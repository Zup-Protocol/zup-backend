import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TokensController } from './modules/tokens/tokens.controller';
import { TokensModule } from './modules/tokens/tokens.module';

@Module({
  imports: [ConfigModule.forRoot(), TokensModule],
  controllers: [TokensController, AppController],
  providers: [],
})
export class AppModule {}
