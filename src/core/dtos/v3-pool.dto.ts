import { PoolDTO } from './pool.dto';

export interface V3PoolDTO extends PoolDTO {
  feeTier: number;
  tickSpacing: number;
  positionManagerAddress: string;
}
