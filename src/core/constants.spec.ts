import { oneDayInSeconds, zeroEthereumAddress } from './constants';

describe('Constants', () => {
  it('The oneDayInSeconds constant should be 86400', () => {
    expect(oneDayInSeconds).toBe(86400);
  });

  it('should return the correct zero address for ethereum', () => {
    expect(zeroEthereumAddress).toBe(
      '0x0000000000000000000000000000000000000000',
    );
  });
});
