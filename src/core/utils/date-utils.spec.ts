import { getDaysAgoTimestamp, nowInSecondsTimestamp } from './date-utils';

describe('Date Extension', () => {
  it('dabab', () => {});
  // it('should return the current timestamp in seconds when nowInSecondsTimestamp is called', () => {
  //   expect(nowInSecondsTimestamp()).toEqual(Math.floor(Date.now() / 1000));
  // });
  // it('should return 24h ago timestamp when yesterdayStartSecondsTimestamp is called ', () => {
  //   expect(yesterdayStartSecondsTimestamp()).toBe(nowInSecondsTimestamp() - 86400);
  // });
  it('should return timestamp X days ago when getDaysAgoTimestamp is called with X Value ', () => {
    expect(getDaysAgoTimestamp(90)).toBe(nowInSecondsTimestamp() - 86400 * 90);
  });
});
