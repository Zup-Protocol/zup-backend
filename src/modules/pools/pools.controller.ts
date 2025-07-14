import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { MatchedPoolsDTO } from 'src/core/dtos/matched-pools.dto';
import { PoolSearchFiltersDTO } from 'src/core/dtos/pool-search-filters.dto';
import { PoolsService } from './pools.service';

@Controller('pools')
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}
  @Post('/search/all')
  async searchPoolsAcrossNetworks(
    @Query('token0Id') token0Id: string,
    @Query('token1Id') token1Id: string,
    @Body('filters', new ValidationPipe({ transform: true }))
    filters: PoolSearchFiltersDTO = new PoolSearchFiltersDTO(),
  ): Promise<MatchedPoolsDTO> {
    return await this.poolsService.searchPoolsCrossChain({
      token0Id: token0Id,
      token1Id: token1Id,
      filters,
    });
  }

  @Post('/search/:chainId')
  async searchPoolsInChain(
    @Query('token0Address') token0: string,
    @Query('token1Address') token1: string,
    @Param('chainId', ParseIntPipe) chainId: number,
    @Body('filters', new ValidationPipe({ transform: true }))
    filters: PoolSearchFiltersDTO = new PoolSearchFiltersDTO(),
  ): Promise<MatchedPoolsDTO> {
    return await this.poolsService.searchPoolsInChain({
      token0Address: token0,
      token1Address: token1,
      network: chainId,
      filters,
    });
  }
}
