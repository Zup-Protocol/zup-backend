import { BadRequestException } from '@nestjs/common';

import { mock } from 'jest-mock-extended';
import { _MockProxy } from 'jest-mock-extended/lib/Mock';
import { zeroEthereumAddress } from 'src/core/constants';
import { TokenListDTO } from 'src/core/dtos/token-list.dto';
import { TokenPriceDTO } from 'src/core/dtos/token-price-dto';
import { Networks, NetworksUtils } from 'src/core/enums/networks';
import { tokenGroupList } from 'src/core/token-group-list';
import { tokenList } from 'src/core/token-list';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';

describe('TokensController', () => {
  let sut: TokensController;
  let tokensService: _MockProxy<TokensService> & TokensService;

  beforeEach(() => {
    tokensService = mock<TokensService>();

    tokensService.getTokenPrice.mockResolvedValue(<TokenPriceDTO>{
      address: '0x1234567890123456789012345678901234567890',
      usdPrice: 120.312,
    });

    sut = new TokensController(tokensService);
  });

  it('should call the service method to get popular tokens when calling the /popular endpoint without a chain id', () => {
    sut.getPopularTokens();
    expect(tokensService.getPopularTokens).toHaveBeenCalledWith(undefined);
  });

  it('should call the service method to get popular tokens when calling the /popular passing the chain id from the query', () => {
    sut.getPopularTokens(11155111);

    expect(tokensService.getPopularTokens).toHaveBeenCalledWith(
      Networks.SEPOLIA,
    );
  });

  it('should throw 400 if a chain id is provided to /search and it is not any of the supported chain ids', async () => {
    const invalidChainId = 99999999;

    await expect(sut.searchTokens('query', invalidChainId)).rejects.toThrow(
      new BadRequestException(
        `The provided chain id (${invalidChainId}) is not supported. Please provide a valid chain id`,
      ),
    );
  });

  it('should throw 400 if no query is provided to /search', async () => {
    await expect(sut.searchTokens('', undefined)).rejects.toThrow(
      new BadRequestException(
        'A query string should be provided in order to perform a search',
      ),
    );
  });

  it('should throw 400 if no chain id is provided to /search and the query is an address', async () => {
    await expect(
      sut.searchTokens('0x1234567890123456789012345678901234567890', undefined),
    ).rejects.toThrow(
      new BadRequestException(
        'A chain id should be provided to get a token by address',
      ),
    );
  });

  it("should call the correct service method to search tokens by name or symbol if the query isn't an address", async () => {
    const query = 'query';
    const network = 11155111;

    await sut.searchTokens(query, network);

    expect(tokensService.searchTokensByNameOrSymbol).toHaveBeenCalledWith(
      query,
      network,
    );
  });

  it('should call the correct service method to search tokens by address if the query is an address', async () => {
    const query = '0x1234567890123456789012345678901234567890';
    const network = 11155111;

    await sut.searchTokens(query, network);

    expect(tokensService.getTokenByAddress).toHaveBeenCalledWith(
      network,
      query,
    );
  });

  it('should throw 400 if an invalid address is provided to /price', async () => {
    const invalidAddress = 'invalid_address';
    const chainId = Networks.SEPOLIA;

    await expect(sut.getTokenPrice(invalidAddress, chainId)).rejects.toThrow(
      new BadRequestException('A valid address should be provided'),
    );
  });

  it('should throw 400 if an invalid chain id is provided to /price', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const invalidChainId = 99999999;

    await expect(sut.getTokenPrice(address, invalidChainId)).rejects.toThrow(
      new BadRequestException(
        `The provided chain id (${invalidChainId}) is not supported. Please provide a valid chain id`,
      ),
    );
  });

  it('should call the service method to get token price with the provided address and chain id', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const chainId = Networks.SEPOLIA;

    await sut.getTokenPrice(address, chainId);

    expect(tokensService.getTokenPrice).toHaveBeenCalledWith(address, chainId);
  });

  it('should call the service method to get token price with the provided address and chain id', async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const chainId = Networks.SEPOLIA;

    await sut.getTokenPrice(address, chainId);

    expect(tokensService.getTokenPrice).toHaveBeenCalledWith(address, chainId);
  });

  it(`should call the service with the wrapped native address to get the price
    when searching for the zero address and returning zero`, async () => {
    const _tokensService = mock<TokensService>();
    const _sut = new TokensController(_tokensService);

    const searchAddress = zeroEthereumAddress;
    const chainId = Networks.SEPOLIA;
    const wrappedNativeAddress = NetworksUtils.wrappedNativeAddress(chainId);
    const expectedReturnedValue = <TokenPriceDTO>{
      address: wrappedNativeAddress,
      usdPrice: 328769.43,
    };

    _tokensService.getTokenPrice
      .calledWith(wrappedNativeAddress, chainId)
      .mockResolvedValue(expectedReturnedValue);

    _tokensService.getTokenPrice
      .calledWith(searchAddress, chainId)
      .mockResolvedValue(<TokenPriceDTO>{
        address: searchAddress,
        usdPrice: 0,
      });

    const returnedValue = await _sut.getTokenPrice(searchAddress, chainId);

    expect(returnedValue).toEqual(expectedReturnedValue);

    expect(_tokensService.getTokenPrice).toHaveBeenCalledWith(
      wrappedNativeAddress,
      chainId,
    );

    expect(_tokensService.getTokenPrice).toHaveBeenCalledWith(
      zeroEthereumAddress,
      chainId,
    );
  });

  it('should call the service method with the passed chainId to get the tokens groups when calling the /groups endpoint', () => {
    const chainId = Networks.SEPOLIA;
    sut.getTokenGroups(chainId);

    expect(tokensService.getTokenGroups).toHaveBeenCalledWith(chainId);
  });

  it('should call the service method without a chainId to get the tokens groups when calling the /groups endpoint not passing a chainId', () => {
    sut.getTokenGroups();

    expect(tokensService.getTokenGroups).toHaveBeenCalledWith(undefined);
  });

  it('should call the service method with the chainid passed to get the popular tokens and tokens groups when calling the /list endpoint', () => {
    const chainId = Networks.SEPOLIA;
    sut.getTokenList(chainId);

    expect(tokensService.getPopularTokens).toHaveBeenCalledWith(chainId);
    expect(tokensService.getTokenGroups).toHaveBeenCalledWith(chainId);
  });

  it(`should call the service method without the chainid to get
    the popular tokens and tokens groups when calling the
    /list endpoint not passing a chainId`, () => {
    sut.getTokenList();

    expect(tokensService.getPopularTokens).toHaveBeenCalledWith(undefined);
    expect(tokensService.getTokenGroups).toHaveBeenCalledWith(undefined);
  });

  it(`should return the popular tokens and tokens groups when calling the /list endpoint, got from the service`, () => {
    tokensService.getPopularTokens.mockReturnValue(tokenList);
    tokensService.getTokenGroups.mockReturnValue(tokenGroupList);

    const expectedResult: TokenListDTO = {
      popularTokens: tokenList,
      tokenGroups: tokenGroupList,
    };

    const result = sut.getTokenList();

    expect(result).toEqual(expectedResult);
  });
});
