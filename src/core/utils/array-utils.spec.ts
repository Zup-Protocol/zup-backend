import { isArrayEmptyOrUndefined } from './array-utils';

describe('Array Utils', () => {
  it('should return false for an empty array', () => {
    expect(isArrayEmptyOrUndefined([])).toBe(true);
  });

  it('should return false for an undefined array', () => {
    expect(isArrayEmptyOrUndefined(undefined)).toBe(true);
  });
});
