import { Alchemy } from 'alchemy-sdk';
import { Networks } from 'src/core/networks';
import { tokenList } from 'src/core/token-list';
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

    tokensService = new TokensService(alchemyFactoryMock);
  });

  it('should return the token list if no network is provided to the getPopularTokens method', () => {
    const tokens = tokensService.getPopularTokens();

    expect(tokens).toEqual(tokenList);
  });

  it('should return the token list filtered with the network passed when calling getPopularTokens method passing a network', () => {
    const network = Networks.SEPOLIA;
    const tokens = tokensService.getPopularTokens(network);

    expect(tokens).toEqual(
      tokenList.filter((token) => token.address[network] !== null),
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
        .filter((token) => token.address[network] !== null)
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

  it('should not have the logoUrl param when calling getTokenByAddress method if alchemy returns no logo', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const network = Networks.SEPOLIA;

    const token = await tokensService.getTokenByAddress(network, address);

    expect(token).toEqual({
      address: address,
      name: alchemyTokenMetadataWithoutLogo.name,
      symbol: alchemyTokenMetadataWithoutLogo.symbol,
      decimals: alchemyTokenMetadataWithoutLogo.decimals,
    });
  });
});
