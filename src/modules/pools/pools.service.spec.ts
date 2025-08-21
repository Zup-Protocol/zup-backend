import { GraphQLClient } from 'graphql-request';
import { any } from 'jest-mock-extended';
import mock, { _MockProxy } from 'jest-mock-extended/lib/Mock';
import { zeroEthereumAddress } from 'src/core/constants';
import { MatchedPoolsDTO } from 'src/core/dtos/matched-pools.dto';
import { PoolSearchFiltersDTO } from 'src/core/dtos/pool-search-filters.dto';
import { TokenPriceDTO } from 'src/core/dtos/token-price-dto';
import { V4PoolDTO } from 'src/core/dtos/v4-pool.dto';
import { Networks, NetworksUtils } from 'src/core/enums/networks';
import { PoolType } from 'src/core/enums/pool-type';
import { tokenList } from 'src/core/token-list';
import { SupportedPoolType } from 'src/core/types';
import { isArrayEmptyOrUndefined } from 'src/core/utils/array-utils';
import { GetPoolsDocument, GetPoolsQuery, GetPoolsQueryVariables, Pool_Bool_Exp } from 'src/gen/graphql.gen';
import { TokensService } from '../tokens/tokens.service';
import { PoolsService } from './pools.service';

describe('PoolsController', () => {
  let sut: PoolsService;
  let tokensService: _MockProxy<TokensService> & TokensService;
  let graphqlClient: GraphQLClient;

  beforeEach(() => {
    tokensService = mock<TokensService>();
    tokensService.getPopularTokens.mockReturnValue(tokenList);
    tokensService.searchTokensByNameOrSymbol.mockReturnValue(tokenList);
    tokensService.getTokenPrice.mockResolvedValue(<TokenPriceDTO>{
      address: '0x1234567890123456789012345678901234567890',
      usdPrice: 120.312,
    });
    tokensService.getTokenByAddress.calledWith(any(), any()).mockResolvedValue(tokenList[0]);

    const graphQLRequestMock = jest.fn().mockReturnValue({ Pool: [] });

    graphqlClient = {
      request: graphQLRequestMock,
    } as unknown as GraphQLClient;

    sut = new PoolsService(tokensService, graphqlClient);
  });

  it('should call the graphql url with the correct query and params to search pools in a specific chain', async () => {
    const token0Address = '0x0000000000000000000000000000000000000001';
    const token1Address = '0x0000000000000000000000000000000000000002';
    const network = Networks.ETHEREUM;
    const mintvlusd = 321;
    const filters: PoolSearchFiltersDTO = {
      blockedProtocols: [],
      allowedPoolTypes: Object.values(PoolType),
      testnetMode: false,
      minTvlUsd: mintvlusd,
    };

    await sut.searchPoolsInChain({
      token0Addresses: [token0Address],
      token1Addresses: [token1Address],
      network,
      filters,
    });

    expect(graphqlClient.request).toHaveBeenCalledWith(GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        _and: [
          {
            totalValueLockedUSD: {
              _gt: mintvlusd.toString(),
              _lt: '1000000000000',
            },
            poolType: {
              _in: filters.allowedPoolTypes,
            },
            dailyData: any(),
          },
          {
            _or: [
              {
                _and: [
                  {
                    chainId: {
                      _eq: network,
                    },
                  },
                  {
                    _or: [
                      {
                        token0: {
                          tokenAddress: {
                            _in: [token0Address],
                          },
                        },
                        token1: {
                          tokenAddress: {
                            _in: [token1Address],
                          },
                        },
                      },
                      {
                        token0: {
                          tokenAddress: {
                            _in: [token1Address],
                          },
                        },
                        token1: {
                          tokenAddress: {
                            _in: [token0Address],
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      dailyDataFilter: {
        feesUSD: any(),
        dayStartTimestamp: {
          _gt: Date.getDaysAgoTimestamp(90).toString(),
        },
      },
      hourlyDataFilter: {
        feesUSD: any(),
        hourStartTimestamp: {
          _gt: Date.yesterdayStartSecondsTimestamp().toString(),
        },
      },
    });
  });

  it(`should call the graphql url with the correct query and params to search pools in a
      specific chain when the blocked protocols ids is greater than 0`, async () => {
    const token0Address = '0x0000000000000000000000000000000000000001';
    const token1Address = '0x0000000000000000000000000000000000000002';
    const network = Networks.ETHEREUM;
    const mintvlusd = 321;
    const filters: PoolSearchFiltersDTO = {
      blockedProtocols: ['uniswap-v2', 'uniswap-v3', 'quickswap'],
      allowedPoolTypes: Object.values(PoolType),
      testnetMode: false,
      minTvlUsd: mintvlusd,
    };

    await sut.searchPoolsInChain({
      token0Addresses: [token0Address],
      token1Addresses: [token1Address],
      network,
      filters,
    });

    expect(graphqlClient.request).toHaveBeenCalledWith(GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        _and: [
          {
            totalValueLockedUSD: {
              _gt: mintvlusd.toString(),
              _lt: any(),
            },
            poolType: {
              _in: filters.allowedPoolTypes,
            },
            protocol_id: {
              _nin: filters.blockedProtocols,
            },
            dailyData: {
              dayStartTimestamp: any(),
            },
          },
          {
            _or: [
              {
                _and: [
                  {
                    chainId: {
                      _eq: network,
                    },
                  },
                  {
                    _or: [
                      {
                        token0: {
                          tokenAddress: {
                            _in: [token0Address],
                          },
                        },
                        token1: {
                          tokenAddress: {
                            _in: [token1Address],
                          },
                        },
                      },
                      {
                        token0: {
                          tokenAddress: {
                            _in: [token1Address],
                          },
                        },
                        token1: {
                          tokenAddress: {
                            _in: [token0Address],
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      dailyDataFilter: {
        feesUSD: any(),
        dayStartTimestamp: {
          _gt: Date.getDaysAgoTimestamp(90).toString(),
        },
      },
      hourlyDataFilter: {
        feesUSD: any(),
        hourStartTimestamp: {
          _gt: Date.yesterdayStartSecondsTimestamp().toString(),
        },
      },
    });
  });

  it(`should call the graphql url with the correct query and params to search pools in all
     chains when the blocked protocols ids is greater than 0`, async () => {
    const token0 = tokenList[1];
    const token1 = tokenList[2];
    const token02 = tokenList[3];
    const token12 = tokenList[4];

    const token0AddressesPerChainId: Record<number, string[]> = {};
    const token1AddressesPerChainId: Record<number, string[]> = {};

    Object.entries(token0.addresses)
      .concat(Object.entries(token02.addresses))
      .forEach(([network, address]) => {
        if (!token0AddressesPerChainId[Number(network)]) token0AddressesPerChainId[Number(network)] = [];
        if (address) token0AddressesPerChainId[Number(network)].push(address.toLowerCase());
      });

    Object.entries(token1.addresses)
      .concat(Object.entries(token12.addresses))
      .forEach(([network, address]) => {
        if (!token1AddressesPerChainId[Number(network)]) token1AddressesPerChainId[Number(network)] = [];
        if (address) token1AddressesPerChainId[Number(network)].push(address.toLowerCase());
      });

    const networks = new Set<number>(
      Object.keys(token0AddressesPerChainId)
        .concat(Object.keys(token1AddressesPerChainId))
        .map((network) => Number(network)),
    );

    const possibleCombinations: Pool_Bool_Exp[] = [];

    for (const network of networks) {
      if (NetworksUtils.isTestnet(network)) {
        continue;
      }
      if (
        isArrayEmptyOrUndefined(token0AddressesPerChainId[network]) ||
        isArrayEmptyOrUndefined(token1AddressesPerChainId[network])
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
                    _in: token0AddressesPerChainId[network],
                  },
                },
                token1: {
                  tokenAddress: {
                    _in: token1AddressesPerChainId[network],
                  },
                },
              },
              {
                token0: {
                  tokenAddress: {
                    _in: token1AddressesPerChainId[network],
                  },
                },
                token1: {
                  tokenAddress: {
                    _in: token0AddressesPerChainId[network],
                  },
                },
              },
            ],
          },
        ],
      });
    }

    const mintvlusd = 321;
    const filters: PoolSearchFiltersDTO = {
      blockedProtocols: ['uniswap-v2', 'uniswap-v3', 'quickswap'],
      allowedPoolTypes: Object.values(PoolType),
      testnetMode: false,
      minTvlUsd: mintvlusd,
    };

    await sut.searchPoolsCrossChain({
      token0Ids: [token0.id!, token02.id!],
      token1Ids: [token1.id!, token12.id!],
      filters,
    });

    expect(graphqlClient.request).toHaveBeenCalledWith(GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        _and: [
          {
            totalValueLockedUSD: {
              _gt: mintvlusd.toString(),
              _lt: '1000000000000',
            },
            poolType: {
              _in: filters.allowedPoolTypes,
            },
            protocol_id: {
              _nin: filters.blockedProtocols,
            },
            dailyData: any(),
          },
          {
            _or: possibleCombinations,
          },
        ],
      },
      dailyDataFilter: {
        feesUSD: any(),
        dayStartTimestamp: {
          _gt: Date.getDaysAgoTimestamp(90).toString(),
        },
      },
      hourlyDataFilter: {
        feesUSD: any(),
        hourStartTimestamp: {
          _gt: Date.yesterdayStartSecondsTimestamp().toString(),
        },
      },
    });
  });

  it('Should process and return the pool data got from the graphQL query correctly when calling the searchPoolsInChain method', async () => {
    const expectedPoolResult: SupportedPoolType = {
      latestTick: '0',
      deployerAddress: undefined,
      token0: {
        addresses: {
          [Networks.ETHEREUM]: tokenList[0].addresses[Networks.ETHEREUM],
        } as unknown as Record<Networks, string>,
        name: tokenList[0].name,
        symbol: tokenList[0].symbol,
        decimals: tokenList[0].decimals,
      },
      token1: {
        addresses: {
          [Networks.ETHEREUM]: tokenList[2].addresses[Networks.ETHEREUM],
        } as unknown as Record<Networks, string>,
        name: tokenList[2].name,
        symbol: tokenList[2].symbol,
        decimals: tokenList[2].decimals,
      },
      chainId: Networks.ETHEREUM,
      totalValueLockedUSD: 98261715.218,
      feeTier: 500,
      poolAddress: '0xA30B2D8c8eB4aA8a5F6eF9C1E5Bd0A1b1eA4B1E5',
      poolType: PoolType.V3,
      positionManagerAddress: '0xB30B2D8c8eB4aA8a5F6eF9C1E5Bd0A1b1eA4B1E5',
      yield24h: 0.8914967523786218,
      yield30d: 3650,
      yield90d: 3650,
      yield7d: 3650,
      protocol: {
        id: 'uniswap',
        name: 'Uniswap V3',
        url: 'https://uniswap.org',
        logo: 'https://www.pudim.com.br/pudim.jpg',
      },
      tickSpacing: 10,
    };

    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          dailyData: Array.from({ length: 90 }, (_, index) => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(index).toString(),
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          v3PoolData: {
            tick: expectedPoolResult.latestTick,
            tickSpacing: expectedPoolResult.tickSpacing,
          },
          initialFeeTier: expectedPoolResult.feeTier,
          currentFeeTier: expectedPoolResult.feeTier,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '100',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: expectedPoolResult.poolAddress,
          poolAddress: expectedPoolResult.poolAddress,
          chainId: expectedPoolResult.chainId,
          positionManager: expectedPoolResult.positionManagerAddress,
          protocol: {
            id: 'uniswap',
            logo: expectedPoolResult.protocol.logo,
            name: expectedPoolResult.protocol.name,
            url: expectedPoolResult.protocol.url,
          },
          token0: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            decimals: expectedPoolResult.token0.decimals[Networks.ETHEREUM]!,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: expectedPoolResult.token0.name,
            symbol: expectedPoolResult.token0.symbol,
          },
          token1: {
            tokenAddress: expectedPoolResult.token1.addresses[Networks.ETHEREUM] as string,
            decimals: expectedPoolResult.token1.decimals[Networks.ETHEREUM]!,
            id: expectedPoolResult.token1.addresses[Networks.ETHEREUM] as string,
            name: expectedPoolResult.token1.name,
            symbol: expectedPoolResult.token1.symbol,
          },
          poolType: PoolType.V3,
          totalValueLockedUSD: expectedPoolResult.totalValueLockedUSD.toString(),
        },
      ],
    };

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    tokensService.getTokenByAddress
      .calledWith(expectedPoolResult.chainId, expectedPoolResult.token0.addresses[Networks.ETHEREUM]!)
      .mockResolvedValue(expectedPoolResult.token0);

    tokensService.getTokenByAddress
      .calledWith(expectedPoolResult.chainId, expectedPoolResult.token1.addresses[Networks.ETHEREUM]!)
      .mockResolvedValue(expectedPoolResult.token1);

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: [expectedPoolResult.token0.addresses[expectedPoolResult.chainId]!],
      token1Addresses: [expectedPoolResult.token1.addresses[expectedPoolResult.chainId]!],
      network: expectedPoolResult.chainId,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result).toEqual(<MatchedPoolsDTO>{
      pools: [expectedPoolResult],
      filters: new PoolSearchFiltersDTO(),
    });
  });

  it('Should match liquidity pools from different networks with the same tokens when calling searchPoolsCrossChain', async () => {
    const token0 = tokenList[1];
    const token1 = tokenList[2];

    const poolResult1: SupportedPoolType = {
      deployerAddress: undefined,
      token0: token0,
      token1: token1,
      chainId: Networks.ETHEREUM,
      totalValueLockedUSD: 98261715.218,
      feeTier: 500,
      latestTick: '32657',
      poolAddress: '0xA30B2D8c8eB4aA8a5F6eF9C1E5Bd0A1b1eA4B1E5',
      poolType: PoolType.V3,
      positionManagerAddress: '0xB30B2D8c8eB4aA8a5F6eF9C1E5Bd0A1b1eA4B1E5',
      yield24h: 0.8914967523786218,
      yield30d: 3650,
      yield90d: 3650,
      yield7d: 3650,
      protocol: {
        id: 'uniswap',
        name: 'Uniswap V3',
        url: 'https://uniswap.org',
        logo: 'https://www.pudim.com.br/pudim.jpg',
      },
      tickSpacing: 10,
    };

    const poolResult2: SupportedPoolType = {
      deployerAddress: undefined,
      token0: token0,
      token1: token1,
      chainId: Networks.SCROLL,
      totalValueLockedUSD: 98261715.218,
      latestTick: '89621782',
      feeTier: 500,
      poolAddress: '0xA30B2D8c8eB4aA8a5F6eF9C1E5Bd0A1b1eA4B1E5',
      poolType: PoolType.V3,
      positionManagerAddress: '0xB30B2D8c8eB4aA8a5F6eF9C1E5Bd0A1b1eA4B1E5',
      yield24h: 0.8914967523786218,
      yield30d: 3650,
      yield90d: 3650,
      yield7d: 3650,
      protocol: {
        id: 'uniswap',
        name: 'Uniswap V3',
        url: 'https://uniswap.org',
        logo: 'https://www.pudim.com.br/pudim.jpg',
      },
      tickSpacing: 10,
    };

    const mockResponse: GetPoolsQuery = {
      Pool: [
        {
          dailyData: Array.from({ length: 90 }, (_, index) => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(index).toString(),
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          v3PoolData: {
            tickSpacing: poolResult1.tickSpacing,
            tick: poolResult1.latestTick,
          },
          initialFeeTier: poolResult1.feeTier,
          currentFeeTier: poolResult1.feeTier,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '100',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: poolResult1.poolAddress,
          poolAddress: poolResult1.poolAddress,
          chainId: poolResult1.chainId,
          positionManager: poolResult1.positionManagerAddress,
          protocol: {
            id: 'uniswap',
            logo: poolResult1.protocol.logo,
            name: poolResult1.protocol.name,
            url: poolResult1.protocol.url,
          },
          token0: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(poolResult1.chainId),
            decimals: poolResult1.token0.decimals[poolResult1.chainId]!,
            id: NetworksUtils.wrappedNativeAddress(poolResult1.chainId),
            name: poolResult1.token0.name,
            symbol: poolResult1.token0.symbol,
          },
          token1: {
            tokenAddress: poolResult1.token1.addresses[Networks.ETHEREUM] as string,
            decimals: poolResult1.token1.decimals[poolResult1.chainId]!,
            id: poolResult1.token1.addresses[Networks.ETHEREUM] as string,
            name: poolResult1.token1.name,
            symbol: poolResult1.token1.symbol,
          },

          poolType: PoolType.V3,
          totalValueLockedUSD: poolResult1.totalValueLockedUSD.toString(),
        },
        {
          dailyData: Array.from({ length: 90 }, (_, index) => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(index).toString(),
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          v3PoolData: {
            tick: poolResult2.latestTick,
            tickSpacing: poolResult2.tickSpacing,
          },
          initialFeeTier: poolResult2.feeTier,
          currentFeeTier: poolResult2.feeTier,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '100',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: poolResult2.poolAddress,
          positionManager: poolResult2.positionManagerAddress,
          protocol: {
            id: 'uniswap',
            logo: poolResult2.protocol.logo,
            name: poolResult2.protocol.name,
            url: poolResult2.protocol.url,
          },
          token0: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(poolResult2.chainId),
            decimals: poolResult2.token0.decimals[poolResult2.chainId]!,
            id: NetworksUtils.wrappedNativeAddress(poolResult2.chainId),
            name: poolResult2.token0.name,
            symbol: poolResult2.token0.symbol,
          },
          token1: {
            tokenAddress: poolResult2.token1.addresses[Networks.SCROLL] as string,
            decimals: poolResult2.token1.decimals[poolResult2.chainId]!,
            id: poolResult2.token1.addresses[Networks.SCROLL] as string,
            name: poolResult2.token1.name,
            symbol: poolResult2.token1.symbol,
          },
          poolType: 'V3',
          chainId: poolResult2.chainId,
          poolAddress: poolResult2.poolAddress,
          totalValueLockedUSD: poolResult2.totalValueLockedUSD.toString(),
        },
      ],
    };

    const graphqlClient = {
      request: jest.fn().mockResolvedValue(mockResponse),
    } as unknown as GraphQLClient;

    tokensService.getTokenByAddress.calledWith(any(), token0.addresses[poolResult1.chainId]!).mockResolvedValue(token0);
    tokensService.getTokenByAddress.calledWith(any(), token1.addresses[poolResult1.chainId]!).mockResolvedValue(token1);

    tokensService.getTokenByAddress.calledWith(any(), token0.addresses[poolResult2.chainId]!).mockResolvedValue(token0);
    tokensService.getTokenByAddress.calledWith(any(), token1.addresses[poolResult2.chainId]!).mockResolvedValue(token1);

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsCrossChain({
      token0Ids: [token0.id!],
      token1Ids: [token1.id!],
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result).toEqual(<MatchedPoolsDTO>{
      pools: [poolResult1, poolResult2],
      filters: new PoolSearchFiltersDTO(),
    });
  });

  it('When the search has the token 0 with zero address (native token), it should also search for the wrapped native address', async () => {
    const sut = new PoolsService(tokensService, graphqlClient);
    const network = Networks.SEPOLIA;
    const token1Address = '0x0000000000000000000000000000000000000001';

    await sut.searchPoolsInChain({
      token0Addresses: [zeroEthereumAddress],
      token1Addresses: [token1Address],
      network: network,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(graphqlClient.request).toHaveBeenCalledWith(GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        _and: [
          {
            totalValueLockedUSD: {
              _gt: any(),
              _lt: any(),
            },
            poolType: {
              _in: any(),
            },
            dailyData: any(),
          },
          {
            _or: [
              {
                _and: [
                  {
                    chainId: {
                      _eq: network,
                    },
                  },
                  {
                    _or: [
                      {
                        token0: {
                          tokenAddress: {
                            _in: [zeroEthereumAddress, NetworksUtils.wrappedNativeAddress(network).toLowerCase()],
                          },
                        },
                        token1: {
                          tokenAddress: {
                            _in: [token1Address],
                          },
                        },
                      },
                      {
                        token0: {
                          tokenAddress: {
                            _in: [token1Address],
                          },
                        },
                        token1: {
                          tokenAddress: {
                            _in: [zeroEthereumAddress, NetworksUtils.wrappedNativeAddress(network).toLowerCase()],
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      dailyDataFilter: {
        feesUSD: any(),
        dayStartTimestamp: {
          _gt: Date.getDaysAgoTimestamp(90).toString(),
        },
      },
      hourlyDataFilter: {
        feesUSD: any(),
        hourStartTimestamp: {
          _gt: Date.yesterdayStartSecondsTimestamp().toString(),
        },
      },
    });
  });

  it(`When the search has the token 0 with zero address (native token) in many networks,
    it should also search for the wrapped native address for all networks when using
    the cross chain search`, async () => {
    const sut = new PoolsService(tokensService, graphqlClient);
    const token0 = tokenList[0]; // Should be ETH
    const token1 = tokenList[1];

    const token0AddressesPerChainId: Record<number, string[]> = Object.entries(token0.addresses).reduce(
      (acc, [network, address]) => {
        if (address) acc[Number(network)] = [address.toLowerCase()];

        return acc;
      },
      {},
    );
    const token1AddressesPerChainId: Record<number, string[]> = Object.entries(token1.addresses).reduce(
      (acc, [network, address]) => {
        if (address) acc[Number(network)] = [address.toLowerCase()];

        return acc;
      },
      {},
    );

    const networks = new Set<number>(
      Object.keys(token0AddressesPerChainId)
        .concat(Object.keys(token1AddressesPerChainId))
        .map((network) => Number(network))
        .filter((network) => !NetworksUtils.isTestnet(network)),
    );

    const possibleCombinations: Pool_Bool_Exp[] = [];

    for (const network of networks) {
      if (!token0AddressesPerChainId[network] || !token1AddressesPerChainId[network]) {
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
                    _in: token0AddressesPerChainId[network].concat(
                      NetworksUtils.wrappedNativeAddress(network).toLowerCase(),
                    ),
                  },
                },
                token1: {
                  tokenAddress: {
                    _in: token1AddressesPerChainId[network],
                  },
                },
              },
              {
                token0: {
                  tokenAddress: {
                    _in: token1AddressesPerChainId[network],
                  },
                },
                token1: {
                  tokenAddress: {
                    _in: token0AddressesPerChainId[network].concat(
                      NetworksUtils.wrappedNativeAddress(network).toLowerCase(),
                    ),
                  },
                },
              },
            ],
          },
        ],
      });
    }

    await sut.searchPoolsCrossChain({
      token0Ids: [token0.id!],
      token1Ids: [token1.id!],
      filters: new PoolSearchFiltersDTO(),
    });

    expect(graphqlClient.request).toHaveBeenCalledWith(GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        _and: [
          {
            totalValueLockedUSD: {
              _gt: any(),
              _lt: any(),
            },
            poolType: {
              _in: any(),
            },
            dailyData: any(),
          },
          {
            _or: possibleCombinations,
          },
        ],
      },
      dailyDataFilter: {
        feesUSD: any(),
        dayStartTimestamp: {
          _gt: Date.getDaysAgoTimestamp(90).toString(),
        },
      },
      hourlyDataFilter: {
        feesUSD: any(),
        hourStartTimestamp: {
          _gt: Date.yesterdayStartSecondsTimestamp().toString(),
        },
      },
    });
  });

  it(`When the search has the token 1 with zero address (native token) in many networks,
    it should also search for the wrapped native address for all networks when using
    the cross chain search`, async () => {
    const sut = new PoolsService(tokensService, graphqlClient);
    const token0 = tokenList[1];
    const token1 = tokenList[0]; // Should be ETH

    const token0AddressesPerChainId: Record<number, string[]> = Object.entries(token0.addresses).reduce(
      (acc, [network, address]) => {
        if (address) acc[Number(network)] = [address.toLowerCase()];

        return acc;
      },
      {},
    );
    const token1AddressesPerChainId: Record<number, string[]> = Object.entries(token1.addresses).reduce(
      (acc, [network, address]) => {
        if (address) acc[Number(network)] = [address.toLowerCase()];

        return acc;
      },
      {},
    );

    const networks = new Set<number>(
      Object.keys(token0AddressesPerChainId)
        .concat(Object.keys(token1AddressesPerChainId))
        .map((network) => Number(network))
        .filter((network) => !NetworksUtils.isTestnet(network)),
    );

    const possibleCombinations: Pool_Bool_Exp[] = [];

    for (const network of networks) {
      if (!token0AddressesPerChainId[network] || !token1AddressesPerChainId[network]) {
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
                    _in: token0AddressesPerChainId[network],
                  },
                },
                token1: {
                  tokenAddress: {
                    _in: token1AddressesPerChainId[network].concat(
                      NetworksUtils.wrappedNativeAddress(network).toLowerCase(),
                    ),
                  },
                },
              },
              {
                token0: {
                  tokenAddress: {
                    _in: token1AddressesPerChainId[network].concat(
                      NetworksUtils.wrappedNativeAddress(network).toLowerCase(),
                    ),
                  },
                },
                token1: {
                  tokenAddress: {
                    _in: token0AddressesPerChainId[network],
                  },
                },
              },
            ],
          },
        ],
      });
    }

    await sut.searchPoolsCrossChain({
      token0Ids: [token0.id!],
      token1Ids: [token1.id!],
      filters: new PoolSearchFiltersDTO(),
    });

    expect(graphqlClient.request).toHaveBeenCalledWith(GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        _and: [
          {
            totalValueLockedUSD: {
              _gt: any(),
              _lt: any(),
            },
            poolType: {
              _in: any(),
            },
            dailyData: any(),
          },
          {
            _or: possibleCombinations,
          },
        ],
      },
      dailyDataFilter: {
        feesUSD: any(),
        dayStartTimestamp: {
          _gt: Date.getDaysAgoTimestamp(90).toString(),
        },
      },
      hourlyDataFilter: {
        feesUSD: any(),
        hourStartTimestamp: {
          _gt: Date.yesterdayStartSecondsTimestamp().toString(),
        },
      },
    });
  });

  it('should return hooks address, pool manager address and state view address when the pool type is v4', async () => {
    const hooksAddress = '0x0000000000000000000000000000000000000111';
    const poolManagerAddress = '0x0000000000000000000000000000000000000222';
    const stateViewAddress = '0x0000000000000000000000000000000000000333';

    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          dailyData: Array.from({ length: 90 }, () => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(90).toString(),
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          initialFeeTier: 1079,
          currentFeeTier: 1079,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '100',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0d4a11d5eeaac28ec3f61d1005ee9b9f5060c61a',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://uniswap.org',
          },
          v4PoolData: {
            stateView: stateViewAddress,
            poolManager: poolManagerAddress,
            permit2: '0x0d4a11d5eeaac28ec3f61d1005ee9b9f5060c61a',
            hooks: hooksAddress,
            tick: '123',
            tickSpacing: 987,
          },
          positionManager: '0x0d4a11d5eeaac28ec3f61d1005ee9b9f5060c61a',
          token0: {
            tokenAddress: tokenList[0].addresses[Networks.ETHEREUM] as string,
            decimals: tokenList[0].decimals[Networks.ETHEREUM]!,
            id: tokenList[0].addresses[Networks.ETHEREUM] as string,
            name: tokenList[0].name,
            symbol: tokenList[0].symbol,
          },
          token1: {
            tokenAddress: tokenList[3].addresses[Networks.ETHEREUM] as string,
            decimals: tokenList[3].decimals[Networks.ETHEREUM]!,
            id: tokenList[3].addresses[Networks.ETHEREUM] as string,
            name: tokenList[3].name,
            symbol: tokenList[3].symbol,
          },
          poolType: 'V4',
          chainId: Networks.ETHEREUM,
          poolAddress: '0x0d4a11d5eeaac28ec3f61d1005ee9b9f5060c61a',

          totalValueLockedUSD: '12231.32',
        },
      ],
    };

    const poolsResult: MatchedPoolsDTO = {
      filters: new PoolSearchFiltersDTO(),
      pools: [
        {
          latestTick: poolsQueryResponse.Pool[0].v4PoolData!.tick,
          chainId: Networks.ETHEREUM,
          feeTier: poolsQueryResponse.Pool[0].initialFeeTier,
          hooksAddress: hooksAddress,
          poolAddress: poolsQueryResponse.Pool[0].id,
          totalValueLockedUSD: Number.parseFloat(poolsQueryResponse.Pool[0].totalValueLockedUSD),
          poolType: PoolType.V4,
          tickSpacing: poolsQueryResponse.Pool[0].v4PoolData!.tickSpacing,
          positionManagerAddress: poolsQueryResponse.Pool[0].positionManager,
          protocol: {
            id: poolsQueryResponse.Pool[0].protocol!.id,
            logo: poolsQueryResponse.Pool[0].protocol!.logo,
            name: poolsQueryResponse.Pool[0].protocol!.name,
            url: poolsQueryResponse.Pool[0].protocol!.url,
          },
          token0: {
            addresses: {
              [Networks.ETHEREUM]: poolsQueryResponse.Pool[0].token0!.id,
            } as Record<Networks, string>,
            decimals: {
              [Networks.ETHEREUM]: poolsQueryResponse.Pool[0].token0!.decimals,
            } as Record<Networks, number>,
            name: poolsQueryResponse.Pool[0].token0!.name,
            symbol: poolsQueryResponse.Pool[0].token0!.symbol,
          },
          yield24h: 7161.941638351379,
          yield30d: 3650,
          yield90d: 3650,
          yield7d: 3650,
          stateViewAddress: stateViewAddress,
          poolManagerAddress: poolManagerAddress,
          permit2Address: poolsQueryResponse.Pool[0].v4PoolData!.permit2,
          token1: {
            addresses: {
              [Networks.ETHEREUM]: poolsQueryResponse.Pool[0].token1!.id,
            } as Record<Networks, string>,
            decimals: {
              [Networks.ETHEREUM]: poolsQueryResponse.Pool[0].token1!.decimals,
            } as Record<Networks, number>,
            name: poolsQueryResponse.Pool[0].token1!.name,
            symbol: poolsQueryResponse.Pool[0].token1!.symbol,
          },
        },
      ],
    };

    const graphQlRequestMock = jest.fn().mockReturnValue(poolsQueryResponse);

    graphqlClient = {
      request: graphQlRequestMock,
    } as unknown as GraphQLClient;

    tokensService.getTokenByAddress
      .calledWith(any(), poolsQueryResponse.Pool[0].token0!.id)
      .mockResolvedValue(poolsResult.pools[0].token0);

    tokensService.getTokenByAddress
      .calledWith(any(), poolsQueryResponse.Pool[0].token1!.id)
      .mockResolvedValue(poolsResult.pools[0].token1);

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = (
      await sut.searchPoolsInChain({
        token0Addresses: [poolsResult.pools[0].token0.addresses[poolsResult.pools[0].chainId]!],
        token1Addresses: [poolsResult.pools[0].token1.addresses[poolsResult.pools[0].chainId]!],
        network: Networks.ETHEREUM,
        filters: new PoolSearchFiltersDTO(),
      })
    ).pools[0];

    expect((result as V4PoolDTO).hooksAddress).toEqual(hooksAddress);
    expect((result as V4PoolDTO).stateViewAddress).toEqual(stateViewAddress);
    expect((result as V4PoolDTO).poolManagerAddress).toEqual(poolManagerAddress);
  });

  it('should request the graphql provider correctly with the pool type as filter if filter pool types are provided', async () => {
    const network = Networks.ETHEREUM;
    const token0Address = '0x0000000000000000000000000000000000000001';
    const token1Address = '0x0000000000000000000000000000000000000002';
    const minTvlUsd = 0;

    await sut.searchPoolsInChain({
      network: network,
      token1Addresses: [token1Address],
      token0Addresses: [token0Address],
      filters: {
        blockedProtocols: [],
        minTvlUsd: minTvlUsd,
        testnetMode: false,
        allowedPoolTypes: [PoolType.V4],
      },
    });

    expect(graphqlClient.request).toHaveBeenCalledWith(GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        _and: [
          {
            totalValueLockedUSD: {
              _gt: minTvlUsd.toString(),
              _lt: any(),
            },
            poolType: {
              _in: [PoolType.V4],
            },
            dailyData: any(),
          },
          {
            _or: [
              {
                _and: [
                  {
                    chainId: {
                      _eq: network,
                    },
                  },
                  {
                    _or: [
                      {
                        token0: {
                          tokenAddress: {
                            _in: [token0Address],
                          },
                        },
                        token1: {
                          tokenAddress: {
                            _in: [token1Address],
                          },
                        },
                      },
                      {
                        token1: {
                          tokenAddress: {
                            _in: [token0Address],
                          },
                        },
                        token0: {
                          tokenAddress: {
                            _in: [token1Address],
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      dailyDataFilter: {
        feesUSD: any(),
        dayStartTimestamp: {
          _gt: Date.getDaysAgoTimestamp(90).toString(),
        },
      },
      hourlyDataFilter: {
        feesUSD: any(),
        hourStartTimestamp: {
          _gt: Date.yesterdayStartSecondsTimestamp().toString(),
        },
      },
    });
  });

  it('Should return zero as yield when there are not at least 20 days of data in the 30d yield', async () => {
    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          v3PoolData: {
            tick: '26187',
            tickSpacing: 10,
          },
          dailyData: Array.from({ length: 10 }, () => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(10).toString(),
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          initialFeeTier: 100,
          currentFeeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '100',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://example.com/uniswap',
          },
          positionManager: '0x0000000000000000000000000000000000000001',

          token0: {
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
            tokenAddress: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
          },
          token1: {
            tokenAddress: '0x0000000000000000000000000000000000000002',
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          poolType: PoolType.V3,
          chainId: Networks.ETHEREUM,
          poolAddress: '0x0000000000000000000000000000000000000001',
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: ['<token0Address>'],
      token1Addresses: ['<token1Address>'],
      network: Networks.ETHEREUM,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools[0].yield30d).toBe(0);
  });

  it('Should return zero as yield when there are not at least 3 days of data in the 7d yield', async () => {
    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          v3PoolData: {
            tick: '26187',
            tickSpacing: 10,
          },
          dailyData: Array.from({ length: 2 }, () => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(10).toString(),
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          initialFeeTier: 100,
          currentFeeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '100',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://example.com/uniswap',
          },
          positionManager: '0x0000000000000000000000000000000000000001',
          token0: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            tokenAddress: '0x0000000000000000000000000000000000000002',
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          poolType: 'V3',
          chainId: Networks.ETHEREUM,
          poolAddress: '0x0000000000000000000000000000000000000001',
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: ['<token0Address>'],
      token1Addresses: ['<token1Address>'],
      network: Networks.ETHEREUM,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools[0].yield7d).toBe(0);
  });

  it('Should return zero as yield when there are not at least 10 hours of data in the 24h yield', async () => {
    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          v3PoolData: {
            tick: '26187',
            tickSpacing: 10,
          },
          dailyData: Array.from({ length: 10 }, (_, index) => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(index).toString(),
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          initialFeeTier: 100,
          currentFeeTier: 100,
          hourlyData: Array.from({ length: 8 }, () => ({
            feesUSD: '100',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://example.com/uniswap',
          },

          positionManager: '0x0000000000000000000000000000000000000001',
          token0: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            tokenAddress: '0x0000000000000000000000000000000000000002',
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          poolType: 'V3',
          chainId: Networks.ETHEREUM,
          poolAddress: '0x0000000000000000000000000000000000000001',
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: ['<token0Address>'],
      token1Addresses: ['<token1Address>'],
      network: Networks.ETHEREUM,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools[0].yield24h).toBe(0);
  });

  it('Should not return zero as yield when there are at least 10 hours of data in the 24h yield', async () => {
    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          dailyData: Array.from({ length: 10 }, (_, index) => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(index).toString(),
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          v3PoolData: {
            tick: '26187',
            tickSpacing: 10,
          },
          initialFeeTier: 100,
          currentFeeTier: 100,
          hourlyData: Array.from({ length: 11 }, () => ({
            feesUSD: '100',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://example.com/uniswap',
          },
          positionManager: '0x0000000000000000000000000000000000000001',
          chainId: Networks.ETHEREUM,
          token0: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            tokenAddress: '0x0000000000000000000000000000000000000002',
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          poolType: 'V3',
          poolAddress: '0x0000000000000000000000000000000000000001',
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: ['<token0Address>'],
      token1Addresses: ['<token1Address>'],
      network: Networks.ETHEREUM,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools[0].yield24h).toBe(185.1288293771556);
  });

  it('Should not return zero as yield when there are at least 3 days of data in the 7d yield', async () => {
    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          dailyData: Array.from({ length: 10 }, (_, index) => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(index).toString(),
            feesUSD: '100',
            totalValueLockedUSD: '100',
          })),
          v3PoolData: {
            tickSpacing: 10,
            tick: '26187',
          },
          initialFeeTier: 100,
          currentFeeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '100',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://example.com/uniswap',
          },
          positionManager: '0x0000000000000000000000000000000000000001',
          token0: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            tokenAddress: '0x0000000000000000000000000000000000000002',
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          poolType: 'V3',
          chainId: Networks.ETHEREUM,
          poolAddress: '0x0000000000000000000000000000000000000001',
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: ['<token0Address>'],
      token1Addresses: ['<token1Address>'],
      network: Networks.ETHEREUM,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools[0].yield7d).toBe(36500);
  });

  it('Should not return zero as yield when there are at least 20 days of data in the 30d yield', async () => {
    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          v3PoolData: {
            tick: '26187',
            tickSpacing: 10,
          },
          dailyData: Array.from({ length: 21 }, (_, index) => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(index).toString(),
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          initialFeeTier: 100,
          currentFeeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '100',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0000000000000000000000000000000000000001',
          positionManager: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://example.com/uniswap',
          },
          token0: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            tokenAddress: '0x0000000000000000000000000000000000000002',
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          poolType: 'V3',
          chainId: Networks.ETHEREUM,
          poolAddress: '0x0000000000000000000000000000000000000001',
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: ['<token0Address>'],
      token1Addresses: ['<token1Address>'],
      network: Networks.ETHEREUM,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools[0].yield30d).toBe(3650);
  });

  it('Should return zero as yield when there are not at least 70 days of data in the 90d yield', async () => {
    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          v3PoolData: {
            tick: '26187',
            tickSpacing: 10,
          },
          dailyData: Array.from({ length: 69 }, () => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(69).toString(),

            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          initialFeeTier: 100,
          currentFeeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '100',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0000000000000000000000000000000000000001',
          positionManager: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://example.com/uniswap',
          },

          token0: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            tokenAddress: '0x0000000000000000000000000000000000000002',
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          poolType: PoolType.V3,
          chainId: Networks.ETHEREUM,
          poolAddress: '0x0000000000000000000000000000000000000001',
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: ['<token0Address>'],
      token1Addresses: ['<token1Address>'],
      network: Networks.ETHEREUM,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools[0].yield90d).toBe(0);
  });

  it('Should not return the pool if all the yields are zero', async () => {
    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          v3PoolData: {
            tick: '26187',
            tickSpacing: 10,
          },
          dailyData: Array.from({ length: 69 }, () => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(69).toString(),
            feesUSD: '0',
            totalValueLockedUSD: '100',
          })),
          initialFeeTier: 100,
          currentFeeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '0',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0000000000000000000000000000000000000001',
          positionManager: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://example.com/uniswap',
          },

          token0: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            tokenAddress: '0x0000000000000000000000000000000000000002',
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          poolType: PoolType.V3,
          chainId: Networks.ETHEREUM,
          poolAddress: '0x0000000000000000000000000000000000000001',
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: ['<token0Address>'],
      token1Addresses: ['<token1Address>'],
      network: Networks.ETHEREUM,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools.length).toBe(0);
  });

  it('Should return the pool token0 as native if the user searched for native, but the pool token0 is wrapped native', async () => {
    const network = Networks.ETHEREUM;
    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          v3PoolData: {
            tick: '26187',
            tickSpacing: 10,
          },
          dailyData: Array.from({ length: 69 }, (_, index) => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(index).toString(),
            feesUSD: '1000',
            totalValueLockedUSD: '100',
          })),
          initialFeeTier: 100,
          currentFeeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '1000',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0000000000000000000000000000000000000001',
          positionManager: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://example.com/uniswap',
          },

          token0: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(network),
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(network),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            tokenAddress: '0x0000000000000000000000000000000000000002',
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          poolType: PoolType.V3,
          chainId: Networks.ETHEREUM,
          poolAddress: '0x0000000000000000000000000000000000000001',
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: [zeroEthereumAddress],
      token1Addresses: ['<token1Address>'],
      network: Networks.ETHEREUM,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools[0].token0.addresses[network]).toBe(zeroEthereumAddress);
  });

  it('Should return the pool token0 as wrapped native if the user searched for wrapped native', async () => {
    const network = Networks.ETHEREUM;
    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          v3PoolData: {
            tick: '26187',
            tickSpacing: 10,
          },
          dailyData: Array.from({ length: 69 }, (_, index) => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(index).toString(),
            feesUSD: '1000',
            totalValueLockedUSD: '100',
          })),
          initialFeeTier: 100,
          currentFeeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '1000',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0000000000000000000000000000000000000001',
          positionManager: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://example.com/uniswap',
          },

          token0: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(network),
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(network),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            tokenAddress: '0x0000000000000000000000000000000000000002',
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          poolType: PoolType.V3,
          chainId: Networks.ETHEREUM,
          poolAddress: '0x0000000000000000000000000000000000000001',
          totalValueLockedUSD: '216876',
        },
      ],
    };

    tokensService.getTokenByAddress.calledWith(network, NetworksUtils.wrappedNativeAddress(network)).mockResolvedValue(
      tokenList[1], // expected to be WETH
    );

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: [NetworksUtils.wrappedNativeAddress(network)],
      token1Addresses: ['<token1Address>'],
      network: network,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools[0].token0.addresses[network]).toBe(NetworksUtils.wrappedNativeAddress(network));
  });

  it('Should return the pool token1 as wrapped native if the user searched for wrapped native', async () => {
    const network = Networks.ETHEREUM;
    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          v3PoolData: {
            tick: '26187',
            tickSpacing: 10,
          },
          dailyData: Array.from({ length: 69 }, (_, index) => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(index).toString(),
            feesUSD: '1000',
            totalValueLockedUSD: '100',
          })),
          initialFeeTier: 100,
          currentFeeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '1000',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0000000000000000000000000000000000000001',
          positionManager: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://example.com/uniswap',
          },

          token1: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(network),
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(network),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token0: {
            tokenAddress: '0x0000000000000000000000000000000000000002',
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          poolType: PoolType.V3,
          chainId: Networks.ETHEREUM,
          poolAddress: '0x0000000000000000000000000000000000000001',
          totalValueLockedUSD: '216876',
        },
      ],
    };

    tokensService.getTokenByAddress.calledWith(network, NetworksUtils.wrappedNativeAddress(network)).mockResolvedValue(
      tokenList[1], // expected to be WETH
    );

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: [NetworksUtils.wrappedNativeAddress(network)],
      token1Addresses: ['<token1Address>'],
      network: network,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools[0].token1.addresses[network]).toBe(NetworksUtils.wrappedNativeAddress(network));
  });

  it('Should return the pool token1 as native if the user searched for native, but the pool token1 is wrapped native', async () => {
    const network = Networks.ETHEREUM;
    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          v3PoolData: {
            tick: '26187',
            tickSpacing: 10,
          },
          dailyData: Array.from({ length: 69 }, (_, index) => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(index).toString(),
            feesUSD: '1000',
            totalValueLockedUSD: '100',
          })),
          initialFeeTier: 100,
          currentFeeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '1000',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0000000000000000000000000000000000000001',
          positionManager: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://example.com/uniswap',
          },

          token1: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(network),
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(network),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token0: {
            tokenAddress: '0x0000000000000000000000000000000000000002',
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          poolType: PoolType.V3,
          chainId: Networks.ETHEREUM,
          poolAddress: '0x0000000000000000000000000000000000000001',
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: ['<token0Address>'],
      token1Addresses: [zeroEthereumAddress],
      network: network,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools[0].token1.addresses[network]).toBe(zeroEthereumAddress);
  });

  it('Should skip the pool if the user searched for token1 native, but the pool token1 is V4 with wrapped native', async () => {
    const network = Networks.ETHEREUM;
    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          v3PoolData: {
            tick: '26187',
            tickSpacing: 10,
          },
          dailyData: Array.from({ length: 69 }, (_, index) => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(index).toString(),
            feesUSD: '1000',
            totalValueLockedUSD: '100',
          })),
          initialFeeTier: 100,
          currentFeeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '1000',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0000000000000000000000000000000000000001',
          positionManager: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://example.com/uniswap',
          },

          token1: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(network),
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(network),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token0: {
            tokenAddress: '0x0000000000000000000000000000000000000002',
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          poolType: PoolType.V4,
          chainId: Networks.ETHEREUM,
          poolAddress: '0x0000000000000000000000000000000000000001',
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: ['<token0Address>'],
      token1Addresses: [zeroEthereumAddress],
      network: network,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools.length).toBe(0);
  });

  it('Should skip the pool if the user searched for token0 native, but the pool token0 is V4 with wrapped native', async () => {
    const network = Networks.ETHEREUM;
    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          v3PoolData: {
            tick: '26187',
            tickSpacing: 10,
          },
          dailyData: Array.from({ length: 69 }, (_, index) => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(index).toString(),
            feesUSD: '1000',
            totalValueLockedUSD: '100',
          })),
          initialFeeTier: 100,
          currentFeeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '1000',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0000000000000000000000000000000000000001',
          positionManager: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://example.com/uniswap',
          },

          token0: {
            tokenAddress: NetworksUtils.wrappedNativeAddress(network),
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(network),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            tokenAddress: '0x0000000000000000000000000000000000000002',
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          poolType: PoolType.V4,
          chainId: Networks.ETHEREUM,
          poolAddress: '0x0000000000000000000000000000000000000001',
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: [zeroEthereumAddress],
      token1Addresses: ['<token1Address>'],
      network: network,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools.length).toBe(0);
  });

  it('Should not return zero as yield when there are at least 70 days of data in the 90d yield', async () => {
    const poolsQueryResponse: GetPoolsQuery = {
      Pool: [
        {
          v3PoolData: {
            tick: '26187',
            tickSpacing: 10,
          },
          dailyData: Array.from({ length: 70 }, () => ({
            dayStartTimestamp: Date.getDaysAgoTimestamp(70).toString(),
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          initialFeeTier: 100,
          currentFeeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({
            feesUSD: '100',
            hourStartTimestamp: Date.yesterdayStartSecondsTimestamp().toString(),
          })),
          id: '0x0000000000000000000000000000000000000001',
          positionManager: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            url: 'https://example.com/uniswap',
          },

          token0: {
            decimals: 18,
            tokenAddress: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            decimals: 18,
            tokenAddress: '0x0000000000000000000000000000000000000002',
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          poolType: PoolType.V3,
          chainId: Networks.ETHEREUM,
          poolAddress: '0x0000000000000000000000000000000000000001',
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClient = {
      request: jest.fn().mockReturnValue(poolsQueryResponse),
    } as unknown as GraphQLClient;

    const sut = new PoolsService(tokensService, graphqlClient);

    const result = await sut.searchPoolsInChain({
      token0Addresses: ['<token0Address>'],
      token1Addresses: ['<token1Address>'],
      network: Networks.ETHEREUM,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools[0].yield90d).toBe(3650);
  });

  it(`should make all possible combinations between the tokens0 and tokens1 when calling searchPoolsInChain
    and put it in the or filter in the query`, async () => {
    const tokens0 = ['<token0Address-1>', '<token0Address-2>', '<token0Address-3>'];
    const tokens1 = ['<token1Address-1>', '<token1Address-2>', '<token1Address-3>'];

    const chainId = Networks.ETHEREUM;
    const filters = new PoolSearchFiltersDTO();

    await sut.searchPoolsInChain({
      token0Addresses: tokens0,
      token1Addresses: tokens1,
      network: chainId,
      filters: filters,
    });

    expect(graphqlClient.request).toHaveBeenCalledWith(GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        _and: [
          {
            totalValueLockedUSD: any(),
            poolType: any(),
            dailyData: any(),
          },
          {
            _or: [
              {
                _and: [
                  {
                    chainId: {
                      _eq: chainId,
                    },
                  },
                  {
                    _or: [
                      {
                        token0: {
                          tokenAddress: {
                            _in: tokens0.map((token) => token.toLowerCase()),
                          },
                        },
                        token1: {
                          tokenAddress: {
                            _in: tokens1.map((token) => token.toLowerCase()),
                          },
                        },
                      },
                      {
                        token1: {
                          tokenAddress: {
                            _in: tokens0.map((token) => token.toLowerCase()),
                          },
                        },
                        token0: {
                          tokenAddress: {
                            _in: tokens1.map((token) => token.toLowerCase()),
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      dailyDataFilter: any(),
      hourlyDataFilter: any(),
    });
  });

  it('should filter pools that are not active in the last 30 days using the daily data in the pool query', async () => {
    const tokens0 = ['<token0Address-1>'];
    const tokens1 = ['<token0Address-1>'];

    const chainId = Networks.ETHEREUM;
    const filters = new PoolSearchFiltersDTO();

    await sut.searchPoolsInChain({
      token0Addresses: tokens0,
      token1Addresses: tokens1,
      network: chainId,
      filters: filters,
    });

    expect(graphqlClient.request).toHaveBeenCalledWith(GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        _and: [
          {
            totalValueLockedUSD: any(),
            poolType: any(),
            dailyData: {
              dayStartTimestamp: {
                _gt: Date.getDaysAgoTimestamp(30).toString(),
              },
            },
          },
          {
            _or: any(),
          },
        ],
      },
      dailyDataFilter: any(),
      hourlyDataFilter: any(),
    });
  });

  it('should filter out pools that the tvl are greater than 1 trillion, to reduce the possible errors', async () => {
    const tokens0 = ['<token0Address-1>'];
    const tokens1 = ['<token0Address-1>'];

    const chainId = Networks.ETHEREUM;
    const filters = new PoolSearchFiltersDTO();

    await sut.searchPoolsInChain({
      token0Addresses: tokens0,
      token1Addresses: tokens1,
      network: chainId,
      filters: filters,
    });

    expect(graphqlClient.request).toHaveBeenCalledWith(GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        _and: [
          {
            totalValueLockedUSD: {
              _gt: any() as unknown as string,
              _lt: '1000000000000',
            },
            poolType: any(),
            dailyData: any(),
          },
          {
            _or: any(),
          },
        ],
      },
      dailyDataFilter: any(),
      hourlyDataFilter: any(),
    });
  });

  it(`should filter out pools that the feesUSD are so high (that can be considered wrong)
    for the daily data or hourly data, to reduce the possible errors`, async () => {
    const tokens0 = ['<token0Address-1>'];
    const tokens1 = ['<token0Address-1>'];

    const chainId = Networks.ETHEREUM;
    const filters = new PoolSearchFiltersDTO();

    await sut.searchPoolsInChain({
      token0Addresses: tokens0,
      token1Addresses: tokens1,
      network: chainId,
      filters: filters,
    });

    expect(graphqlClient.request).toHaveBeenCalledWith(GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        _and: [
          {
            totalValueLockedUSD: any(),
            poolType: any(),
            dailyData: any(),
          },
          {
            _or: any(),
          },
        ],
      },
      dailyDataFilter: {
        feesUSD: {
          _lt: '1000000000',
        },
        dayStartTimestamp: any(),
      },
      hourlyDataFilter: {
        feesUSD: {
          _lt: '10000000',
        },
        hourStartTimestamp: any(),
      },
    });
  });

  it('should return empty pools if none of the networks supported has the passed token ids in the searchPoolsCrossChain', async () => {
    const filters = new PoolSearchFiltersDTO();

    const result = await sut.searchPoolsCrossChain({
      token0Ids: ['97128752615'], // random id
      token1Ids: ['9172627521'], // random id
      filters: filters,
    });

    expect(result).toEqual({
      pools: [],
      filters: any(),
    });
  });
});
