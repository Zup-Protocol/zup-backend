import { PoolDTO } from './pool.dto';

export interface V3PoolDTO extends PoolDTO {
  tickSpacing: number;
  latestTick: string;
  latestSqrtPriceX96: string;
  deployerAddress?: string | null;
}
