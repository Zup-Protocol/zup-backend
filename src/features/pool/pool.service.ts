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

@Injectable()
export class PoolService {
  constructor(private graphqlService: GraphQLService) {}

  async findBestYieldsForTokenPair(
    token0Id: string,
    token1Id: string,
    network: Networks = Networks.SEPOLIA,
  ): Promise<any> {
    console.log('Starting calculation of best yields ...');
    console.debug('*** network ***', network);
    const { pools } = await this.graphqlService.query<GetPoolsByTokenIdsQuery>(
      print(GetPoolsByTokenIdsDocument),
      { token0Id, token1Id },
    );

    const poolIds = [...new Set([...pools.map((pool) => pool.id)])];
    console.debug('pool ids:', poolIds);

    const bestYields = await Promise.all(
      poolIds.map((id) => this.findBestYieldsByPool(id)),
    );
    console.log('Finishing calculation of best yields ...');
    return { bestYields };
  }

  async findBestYieldsByPool(
    poolId: string,
  ): Promise<{ id: string; dailyAPR: string; hourlyAPR: string }> {
    const { pool } = await this.graphqlService.query<GetPoolDataQuery>(
      print(GetPoolDataDocument),
      { poolId },
    );

    const calculateDailyAnualizedApr = this.calculateDailyAnualizedApr(
      pool.dailyData as PoolDailyData[],
    );

    const calculateHourlyAnualizedApr = this.calculateHourlyAnualizedApr(
      pool.hourlyData as PoolHourlyData[],
      pool.totalValueLockedUSD,
    );
    return {
      id: poolId,
      dailyAPR: calculateDailyAnualizedApr,
      hourlyAPR: calculateHourlyAnualizedApr,
    };
  }

  getTotalFees(poolDailyData: Array<Partial<PoolDailyData>>) {
    return poolDailyData.reduce((sum, day) => sum + parseFloat(day.feesUSD), 0);
  }

  calculateHourlyAnualizedApr(
    poolHourlyData: Array<PoolHourlyData>,
    totalValueLockedUSD: string,
  ): string {
    const hourlyTotalFeesUSD = poolHourlyData
      .reduce((sum, hour: PoolHourlyData) => sum + parseFloat(hour.feesUSD), 0)
      .toFixed(2);
    return this.calculateAnualizedApr(
      hourlyTotalFeesUSD,
      totalValueLockedUSD,
    ).toFixed(2);
  }

  calculateDailyAnualizedApr(poolDailyData: Array<PoolDailyData>): string {
    const dailyAPRs = poolDailyData.map((day: PoolDailyData) => {
      const { totalValueLockedUSD, feesUSD } = day;
      return this.calculateAnualizedApr(feesUSD, totalValueLockedUSD);
    });
    const averageDailyAPR =
      dailyAPRs.reduce((sum, apr) => sum + apr, 0) / dailyAPRs.length;
    return averageDailyAPR.toFixed(2);
  }

  calculateAnualizedApr(feesUSD: string, tvlUSD: string): number {
    const apr = (parseFloat(feesUSD) / parseFloat(tvlUSD)) * 100 * 365;
    return parseFloat(apr.toFixed(2));
  }
}
