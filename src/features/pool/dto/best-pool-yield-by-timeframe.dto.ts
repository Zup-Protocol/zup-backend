import { PoolMetadata } from './pool-metadata.dto';

export class BestPoolYieldByTimeframe {
  bestYield24hs: Partial<PoolMetadata>[];
  bestYield7d: Partial<PoolMetadata>[];
  bestYield30d: Partial<PoolMetadata>[];
  bestYield90d: Partial<PoolMetadata>[];
}
