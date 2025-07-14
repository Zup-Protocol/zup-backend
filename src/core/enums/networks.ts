import { Network as AlchemyNetwork } from 'alchemy-sdk';

export enum Networks {
  ETHEREUM = 1,
  SCROLL = 534352,
  SEPOLIA = 11155111,
  // BASE = 8453,
  UNICHAIN = 130,
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
      // case Networks.BASE:
      //   return AlchemyNetwork.BASE_MAINNET;
      case Networks.UNICHAIN:
        return AlchemyNetwork.UNICHAIN_MAINNET;
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
      // case Networks.BASE:
      //   return false;
      case Networks.UNICHAIN:
        return false;
    }
  }

  static getSubgraphUrl(network: Networks): string {
    switch (network) {
      case Networks.ETHEREUM:
        return `https://subgraph.satsuma-prod.com/${process.env.GRAPHQL_API_KEY}/zup-protocol-team--156415/zup-dexs-ethereum/version/1.1.20/api`;
      case Networks.SCROLL:
        return `https://subgraph.satsuma-prod.com/${process.env.GRAPHQL_API_KEY}/zup-protocol-team--156415/zup-dexs-scroll/version/1.1.20/api`;
      case Networks.SEPOLIA:
        return `https://subgraph.satsuma-prod.com/${process.env.GRAPHQL_API_KEY}/zup-protocol-team--156415/zup-dexs-sepolia/version/1.1.20/api`;
      // case Networks.BASE:
      //   return `https://subgraph.satsuma-prod.com/${process.env.GRAPHQL_API_KEY}/zup-protocol-team--156415/zup-dexs-base/version/1.1.20/api`;
      case Networks.UNICHAIN:
        return `https://subgraph.satsuma-prod.com/${process.env.GRAPHQL_API_KEY}/zup-protocol-team--156415/zup-dexs-unichain/version/1.1.20/api`;
    }
  }

  static isValidChainId(chainId: number): boolean {
    return Object.values(Networks).includes(chainId);
  }

  static wrappedNativeAddress(network: Networks): string {
    switch (network) {
      case Networks.ETHEREUM:
        return '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
      case Networks.SCROLL:
        return '0x5300000000000000000000000000000000000004';
      case Networks.SEPOLIA:
        return '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';
      // case Networks.BASE:
      //   return '0x4200000000000000000000000000000000000006';
      case Networks.UNICHAIN:
        return '0x4200000000000000000000000000000000000006';
    }
  }
}
