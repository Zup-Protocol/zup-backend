import { Inject } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { MatchedPoolsDTO } from 'src/core/dtos/matched-pools.dto';
import { SinglechainTokenDTO } from 'src/core/dtos/token.dto';
import { Networks, NetworksUtils } from 'src/core/enums/networks';
import { PoolType } from 'src/core/enums/pool-type';
import 'src/core/extensions/date.extension';
import { tokenList } from 'src/core/token-list';
import { SupportedPoolType } from 'src/core/types';
import { average, calculateDayPoolAPR } from 'src/core/utils/math-utils';
import {
  GetPoolsDocument,
  GetPoolsQuery,
  GetPoolsQueryVariables,
} from 'src/gen/graphql.gen';
import { TokensService } from '../tokens/tokens.service';

export class PoolsService {
  constructor(
    private readonly tokensService: TokensService,
    @Inject('GraphqlClients')
    private readonly graphqlClients: Record<Networks, GraphQLClient>,
  ) {}

  async searchPoolsInChain(
    token0Address: string,
    token1Address: string,
    network: Networks,
  ): Promise<MatchedPoolsDTO> {
    const poolsQueryResponse = await this._getPoolsForSingleNetwork(
      token0Address,
      token1Address,
      network,
    );

    const matchedPools = await this._processPoolsDataFromQuery({
      queryResponse: poolsQueryResponse,
      network,
      token0Address,
      token1Address,
    });

    return {
      pools: matchedPools,
    };
  }

  async searchPoolsCrossChain(
    token0Id: string,
    token1Id: string,
  ): Promise<MatchedPoolsDTO> {
    const allSupportedNetworks = NetworksUtils.values();
    const token0InTokenList = tokenList.find((token) => token.id === token0Id);
    const token1InTokenList = tokenList.find((token) => token.id === token1Id);

    const networksWithTokens = allSupportedNetworks.filter((network) => {
      return (
        token0InTokenList?.addresses[network] !== null &&
        token1InTokenList?.addresses[network] !== null
      );
    });

    if (networksWithTokens.length === 0) {
      return {
        pools: [],
      };
    }

    const poolsQueryResponses = await this._getPoolsForMultipleNetworks(
      networksWithTokens.map((network) => {
        return {
          network: network,
          token0Address: token0InTokenList!.addresses[network]!,
          token1Address: token1InTokenList!.addresses[network]!,
        };
      }),
    );

    const matchedPools = await Promise.all(
      poolsQueryResponses.map((queryResponse, index) => {
        const network = networksWithTokens[index];

        return this._processPoolsDataFromQuery({
          queryResponse,
          network,
          token0Address: token0InTokenList!.addresses[network]!,
          token1Address: token1InTokenList!.addresses[network]!,
        });
      }),
    );

    return {
      pools: matchedPools.flat(),
    };
  }

  private async _getPoolsForSingleNetwork(
    token0: string,
    token1: string,
    network: Networks,
  ): Promise<GetPoolsQuery> {
    const response = await this.graphqlClients[network].request<
      GetPoolsQuery,
      GetPoolsQueryVariables
    >(GetPoolsDocument, {
      token0Id: token0,
      token1Id: token1,
      hourlyDataStartTimestamp:
        Date.yesterdayStartSecondsTimestamp().toString(),
      dailyDataStartTimestamp: Date.getDaysAgoTimestamp(90).toString(),
    });

    return response;
  }

  private async _getPoolsForMultipleNetworks(
    networks: {
      network: Networks;
      token0Address: string;
      token1Address: string;
    }[],
  ): Promise<GetPoolsQuery[]> {
    const responses = await Promise.all(
      networks.map((searchNetworkData) => {
        return this._getPoolsForSingleNetwork(
          searchNetworkData.token0Address,
          searchNetworkData.token1Address,
          searchNetworkData.network,
        );
      }),
    );

    return responses;
  }

  private async _processPoolsDataFromQuery(params: {
    queryResponse: GetPoolsQuery;
    network: Networks;
    token0Address: string;
    token1Address: string;
  }): Promise<SupportedPoolType[]> {
    let remoteToken0Metadata: SinglechainTokenDTO;
    let remoteToken1Metadata: SinglechainTokenDTO;

    try {
      remoteToken0Metadata = await this.tokensService.getTokenByAddress(
        params.network,
        params.token0Address,
      );

      remoteToken1Metadata = await this.tokensService.getTokenByAddress(
        params.network,
        params.token1Address,
      );
    } catch {
      // ignore
    }

    return params.queryResponse.pools.map<SupportedPoolType>((pool) => {
      let pool24hFees: number = 0;
      const pool30dYields: number[] = [];
      const pool90dYields: number[] = [];

      pool.hourlyData.forEach((hourlyData) => {
        if (hourlyData) pool24hFees += Number(hourlyData.feesUSD);
      });

      for (let i = 0; i < 90; i++) {
        const dailyData = pool.dailyData[i];
        if (!dailyData) continue;

        const dayAPR = calculateDayPoolAPR(
          Number(dailyData.totalValueLockedUSD),
          Number(dailyData.feesUSD),
        );

        if (pool30dYields.length < 30) pool30dYields.push(dayAPR);
        pool90dYields.push(dayAPR);
      }

      const poolYield30d = average(pool30dYields);
      const poolYield90d = average(pool90dYields);

      return {
        chainId: params.network,
        poolAddress: pool.id,
        totalValueLockedUSD: Number(pool.totalValueLockedUSD),
        yield24h: calculateDayPoolAPR(
          Number(pool.totalValueLockedUSD),
          pool24hFees,
        ),
        yield30d: poolYield30d,
        yield90d: poolYield90d,
        poolType: PoolType.v3,
        protocol: {
          logo: pool.protocol.logo,
          name: pool.protocol.name,
          url: pool.protocol.url,
        },
        token0: {
          address: pool.token0.id,
          decimals: pool.token0.decimals,
          name: pool.token0.name,
          symbol: pool.token0.symbol,
          ...(remoteToken0Metadata.logoUrl && {
            logoUrl: remoteToken0Metadata.logoUrl,
          }),
        },
        token1: {
          address: pool.token1.id,
          decimals: pool.token1.decimals,
          name: pool.token1.name,
          symbol: pool.token1.symbol,
          ...(remoteToken1Metadata.logoUrl && {
            logoUrl: remoteToken1Metadata.logoUrl,
          }),
        },
        positionManagerAddress: pool.protocol.positionManager,
        tickSpacing: pool.tickSpacing,
        feeTier: pool.feeTier,
      };
    });
  }
}
