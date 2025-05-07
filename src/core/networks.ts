import { Network as AlchemyNetwork } from 'alchemy-sdk';

/* eslint-disable @typescript-eslint/no-namespace */
export enum Networks {
  ETHEREUM = 1,
  SCROLL = 534352,
  SEPOLIA = 11155111,
}

export namespace Networks {
  export function getAlchemyNetwork(network: Networks): AlchemyNetwork {
    switch (network) {
      case Networks.ETHEREUM:
        return AlchemyNetwork.ETH_MAINNET;
      case Networks.SCROLL:
        return AlchemyNetwork.SCROLL_MAINNET;
      case Networks.SEPOLIA:
        return AlchemyNetwork.ETH_SEPOLIA;
      default:
        throw new Error('Network not mapped to alchemy network');
    }
  }

  export function isValidChainId(chainId: number): boolean {
    return Object.values(Networks).includes(chainId);
  }
}
