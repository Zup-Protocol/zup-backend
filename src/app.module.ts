import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PoolsController } from './modules/pools/pools.controller';
import { PoolsModule } from './modules/pools/pools.module';
import { ProtocolsController } from './modules/protocols/protocols.controller';
import { ProtocolsModule } from './modules/protocols/protocols.module';
import { TokensController } from './modules/tokens/tokens.controller';
import { TokensModule } from './modules/tokens/tokens.module';

@Module({
  imports: [ConfigModule.forRoot(), TokensModule, PoolsModule, ProtocolsModule],
  controllers: [
    TokensController,
    AppController,
    PoolsController,
    ProtocolsController,
  ],
  providers: [],
})
export class AppModule {}
