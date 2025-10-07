import { GetPoolsQueryVariables } from 'src/gen/graphql.gen';
import { YIELD_DAILY_DATA_LIMIT } from '../constants';
import { getDaysAgoTimestamp, yesterdayStartSecondsTimestamp } from './date-utils';

export function getPoolQueryVariablesForYieldCalculation(): GetPoolsQueryVariables {
  return {
    dailyDataFilter: {
      feesUSD: {
        _lt: '1000000000', // filter out weird days with very high fees
      },
      dayStartTimestamp: {
        _gt: getDaysAgoTimestamp(YIELD_DAILY_DATA_LIMIT).toString(),
      },
    },
    hourlyDataFilter: {
      feesUSD: {
        _lt: '10000000', // filter out weird hours with very high fees
      },
      hourStartTimestamp: {
        _gt: yesterdayStartSecondsTimestamp().toString(),
      },
    },
  };
}
