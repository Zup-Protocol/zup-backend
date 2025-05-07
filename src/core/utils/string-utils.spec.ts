import { isEthereumAddress } from './string-utils';

describe('isEthereumAddress', () => {
  it('should return true for a valid Ethereum address', () => {
    expect(
      isEthereumAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e'),
    ).toBe(true);
  });

  it('should return false for an invalid Ethereum address', () => {
    expect(isEthereumAddress('0x123456')).toBe(false);
  });
});
