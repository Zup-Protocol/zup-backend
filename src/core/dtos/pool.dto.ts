import { PoolType } from 'src/gen/graphql.gen';
import { Networks } from '../enums/networks';
import { ProtocolDTO } from './protocol.dto';
import { TokenDTO } from './token.dto';

export interface PoolDTO {
  poolAddress: string;
  token0: TokenDTO;
  token1: TokenDTO;
  protocol: ProtocolDTO;
  yield24h: number;
  yield30d: number;
  yield90d: number;
  chainId: Networks;
  totalValueLockedUSD: number;
  poolType: PoolType;
  permit2Address?: string | null;
}
