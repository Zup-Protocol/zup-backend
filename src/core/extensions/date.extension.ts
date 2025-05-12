import { oneDayInSeconds } from '../constants';

export {};

declare global {
  interface DateConstructor {
    nowInSecondsTimestamp(): number;
    yesterdayStartSecondsTimestamp(): number;
    getDaysAgoTimestamp(daysAgo: number): number;
  }
}

Date.nowInSecondsTimestamp = function () {
  return Math.floor(Date.now() / 1000);
};

Date.yesterdayStartSecondsTimestamp = function () {
  return Date.nowInSecondsTimestamp() - oneDayInSeconds;
};

Date.getDaysAgoTimestamp = function (daysAgo: number) {
  return Date.nowInSecondsTimestamp() - oneDayInSeconds * daysAgo;
};
