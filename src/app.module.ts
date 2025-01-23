import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PoolModule } from './features/pool/pool.module';
import { CoreModule } from './core/core.module';
import { TokenModule } from './features/tokens/token.module';

@Module({
  imports: [TokenModule, PoolModule, CoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
