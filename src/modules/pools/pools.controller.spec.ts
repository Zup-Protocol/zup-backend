import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';

describe('PoolsController', () => {
  let sut: PoolsController;
  let poolsService: PoolsService;

  beforeEach(() => {
    poolsService = {
      searchPoolsCrossChain: jest.fn(),
      searchPoolsInChain: jest.fn(),
    } as unknown as PoolsService;

    sut = new PoolsController(poolsService);
  });

  it('Should call the service to get pools across networks when calling the /pools/all endpoint with the correct params', async () => {
    const token0Id = '12';
    const token1Id = '34';
    const minTvlUSD = 12132876.43;

    await sut.searchPoolsAcrossNetworks(token0Id, token1Id, minTvlUSD, false);

    expect(poolsService.searchPoolsCrossChain).toHaveBeenCalledWith({
      token0Id: token0Id,
      token1Id: token1Id,
      minTvlUsd: minTvlUSD,
      testnetMode: false,
    });
  });

  it('Should call the service to get pools across networks when calling the /pools/all with testnet mode true if query param is true', async () => {
    const token0Id = '12';
    const token1Id = '34';
    const minTvlUSD = 12132876.43;
    const testnetMode = true;

    await sut.searchPoolsAcrossNetworks(
      token0Id,
      token1Id,
      minTvlUSD,
      testnetMode,
    );

    expect(poolsService.searchPoolsCrossChain).toHaveBeenCalledWith({
      token0Id: token0Id,
      token1Id: token1Id,
      minTvlUsd: minTvlUSD,
      testnetMode: testnetMode,
    });
  });

  it('Should call the service to get pools in a specific network when calling the /pools/:chainId endpoint with the correct params', async () => {
    const token0 = '0x0000000000000000000000000000000000000000';
    const token1 = '0x1111111111111111111111111111111111111111';
    const chainId = 98765;
    const minTvlUSD = 12132876.43;

    await sut.searchPoolsInChain(token0, token1, minTvlUSD, chainId);

    expect(poolsService.searchPoolsInChain).toHaveBeenCalledWith({
      token0Address: token0,
      token1Address: token1,
      network: chainId,
      minTvlUsd: minTvlUSD,
    });
  });
});
