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
import { isArrayEmptyOrUndefined } from 'src/core/utils/array-utils';
import { calculateDayPoolAPR, trimmedAverage } from 'src/core/utils/math-utils';
import { GetPoolsDocument, GetPoolsQuery, GetPoolsQueryVariables, Pool_Bool_Exp } from 'src/gen/graphql.gen';
import '../../core/extensions/string.extension';
import { TokensService } from '../tokens/tokens.service';

export class PoolsService {
  constructor(
    private readonly tokensService: TokensService,
    @Inject('GraphqlClient')
    private readonly graphqlClient: GraphQLClient,
  ) {}

  async searchPoolsInChain(params: {
    token0Addresses: string[];
    token1Addresses: string[];
    network: Networks;
    filters: PoolSearchFiltersDTO;
  }): Promise<MatchedPoolsDTO> {
    const search0Addresses = structuredClone(params.token0Addresses);
    const search1Addresses = structuredClone(params.token1Addresses);

    if (params.token0Addresses.includes(zeroEthereumAddress)) {
      search0Addresses.push(NetworksUtils.wrappedNativeAddress(params.network));
    }

    if (params.token1Addresses.includes(zeroEthereumAddress)) {
      search1Addresses.push(NetworksUtils.wrappedNativeAddress(params.network));
    }

    const poolsQueryResponse = await this._getPools({
      filters: params.filters,
      token0AddressesPerChainId: {
        [params.network]: search0Addresses,
      },
      token1AddressesPerChainId: {
        [params.network]: search1Addresses,
      },
    });

    const matchedPools = await this._processPoolsDataFromQuery({
      queryResponse: poolsQueryResponse,
      filters: params.filters,
      userInputTokenAddresses: {
        [params.network]: [...params.token0Addresses, ...params.token1Addresses],
      } as Record<Networks, string[]>,
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
      ? NetworksUtils.values().filter((network) => NetworksUtils.isTestnet(network))
      : NetworksUtils.values().filter((network) => !NetworksUtils.isTestnet(network));

    const searchTokens0 = tokenList.filter((token) => params.token0Ids.includes(token.id!));
    const searchTokens1 = tokenList.filter((token) => params.token1Ids.includes(token.id!));

    const networksWithPools = allSupportedNetworks.filter((network) => {
      return (
        searchTokens0.some((token) => token?.addresses[network] !== null) &&
        searchTokens1.some((token) => token?.addresses[network] !== null)
      );
    });

    if (networksWithPools.length === 0) {
      return {
        pools: [],
        filters: params.filters,
      };
    }

    const userInputTokenAddressesPerChainId: Record<number, string[]> = {};
    const searchToken0AddressesPerChainId: Record<number, string[]> = {};
    const searchToken1AddressesPerChainId: Record<number, string[]> = {};

    networksWithPools.forEach((network) => {
      searchTokens0
        .map((token) => token.addresses[network])
        .filter((tokenAddress) => tokenAddress !== null)
        .forEach((tokenAddress) => {
          if (userInputTokenAddressesPerChainId[network] === undefined) {
            userInputTokenAddressesPerChainId[network] = [];
          }

          if (!userInputTokenAddressesPerChainId[network].includes[tokenAddress]) {
            userInputTokenAddressesPerChainId[network].push(tokenAddress);
          }

          if (searchToken0AddressesPerChainId[network] === undefined) {
            searchToken0AddressesPerChainId[network] = [tokenAddress];
          }

          if (!searchToken0AddressesPerChainId[network].includes(tokenAddress)) {
            searchToken0AddressesPerChainId[network].push(tokenAddress);
          }

          // include native wrapped tokens in the list if user searched with native token
          // because of v3 and v2 pools being with wrapped native, and v4 being with native/wrapped
          if (tokenAddress === zeroEthereumAddress) {
            const wrappedNative = NetworksUtils.wrappedNativeAddress(network);
            if (searchToken0AddressesPerChainId[network].includes(wrappedNative)) return;

            searchToken0AddressesPerChainId[network].push(NetworksUtils.wrappedNativeAddress(network));
          }
        });

      searchTokens1
        .map((token) => token.addresses[network])
        .filter((tokenAddress) => tokenAddress !== null)
        .forEach((tokenAddress) => {
          if (userInputTokenAddressesPerChainId[network] === undefined) {
            userInputTokenAddressesPerChainId[network] = [];
          }

          if (!userInputTokenAddressesPerChainId[network].includes[tokenAddress]) {
            userInputTokenAddressesPerChainId[network].push(tokenAddress);
          }

          if (searchToken1AddressesPerChainId[network] === undefined) {
            searchToken1AddressesPerChainId[network] = [tokenAddress];
          }

          if (!searchToken1AddressesPerChainId[network].includes(tokenAddress)) {
            searchToken1AddressesPerChainId[network].push(tokenAddress);
          }

          // include native wrapped tokens in the list if user searched with native token
          // because of v3 and v2 pools being with wrapped native, and v4 being with native/wrapped
          if (tokenAddress === zeroEthereumAddress) {
            const wrappedNative = NetworksUtils.wrappedNativeAddress(network);
            if (searchToken1AddressesPerChainId[network].includes(wrappedNative)) return;

            searchToken1AddressesPerChainId[network].push(NetworksUtils.wrappedNativeAddress(network));
          }
        });
    });

    const poolsQueryResponse = await this._getPools({
      filters: params.filters,
      token0AddressesPerChainId: searchToken0AddressesPerChainId,
      token1AddressesPerChainId: searchToken1AddressesPerChainId,
    });

    const matchedPools = await this._processPoolsDataFromQuery({
      queryResponse: poolsQueryResponse,
      filters: params.filters,
      userInputTokenAddresses: userInputTokenAddressesPerChainId,
    });

    const flatMatchedPools = matchedPools.flat();

    return {
      pools: flatMatchedPools,
      filters: params.filters,
    };
  }

  private async _getPools(params: {
    token0AddressesPerChainId: Record<number, string[]>;
    token1AddressesPerChainId: Record<number, string[]>;
    filters: PoolSearchFiltersDTO;
  }): Promise<GetPoolsQuery> {
    const minTvlUsd = params.filters.minTvlUsd;
    const typesAllowed = params.filters.allowedPoolTypes;

    Object.entries(params.token0AddressesPerChainId).forEach(([network, token0Addresses]) => {
      params.token0AddressesPerChainId[network] = token0Addresses.map((address) => address.toLowerCase());
    });

    Object.entries(params.token1AddressesPerChainId).forEach(([network, token1Addresses]) => {
      params.token1AddressesPerChainId[network] = token1Addresses.map((address) => address.toLowerCase());
    });

    const networks = new Set<number>(
      Object.keys(params.token0AddressesPerChainId)
        .concat(Object.keys(params.token1AddressesPerChainId))
        .map((network) => Number(network)),
    );

    const possibleCombinations: Pool_Bool_Exp[] = [];

    for (const network of networks) {
      if (
        isArrayEmptyOrUndefined(params.token0AddressesPerChainId[network]) ||
        isArrayEmptyOrUndefined(params.token1AddressesPerChainId[network])
      ) {
        continue;
      }

      possibleCombinations.push({
        _and: [
          {
            chainId: {
              _eq: Number(network),
            },
          },
          {
            _or: [
              {
                token0: {
                  tokenAddress: {
                    _in: params.token0AddressesPerChainId[network],
                  },
                },
                token1: {
                  tokenAddress: {
                    _in: params.token1AddressesPerChainId[network],
                  },
                },
              },
              {
                token0: {
                  tokenAddress: {
                    _in: params.token1AddressesPerChainId[network],
                  },
                },
                token1: {
                  tokenAddress: {
                    _in: params.token0AddressesPerChainId[network],
                  },
                },
              },
            ],
          },
        ],
      });
    }

    const response = await this.graphqlClient.request<GetPoolsQuery, GetPoolsQueryVariables>(GetPoolsDocument, {
      poolsFilter: {
        _and: [
          {
            // TODO: Evaluate coming back with this if added @index to envio indexer
            // dailyData: {
            //   dayStartTimestamp: {
            //     // remove pools that have not been active in the last 20 days
            //     _gt: Date.getDaysAgoTimestamp(30).toString(),
            //   },
            // },
            chainId: {
              // TODO: REMOVE HOTFIX FOR Ethereum and Base
              _nin: [Networks.ETHEREUM, Networks.BASE],
            },
            totalValueLockedUSD: {
              _gt: minTvlUsd.toString(),
              _lt: (1000000000000).toString(), // remove pools with tvl > 1 trillion (which today can be considered an error)
            },
            poolType: {
              _in: typesAllowed,
            },
            ...(params.filters.blockedProtocols.length > 0
              ? {
                  protocol_id: {
                    _nin: params.filters.blockedProtocols,
                  },
                }
              : {}),
          },
          {
            _or: possibleCombinations,
          },
        ],
      },
      dailyDataFilter: {
        feesUSD: {
          _lt: '1000000000', // filter out weird days with very high fees
        },
        dayStartTimestamp: {
          _gt: Date.getDaysAgoTimestamp(100).toString(),
        },
      },
      hourlyDataFilter: {
        feesUSD: {
          _lt: '10000000', // filter out weird hours with very high fees
        },
        hourStartTimestamp: {
          _gt: Date.yesterdayStartSecondsTimestamp().toString(),
        },
      },
    });

    // TODO: REMOVE HOTFIX FOR ETHEREUM ONCE ISSUE IS FIXED
    if (networks.has(Networks.ETHEREUM)) {
      const ethereumResponse = await new GraphQLClient(
        'https://indexer.dedicated.hyperindex.xyz/aefe5f4/v1/graphql',
      ).request<GetPoolsQuery, GetPoolsQueryVariables>(GetPoolsDocument, {
        poolsFilter: {
          _and: [
            {
              chainId: {
                _eq: Networks.ETHEREUM,
              },
              totalValueLockedUSD: {
                _gt: minTvlUsd.toString(),
                _lt: (1000000000000).toString(), // remove pools with tvl > 1 trillion (which today can be considered an error)
              },
              poolType: {
                _in: typesAllowed,
              },
              ...(params.filters.blockedProtocols.length > 0
                ? {
                    protocol_id: {
                      _nin: params.filters.blockedProtocols,
                    },
                  }
                : {}),
            },
            {
              _or: possibleCombinations,
            },
          ],
        },
        dailyDataFilter: {
          feesUSD: {
            _lt: '1000000000', // filter out weird days with very high fees
          },
          dayStartTimestamp: {
            _gt: Date.getDaysAgoTimestamp(100).toString(),
          },
        },
        hourlyDataFilter: {
          feesUSD: {
            _lt: '10000000', // filter out weird hours with very high fees
          },
          hourStartTimestamp: {
            _gt: Date.yesterdayStartSecondsTimestamp().toString(),
          },
        },
      });

      response.Pool = [...response.Pool, ...ethereumResponse.Pool];
    }

    // TODO: REMOVE HOTFIX FOR BASE ONCE ISSUE IS FIXED
    if (networks.has(Networks.BASE)) {
      const baseResponse = await new GraphQLClient(
        'https://indexer.dedicated.hyperindex.xyz/0454ac3/v1/graphql',
      ).request<GetPoolsQuery, GetPoolsQueryVariables>(GetPoolsDocument, {
        poolsFilter: {
          _and: [
            {
              chainId: {
                _eq: Networks.BASE,
              },
              totalValueLockedUSD: {
                _gt: minTvlUsd.toString(),
                _lt: (1000000000000).toString(), // remove pools with tvl > 1 trillion (which today can be considered an error)
              },
              poolType: {
                _in: typesAllowed,
              },
              ...(params.filters.blockedProtocols.length > 0
                ? {
                    protocol_id: {
                      _nin: params.filters.blockedProtocols,
                    },
                  }
                : {}),
            },
            {
              _or: possibleCombinations,
            },
          ],
        },
        dailyDataFilter: {
          feesUSD: {
            _lt: '1000000000', // filter out weird days with very high fees
          },
          dayStartTimestamp: {
            _gt: Date.getDaysAgoTimestamp(100).toString(),
          },
        },
        hourlyDataFilter: {
          feesUSD: {
            _lt: '10000000', // filter out weird hours with very high fees
          },
          hourStartTimestamp: {
            _gt: Date.yesterdayStartSecondsTimestamp().toString(),
          },
        },
      });

      response.Pool = [...response.Pool, ...baseResponse.Pool];
    }

    return response;
  }

  private async _getSearchedTokensMetadata(
    userInputTokenAddresses: Record<Networks, string[]>,
  ): Promise<Record<string, TokenDTO>> {
    const tokensMetadata: Record<string, TokenDTO> = {};
    const tokensService = this.tokensService;

    const promises = (): Promise<TokenDTO>[] => {
      const requests: Promise<TokenDTO>[] = [];

      for (const network of NetworksUtils.values()) {
        const networkAddresses = userInputTokenAddresses[network];

        if (!networkAddresses) continue;

        networkAddresses.forEach((address) => {
          requests.push(tokensService.getTokenByAddress(network, address));
        });
      }

      return requests;
    };

    const tokensMetadataResponses = await Promise.all(promises());

    for (let i = 0; i < tokensMetadataResponses.length; i++) {
      const tokenMetadata = tokensMetadataResponses[i];
      const tokenAddresses = tokenMetadata.addresses;

      NetworksUtils.values().forEach((network) => {
        if (tokenAddresses[network]) tokensMetadata[tokenAddresses[network].toLowerCase()] = tokenMetadata;
      });
    }

    return tokensMetadata;
  }

  private async _processPoolsDataFromQuery(params: {
    queryResponse: GetPoolsQuery;
    userInputTokenAddresses: Record<Networks, string[]>;
    filters: PoolSearchFiltersDTO;
  }): Promise<SupportedPoolType[]> {
    const tokensMetadata: Record<string, TokenDTO> = await this._getSearchedTokensMetadata(
      params.userInputTokenAddresses,
    );

    const matchedPools: SupportedPoolType[] = [];
    const trimmedAveragePercentage7Days: number = 0.15;
    const trimmedAveragePercentage30Days: number = 0.1;
    const trimmedAveragePercentage90Days: number = 0.05;

    for (const pool of params.queryResponse.Pool) {
      let pool24hFees: number = 0;
      const pool30dYields: number[] = [];
      const pool90dYields: number[] = [];
      const pool7DaysYields: number[] = [];

      const didUserSearchForWrappedNativePoolsAtPoolNetwork = params.userInputTokenAddresses[
        NetworksUtils.networkFromChainId(pool.chainId)
      ].includes(NetworksUtils.wrappedNativeAddress(pool.chainId));

      const isPoolToken0WrappedNative: boolean = pool.token0!.tokenAddress.lowercasedEquals(
        NetworksUtils.wrappedNativeAddress(pool.chainId),
      );

      const isPoolToken1WrappedNative: boolean = pool.token1!.tokenAddress.lowercasedEquals(
        NetworksUtils.wrappedNativeAddress(pool.chainId),
      );

      // filter out pools that are v4 with wrapped native
      // due to the search for v3 pools with wrapped native
      if (
        (isPoolToken0WrappedNative || isPoolToken1WrappedNative) &&
        pool.poolType === 'V4' &&
        !didUserSearchForWrappedNativePoolsAtPoolNetwork
      ) {
        continue;
      }

      function poolToken0Metadata(): TokenDTO {
        const poolToken0AddressMetadata = tokensMetadata[pool.token0!.tokenAddress.toLowerCase()];

        if (isPoolToken0WrappedNative && !poolToken0AddressMetadata) {
          return tokensMetadata[zeroEthereumAddress];
        }

        return poolToken0AddressMetadata;
      }

      function poolToken1Metadata(): TokenDTO {
        const poolToken1AddressMetadata = tokensMetadata[pool.token1!.tokenAddress.toLowerCase()];

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

        const dayAPR = calculateDayPoolAPR(Number(dailyData.totalValueLockedUSD), Number(dailyData.feesUSD));
        if (dayAPR === 0 || Number(dailyData.totalValueLockedUSD) < params.filters.minTvlUsd) continue;

        if (Number(dailyData.dayStartTimestamp) > Date.getDaysAgoTimestamp(7 + trimmedAveragePercentage7Days * 7)) {
          pool7DaysYields.push(dayAPR);
        }

        if (Number(dailyData.dayStartTimestamp) > Date.getDaysAgoTimestamp(30 + trimmedAveragePercentage30Days * 30)) {
          pool30dYields.push(dayAPR);
        }

        if (Number(dailyData.dayStartTimestamp) > Date.getDaysAgoTimestamp(90 + trimmedAveragePercentage90Days * 90)) {
          pool90dYields.push(dayAPR);
        }
      }

      const poolYield24h =
        pool.hourlyData.length < 10 ? 0 : calculateDayPoolAPR(Number(pool.totalValueLockedUSD), pool24hFees);

      const poolYield7d =
        pool7DaysYields.length < 3 ? 0 : trimmedAverage(pool7DaysYields, trimmedAveragePercentage7Days);

      const poolYield30d =
        pool30dYields.length < 20 ? 0 : trimmedAverage(pool30dYields, trimmedAveragePercentage30Days);

      const poolYield90d =
        pool90dYields.length < 70 ? 0 : trimmedAverage(pool90dYields, trimmedAveragePercentage90Days);

      if (poolYield24h === 0 && poolYield7d === 0 && poolYield30d === 0 && poolYield90d === 0) {
        continue; // skip pool if all yields are 0
      }

      const basePool: PoolDTO = {
        chainId: pool.chainId,
        poolAddress: pool.poolAddress,
        totalValueLockedUSD: Number(pool.totalValueLockedUSD),
        yield24h: poolYield24h,
        yield30d: poolYield30d,
        yield90d: poolYield90d,
        yield7d: poolYield7d,
        poolType: pool.poolType,
        protocol: {
          id: pool.protocol!.id,
          // TODO: Remove workaround once the subgraph is updated using logos from CDN
          logo: pool.protocol!.logo.replace(
            'https://raw.githubusercontent.com/trustwallet/assets/refs/heads/master/dapps/',
            'https://assets-cdn.trustwallet.com/dapps/',
          ),
          name: pool.protocol!.name,
          url: pool.protocol!.url,
        },
        token0: poolToken0Metadata(),
        token1: poolToken1Metadata(),
        positionManagerAddress: pool.positionManager,
        initialFeeTier: pool.initialFeeTier,
        currentFeeTier: pool.currentFeeTier,
      };

      if (pool.poolType === 'V3') {
        const v3Pool: V3PoolDTO = {
          ...basePool,
          latestSqrtPriceX96: pool.v3PoolData!.sqrtPriceX96,
          tickSpacing: pool.v3PoolData!.tickSpacing,
          latestTick: pool.v3PoolData!.tick,
          deployerAddress: pool.algebraPoolData?.deployer,
        };

        matchedPools.push(v3Pool);
        continue;
      }

      if (pool.poolType === 'V4') {
        const v4Pool: V4PoolDTO = {
          ...basePool,
          permit2Address: pool.v4PoolData!.permit2,
          latestTick: pool.v4PoolData!.tick,
          tickSpacing: pool.v4PoolData!.tickSpacing,
          hooksAddress: pool.v4PoolData!.hooks,
          poolManagerAddress: pool.v4PoolData!.poolManager,
          stateViewAddress: pool.v4PoolData!.stateView ?? '',
          latestSqrtPriceX96: pool.v4PoolData!.sqrtPriceX96,
        };

        matchedPools.push(v4Pool);
        continue;
      }

      throw new Error('Unsupported pool type received');
    }

    return matchedPools;
  }
}
