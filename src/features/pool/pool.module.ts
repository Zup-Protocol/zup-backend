import { Module } from '@nestjs/common';
import { PoolService } from './pool.service';
import { PoolController } from './pool.controller';
import { CoreModule } from '@/core/core.module';
import { TokenModule } from '@/features/tokens/token.module';

@Module({
  imports: [CoreModule, TokenModule],
  controllers: [PoolController],
  providers: [PoolService],
})
export class PoolModule {}
