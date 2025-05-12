import { average, calculateDayPoolAPR } from './math-utils';

describe('Math Utils', () => {
  it('should return the average of an array of numbers', () => {
    expect(average([1, 2, 3, 4, 5])).toBe(3);
  });

  it("should calculate a liquidity pool APR from it's TVL and fees", () => {
    expect(calculateDayPoolAPR(100, 10)).toBe(3650);
  });
});
