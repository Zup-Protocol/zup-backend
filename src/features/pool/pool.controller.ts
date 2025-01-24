import { Controller, Get, Param, Query } from '@nestjs/common';
import { PoolService } from './pool.service';
import { Networks } from '../tokens/network.enum';
import { TokenMetadata } from '../tokens/dto/token.dto';

@Controller('pools')
export class PoolController {
  constructor(private readonly poolService: PoolService) {}

  @Get()
  async findBestYieldsByTokenPair(
    @Query('token0') token0: string,
    @Query('token1') token1: string,
    @Query('network') network: Networks,
  ): Promise<any> {
    const bestYields = await this.poolService.findBestYieldsForTokenPair(
      token0,
      token1,
      network,
    );
    return {
      bestYields,
    };
  }

  @Get(':poolId')
  async findBestYieldsByPool(@Param('poolId') poolId: string): Promise<any> {
    return this.poolService.findBestYieldsByPool(
      poolId,
      Networks.SEPOLIA,
      {} as TokenMetadata,
      {} as TokenMetadata,
    );
  }
}
