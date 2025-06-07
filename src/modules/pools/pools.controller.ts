import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseFloatPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MatchedPoolsDTO } from 'src/core/dtos/matched-pools.dto';
import { PoolsService } from './pools.service';

@Controller('pools')
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}
  @Get('/search/all')
  async searchPoolsAcrossNetworks(
    @Query('token0Id') token0Id: string,
    @Query('token1Id') token1Id: string,
    @Query('minTvlUsd', ParseFloatPipe) minTvlUsd: number = 0,
    @Query('testnetMode', ParseBoolPipe) testnetMode: boolean = false,
  ): Promise<MatchedPoolsDTO> {
    return await this.poolsService.searchPoolsCrossChain({
      minTvlUsd: minTvlUsd,
      token0Id: token0Id,
      token1Id: token1Id,
      testnetMode: testnetMode,
    });
  }

  @Get('/search/:chainId')
  async searchPoolsInChain(
    @Query('token0Address') token0: string,
    @Query('token1Address') token1: string,
    @Query(
      'minTvlUsd',
      new ParseFloatPipe({
        optional: true,
      }),
    )
    minTvlUsd: number = 0,
    @Param('chainId', ParseIntPipe) chainId: number,
  ): Promise<MatchedPoolsDTO> {
    return await this.poolsService.searchPoolsInChain({
      token0Address: token0,
      token1Address: token1,
      network: chainId,
      minTvlUsd,
    });
  }
}
