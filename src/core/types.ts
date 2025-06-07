import { PoolDTO } from './dtos/pool.dto';
import { V3PoolDTO } from './dtos/v3-pool.dto';
import { V4PoolDTO } from './dtos/v4-pool.dto';

export type SupportedPoolType = (V3PoolDTO | V4PoolDTO) & PoolDTO;
