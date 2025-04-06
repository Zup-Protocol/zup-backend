import { Network as AlchemyNetwork } from 'alchemy-sdk';

export enum Networks {
  MAINNET = 'mainnet',
  SEPOLIA = 'sepolia',
  SCROLL = 'scroll',
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Networks {
  export function getAlchemyNetwork(network: Networks): AlchemyNetwork {
    switch (network) {
      case Networks.MAINNET:
        return AlchemyNetwork.ETH_MAINNET;
      case Networks.SEPOLIA:
        return AlchemyNetwork.ETH_SEPOLIA;
      case Networks.SCROLL:
        return AlchemyNetwork.SCROLL_MAINNET;
      default:
        throw new Error(`Network ${network} not mapped to Alchemy network yet`);
    }
  }

  export function getTrustWalletAssetsNetwork(network: Networks): string {
    switch (network) {
      case Networks.MAINNET:
        return 'ethereum';
      case Networks.SEPOLIA:
        return 'sepolia';
      case Networks.SCROLL:
        return 'scroll';
      default:
        throw new Error(
          `Network ${network} not mapped to Trust Wallet Assets network yet`,
        );
    }
  }

  export function getChainId(network: Networks): number {
    switch (network) {
      case Networks.MAINNET:
        return 1;
      case Networks.SEPOLIA:
        return 11155111;
      case Networks.SCROLL:
        return 534351;
      default:
        throw new Error(`Network ${network} not mapped to chain id yet`);
    }
  }
}
