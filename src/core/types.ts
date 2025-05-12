import { PoolDTO } from './dtos/pool.dto';
import { V3PoolDTO } from './dtos/v3-pool.dto';

export type SupportedPoolType = V3PoolDTO & PoolDTO;
