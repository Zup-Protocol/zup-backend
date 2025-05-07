import { Network as AlchemyNetwork } from 'alchemy-sdk';
import { Networks } from './networks';

describe('Networks', () => {
  it('should return false if the passed chainId is not a valid mapped network', () => {
    expect(Networks.isValidChainId(907987)).toBe(false);
  });

  it('should return true if the passed chainId is not valid & mapped network', () => {
    expect(Networks.isValidChainId(11155111)).toBe(true);
  });

  it('should return the alchemy network for a valid mapped network', () => {
    expect(Networks.getAlchemyNetwork(Networks.ETHEREUM)).toBe(
      AlchemyNetwork.ETH_MAINNET,
    );
    expect(Networks.getAlchemyNetwork(Networks.SEPOLIA)).toBe(
      AlchemyNetwork.ETH_SEPOLIA,
    );
    expect(Networks.getAlchemyNetwork(Networks.SCROLL)).toBe(
      AlchemyNetwork.SCROLL_MAINNET,
    );
  });
});
