import { Network as AlchemyNetwork } from 'alchemy-sdk';

export enum Networks {
  ETHEREUM = 1,
  SCROLL = 534352,
  SEPOLIA = 11155111,
  BASE = 8453,
}

export class NetworksUtils {
  static values(): Networks[] {
    return (Object.values(Networks) as Networks[]).filter(
      (value) => typeof value === 'number',
    );
  }

  static getAlchemyNetwork(network: Networks): AlchemyNetwork {
    switch (network) {
      case Networks.ETHEREUM:
        return AlchemyNetwork.ETH_MAINNET;
      case Networks.SCROLL:
        return AlchemyNetwork.SCROLL_MAINNET;
      case Networks.SEPOLIA:
        return AlchemyNetwork.ETH_SEPOLIA;
      case Networks.BASE:
        return AlchemyNetwork.BASE_MAINNET;
    }
  }

  static isTestnet(network: Networks): boolean {
    switch (network) {
      case Networks.ETHEREUM:
        return false;
      case Networks.SCROLL:
        return false;
      case Networks.SEPOLIA:
        return true;
      case Networks.BASE:
        return false;
    }
  }

  static getSubgraphUrl(network: Networks): string {
    switch (network) {
      case Networks.ETHEREUM:
        return 'https://gateway.thegraph.com/api/subgraphs/id/9MKMGf1LCYQsMx6RUoBGqQaWNyyhSGxeVPS88q6SujKq';
      case Networks.SCROLL:
        return 'https://gateway.thegraph.com/api/subgraphs/id/CEw9wKwo49yqpiWKD2iZQ9cEzMwZwPSjsCrdJ4NPikzW';
      case Networks.SEPOLIA:
        return 'https://gateway.thegraph.com/api/subgraphs/id/ELdPgMnFSt3caHSQrwPMGpSpPwVq3Ue2MiHKic94m2LY';
      case Networks.BASE:
        return 'https://api.studio.thegraph.com/query/108565/zup-dexs-base/version/latest';
    }
  }

  static isValidChainId(chainId: number): boolean {
    return Object.values(Networks).includes(chainId);
  }
}
