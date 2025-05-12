import '../extensions/date.extension';

describe('Date Extension', () => {
  it('should return the current timestamp in seconds when nowInSecondsTimestamp is called', () => {
    expect(Date.nowInSecondsTimestamp()).toEqual(Math.floor(Date.now() / 1000));
  });

  it('should return 24h ago timestamp when yesterdayStartSecondsTimestamp is called ', () => {
    expect(Date.yesterdayStartSecondsTimestamp()).toBe(
      Date.nowInSecondsTimestamp() - 86400,
    );
  });

  it('should return timestamp X days ago when getDaysAgoTimestamp is called with X Value ', () => {
    expect(Date.getDaysAgoTimestamp(90)).toBe(
      Date.nowInSecondsTimestamp() - 86400 * 90,
    );
  });
});
