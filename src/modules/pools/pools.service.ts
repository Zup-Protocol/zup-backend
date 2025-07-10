import { Inject } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { zeroEthereumAddress } from 'src/core/constants';
import { MatchedPoolsDTO } from 'src/core/dtos/matched-pools.dto';
import { PoolSearchFiltersDTO } from 'src/core/dtos/pool-search-filters.dto';
import { TokenDTO } from 'src/core/dtos/token.dto';
import { Networks, NetworksUtils } from 'src/core/enums/networks';
import 'src/core/extensions/date.extension';
import { tokenList } from 'src/core/token-list';
import { SupportedPoolType } from 'src/core/types';
import { average, calculateDayPoolAPR } from 'src/core/utils/math-utils';
import {
  GetPoolsDocument,
  GetPoolsQuery,
  GetPoolsQueryVariables,
  PoolType,
} from 'src/gen/graphql.gen';
import '../../core/extensions/string.extension';
import { TokensService } from '../tokens/tokens.service';

export class PoolsService {
  constructor(
    private readonly tokensService: TokensService,
    @Inject('GraphqlClients')
    private readonly graphqlClients: Record<Networks, GraphQLClient>,
  ) {}

  async searchPoolsInChain(params: {
    token0Address: string;
    token1Address: string;
    network: Networks;
    filters: PoolSearchFiltersDTO;
  }): Promise<MatchedPoolsDTO> {
    const poolsQueryResponse = await this._getPoolsForSingleNetwork(
      params.token0Address,
      params.token1Address,
      params.network,
      params.filters,
    );

    const matchedPools = await this._processPoolsDataFromQuery({
      queryResponse: poolsQueryResponse,
      network: params.network,
      token0Address: params.token0Address,
      token1Address: params.token1Address,
    });

    return {
      pools: matchedPools,
      minTvlUsd: params.filters.minTvlUsd,
    };
  }

  async searchPoolsCrossChain(params: {
    token0Id: string;
    token1Id: string;
    filters: PoolSearchFiltersDTO;
  }): Promise<MatchedPoolsDTO> {
    const allSupportedNetworks = params.filters.testnetMode
      ? NetworksUtils.values().filter((network) =>
          NetworksUtils.isTestnet(network),
        )
      : NetworksUtils.values().filter(
          (network) => !NetworksUtils.isTestnet(network),
        );

    const token0InTokenList = tokenList.find((token) =>
      token.id?.lowercasedEquals(params.token0Id),
    );
    const token1InTokenList = tokenList.find((token) =>
      token.id?.lowercasedEquals(params.token1Id),
    );

    const networksWithTokens = allSupportedNetworks.filter((network) => {
      return (
        token0InTokenList?.addresses[network] !== null &&
        token1InTokenList?.addresses[network] !== null
      );
    });

    if (networksWithTokens.length === 0) {
      return {
        pools: [],
        minTvlUsd: params.filters.minTvlUsd,
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
      params.filters,
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

    const flatMatchedPools = matchedPools.flat();

    return {
      pools: flatMatchedPools,
      minTvlUsd: params.filters.minTvlUsd,
    };
  }

  private async _getPoolsForSingleNetwork(
    token0Address: string,
    token1Address: string,
    network: Networks,
    filters: PoolSearchFiltersDTO,
  ): Promise<GetPoolsQuery> {
    const wrappedNativeAddress = NetworksUtils.wrappedNativeAddress(network);
    const minTvlUsd = filters.minTvlUsd;
    const typesAllowed = filters.allowedPoolTypes;

    const isNativeTokenSearch =
      token0Address === zeroEthereumAddress ||
      token1Address === zeroEthereumAddress;

    const response = await this.graphqlClients[network].request<
      GetPoolsQuery,
      GetPoolsQueryVariables
    >(GetPoolsDocument, {
      poolsFilter: {
        or: [
          {
            token0: token0Address,
            token1: token1Address,
            totalValueLockedUSD_gt: minTvlUsd.toString(),
            type_in: typesAllowed,
          },
          {
            token0: token1Address,
            token1: token0Address,
            totalValueLockedUSD_gt: minTvlUsd.toString(),
            type_in: typesAllowed,
          },
          // as V3 pools don't have the native token, we need to search for the wrapped native token
          ...(isNativeTokenSearch
            ? [
                {
                  token0: token0Address,
                  token1: wrappedNativeAddress,
                  totalValueLockedUSD_gt: minTvlUsd.toString(),
                  type_in: typesAllowed,
                },
                {
                  token0: token1Address,
                  token1: wrappedNativeAddress,
                  totalValueLockedUSD_gt: minTvlUsd.toString(),
                  type_in: typesAllowed,
                },
                {
                  token0: wrappedNativeAddress,
                  token1: token0Address,
                  totalValueLockedUSD_gt: minTvlUsd.toString(),
                  type_in: typesAllowed,
                },
                {
                  token0: wrappedNativeAddress,
                  token1: token1Address,
                  totalValueLockedUSD_gt: minTvlUsd.toString(),
                  type_in: typesAllowed,
                },
              ]
            : []),
        ],
      },
      dailyDataFilter: {
        dayStartTimestamp_gt: Date.getDaysAgoTimestamp(90).toString(),
      },
      hourlyDataFilter: {
        hourStartTimestamp_gt: Date.yesterdayStartSecondsTimestamp().toString(),
      },
    });

    return response;
  }

  private async _getPoolsForMultipleNetworks(
    networks: {
      network: Networks;
      token0Address: string;
      token1Address: string;
    }[],
    filters: PoolSearchFiltersDTO,
  ): Promise<GetPoolsQuery[]> {
    const responses = await Promise.all(
      networks.map((searchNetworkData) => {
        return this._getPoolsForSingleNetwork(
          searchNetworkData.token0Address,
          searchNetworkData.token1Address,
          searchNetworkData.network,
          filters,
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
    let token0Metadata: TokenDTO;
    let token1Metadata: TokenDTO;

    try {
      token0Metadata = await this.tokensService.getTokenByAddress(
        params.network,
        params.token0Address,
      );

      token1Metadata = await this.tokensService.getTokenByAddress(
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
      const token0MetadataAddress =
        token0Metadata.addresses[params.network] === zeroEthereumAddress &&
        pool.type === PoolType.V3
          ? NetworksUtils.wrappedNativeAddress(params.network)
          : token0Metadata.addresses[params.network];

      const token1MetadataAddress =
        token1Metadata.addresses[params.network] === zeroEthereumAddress &&
        pool.type === PoolType.V3
          ? NetworksUtils.wrappedNativeAddress(params.network)
          : token1Metadata.addresses[params.network];

      const poolToken0Metadata: TokenDTO =
        token0MetadataAddress?.lowercasedEquals(pool.token0.id)
          ? token0Metadata
          : token1Metadata;

      const poolToken1Metadata: TokenDTO =
        token1MetadataAddress?.lowercasedEquals(pool.token1.id)
          ? token1Metadata
          : token0Metadata;

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

      const poolYield30d =
        pool30dYields.length < 20 ? 0 : average(pool30dYields);
      const poolYield90d =
        pool90dYields.length < 70 ? 0 : average(pool90dYields);

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
        poolType: pool.type,
        protocol: {
          logo: pool.protocol.logo,
          name: pool.protocol.name,
          url: pool.protocol.url,
        },
        token0: poolToken0Metadata,
        token1: poolToken1Metadata,
        positionManagerAddress: pool.protocol.positionManager,
        tickSpacing: pool.tickSpacing,
        feeTier: pool.feeTier,
        permit2Address: pool.protocol.permit2,
        ...(pool.type === PoolType.V4 && {
          hooksAddress: pool.v4Hooks,
          poolManagerAddress: pool.protocol.v4PoolManager,
          ...(pool.protocol.v4StateView && {
            stateViewAddress: pool.protocol.v4StateView,
          }),
        }),
      };
    });
  }
}
