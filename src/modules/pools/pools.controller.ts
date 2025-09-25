import { Body, Controller, Param, ParseIntPipe, Post, Query, ValidationPipe } from '@nestjs/common';
import { MatchedPoolsDTO } from 'src/core/dtos/matched-pools.dto';
import { PoolSearchFiltersDTO } from 'src/core/dtos/pool-search-filters.dto';
import { tokenGroupList } from 'src/core/token-group-list';
import { PoolsService } from './pools.service';

@Controller('pools')
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}
  @Post('/search/all')
  async searchPoolsAcrossNetworks(
    @Query('token0Id') token0Id?: string,
    @Query('token1Id') token1Id?: string,
    @Query('group0Id') group0Id?: string,
    @Query('group1Id') group1Id?: string,
    @Body('filters', new ValidationPipe({ transform: true }))
    filters: PoolSearchFiltersDTO = new PoolSearchFiltersDTO(),
  ): Promise<MatchedPoolsDTO> {
    const tokens0: string[] = [...(token0Id !== undefined ? [token0Id] : [])];
    const tokens1: string[] = [...(token1Id !== undefined ? [token1Id] : [])];

    if (group0Id !== undefined) {
      tokens0.push(...this._resolveTokensFromGroupIds(group0Id));
    }

    if (group1Id !== undefined) {
      tokens1.push(...this._resolveTokensFromGroupIds(group1Id));
    }

    return await this.poolsService.searchPoolsCrossChain({
      token0Ids: tokens0,
      token1Ids: tokens1,
      filters,
    });
  }

  @Post('/search/:chainId')
  async searchPoolsInChain(
    @Param('chainId', ParseIntPipe) chainId: number,
    @Query('token0Address') token0Address?: string,
    @Query('token1Address') token1Address?: string,
    @Query('group0Id') group0Id?: string,
    @Query('group1Id') group1Id?: string,
    @Body('filters', new ValidationPipe({ transform: true }))
    filters: PoolSearchFiltersDTO = new PoolSearchFiltersDTO(),
  ): Promise<MatchedPoolsDTO> {
    const tokens0: string[] = [...(token0Address !== undefined ? [token0Address] : [])];
    const tokens1: string[] = [...(token1Address !== undefined ? [token1Address] : [])];

    if (group0Id !== undefined) {
      tokens0.push(...this._resolveTokensFromGroupIds(group0Id, chainId));
    }

    if (group1Id !== undefined) {
      tokens1.push(...this._resolveTokensFromGroupIds(group1Id, chainId));
    }

    return await this.poolsService.searchPoolsInChain({
      token0Addresses: tokens0,
      token1Addresses: tokens1,
      network: chainId,
      filters,
    });
  }

  private _resolveTokensFromGroupIds(groupId: string, chainId?: number): string[] {
    const tokens: string[] = [];
    const groupTokens = tokenGroupList.find((group) => {
      return group.id === groupId;
    })?.tokens;

    groupTokens?.forEach((token) => {
      if (chainId === undefined) return tokens.push(token.id!);

      const tokenAddressInNetwork = token.addresses[chainId];

      if (typeof tokenAddressInNetwork === 'string') {
        return tokens.push(tokenAddressInNetwork);
      }
    });

    return tokens;
  }
}
