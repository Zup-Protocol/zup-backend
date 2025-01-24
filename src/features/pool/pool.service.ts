import { Injectable } from '@nestjs/common';
import { GraphQLService } from '@/core/services/graphql.service';
import {
  GetPoolDataDocument,
  GetPoolDataQuery,
  GetPoolsByTokenIdsDocument,
  GetPoolsByTokenIdsQuery,
  PoolDailyData,
  PoolHourlyData,
} from '@/graphql/types/generated';
import { print } from 'graphql';
import { Networks } from '../tokens/network.enum';
import { PoolMetadata } from './dto/pool-metadata.dto';
import { TokenService } from '../tokens/token.service';
import { PoolMetadataByNetwork } from './dto/pool-metadata-by-network.dto';

@Injectable()
export class PoolService {
  ONE_DAY_IN_SECONDS = 86400;
  ONE_WEEK_IN_SECONDS = this.ONE_DAY_IN_SECONDS * 7;
  ONE_MONTH_IN_SECONDS = this.ONE_DAY_IN_SECONDS * 30;

  constructor(
    private graphqlService: GraphQLService,
    private tokenService: TokenService,
  ) {}

  async findBestYieldsForTokenPair(
    token0Symbol: string,
    token1Symbol: string,
    network: Networks = Networks.SEPOLIA,
  ): Promise<PoolMetadataByNetwork[]> {
    console.log('Starting calculation of best yields ...');
    if (network === Networks.ALL) {
      // TODO: Process all networks
    }
    const poolsMetadata = await this.processSingleNetworkPoolsMetadata(
      token0Symbol,
      token1Symbol,
      network,
    );

    console.log('Finishing calculation of best yields ...');
    return poolsMetadata;
  }

  // TODO: Hardcoded token address and networks
  async processSingleNetworkPoolsMetadata(
    token0Symbol: string,
    token1Symbol: string,
    network: Networks = Networks.SEPOLIA,
  ): Promise<PoolMetadataByNetwork[]> {
    const token0 =
      await this.tokenService.getTokenMetadataBySymbol(token0Symbol);
    const token1 =
      await this.tokenService.getTokenMetadataBySymbol(token1Symbol);

    const token0Id = '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238';
    const token1Id = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14';

    console.debug('*** network ***', network);

    const { pools } = await this.graphqlService.query<GetPoolsByTokenIdsQuery>(
      network,
      print(GetPoolsByTokenIdsDocument),
      { token0Id, token1Id },
    );
    const poolIds = [...new Set([...pools.map((pool) => pool.id)])];
    console.debug('pool ids:', poolIds);
    const poolsMetadata: PoolMetadata[] = await Promise.all(
      poolIds.map((id) => this.findBestYieldsByPool(id, network)),
    );
    return [{ network, token0, token1, poolsMetadata }];
  }

  async findBestYieldsByPool(
    poolId: string,
    network: Networks = Networks.SEPOLIA,
  ): Promise<PoolMetadata> {
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const hourStartTimestamp = currentTimeInSeconds - this.ONE_DAY_IN_SECONDS;
    const dayStartTimestamp =
      currentTimeInSeconds - this.ONE_DAY_IN_SECONDS * 30;
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
      poolAddress: poolId,
      protocol: {
        name: pool.protocol.name,
        logo: pool.protocol.logo,
        url: pool.protocol.url,
        id: pool.protocol.id,
        positionManager: pool.protocol.positionManager,
      },
      feeTier: pool.feeTier,
      tickSpacing: pool.tickSpacing,
      yield24hs: calculateHourlyAnualizedApr,
      yield7d: calculateDailyAnualizedApr.apr7d,
      yield30d: calculateDailyAnualizedApr.apr30d,
    };
  }

  getTotalFees(poolDailyData: Array<Partial<PoolDailyData>>) {
    return poolDailyData.reduce((sum, day) => sum + parseFloat(day.feesUSD), 0);
  }

  // TODO: Fix the hourly APR to consider items between dates instead of first 24 items
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

  // TODO: Fix the hourly APR to consider items between dates instead of first X number of items
  calculateDailyAnualizedApr(
    poolDailyData: Array<PoolDailyData>,
    currentTimeInSeconds: number,
  ): { apr7d: number; apr30d: number } {
    const timestampSevenDaysAgo =
      currentTimeInSeconds - this.ONE_WEEK_IN_SECONDS;
    const timestampThirtyDaysAgo =
      currentTimeInSeconds - this.ONE_MONTH_IN_SECONDS;

    // Filter data points for 7 days and 30 days
    const last7DaysData = poolDailyData.filter(
      (day) => parseFloat(day.dayStartTimestamp) >= timestampSevenDaysAgo,
    );

    const last30DaysData = poolDailyData.filter(
      (day) => parseFloat(day.dayStartTimestamp) >= timestampThirtyDaysAgo,
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
    };
  }

  calculateAnualizedApr(feesUSD: string, tvlUSD: string): number {
    const apr = (parseFloat(feesUSD) / parseFloat(tvlUSD)) * 100 * 365;
    return parseFloat(apr.toFixed(2));
  }
}
