import { GraphQLClient } from 'graphql-request';
import { any } from 'jest-mock-extended';
import mock from 'jest-mock-extended/lib/Mock';
import { zeroEthereumAddress } from 'src/core/constants';
import { MatchedPoolsDTO } from 'src/core/dtos/matched-pools.dto';
import { PoolSearchFiltersDTO } from 'src/core/dtos/pool-search-filters.dto';
import { TokenPriceDTO } from 'src/core/dtos/token-price-dto';
import { TokenDTO } from 'src/core/dtos/token.dto';
import { V4PoolDTO } from 'src/core/dtos/v4-pool.dto';
import { Networks, NetworksUtils } from 'src/core/enums/networks';
import { tokenList } from 'src/core/token-list';
import { SupportedPoolType } from 'src/core/types';
import {
  GetPoolsDocument,
  GetPoolsQuery,
  GetPoolsQueryVariables,
  Pool_Filter,
  PoolType,
} from 'src/gen/graphql.gen';
import { TokensService } from '../tokens/tokens.service';
import { PoolsService } from './pools.service';

describe('PoolsController', () => {
  let sut: PoolsService;
  const tokensService = mock<TokensService>();
  let graphqlClients: Record<Networks, GraphQLClient>;

  beforeEach(() => {
    tokensService.getPopularTokens.mockReturnValue(tokenList);
    tokensService.searchTokensByNameOrSymbol.mockReturnValue(tokenList);
    tokensService.getTokenPrice.mockResolvedValue(<TokenPriceDTO>{
      address: '0x1234567890123456789012345678901234567890',
      usdPrice: 120.312,
    });
    tokensService.getTokenByAddress
      .calledWith(any(), any())
      .mockResolvedValue(tokenList[0]);

    const graphQLRequestMock = jest.fn().mockReturnValue({ pools: [] });

    graphqlClients = NetworksUtils.values().reduce(
      (acc, network) => {
        acc[network] = {
          request: graphQLRequestMock,
        } as unknown as GraphQLClient;

        return acc;
      },
      {} as Record<Networks, GraphQLClient>,
    );

    sut = new PoolsService(tokensService, graphqlClients);
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

    expect(graphqlClients[network].request).toHaveBeenCalledWith(
      GetPoolsDocument,
      <GetPoolsQueryVariables>{
        poolsFilter: {
          and: [
            {
              totalValueLockedUSD_gt: mintvlusd.toString(),
              type_in: filters.allowedPoolTypes,
              dailyData_: any(),
            },
            {
              or: [
                {
                  token0: token0Address,
                  token1: token1Address,
                },
                {
                  token0: token1Address,
                  token1: token0Address,
                },
              ],
            },
          ],
        },
        dailyDataFilter: {
          dayStartTimestamp_gt: Date.getDaysAgoTimestamp(90).toString(),
        },
        hourlyDataFilter: {
          hourStartTimestamp_gt:
            Date.yesterdayStartSecondsTimestamp().toString(),
        },
      },
    );
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

    expect(graphqlClients[network].request).toHaveBeenCalledWith(
      GetPoolsDocument,
      <GetPoolsQueryVariables>{
        poolsFilter: {
          and: [
            {
              totalValueLockedUSD_gt: mintvlusd.toString(),
              type_in: filters.allowedPoolTypes,
              protocol_not_in: filters.blockedProtocols,
              dailyData_: any(),
            },
            {
              or: [
                {
                  token0: token0Address,
                  token1: token1Address,
                },
                {
                  token0: token1Address,
                  token1: token0Address,
                },
              ],
            },
          ],
        },
        dailyDataFilter: {
          dayStartTimestamp_gt: Date.getDaysAgoTimestamp(90).toString(),
        },
        hourlyDataFilter: {
          hourStartTimestamp_gt:
            Date.yesterdayStartSecondsTimestamp().toString(),
        },
      },
    );
  });

  it(`should call the graphql url with the correct query and params to search pools in all
     chains when the blocked protocols ids is greater than 0`, async () => {
    const token0 = <TokenDTO>{
      addresses: {
        [Networks.ETHEREUM]: tokenList[1].addresses[Networks.ETHEREUM],
        [Networks.SCROLL]: tokenList[1].addresses[Networks.SCROLL],
        [Networks.SEPOLIA]: tokenList[1].addresses[Networks.SEPOLIA],
      },
      name: tokenList[1].name,
      symbol: tokenList[1].symbol,
      decimals: tokenList[1].decimals,
      id: tokenList[1].id,
    };
    const token1 = <TokenDTO>{
      addresses: {
        [Networks.ETHEREUM]: tokenList[3].addresses[Networks.ETHEREUM],
        [Networks.SCROLL]: tokenList[3].addresses[Networks.SCROLL],
        [Networks.SEPOLIA]: tokenList[3].addresses[Networks.SEPOLIA],
      },
      name: tokenList[3].name,
      symbol: tokenList[3].symbol,
      decimals: tokenList[3].decimals,
      id: tokenList[3].id,
    };

    const network = Networks.ETHEREUM;
    const mintvlusd = 321;
    const filters: PoolSearchFiltersDTO = {
      blockedProtocols: ['uniswap-v2', 'uniswap-v3', 'quickswap'],
      allowedPoolTypes: Object.values(PoolType),
      testnetMode: false,
      minTvlUsd: mintvlusd,
    };

    await sut.searchPoolsCrossChain({
      token0Ids: [token0.id!],
      token1Ids: [token1.id!],
      filters,
    });

    expect(graphqlClients[network].request).toHaveBeenCalledWith(
      GetPoolsDocument,
      <GetPoolsQueryVariables>{
        poolsFilter: {
          and: [
            {
              totalValueLockedUSD_gt: mintvlusd.toString(),
              type_in: filters.allowedPoolTypes,
              protocol_not_in: filters.blockedProtocols,
              dailyData_: any(),
            },
            {
              or: [
                {
                  token0: token0.addresses[network]!,
                  token1: token1.addresses[network]!,
                },
                {
                  token0: token1.addresses[network]!,
                  token1: token0.addresses[network]!,
                },
              ],
            },
          ],
        },
        dailyDataFilter: {
          dayStartTimestamp_gt: Date.getDaysAgoTimestamp(90).toString(),
        },
        hourlyDataFilter: {
          hourStartTimestamp_gt:
            Date.yesterdayStartSecondsTimestamp().toString(),
        },
      },
    );
  });

  it('Should process and return the pool data got from the graphQL query correctly when calling the searchPoolsInChain method', async () => {
    const expectedPoolResult: SupportedPoolType = {
      permit2Address: undefined,
      latestTick: '0',

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
      pools: [
        {
          dailyData: Array.from({ length: 90 }, () => ({
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          tick: expectedPoolResult.latestTick,
          feeTier: expectedPoolResult.feeTier,
          hourlyData: Array.from({ length: 24 }, () => ({ feesUSD: '100' })),
          id: expectedPoolResult.poolAddress,
          protocol: {
            id: 'uniswap',
            logo: expectedPoolResult.protocol.logo,
            name: expectedPoolResult.protocol.name,
            positionManager: expectedPoolResult.positionManagerAddress,
            url: expectedPoolResult.protocol.url,
          },
          tickSpacing: expectedPoolResult.tickSpacing,
          token0: {
            decimals: expectedPoolResult.token0.decimals[Networks.ETHEREUM]!,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: expectedPoolResult.token0.name,
            symbol: expectedPoolResult.token0.symbol,
          },
          token1: {
            decimals: expectedPoolResult.token1.decimals[Networks.ETHEREUM]!,
            id: expectedPoolResult.token1.addresses[
              Networks.ETHEREUM
            ] as string,
            name: expectedPoolResult.token1.name,
            symbol: expectedPoolResult.token1.symbol,
          },
          type: PoolType.V3,
          totalValueLockedUSD:
            expectedPoolResult.totalValueLockedUSD.toString(),
        },
      ],
    };

    graphqlClients = {
      [Networks.ETHEREUM]: {
        request: jest.fn().mockReturnValue(poolsQueryResponse),
      } as unknown as GraphQLClient,
    } as unknown as Record<Networks, GraphQLClient>;

    tokensService.getTokenByAddress
      .calledWith(
        expectedPoolResult.chainId,
        expectedPoolResult.token0.addresses[Networks.ETHEREUM]!,
      )
      .mockResolvedValue(expectedPoolResult.token0);

    tokensService.getTokenByAddress
      .calledWith(
        expectedPoolResult.chainId,
        expectedPoolResult.token1.addresses[Networks.ETHEREUM]!,
      )
      .mockResolvedValue(expectedPoolResult.token1);

    const sut = new PoolsService(tokensService, graphqlClients);

    const result = await sut.searchPoolsInChain({
      token0Addresses: [
        expectedPoolResult.token0.addresses[expectedPoolResult.chainId]!,
      ],
      token1Addresses: [
        expectedPoolResult.token1.addresses[expectedPoolResult.chainId]!,
      ],
      network: expectedPoolResult.chainId,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result).toEqual(<MatchedPoolsDTO>{
      pools: [expectedPoolResult],
      filters: new PoolSearchFiltersDTO(),
    });
  });

  it('Should match liquidity pools from different networks with the same tokens when calling searchPoolsCrossChain', async () => {
    const token0 = <TokenDTO>{
      addresses: {
        [Networks.ETHEREUM]: tokenList[0].addresses[Networks.ETHEREUM],
        [Networks.SCROLL]: tokenList[0].addresses[Networks.SCROLL],
        [Networks.SEPOLIA]: tokenList[0].addresses[Networks.SEPOLIA],
      },
      name: tokenList[0].name,
      symbol: tokenList[0].symbol,
      decimals: tokenList[0].decimals,
      id: tokenList[0].id,
    };
    const token1 = <TokenDTO>{
      addresses: {
        [Networks.ETHEREUM]: tokenList[3].addresses[Networks.ETHEREUM],
        [Networks.SCROLL]: tokenList[3].addresses[Networks.SCROLL],
        [Networks.SEPOLIA]: tokenList[3].addresses[Networks.SEPOLIA],
      },
      name: tokenList[3].name,
      symbol: tokenList[3].symbol,
      decimals: tokenList[3].decimals,
      id: tokenList[3].id,
    };

    const poolResult1: SupportedPoolType = {
      permit2Address: undefined,
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

    const poolsQueryResponseNetwork1: GetPoolsQuery = {
      pools: [
        {
          dailyData: Array.from({ length: 90 }, () => ({
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          tick: poolResult1.latestTick,
          feeTier: poolResult1.feeTier,
          hourlyData: Array.from({ length: 24 }, () => ({ feesUSD: '100' })),
          id: poolResult1.poolAddress,
          protocol: {
            id: 'uniswap',
            logo: poolResult1.protocol.logo,
            name: poolResult1.protocol.name,
            positionManager: poolResult1.positionManagerAddress,
            url: poolResult1.protocol.url,
          },
          tickSpacing: poolResult1.tickSpacing,
          token0: {
            decimals: poolResult1.token0.decimals[poolResult1.chainId]!,
            id: NetworksUtils.wrappedNativeAddress(poolResult1.chainId),
            name: poolResult1.token0.name,
            symbol: poolResult1.token0.symbol,
          },
          token1: {
            decimals: poolResult1.token1.decimals[poolResult1.chainId]!,
            id: poolResult1.token1.addresses[Networks.ETHEREUM] as string,
            name: poolResult1.token1.name,
            symbol: poolResult1.token1.symbol,
          },
          type: PoolType.V3,
          totalValueLockedUSD: poolResult1.totalValueLockedUSD.toString(),
        },
      ],
    };

    const poolsQueryResponseNetwork2: GetPoolsQuery = {
      pools: [
        {
          dailyData: Array.from({ length: 90 }, () => ({
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          tick: poolResult2.latestTick,
          feeTier: poolResult2.feeTier,
          hourlyData: Array.from({ length: 24 }, () => ({ feesUSD: '100' })),
          id: poolResult2.poolAddress,
          protocol: {
            id: 'uniswap',
            logo: poolResult2.protocol.logo,
            name: poolResult2.protocol.name,
            positionManager: poolResult2.positionManagerAddress,
            url: poolResult2.protocol.url,
          },
          tickSpacing: poolResult2.tickSpacing,
          token0: {
            decimals: poolResult2.token0.decimals[poolResult2.chainId]!,
            id: NetworksUtils.wrappedNativeAddress(poolResult2.chainId),
            name: poolResult2.token0.name,
            symbol: poolResult2.token0.symbol,
          },
          token1: {
            decimals: poolResult2.token1.decimals[poolResult2.chainId]!,
            id: poolResult2.token1.addresses[Networks.SCROLL] as string,
            name: poolResult2.token1.name,
            symbol: poolResult2.token1.symbol,
          },
          type: PoolType.V3,
          totalValueLockedUSD: poolResult2.totalValueLockedUSD.toString(),
        },
      ],
    };

    const graphqlClients = NetworksUtils.values().reduce(
      (acc, network) => {
        let mockResponse: GetPoolsQuery;

        switch (network) {
          case Networks.ETHEREUM:
            mockResponse = poolsQueryResponseNetwork1;
            break;
          case Networks.SCROLL:
            mockResponse = poolsQueryResponseNetwork2;
            break;
          default:
            mockResponse = { pools: [] }; // or some default mock response
        }

        acc[network] = {
          request: jest.fn().mockResolvedValue(mockResponse),
        } as unknown as GraphQLClient;

        return acc;
      },
      {} as Record<Networks, GraphQLClient>,
    );

    tokensService.getTokenByAddress
      .calledWith(any(), token0.addresses[poolResult1.chainId]!)
      .mockResolvedValue(token0);

    tokensService.getTokenByAddress
      .calledWith(any(), token1.addresses[poolResult1.chainId]!)
      .mockResolvedValue(token1);

    tokensService.getTokenByAddress
      .calledWith(any(), token0.addresses[poolResult2.chainId]!)
      .mockResolvedValue(token0);

    tokensService.getTokenByAddress
      .calledWith(any(), token1.addresses[poolResult2.chainId]!)
      .mockResolvedValue(token1);

    const sut = new PoolsService(tokensService, graphqlClients);

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
    const sut = new PoolsService(tokensService, graphqlClients);
    const network = Networks.SEPOLIA;
    const token1Address = '0x0000000000000000000000000000000000000001';
    const minTVLUSD = '0';
    const filters = new PoolSearchFiltersDTO();

    await sut.searchPoolsInChain({
      token0Addresses: [zeroEthereumAddress],
      token1Addresses: [token1Address],
      network: network,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(graphqlClients[network].request).toHaveBeenCalledWith(
      GetPoolsDocument,
      <GetPoolsQueryVariables>{
        poolsFilter: {
          and: [
            {
              totalValueLockedUSD_gt: any(),
              type_in: any(),
              dailyData_: any(),
            },
            {
              or: [
                {
                  token0: zeroEthereumAddress,
                  token1: token1Address,
                },
                {
                  token0: token1Address,
                  token1: zeroEthereumAddress,
                },
                {
                  token0: token1Address,
                  token1: NetworksUtils.wrappedNativeAddress(network),
                },
                {
                  token0: NetworksUtils.wrappedNativeAddress(network),
                  token1: token1Address,
                },
              ],
            },
          ],
        },
        dailyDataFilter: {
          dayStartTimestamp_gt: Date.getDaysAgoTimestamp(90).toString(),
        },
        hourlyDataFilter: {
          hourStartTimestamp_gt:
            Date.yesterdayStartSecondsTimestamp().toString(),
        },
      },
    );
  });

  it('should return hooks address, pool manager address and state view address when the pool type is v4', async () => {
    const hooksAddress = '0x0000000000000000000000000000000000000111';
    const poolManagerAddress = '0x0000000000000000000000000000000000000222';
    const stateViewAddress = '0x0000000000000000000000000000000000000333';

    const poolsQueryResponse: GetPoolsQuery = {
      pools: [
        {
          tick: '123',
          dailyData: Array.from({ length: 90 }, () => ({
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          feeTier: 1079,
          hourlyData: Array.from({ length: 24 }, () => ({ feesUSD: '100' })),
          id: '0x0d4a11d5eeaac28ec3f61d1005ee9b9f5060c61a',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            positionManager: '0x0d4a11d5eeaac28ec3f61d1005ee9b9f5060c61a',
            url: 'https://uniswap.org',
            permit2: '0x0d4a11d5eeaac28ec3f61d1005ee9b9f5060c61a',
            v4StateView: stateViewAddress,
            v4PoolManager: poolManagerAddress,
          },
          tickSpacing: 987,
          token0: {
            decimals: tokenList[0].decimals[Networks.ETHEREUM]!,
            id: tokenList[0].addresses[Networks.ETHEREUM] as string,
            name: tokenList[0].name,
            symbol: tokenList[0].symbol,
          },
          token1: {
            decimals: tokenList[3].decimals[Networks.ETHEREUM]!,
            id: tokenList[3].addresses[Networks.ETHEREUM] as string,
            name: tokenList[3].name,
            symbol: tokenList[3].symbol,
          },
          type: PoolType.V4,
          v4Hooks: hooksAddress,

          totalValueLockedUSD: '12231.32',
        },
      ],
    };

    const poolsResult: MatchedPoolsDTO = {
      filters: new PoolSearchFiltersDTO(),
      pools: [
        {
          latestTick: poolsQueryResponse.pools[0].tick,
          chainId: Networks.ETHEREUM,
          feeTier: poolsQueryResponse.pools[0].feeTier,
          hooksAddress: hooksAddress,
          poolAddress: poolsQueryResponse.pools[0].id,
          totalValueLockedUSD: Number.parseFloat(
            poolsQueryResponse.pools[0].totalValueLockedUSD,
          ),
          poolType: PoolType.V4,
          tickSpacing: poolsQueryResponse.pools[0].tickSpacing,
          positionManagerAddress:
            poolsQueryResponse.pools[0].protocol.positionManager,
          protocol: {
            id: poolsQueryResponse.pools[0].protocol.id,
            logo: poolsQueryResponse.pools[0].protocol.logo,
            name: poolsQueryResponse.pools[0].protocol.name,
            url: poolsQueryResponse.pools[0].protocol.url,
          },
          token0: {
            addresses: {
              [Networks.ETHEREUM]: poolsQueryResponse.pools[0].token0.id,
            } as Record<Networks, string>,
            decimals: {
              [Networks.ETHEREUM]: poolsQueryResponse.pools[0].token0.decimals,
            } as Record<Networks, number>,
            name: poolsQueryResponse.pools[0].token0.name,
            symbol: poolsQueryResponse.pools[0].token0.symbol,
          },
          yield24h: 7161.941638351379,
          yield30d: 3650,
          yield90d: 3650,
          yield7d: 3650,
          stateViewAddress: stateViewAddress,
          poolManagerAddress: poolManagerAddress,
          permit2Address: poolsQueryResponse.pools[0].protocol.permit2,
          token1: {
            addresses: {
              [Networks.ETHEREUM]: poolsQueryResponse.pools[0].token1.id,
            } as Record<Networks, string>,
            decimals: {
              [Networks.ETHEREUM]: poolsQueryResponse.pools[0].token1.decimals,
            } as Record<Networks, number>,
            name: poolsQueryResponse.pools[0].token1.name,
            symbol: poolsQueryResponse.pools[0].token1.symbol,
          },
        },
      ],
    };

    const graphQlRequestMock = jest.fn().mockReturnValue(poolsQueryResponse);

    graphqlClients = {
      [Networks.ETHEREUM]: {
        request: graphQlRequestMock,
      } as unknown as GraphQLClient,
    } as unknown as Record<Networks, GraphQLClient>;

    tokensService.getTokenByAddress
      .calledWith(any(), poolsQueryResponse.pools[0].token0.id)
      .mockResolvedValue(poolsResult.pools[0].token0);

    tokensService.getTokenByAddress
      .calledWith(any(), poolsQueryResponse.pools[0].token1.id)
      .mockResolvedValue(poolsResult.pools[0].token1);

    const sut = new PoolsService(tokensService, graphqlClients);

    const result = (
      await sut.searchPoolsInChain({
        token0Addresses: [
          poolsResult.pools[0].token0.addresses[poolsResult.pools[0].chainId]!,
        ],
        token1Addresses: [
          poolsResult.pools[0].token1.addresses[poolsResult.pools[0].chainId]!,
        ],
        network: Networks.ETHEREUM,
        filters: new PoolSearchFiltersDTO(),
      })
    ).pools[0];

    expect((result as V4PoolDTO).hooksAddress).toEqual(hooksAddress);
    expect((result as V4PoolDTO).stateViewAddress).toEqual(stateViewAddress);
    expect((result as V4PoolDTO).poolManagerAddress).toEqual(
      poolManagerAddress,
    );
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

    expect(graphqlClients[network].request).toHaveBeenCalledWith(
      GetPoolsDocument,
      <GetPoolsQueryVariables>{
        poolsFilter: {
          and: [
            {
              totalValueLockedUSD_gt: minTvlUsd.toString(),
              type_in: [PoolType.V4],
              dailyData_: any(),
            },
            {
              or: [
                {
                  token0: token0Address,
                  token1: token1Address,
                },
                {
                  token0: token1Address,
                  token1: token0Address,
                },
              ],
            },
          ],
        },
        dailyDataFilter: {
          dayStartTimestamp_gt: Date.getDaysAgoTimestamp(90).toString(),
        },
        hourlyDataFilter: {
          hourStartTimestamp_gt:
            Date.yesterdayStartSecondsTimestamp().toString(),
        },
      },
    );
  });

  it('Should return zero as yield when there are not at least 20 days of data in the 30d yield', async () => {
    const poolsQueryResponse: GetPoolsQuery = {
      pools: [
        {
          tick: '26187',
          dailyData: Array.from({ length: 10 }, () => ({
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          feeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({ feesUSD: '100' })),
          id: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            positionManager: '0x0000000000000000000000000000000000000001',
            url: 'https://example.com/uniswap',
          },
          tickSpacing: 10,
          token0: {
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          type: PoolType.V3,
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClients = {
      [Networks.ETHEREUM]: {
        request: jest.fn().mockReturnValue(poolsQueryResponse),
      } as unknown as GraphQLClient,
    } as unknown as Record<Networks, GraphQLClient>;

    const sut = new PoolsService(tokensService, graphqlClients);

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
      pools: [
        {
          tick: '26187',
          dailyData: Array.from({ length: 2 }, () => ({
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          feeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({ feesUSD: '100' })),
          id: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            positionManager: '0x0000000000000000000000000000000000000001',
            url: 'https://example.com/uniswap',
          },
          tickSpacing: 10,
          token0: {
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          type: PoolType.V3,
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClients = {
      [Networks.ETHEREUM]: {
        request: jest.fn().mockReturnValue(poolsQueryResponse),
      } as unknown as GraphQLClient,
    } as unknown as Record<Networks, GraphQLClient>;

    const sut = new PoolsService(tokensService, graphqlClients);

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
      pools: [
        {
          tick: '26187',
          dailyData: Array.from({ length: 2 }, () => ({
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          feeTier: 100,
          hourlyData: Array.from({ length: 8 }, () => ({ feesUSD: '100' })),
          id: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            positionManager: '0x0000000000000000000000000000000000000001',
            url: 'https://example.com/uniswap',
          },
          tickSpacing: 10,
          token0: {
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          type: PoolType.V3,
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClients = {
      [Networks.ETHEREUM]: {
        request: jest.fn().mockReturnValue(poolsQueryResponse),
      } as unknown as GraphQLClient,
    } as unknown as Record<Networks, GraphQLClient>;

    const sut = new PoolsService(tokensService, graphqlClients);

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
      pools: [
        {
          tick: '26187',
          dailyData: Array.from({ length: 2 }, () => ({
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          feeTier: 100,
          hourlyData: Array.from({ length: 11 }, () => ({ feesUSD: '100' })),
          id: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            positionManager: '0x0000000000000000000000000000000000000001',
            url: 'https://example.com/uniswap',
          },
          tickSpacing: 10,
          token0: {
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          type: PoolType.V3,
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClients = {
      [Networks.ETHEREUM]: {
        request: jest.fn().mockReturnValue(poolsQueryResponse),
      } as unknown as GraphQLClient,
    } as unknown as Record<Networks, GraphQLClient>;

    const sut = new PoolsService(tokensService, graphqlClients);

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
      pools: [
        {
          tick: '26187',
          dailyData: Array.from({ length: 10 }, () => ({
            feesUSD: '100',
            totalValueLockedUSD: '100',
          })),
          feeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({ feesUSD: '100' })),
          id: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            positionManager: '0x0000000000000000000000000000000000000001',
            url: 'https://example.com/uniswap',
          },
          tickSpacing: 10,
          token0: {
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          type: PoolType.V3,
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClients = {
      [Networks.ETHEREUM]: {
        request: jest.fn().mockReturnValue(poolsQueryResponse),
      } as unknown as GraphQLClient,
    } as unknown as Record<Networks, GraphQLClient>;

    const sut = new PoolsService(tokensService, graphqlClients);

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
      pools: [
        {
          tick: '26187',
          dailyData: Array.from({ length: 21 }, () => ({
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          feeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({ feesUSD: '100' })),
          id: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            positionManager: '0x0000000000000000000000000000000000000001',
            url: 'https://example.com/uniswap',
          },
          tickSpacing: 10,
          token0: {
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          type: PoolType.V3,
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClients = {
      [Networks.ETHEREUM]: {
        request: jest.fn().mockReturnValue(poolsQueryResponse),
      } as unknown as GraphQLClient,
    } as unknown as Record<Networks, GraphQLClient>;

    const sut = new PoolsService(tokensService, graphqlClients);

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
      pools: [
        {
          tick: '26187',
          dailyData: Array.from({ length: 69 }, () => ({
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          feeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({ feesUSD: '100' })),
          id: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            positionManager: '0x0000000000000000000000000000000000000001',
            url: 'https://example.com/uniswap',
          },
          tickSpacing: 10,
          token0: {
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          type: PoolType.V3,
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClients = {
      [Networks.ETHEREUM]: {
        request: jest.fn().mockReturnValue(poolsQueryResponse),
      } as unknown as GraphQLClient,
    } as unknown as Record<Networks, GraphQLClient>;

    const sut = new PoolsService(tokensService, graphqlClients);

    const result = await sut.searchPoolsInChain({
      token0Addresses: ['<token0Address>'],
      token1Addresses: ['<token1Address>'],
      network: Networks.ETHEREUM,
      filters: new PoolSearchFiltersDTO(),
    });

    expect(result.pools[0].yield90d).toBe(0);
  });

  it('Should not return zero as yield when there are at least 70 days of data in the 90d yield', async () => {
    const poolsQueryResponse: GetPoolsQuery = {
      pools: [
        {
          tick: '26187',
          dailyData: Array.from({ length: 70 }, () => ({
            feesUSD: '10',
            totalValueLockedUSD: '100',
          })),
          feeTier: 100,
          hourlyData: Array.from({ length: 24 }, () => ({ feesUSD: '100' })),
          id: '0x0000000000000000000000000000000000000001',
          protocol: {
            id: 'uniswap',
            logo: 'https://example.com/logo.png',
            name: 'Uniswap',
            positionManager: '0x0000000000000000000000000000000000000001',
            url: 'https://example.com/uniswap',
          },
          tickSpacing: 10,
          token0: {
            decimals: 18,
            id: NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM),
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          token1: {
            decimals: 18,
            id: '0x0000000000000000000000000000000000000002',
            name: 'Wrapped Ether',
            symbol: 'WETH',
          },
          type: PoolType.V3,
          totalValueLockedUSD: '216876',
        },
      ],
    };

    graphqlClients = {
      [Networks.ETHEREUM]: {
        request: jest.fn().mockReturnValue(poolsQueryResponse),
      } as unknown as GraphQLClient,
    } as unknown as Record<Networks, GraphQLClient>;

    const sut = new PoolsService(tokensService, graphqlClients);

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
    const tokens0 = [
      '<token0Address-1>',
      '<token0Address-2>',
      '<token0Address-3>',
    ];

    const tokens1 = [
      '<token1Address-1>',
      '<token1Address-2>',
      '<token1Address-3>',
    ];

    const possibleTokenCombinations: Pool_Filter[] = [];

    for (let i = 0; i < tokens0.length; i++) {
      for (let j = 0; j < tokens1.length; j++) {
        const tokenA = tokens0[i];
        const tokenB = tokens1[j];

        if (tokenA === tokenB) continue;

        possibleTokenCombinations.push(
          { token0: tokenA, token1: tokenB },
          { token0: tokenB, token1: tokenA },
        );
      }
    }

    const chainId = Networks.ETHEREUM;
    const filters = new PoolSearchFiltersDTO();

    await sut.searchPoolsInChain({
      token0Addresses: tokens0,
      token1Addresses: tokens1,
      network: chainId,
      filters: filters,
    });

    expect(graphqlClients[chainId].request).toHaveBeenCalledWith(
      GetPoolsDocument,
      <GetPoolsQueryVariables>{
        poolsFilter: {
          and: [
            {
              totalValueLockedUSD_gt: any(),
              type_in: any(),
              dailyData_: any(),
            },
            {
              or: possibleTokenCombinations,
            },
          ],
        },
        dailyDataFilter: any(),
        hourlyDataFilter: any(),
      },
    );
  });

  it(`should remove duplicated when making all possible combinations between the tokens0 and tokens1 to call the subgraph`, async () => {
    const tokens0 = ['<token0Address-1>'];
    const tokens1 = ['<token0Address-1>'];

    const possibleTokenCombinations: Pool_Filter[] = [];

    const chainId = Networks.ETHEREUM;
    const filters = new PoolSearchFiltersDTO();

    await sut.searchPoolsInChain({
      token0Addresses: tokens0,
      token1Addresses: tokens1,
      network: chainId,
      filters: filters,
    });

    expect(graphqlClients[chainId].request).toHaveBeenCalledWith(
      GetPoolsDocument,
      <GetPoolsQueryVariables>{
        poolsFilter: {
          and: [
            {
              totalValueLockedUSD_gt: any(),
              type_in: any(),
              dailyData_: any(),
            },
            {
              or: possibleTokenCombinations,
            },
          ],
        },
        dailyDataFilter: any(),
        hourlyDataFilter: any(),
      },
    );
  });

  it(`should filter pools that are not active in the last 30 days using the daily data in the pool query `, async () => {
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

    expect(graphqlClients[chainId].request).toHaveBeenCalledWith(
      GetPoolsDocument,
      <GetPoolsQueryVariables>{
        poolsFilter: {
          and: [
            {
              totalValueLockedUSD_gt: any(),
              type_in: any(),
              dailyData_: {
                dayStartTimestamp_gt: Date.getDaysAgoTimestamp(30).toString(),
              },
            },
            {
              or: [any()],
            },
          ],
        },
        dailyDataFilter: any(),
        hourlyDataFilter: any(),
      },
    );
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
