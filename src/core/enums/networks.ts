import { Network as AlchemyNetwork } from 'alchemy-sdk';

export enum Networks {
  ETHEREUM = 1,
  SCROLL = 534352,
  SEPOLIA = 11155111,
  BASE = 8453,
  UNICHAIN = 130,
  HYPER_EVM = 999,
  // BNB = 56,
}

export class NetworksUtils {
  static values(): Networks[] {
    return (Object.values(Networks) as Networks[]).filter((value) => typeof value === 'number');
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
      case Networks.UNICHAIN:
        return AlchemyNetwork.UNICHAIN_MAINNET;
      case Networks.HYPER_EVM:
        return AlchemyNetwork.HYPERLIQUID_MAINNET;
      // case Networks.BNB:
      //   return AlchemyNetwork.BNB_MAINNET;
    }
  }

  static isTestnet(network: Networks): boolean {
    switch (network) {
      case Networks.SEPOLIA:
        return true;
      default:
        return false;
    }
  }

  static getIndexerUrl(): string {
    return process.env.INDEXER_URL!;
  }

  static isValidChainId(chainId: number): boolean {
    return this.values().includes(chainId);
  }

  static networkFromChainId(chainId: number): Networks {
    if (!this.isValidChainId(chainId)) {
      throw new Error(`Invalid chainId: ${chainId}`);
    }

    return this.values().find((network) => network.toString() === chainId.toString())!;
  }

  static wrappedNativeAddress(network: Networks): string {
    switch (network) {
      case Networks.ETHEREUM:
        return '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
      case Networks.SCROLL:
        return '0x5300000000000000000000000000000000000004';
      case Networks.SEPOLIA:
        return '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';
      case Networks.BASE:
        return '0x4200000000000000000000000000000000000006';
      case Networks.UNICHAIN:
        return '0x4200000000000000000000000000000000000006';
      case Networks.HYPER_EVM:
        return '0x5555555555555555555555555555555555555555';
      // case Networks.BNB:
      //   return '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
    }
  }
}
