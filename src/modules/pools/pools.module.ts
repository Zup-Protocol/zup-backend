import { Module } from '@nestjs/common';
import { PoolsController } from './pools.controller';

@Module({
  controllers: [PoolsController],
  providers: [],
})
export class PoolsModule {}
