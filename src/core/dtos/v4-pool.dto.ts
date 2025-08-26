import { PoolDTO } from './pool.dto';

export interface V4PoolDTO extends PoolDTO {
  hooksAddress: string;
  stateViewAddress: string;
  poolManagerAddress: string;
  tickSpacing: number;
  latestTick: string;
  latestSqrtPriceX96: string;
}
