import { BadRequestException } from '@nestjs/common';
import { Networks } from 'src/core/enums/networks';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';

describe('TokensController', () => {
  let sut: TokensController;
  let tokensService: TokensService;

  beforeEach(() => {
    tokensService = {
      getPopularTokens: jest.fn(),
      searchTokensByNameOrSymbol: jest.fn(),
      getTokenByAddress: jest.fn(),
      getTokenPrice: jest.fn(),
    } as unknown as TokensService;

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
});
