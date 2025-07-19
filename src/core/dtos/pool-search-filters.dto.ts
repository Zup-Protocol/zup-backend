import { PoolType } from 'src/gen/graphql.gen';

export class PoolSearchFiltersDTO {
  minTvlUsd: number = 0;
  testnetMode: boolean = false;
  allowedPoolTypes: PoolType[] = Object.values(PoolType);
  blockedProtocols: string[] = [];
}
