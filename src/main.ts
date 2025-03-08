import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get allowed origins from environment variable
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

  // Enable CORS with origin validation
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests) only in development mode
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0) {
        return callback(
          new InternalServerErrorException('CORS policy not configured'),
          false,
        );
      }

      if (!!origin && allowedOrigins.includes(origin)) {
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
