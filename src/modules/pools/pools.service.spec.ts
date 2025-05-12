import { GraphQLClient } from 'graphql-request';
import { MatchedPoolsDTO } from 'src/core/dtos/matched-pools.dto';
import { TokenDTO } from 'src/core/dtos/token.dto';
import { Networks, NetworksUtils } from 'src/core/enums/networks';
import { PoolType } from 'src/core/enums/pool-type';
import { tokenList } from 'src/core/token-list';
import { SupportedPoolType } from 'src/core/types';
import { GetPoolsDocument, GetPoolsQuery } from 'src/gen/graphql.gen';
import { TokensService } from '../tokens/tokens.service';
import { PoolsService } from './pools.service';

describe('PoolsController', () => {
  let sut: PoolsService;
  let tokensService: TokensService;
  let graphqlClients: Record<Networks, GraphQLClient>;

  beforeEach(() => {
    tokensService = {
      getPopularTokens: jest.fn(),
      searchTokensByNameOrSymbol: jest.fn(),
      getTokenByAddress: jest.fn().mockReturnValue(<TokenDTO>{
        address: '0x0000000000000000000000000000000000000000',
        name: 'Test Token',
        symbol: 'TT',
        decimals: 18,
      }),
    } as unknown as TokensService;

    const graphQLRequestMock = jest.fn().mockReturnValue({ pools: [] });

    graphqlClients = {
      [Networks.ETHEREUM]: {
        request: graphQLRequestMock,
      } as unknown as GraphQLClient,
      [Networks.SCROLL]: {
        request: graphQLRequestMock,
      } as unknown as GraphQLClient,
      [Networks.SEPOLIA]: {
        request: graphQLRequestMock,
      } as unknown as GraphQLClient,
    };

    sut = new PoolsService(tokensService, graphqlClients);
  });

  it('should call the graphql url with the correct query and params to search pools in a specific chain', async () => {
    const token0Address = '0x0000000000000000000000000000000000000000';
    const token1Address = '0x0000000000000000000000000000000000000001';
    const network = Networks.ETHEREUM;

    await sut.searchPoolsInChain(token0Address, token1Address, network);

    expect(graphqlClients[network].request).toHaveBeenCalledWith(
      GetPoolsDocument,
      {
        token0Id: token0Address,
        token1Id: token1Address,
        hourlyDataStartTimestamp:
          Date.yesterdayStartSecondsTimestamp().toString(),
        dailyDataStartTimestamp: Date.getDaysAgoTimestamp(90).toString(),
      },
    );
  });

  it('Should process and return the pool data got from the graphQL query correctly when calling the searchPoolsInChain method', async () => {
    const expectedPoolResult: SupportedPoolType = {
      token0: {
        address: tokenList[0].address,
        name: tokenList[0].name,
        symbol: tokenList[0].symbol,
        decimals: tokenList[0].decimals,
      },
      token1: {
        address: tokenList[1].address,
        name: tokenList[1].name,
        symbol: tokenList[1].symbol,
        decimals: tokenList[1].decimals,
      },
      chainId: Networks.ETHEREUM,
      totalValueLockedUSD: 98261715.218,
      feeTier: 500,
      poolAddress: '0xA30B2D8c8eB4aA8a5F6eF9C1E5Bd0A1b1eA4B1E5',
      poolType: PoolType.v3,
      positionManagerAddress: '0xB30B2D8c8eB4aA8a5F6eF9C1E5Bd0A1b1eA4B1E5',
      yield24h: 0.8914967523786218,
      yield30d: 3650,
      yield90d: 3650,
      protocol: {
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
            decimals: expectedPoolResult.token0.decimals,
            id: expectedPoolResult.token0.address as string,
            name: expectedPoolResult.token0.name,
            symbol: expectedPoolResult.token0.symbol,
          },
          token1: {
            decimals: expectedPoolResult.token1.decimals,
            id: expectedPoolResult.token1.address as string,
            name: expectedPoolResult.token1.name,
            symbol: expectedPoolResult.token1.symbol,
          },

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

    const sut = new PoolsService(tokensService, graphqlClients);

    const result = await sut.searchPoolsInChain(
      expectedPoolResult.token0.address as string,
      expectedPoolResult.token1.address as string,
      expectedPoolResult.chainId,
    );

    expect(result).toEqual(<MatchedPoolsDTO>{
      pools: [expectedPoolResult],
    });
  });

  it('Should match liquidity pools from different networks with the same tokens when calling searchPoolsCrossChain', async () => {
    const token0 = <TokenDTO>{
      address: {
        [Networks.ETHEREUM]: tokenList[0].address[Networks.ETHEREUM],
        [Networks.SCROLL]: tokenList[0].address[Networks.SCROLL],
        [Networks.SEPOLIA]: tokenList[0].address[Networks.SEPOLIA],
      },
      name: tokenList[0].name,
      symbol: tokenList[0].symbol,
      decimals: tokenList[0].decimals,
      id: tokenList[0].id,
    };
    const token1 = <TokenDTO>{
      address: {
        [Networks.ETHEREUM]: tokenList[3].address[Networks.ETHEREUM],
        [Networks.SCROLL]: tokenList[3].address[Networks.SCROLL],
        [Networks.SEPOLIA]: tokenList[3].address[Networks.SEPOLIA],
      },
      name: tokenList[3].name,
      symbol: tokenList[3].symbol,
      decimals: tokenList[3].decimals,
      id: tokenList[3].id,
    };

    const poolResult1: SupportedPoolType = {
      token0: {
        address: token0.address,
        name: token0.name,
        symbol: token0.symbol,
        decimals: token0.decimals,
      },
      token1: {
        address: token1.address,
        name: token1.name,
        symbol: token1.symbol,
        decimals: token1.decimals,
      },
      chainId: Networks.ETHEREUM,
      totalValueLockedUSD: 98261715.218,
      feeTier: 500,
      poolAddress: '0xA30B2D8c8eB4aA8a5F6eF9C1E5Bd0A1b1eA4B1E5',
      poolType: PoolType.v3,
      positionManagerAddress: '0xB30B2D8c8eB4aA8a5F6eF9C1E5Bd0A1b1eA4B1E5',
      yield24h: 0.8914967523786218,
      yield30d: 3650,
      yield90d: 3650,
      protocol: {
        name: 'Uniswap V3',
        url: 'https://uniswap.org',
        logo: 'https://www.pudim.com.br/pudim.jpg',
      },
      tickSpacing: 10,
    };

    const poolResult2: SupportedPoolType = {
      token0: {
        address: token0.address,
        name: token0.name,
        symbol: token0.symbol,
        decimals: token0.decimals,
      },
      token1: {
        address: token1.address,
        name: token1.name,
        symbol: token1.symbol,
        decimals: token1.decimals,
      },
      chainId: Networks.SCROLL,
      totalValueLockedUSD: 98261715.218,
      feeTier: 500,
      poolAddress: '0xA30B2D8c8eB4aA8a5F6eF9C1E5Bd0A1b1eA4B1E5',
      poolType: PoolType.v3,
      positionManagerAddress: '0xB30B2D8c8eB4aA8a5F6eF9C1E5Bd0A1b1eA4B1E5',
      yield24h: 0.8914967523786218,
      yield30d: 3650,
      yield90d: 3650,
      protocol: {
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
            decimals: poolResult1.token0.decimals,
            id: poolResult1.token0.address as string,
            name: poolResult1.token0.name,
            symbol: poolResult1.token0.symbol,
          },
          token1: {
            decimals: poolResult1.token1.decimals,
            id: poolResult1.token1.address as string,
            name: poolResult1.token1.name,
            symbol: poolResult1.token1.symbol,
          },

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
            decimals: poolResult2.token0.decimals,
            id: poolResult2.token0.address as string,
            name: poolResult2.token0.name,
            symbol: poolResult2.token0.symbol,
          },
          token1: {
            decimals: poolResult2.token1.decimals,
            id: poolResult2.token1.address as string,
            name: poolResult2.token1.name,
            symbol: poolResult2.token1.symbol,
          },

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

    const sut = new PoolsService(tokensService, graphqlClients);

    const result = await sut.searchPoolsCrossChain(
      token0.id as string,
      token1.id as string,
    );

    expect(result).toEqual(<MatchedPoolsDTO>{
      pools: [poolResult1, poolResult2],
    });
  });
});
