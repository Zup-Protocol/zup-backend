import { Inject } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { zeroEthereumAddress } from 'src/core/constants';
import { MatchedPoolsDTO } from 'src/core/dtos/matched-pools.dto';
import { PoolSearchFiltersDTO } from 'src/core/dtos/pool-search-filters.dto';
import { PoolDTO } from 'src/core/dtos/pool.dto';
import { TokenDTO } from 'src/core/dtos/token.dto';
import { V3PoolDTO } from 'src/core/dtos/v3-pool.dto';
import { V4PoolDTO } from 'src/core/dtos/v4-pool.dto';
import { Networks, NetworksUtils } from 'src/core/enums/networks';
import 'src/core/extensions/date.extension';
import { tokenList } from 'src/core/token-list';
import { SupportedPoolType } from 'src/core/types';
import { average, calculateDayPoolAPR } from 'src/core/utils/math-utils';
import {
  GetPoolsDocument,
  GetPoolsQuery,
  GetPoolsQueryVariables,
  Pool_Filter,
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
    token0Addresses: string[];
    token1Addresses: string[];
    network: Networks;
    filters: PoolSearchFiltersDTO;
  }): Promise<MatchedPoolsDTO> {
    const poolsQueryResponse = await this._getPoolsForSingleNetwork(
      params.token0Addresses,
      params.token1Addresses,
      params.network,
      params.filters,
    );

    const matchedPools = await this._processPoolsDataFromQuery({
      queryResponse: poolsQueryResponse,
      network: params.network,
      tokenAddresses: params.token0Addresses.concat(params.token1Addresses),
    });

    return {
      pools: matchedPools,
      filters: params.filters,
    };
  }

  async searchPoolsCrossChain(params: {
    token0Ids: string[];
    token1Ids: string[];
    filters: PoolSearchFiltersDTO;
  }): Promise<MatchedPoolsDTO> {
    const allSupportedNetworks = params.filters.testnetMode
      ? NetworksUtils.values().filter((network) =>
          NetworksUtils.isTestnet(network),
        )
      : NetworksUtils.values().filter(
          (network) => !NetworksUtils.isTestnet(network),
        );

    const searchTokens0 = tokenList.filter((token) =>
      params.token0Ids.includes(token.id!),
    );

    const searchTokens1 = tokenList.filter((token) =>
      params.token1Ids.includes(token.id!),
    );

    const networksWithTokens = allSupportedNetworks.filter((network) => {
      return (
        searchTokens0.some((token) => token?.addresses[network] !== null) ||
        searchTokens1.some((token) => token?.addresses[network] !== null)
      );
    });

    if (networksWithTokens.length === 0) {
      return {
        pools: [],
        filters: params.filters,
      };
    }

    const tokenAddressesPerChainId: Record<
      number,
      Record<number, string[]>
    > = {};

    networksWithTokens.forEach((network) => {
      tokenAddressesPerChainId[network] = {
        0: [],
        1: [],
      };

      tokenAddressesPerChainId[network][0] = searchTokens0
        .filter((token) => token.addresses[network] !== null)
        .map((token) => token.addresses[network]!);

      tokenAddressesPerChainId[network][1] = searchTokens1
        .filter((token) => token.addresses[network] !== null)
        .map((token) => token.addresses[network]!);
    });

    const poolsQueryResponses = await this._getPoolsForMultipleNetworks(
      networksWithTokens.map((network) => {
        return {
          network: network,
          token0Addresses: tokenAddressesPerChainId[network][0],
          token1Addresses: tokenAddressesPerChainId[network][1],
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
          tokenAddresses: tokenAddressesPerChainId[network][0].concat(
            tokenAddressesPerChainId[network][1],
          ),
        });
      }),
    );

    const flatMatchedPools = matchedPools.flat();

    return {
      pools: flatMatchedPools,
      filters: params.filters,
    };
  }

  private async _getPoolsForSingleNetwork(
    token0Addresses: string[],
    token1Addresses: string[],
    network: Networks,
    filters: PoolSearchFiltersDTO,
  ): Promise<GetPoolsQuery> {
    const wrappedNativeAddress = NetworksUtils.wrappedNativeAddress(network);
    const minTvlUsd = filters.minTvlUsd;
    const typesAllowed = filters.allowedPoolTypes;

    const possibleTokenCombinations: Pool_Filter[] = [];

    for (let i = 0; i < token0Addresses.length; i++) {
      for (let j = 0; j < token1Addresses.length; j++) {
        const tokenA = token0Addresses[i];
        const tokenB = token1Addresses[j];

        if (tokenA === tokenB) continue;

        possibleTokenCombinations.push(
          { token0: tokenA, token1: tokenB },
          { token0: tokenB, token1: tokenA },
        );

        if (tokenA === zeroEthereumAddress) {
          possibleTokenCombinations.push(
            { token0: tokenB, token1: wrappedNativeAddress },
            { token0: wrappedNativeAddress, token1: tokenB },
          );
        }

        if (tokenB === zeroEthereumAddress) {
          possibleTokenCombinations.push(
            { token0: tokenA, token1: wrappedNativeAddress },
            { token0: wrappedNativeAddress, token1: tokenA },
          );
        }
      }
    }

    const response = await this.graphqlClients[network].request<
      GetPoolsQuery,
      GetPoolsQueryVariables
    >(GetPoolsDocument, {
      poolsFilter: {
        and: [
          {
            dailyData_: {
              // remove pools that have not been active in the last 30 days
              dayStartTimestamp_gt: Date.getDaysAgoTimestamp(30).toString(),
            },
            totalValueLockedUSD_gt: minTvlUsd.toString(),
            type_in: typesAllowed,
            ...(filters.blockedProtocols.length > 0
              ? { protocol_not_in: filters.blockedProtocols }
              : {}),
          },
          {
            or: possibleTokenCombinations,
          },
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
      token0Addresses: string[];
      token1Addresses: string[];
    }[],
    filters: PoolSearchFiltersDTO,
  ): Promise<GetPoolsQuery[]> {
    const responses = await Promise.all(
      networks.map((searchNetworkData) => {
        return this._getPoolsForSingleNetwork(
          searchNetworkData.token0Addresses,
          searchNetworkData.token1Addresses,
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
    tokenAddresses: string[];
  }): Promise<SupportedPoolType[]> {
    const tokensMetadata: Record<string, TokenDTO> = {};

    const tokensMetadataResponses = await Promise.all(
      params.tokenAddresses.map((tokenAddress) => {
        return this.tokensService.getTokenByAddress(
          params.network,
          tokenAddress,
        );
      }),
    );

    for (let i = 0; i < params.tokenAddresses.length; i++) {
      const tokenAddress = params.tokenAddresses[i];
      const tokenMetadata = tokensMetadataResponses[i];

      tokensMetadata[tokenAddress.toLowerCase()] = tokenMetadata;
    }

    return params.queryResponse.pools.map<SupportedPoolType>((pool) => {
      let pool24hFees: number = 0;
      const pool30dYields: number[] = [];
      const pool90dYields: number[] = [];
      const pool7DaysYields: number[] = [];

      function poolToken0Metadata(): TokenDTO {
        const isPoolToken0WrappedNative: boolean =
          pool.token0.id.lowercasedEquals(
            NetworksUtils.wrappedNativeAddress(params.network),
          );

        const poolToken0AddressMetadata =
          tokensMetadata[pool.token0.id.toLowerCase()];

        if (isPoolToken0WrappedNative && !poolToken0AddressMetadata) {
          return tokensMetadata[zeroEthereumAddress];
        }

        return poolToken0AddressMetadata;
      }

      function poolToken1Metadata(): TokenDTO {
        const isPoolToken1WrappedNative: boolean =
          pool.token1.id.lowercasedEquals(
            NetworksUtils.wrappedNativeAddress(params.network),
          );

        const poolToken1AddressMetadata =
          tokensMetadata[pool.token1.id.toLowerCase()];

        if (isPoolToken1WrappedNative && !poolToken1AddressMetadata) {
          return tokensMetadata[zeroEthereumAddress];
        }

        return poolToken1AddressMetadata;
      }

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

        if (pool7DaysYields.length < 7) pool7DaysYields.push(dayAPR);
        if (pool30dYields.length < 30) pool30dYields.push(dayAPR);
        pool90dYields.push(dayAPR);
      }

      const poolYield24h =
        pool.hourlyData.length < 10
          ? 0
          : calculateDayPoolAPR(Number(pool.totalValueLockedUSD), pool24hFees);

      const poolYield7d =
        pool7DaysYields.length < 3 ? 0 : average(pool7DaysYields);

      const poolYield30d =
        pool30dYields.length < 20 ? 0 : average(pool30dYields);

      const poolYield90d =
        pool90dYields.length < 70 ? 0 : average(pool90dYields);

      const basePool: PoolDTO = {
        chainId: params.network,
        poolAddress: pool.id,
        totalValueLockedUSD: Number(pool.totalValueLockedUSD),
        yield24h: poolYield24h,
        yield30d: poolYield30d,
        yield90d: poolYield90d,
        yield7d: poolYield7d,
        poolType: pool.type,
        protocol: {
          id: pool.protocol.id,
          logo: pool.protocol.logo,
          name: pool.protocol.name,
          url: pool.protocol.url,
        },
        token0: poolToken0Metadata(),
        token1: poolToken1Metadata(),
        positionManagerAddress: pool.protocol.positionManager,
        permit2Address: pool.protocol.permit2!,
        feeTier: pool.feeTier,
      };

      if (pool.type === PoolType.V3) {
        const v3Pool: V3PoolDTO = {
          ...basePool,
          tickSpacing: pool.tickSpacing,
          latestTick: pool.tick,
        };

        return v3Pool;
      }

      if (pool.type === PoolType.V4) {
        const v4Pool: V4PoolDTO = {
          ...basePool,
          latestTick: pool.tick,
          tickSpacing: pool.tickSpacing,
          hooksAddress: pool.v4Hooks ?? '',
          poolManagerAddress: pool.protocol.v4PoolManager ?? '',
          stateViewAddress: pool.protocol.v4StateView ?? '',
        };

        return v4Pool;
      }

      throw new Error('Unsupported pool type received');
    });
  }
}
