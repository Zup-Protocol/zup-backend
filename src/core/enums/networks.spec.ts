import { Network as AlchemyNetwork } from 'alchemy-sdk';
import { Networks, NetworksUtils } from './networks';

describe('Networks', () => {
  it('should return false if the passed chainId is not a valid mapped network', () => {
    expect(NetworksUtils.isValidChainId(907987)).toBe(false);
  });

  it('should return true if the passed chainId is not valid & mapped network', () => {
    expect(NetworksUtils.isValidChainId(11155111)).toBe(true);
  });

  it('should return the alchemy network for a valid mapped network', () => {
    expect(NetworksUtils.getAlchemyNetwork(Networks.ETHEREUM)).toBe(
      AlchemyNetwork.ETH_MAINNET,
    );
    expect(NetworksUtils.getAlchemyNetwork(Networks.SEPOLIA)).toBe(
      AlchemyNetwork.ETH_SEPOLIA,
    );
    expect(NetworksUtils.getAlchemyNetwork(Networks.SCROLL)).toBe(
      AlchemyNetwork.SCROLL_MAINNET,
    );

    expect(NetworksUtils.getAlchemyNetwork(Networks.BASE)).toBe(
      AlchemyNetwork.BASE_MAINNET,
    );

    expect(NetworksUtils.getAlchemyNetwork(Networks.UNICHAIN)).toBe(
      AlchemyNetwork.UNICHAIN_MAINNET,
    );

    expect(NetworksUtils.getAlchemyNetwork(Networks.BNB)).toBe(
      AlchemyNetwork.BNB_MAINNET,
    );
  });

  it('should return the correct subgraph url for a valid mapped network using the correct api key from the env', () => {
    const apiKey = (process.env.GRAPHQL_API_KEY = 'test');

    expect(NetworksUtils.getSubgraphUrl(Networks.ETHEREUM)).toBe(
      `https://subgraph.satsuma-prod.com/${apiKey}/zup-protocol-team--156415/zup-dexs-ethereum/version/2.1.23/api`,
    );
    expect(NetworksUtils.getSubgraphUrl(Networks.SEPOLIA)).toBe(
      `https://subgraph.satsuma-prod.com/${apiKey}/zup-protocol-team--156415/zup-dexs-sepolia/version/2.1.23/api`,
    );
    expect(NetworksUtils.getSubgraphUrl(Networks.SCROLL)).toBe(
      `https://subgraph.satsuma-prod.com/${apiKey}/zup-protocol-team--156415/zup-dexs-scroll/version/2.1.23/api`,
    );
    expect(NetworksUtils.getSubgraphUrl(Networks.BASE)).toBe(
      `https://subgraph.satsuma-prod.com/${apiKey}/zup-protocol-team--156415/zup-dexs-base/version/2.1.23/api`,
    );
    expect(NetworksUtils.getSubgraphUrl(Networks.UNICHAIN)).toBe(
      `https://subgraph.satsuma-prod.com/${apiKey}/zup-protocol-team--156415/zup-dexs-unichain/version/2.1.23/api`,
    );
    expect(NetworksUtils.getSubgraphUrl(Networks.BNB)).toBe(
      `https://subgraph.satsuma-prod.com/${apiKey}/zup-protocol-team--156415/zup-dexs-bnb/version/2.1.23/api`,
    );
  });

  it("should return true if the passed chainId is in the enum's values", () => {
    expect(NetworksUtils.isValidChainId(11155111)).toBe(true);
    expect(NetworksUtils.isValidChainId(534352)).toBe(true);
    expect(NetworksUtils.isValidChainId(1)).toBe(true);
    expect(NetworksUtils.isValidChainId(130)).toBe(true);
    expect(NetworksUtils.isValidChainId(56)).toBe(true);
  });

  it('should return false if the passed chainId is not in the enum', () => {
    expect(NetworksUtils.isValidChainId(82791865)).toBe(false);
  });

  it('should return if the network is a testnet', () => {
    expect(NetworksUtils.isTestnet(Networks.ETHEREUM)).toBe(false);
    expect(NetworksUtils.isTestnet(Networks.SEPOLIA)).toBe(true);
    expect(NetworksUtils.isTestnet(Networks.SCROLL)).toBe(false);
    expect(NetworksUtils.isTestnet(Networks.BASE)).toBe(false);
    expect(NetworksUtils.isTestnet(Networks.UNICHAIN)).toBe(false);
    expect(NetworksUtils.isTestnet(Networks.BNB)).toBe(false);
  });

  it('should return the correct address for the wrapped native token', () => {
    expect(NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM)).toBe(
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    );
    expect(NetworksUtils.wrappedNativeAddress(Networks.SEPOLIA)).toBe(
      '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    );
    expect(NetworksUtils.wrappedNativeAddress(Networks.SCROLL)).toBe(
      '0x5300000000000000000000000000000000000004',
    );
    expect(NetworksUtils.wrappedNativeAddress(Networks.BASE)).toBe(
      '0x4200000000000000000000000000000000000006',
    );
    expect(NetworksUtils.wrappedNativeAddress(Networks.UNICHAIN)).toBe(
      '0x4200000000000000000000000000000000000006',
    );
    expect(NetworksUtils.wrappedNativeAddress(Networks.BNB)).toBe(
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    );
  });
});
