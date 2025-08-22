import { average, calculateDayPoolAPR, trimmedAverage } from './math-utils';

describe('Math Utils', () => {
  it('should return the average of an array of numbers', () => {
    expect(average([1, 2, 3, 4, 5])).toBe(3);
  });

  it("should calculate a liquidity pool APR from it's TVL and fees", () => {
    expect(calculateDayPoolAPR(100, 10)).toBe(3650);
  });

  it('should return 0 for an empty array', () => {
    expect(trimmedAverage([], 0.1)).toBe(0);
  });

  it('should return the average when trimPercent is 0', () => {
    expect(trimmedAverage([1, 2, 3, 4, 5], 0)).toBe(3);
  });

  it('should trim extremes based on trimPercent', () => {
    expect(trimmedAverage([1, 2, 3, 100], 0.25)).toBe(2.5);
  });

  it('should work with decimals and trimming', () => {
    expect(trimmedAverage([1.1, 2.2, 3.3, 100.5], 0.25)).toBeCloseTo(2.75, 2);
  });

  it('should handle large outliers by trimming them away', () => {
    expect(trimmedAverage([1, 2, 3, 1000, 2000], 0.2)).toBe(335);
  });

  it('should handle large outliers by trimming them away even if they are not in order', () => {
    expect(trimmedAverage([1, 2000, 3, 2500, 3, 122, 5], 0.3)).toBe(43.333333333333336);
  });

  it('should handle case where trimPercent removes half the data', () => {
    expect(trimmedAverage([10, 20, 30, 40], 0.25)).toBe(25);
  });
});
