import { TokenMetadata } from '@/features/tokens/dto/token.dto';
import { PoolProtocol } from './pool-protocol.dto';

export class PoolMetadata {
  poolAddress: string;
  protocol: PoolProtocol;
  feeTier: number;
  tickSpacing: number;
  yield24hs: number;
  yield7d: number;
  yield30d: number;
  yield90d: number;
  token0: TokenMetadata;
  token1: TokenMetadata;
  network: string;
}
