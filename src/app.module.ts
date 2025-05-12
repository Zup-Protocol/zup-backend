import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PoolsController } from './modules/pools/pools.controller';
import { PoolsModule } from './modules/pools/pools.module';
import { TokensController } from './modules/tokens/tokens.controller';
import { TokensModule } from './modules/tokens/tokens.module';

@Module({
  imports: [ConfigModule.forRoot(), TokensModule, PoolsModule],
  controllers: [TokensController, AppController, PoolsController],
  providers: [],
})
export class AppModule {}
