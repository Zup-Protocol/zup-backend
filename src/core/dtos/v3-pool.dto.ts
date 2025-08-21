import { PoolDTO } from './pool.dto';

export interface V3PoolDTO extends PoolDTO {
  tickSpacing: number;
  latestTick: string;
  deployerAddress?: string | null;
}
