import { oneDayInSeconds } from './constants';

describe('Constants', () => {
  it('The oneDayInSeconds constant should be 86400', () => {
    expect(oneDayInSeconds).toBe(86400);
  });
});
