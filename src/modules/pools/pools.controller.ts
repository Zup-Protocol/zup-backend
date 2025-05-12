import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MatchedPoolsDTO } from 'src/core/dtos/matched-pools.dto';
import { PoolsService } from './pools.service';

@Controller('pools')
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}
  @Get('/search/all')
  async searchPoolsAcrossNetworks(
    @Query('token0Id') token0Id: string,
    @Query('token1Id') token1Id: string,
  ): Promise<MatchedPoolsDTO> {
    return await this.poolsService.searchPoolsCrossChain(token0Id, token1Id);
  }

  @Get('/search/:chainId')
  async searchPoolsInChain(
    @Query('token0') token0: string,
    @Query('token1') token1: string,
    @Param('chainId', ParseIntPipe) chainId: number,
  ): Promise<MatchedPoolsDTO> {
    return await this.poolsService.searchPoolsInChain(token0, token1, chainId);
  }
}
