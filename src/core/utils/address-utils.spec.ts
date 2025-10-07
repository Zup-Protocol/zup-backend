import { ZERO_ETHEREUM_ADDRESS } from '../constants';
import { NetworksUtils } from '../enums/networks';
import { maybeParsePoolWrappedToNativeAddress } from './address-utils';

describe('AddressUtils', () => {
  it(`Should return the wrapped native address if passing wrapped native to
        'maybeParsePoolWrappedToNativeAddress' but the pool type is V4`, () => {
    const chainId = 1;
    const address = NetworksUtils.wrappedNativeAddress(1);

    expect(maybeParsePoolWrappedToNativeAddress(address, chainId, 'V4')).toBe(address);
  });

  it(`Should return zero address address if passing wrapped native address to
        'maybeParsePoolWrappedToNativeAddress' and the Pool type is not V4`, () => {
    const chainId = 1;
    const address = NetworksUtils.wrappedNativeAddress(1);

    expect(maybeParsePoolWrappedToNativeAddress(address, chainId, 'V3')).toBe(ZERO_ETHEREUM_ADDRESS);
  });

  it(`Should return the passed address if the passed address is not the same as wrapped native
    address for the provided chain id`, () => {
    const chainId = 1;

    expect(maybeParsePoolWrappedToNativeAddress('xabas21', chainId, 'V3')).toBe('xabas21');
  });
});
