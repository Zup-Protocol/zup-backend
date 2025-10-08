import { ZERO_ETHEREUM_ADDRESS } from '../constants';
import { NetworksUtils } from '../enums/networks';
import { PoolType } from '../enums/pool-type';
import '../extensions/string.extension';

export function maybeParsePoolWrappedToNativeAddress(address: string, chainId: number, poolType: string): string {
  // V4 Pools doesn't allow natively WETH deposit like V3
  if (poolType.lowercasedEquals(PoolType.V4)) return address;

  if (address.lowercasedEquals(NetworksUtils.wrappedNativeAddress(chainId))) {
    return ZERO_ETHEREUM_ADDRESS;
  }

  return address;
}
