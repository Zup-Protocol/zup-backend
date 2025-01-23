import { Module } from '@nestjs/common';
import { PoolService } from './pool.service';
import { PoolController } from './pool.controller';
import { CoreModule } from '@/core/core.module';

@Module({
  imports: [CoreModule],
  controllers: [PoolController],
  providers: [PoolService],
})
export class PoolModule {}
