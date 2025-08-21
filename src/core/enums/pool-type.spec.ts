import { PoolType } from './pool-type';

describe('PoolType', () => {
  it('should have the correct values for each pool type', () => {
    expect(PoolType.V3).toBe('V3');
    expect(PoolType.V4).toBe('V4');
  });
});
