import { Alchemy } from 'alchemy-sdk';
import { GraphQLClient } from 'graphql-request';
import { zeroEthereumAddress } from 'src/core/constants';
import { TokenDTO } from 'src/core/dtos/token.dto';
import { Networks } from 'src/core/enums/networks';
import { tokenList } from 'src/core/token-list';
import { GetTokenDocument, GetTokenQueryVariables } from 'src/gen/graphql.gen';
import { TokensService } from './tokens.service';

describe('TokensService', () => {
  let tokensService: TokensService;
  let alchemy: Alchemy;

  const alchemyTokenMetadataWithoutLogo = {
    name: 'Test Token',
    symbol: 'TT',
    decimals: 18,
  };

  beforeEach(() => {
    alchemy = {
      core: {
        getTokenMetadata: jest
          .fn()
          .mockReturnValue(alchemyTokenMetadataWithoutLogo),
      },
    } as unknown as Alchemy;

    const alchemyFactoryMock = jest.fn().mockReturnValue(alchemy);

    tokensService = new TokensService(
      alchemyFactoryMock,
      {} as Record<Networks, GraphQLClient>,
    );
  });

  it('should return the token list if no network is provided to the getPopularTokens method', () => {
    const tokens = tokensService.getPopularTokens();

    expect(tokens).toEqual(tokenList);
  });

  it('should return the token list filtered with the network passed when calling getPopularTokens method passing a network', () => {
    const network = Networks.SEPOLIA;
    const tokens = tokensService.getPopularTokens(network);

    expect(tokens).toEqual(
      tokenList.filter((token) => token.addresses[network] !== null),
    );
  });

  it('should return the tokens matching the query by name or symbol when calling searchTokensByNameOrSymbol method', () => {
    const query = 'us';

    const tokens = tokensService.searchTokensByNameOrSymbol(query);

    expect(tokens).toEqual(
      tokenList.filter((token) => {
        return (
          token.name.toLowerCase().includes(query.toLowerCase()) ||
          token.symbol.toLowerCase().includes(query.toLowerCase())
        );
      }),
    );
  });

  it(`should return the tokens matching the query by name or symbol
    in a specific network when calling searchTokensByNameOrSymbol
    method passing a network`, () => {
    const query = 'uni';
    const network = Networks.SEPOLIA;
    const tokens = tokensService.searchTokensByNameOrSymbol(query, network);

    expect(tokens).toEqual(
      tokenList
        .filter((token) => token.addresses[network] !== null)
        .filter((token) => {
          return (
            token.name.toLowerCase().includes(query.toLowerCase()) ||
            token.symbol.toLowerCase().includes(query.toLowerCase())
          );
        }),
    );
  });

  it('should use alchemy to get the token metadata when calling getTokenByAddress method', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const network = Networks.SEPOLIA;

    await tokensService.getTokenByAddress(network, address);

    expect(alchemy.core.getTokenMetadata).toHaveBeenCalledWith(address);
  });

  it('should request the right query to the GraphQL client when calling getTokenPrice method and return the token price from the response', async () => {
    const tokenAddress = '0x1234567890123456789012345678901234567890';
    const network = Networks.SEPOLIA;
    const expectedPrice = 120.312;

    const graphqlClient = {
      request: jest.fn(),
    } as unknown as { request: jest.Mock };

    tokensService = new TokensService(jest.fn(), {
      [network]: graphqlClient as unknown as GraphQLClient,
    } as Record<Networks, GraphQLClient>);

    const expectedQuery = GetTokenDocument;

    const expectedVariables = <GetTokenQueryVariables>{
      tokenId: tokenAddress,
    };

    graphqlClient.request.mockReturnValue({
      token: {
        address: tokenAddress,
        decimals: 18,
        symbol: 'TEST',
        name: 'Test Token',
        usdPrice: expectedPrice,
      },
    });
    const result = await tokensService.getTokenPrice(tokenAddress, network);

    expect(graphqlClient.request).toHaveBeenCalledWith(
      expectedQuery,
      expectedVariables,
    );

    expect(result).toEqual({
      address: tokenAddress,
      usdPrice: expectedPrice,
    });
  });

  it('should return the native token metada when calling getTokenByAddress method passing the zero address', async () => {
    const address = zeroEthereumAddress;
    const network = Networks.UNICHAIN;

    const result = await tokensService.getTokenByAddress(network, address);

    expect(result).toEqual(
      tokenList.find((token) => token.addresses[network] === address),
    );
  });

  it('should return the internal token metadata (if available) when alchemy fetch fails when calling getTokenByAddress method', async () => {
    const _alchemy = {
      core: {
        getTokenMetadata: jest.fn().mockRejectedValue(new Error()),
      },
    };
    const _sut = new TokensService(
      jest.fn().mockReturnValue(_alchemy),
      {} as Record<Networks, GraphQLClient>,
    );

    const address = '0x779877A7B0D9E8603169DdbD7836e478b4624789';
    const network = Networks.SEPOLIA;
    const tokenInList = tokenList.find(
      (token) => token.addresses[network] === address,
    );

    const result = await _sut.getTokenByAddress(network, address);

    expect(result).toEqual(<TokenDTO>{
      ...tokenInList,
      id: undefined,
      addresses: {
        [network]: address,
      },
    });

    expect(_alchemy.core.getTokenMetadata).toHaveBeenCalledWith(address);
  });
});
