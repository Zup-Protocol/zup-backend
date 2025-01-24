import { Controller, Get, Param, Query } from '@nestjs/common';
import { PoolService } from './pool.service';
import { Networks } from '../tokens/network.enum';

@Controller('pools')
export class PoolController {
  constructor(private readonly poolService: PoolService) {}

  @Get()
  async findBestYieldsByTokenPair(
    @Query('token0') token0: string,
    @Query('token1') token1: string,
    @Query('network') network: Networks,
  ): Promise<any> {
    return {
      bestYields: this.poolService.findBestYieldsForTokenPair(
        token0,
        token1,
        network,
      ),
    };
  }

  @Get(':poolId')
  async findBestYieldsByPool(@Param('poolId') poolId: string): Promise<any> {
    return this.poolService.findBestYieldsByPool(poolId);
  }
}
