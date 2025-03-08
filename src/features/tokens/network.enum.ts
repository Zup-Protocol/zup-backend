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
    }
  }
}
