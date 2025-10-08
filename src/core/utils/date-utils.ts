import { ONE_DAY_IN_SECONDS } from '../constants';

export const nowInSecondsTimestamp = () => Math.floor(Date.now() / 1000);

export const yesterdayStartSecondsTimestamp = () => nowInSecondsTimestamp() - ONE_DAY_IN_SECONDS;

export const getDaysAgoTimestamp = (daysAgo: number): number => {
  return nowInSecondsTimestamp() - ONE_DAY_IN_SECONDS * daysAgo;
};
