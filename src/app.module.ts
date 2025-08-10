import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { AppController } from './app.controller';
import { PoolsController } from './modules/pools/pools.controller';
import { PoolsModule } from './modules/pools/pools.module';
import { ProtocolsController } from './modules/protocols/protocols.controller';
import { ProtocolsModule } from './modules/protocols/protocols.module';
import { TokensController } from './modules/tokens/tokens.controller';
import { TokensModule } from './modules/tokens/tokens.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../', 'static'),
      serveRoot: '/static/',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 60,
        },
      ],
    }),
    TokensModule,
    PoolsModule,
    ProtocolsModule,
  ],
  controllers: [
    TokensController,
    AppController,
    PoolsController,
    ProtocolsController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
