import { Networks } from '../enums/networks';
import { ProtocolDTO } from './protocol.dto';
import { TokenDTO } from './token.dto';

export interface PoolDTO {
  poolAddress: string;
  token0: TokenDTO;
  token1: TokenDTO;
  protocol: ProtocolDTO;
  yield24h: number;
  yield7d: number;
  yield30d: number;
  yield90d: number;
  chainId: Networks;
  totalValueLockedUSD: number;
  poolType: string;
  permit2Address?: string | null;
  positionManagerAddress: string;
  feeTier: number;
}
