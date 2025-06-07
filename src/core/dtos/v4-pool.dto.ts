import { PoolDTO } from './pool.dto';
import { V3PoolDTO } from './v3-pool.dto';

export interface V4PoolDTO extends PoolDTO, V3PoolDTO {
  hooks: string;
}
