import { PoolProtocol } from './pool-protocol.dto';

export class PoolMetadata {
  poolAddress: string;
  protocol: PoolProtocol;
  feeTier: number;
  tickSpacing: number;
  yield24hs: number;
  yield7d: number;
  yield30d: number;
  token0Address: string;
  token1Address: string;
}
