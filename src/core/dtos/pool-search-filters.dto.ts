import { PoolType } from '../enums/pool-type';

export class PoolSearchFiltersDTO {
  minTvlUsd: number = 0;
  testnetMode: boolean = false;
  allowedPoolTypes: PoolType[] = Object.values(PoolType);
  blockedProtocols: string[] = [];
}
