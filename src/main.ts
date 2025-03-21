import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get allowed origins from environment variable
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];

  // Enable CORS with origin validation
  app.enableCors({
    origin: (origin, callback) => {
      if (allowedDomains.length === 0) {
        return callback(
          new InternalServerErrorException('CORS policy not configured'),
          false,
        );
      }

      if (
        !!origin &&
        allowedDomains.some((allowedDomain) => origin.endsWith(allowedDomain))
      ) {
        return callback(null, true);
      }

      return callback(new ForbiddenException('Not allowed by CORS'), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
