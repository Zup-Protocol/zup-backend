import { GraphQLService } from '@/core/services/graphql.service';
import {
  GetPoolDataDocument,
  GetPoolDataQuery,
  GetPoolsByTokenIdsDocument,
  GetPoolsByTokenIdsQuery,
  PoolDailyData,
  PoolHourlyData,
} from '@/graphql/types/generated';
import { Injectable } from '@nestjs/common';
import { print } from 'graphql';
import { TokenMetadata } from '../tokens/dto/token.dto';
import { Networks } from '../tokens/network.enum';
import { TokenService } from '../tokens/token.service';
import { BestPoolYieldByTimeframe } from './dto/best-pool-yield-by-timeframe.dto';
import { PoolMetadataByNetwork } from './dto/pool-metadata-by-network.dto';
import { PoolMetadata } from './dto/pool-metadata.dto';

@Injectable()
export class PoolService {
  ONE_DAY_IN_SECONDS = 86400;
  SEVEN_DAYS_IN_SECONDS = this.ONE_DAY_IN_SECONDS * 7;
  THIRY_DAYS_IN_SECONDS = this.ONE_DAY_IN_SECONDS * 30;
  NINETY_DAYS_IN_SECONDS = this.ONE_DAY_IN_SECONDS * 90;

  constructor(
    private graphqlService: GraphQLService,
    private tokenService: TokenService,
  ) {}

  async findBestYieldsForTokenPair(
    token0Address: string,
    token1Address: string,
    network: Networks = Networks.SEPOLIA,
    minTvlUSD: number,
  ): Promise<{
    minTvlUSD: number;
    bestYieldsByFrame: BestPoolYieldByTimeframe;
    poolsMetadataByNetwork: Record<string, PoolMetadataByNetwork[]>;
  }> {
    console.log('Starting calculation of best yields ...');
    // if (network === Networks.ALL) {
    // TODO: Process all networks
    // }
    const poolsMetadataByNetwork = await this.processSingleNetworkPoolsMetadata(
      token0Address,
      token1Address,
      network,
    );

    const bestYieldsByFrame = this.calculateBestYieldsFromPoolsMetadata(
      poolsMetadataByNetwork[network][0].poolsMetadata,
      minTvlUSD,
    );

    console.log('Finishing calculation of best yields ...');
    return {
      minTvlUSD: minTvlUSD,
      bestYieldsByFrame,
      poolsMetadataByNetwork,
    };
  }

  calculateBestYieldsFromPoolsMetadata(
    poolsMetadata: PoolMetadata[],
    minTvlUSD: number,
  ) {
    // Get pools ordered by 24h yield (descending)
    const pools24hs = poolsMetadata
      .filter((pool) => pool.totalValueLockedUSD >= minTvlUSD)
      .sort((a, b) => b.yield24hs - a.yield24hs)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ yield24hs, yield7d, yield30d, yield90d, ...rest }) => ({
        ...rest,
        yield: yield24hs,
      }));

    // Get pools ordered by 7d yield (descending)
    const pools7d = poolsMetadata
      .filter((pool) => pool.totalValueLockedUSD >= minTvlUSD)
      .sort((a, b) => b.yield7d - a.yield7d)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ yield24hs, yield7d, yield30d, yield90d, ...rest }) => ({
        ...rest,
        yield: yield7d,
      }));

    // Get pools ordered by 30d yield (descending)
    const pools30d = poolsMetadata
      .filter((pool) => pool.totalValueLockedUSD >= minTvlUSD)
      .sort((a, b) => b.yield30d - a.yield30d)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ yield24hs, yield7d, yield30d, yield90d, ...rest }) => ({
        ...rest,
        yield: yield30d,
      }));

    // Get pools ordered by 90d yield (descending)
    const pools90d = poolsMetadata
      .filter((pool) => pool.totalValueLockedUSD >= minTvlUSD)
      .sort((a, b) => b.yield90d - a.yield90d)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ yield24hs, yield7d, yield30d, yield90d, ...rest }) => ({
        ...rest,
        yield: yield90d,
      }));

    return {
      bestYield24hs: pools24hs,
      bestYield7d: pools7d,
      bestYield30d: pools30d,
      bestYield90d: pools90d,
    };
  }

  async processSingleNetworkPoolsMetadata(
    token0Address: string,
    token1Address: string,
    network: Networks = Networks.SEPOLIA,
  ): Promise<Record<string, PoolMetadataByNetwork[]>> {
    const token0 = await this.tokenService.getTokenMetadataByAddress(
      token0Address,
      network,
    );

    const token1 = await this.tokenService.getTokenMetadataByAddress(
      token1Address,
      network,
    );

    console.debug('*** network ***', network);

    const { pools } = await this.graphqlService.query<GetPoolsByTokenIdsQuery>(
      network,
      print(GetPoolsByTokenIdsDocument),
      {
        token0Id: token0Address,
        token1Id: token1Address,
      },
    );

    console.debug('*** pools ***', pools);

    const poolIds = [...new Set([...pools.map((pool) => pool.id)])];
    console.debug('pool ids:', poolIds);
    const poolsMetadata: PoolMetadata[] = await Promise.all(
      poolIds.map((id) =>
        this.findBestYieldsByPool(id, network, token0, token1),
      ),
    );

    const poolMetadataByNetwork: Record<string, PoolMetadataByNetwork[]> = {
      [network]: [{ network, token0, token1, poolsMetadata }],
    };
    return poolMetadataByNetwork;
  }

  async findBestYieldsByPool(
    poolId: string,
    network: Networks = Networks.SEPOLIA,
    token0: TokenMetadata,
    token1: TokenMetadata,
  ): Promise<PoolMetadata> {
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const hourStartTimestamp = currentTimeInSeconds - this.ONE_DAY_IN_SECONDS;
    const dayStartTimestamp =
      currentTimeInSeconds - this.NINETY_DAYS_IN_SECONDS;
    const { pool } = await this.graphqlService.query<GetPoolDataQuery>(
      network,
      print(GetPoolDataDocument),
      { poolId, hourStartTimestamp, dayStartTimestamp },
    );

    const calculateDailyAnualizedApr = this.calculateDailyAnualizedApr(
      pool.dailyData as PoolDailyData[],
      currentTimeInSeconds,
    );

    const calculateHourlyAnualizedApr = this.calculateHourlyAnualizedApr(
      pool.hourlyData as PoolHourlyData[],
      pool.totalValueLockedUSD,
    );
    return {
      totalValueLockedUSD: Number.parseFloat(pool.totalValueLockedUSD),
      poolAddress: poolId,
      protocol: {
        name: pool.protocol.name,
        logo: pool.protocol.logo,
        url: pool.protocol.url,
        id: pool.protocol.id,
        positionManager: pool.protocol.positionManager,
      },
      network,
      token0:
        pool.token0.id.toLowerCase() === token0.address.toLowerCase()
          ? token0
          : token1,
      token1:
        pool.token1.id.toLowerCase() === token1.address.toLowerCase()
          ? token1
          : token0,
      feeTier: pool.feeTier,
      tickSpacing: pool.tickSpacing,
      yield24hs: calculateHourlyAnualizedApr,
      yield7d: calculateDailyAnualizedApr.apr7d,
      yield30d: calculateDailyAnualizedApr.apr30d,
      yield90d: calculateDailyAnualizedApr.apr90d,
    };
  }

  getTotalFees(poolDailyData: Array<Partial<PoolDailyData>>) {
    return poolDailyData.reduce((sum, day) => sum + parseFloat(day.feesUSD), 0);
  }

  calculateHourlyAnualizedApr(
    poolHourlyData: Array<PoolHourlyData>,
    totalValueLockedUSD: string,
  ): number {
    const hourlyTotalFeesUSD = poolHourlyData
      .reduce((sum, hour: PoolHourlyData) => sum + parseFloat(hour.feesUSD), 0)
      .toFixed(2);
    return parseFloat(
      this.calculateAnualizedApr(
        hourlyTotalFeesUSD,
        totalValueLockedUSD,
      ).toFixed(2),
    );
  }

  calculateDailyAnualizedApr(
    poolDailyData: Array<PoolDailyData>,
    currentTimeInSeconds: number,
  ): { apr7d: number; apr30d: number; apr90d: number } {
    const timestampSevenDaysAgo =
      currentTimeInSeconds - this.SEVEN_DAYS_IN_SECONDS;
    const timestampThirtyDaysAgo =
      currentTimeInSeconds - this.THIRY_DAYS_IN_SECONDS;
    const timestampNinetyDaysAgo =
      currentTimeInSeconds - this.NINETY_DAYS_IN_SECONDS;

    // Filter data points for 7 days, 30 days and 90 days
    const last7DaysData = poolDailyData.filter(
      (day) => parseFloat(day.dayStartTimestamp) >= timestampSevenDaysAgo,
    );

    const last30DaysData = poolDailyData.filter(
      (day) => parseFloat(day.dayStartTimestamp) >= timestampThirtyDaysAgo,
    );

    const last90DaysData = poolDailyData.filter(
      (day) => parseFloat(day.dayStartTimestamp) >= timestampNinetyDaysAgo,
    );

    const calculateAverageAPR = (data: PoolDailyData[]): number => {
      if (data.length === 0) return 0;
      const dailyAPRs = data.map((day: PoolDailyData) => {
        const { totalValueLockedUSD, feesUSD } = day;
        return this.calculateAnualizedApr(feesUSD, totalValueLockedUSD);
      });

      const averageAPR =
        dailyAPRs.reduce((sum, apr) => sum + apr, 0) / dailyAPRs.length;
      return parseFloat(averageAPR.toFixed(2));
    };

    return {
      apr7d: calculateAverageAPR(last7DaysData),
      apr30d: calculateAverageAPR(last30DaysData),
      apr90d: calculateAverageAPR(last90DaysData),
    };
  }

  calculateAnualizedApr(feesUSD: string, tvlUSD: string): number {
    const apr = (parseFloat(feesUSD) / parseFloat(tvlUSD)) * 100 * 365;
    return parseFloat(apr.toFixed(2));
  }
}
