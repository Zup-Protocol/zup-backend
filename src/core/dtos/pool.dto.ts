import { Networks } from '../enums/networks';
import { PoolType } from '../enums/pool-type';
import { ProtocolDTO } from './protocol.dto';
import { SinglechainTokenDTO } from './token.dto';

export interface PoolDTO {
  poolAddress: string;
  token0: SinglechainTokenDTO;
  token1: SinglechainTokenDTO;
  protocol: ProtocolDTO;
  yield24h: number;
  yield30d: number;
  yield90d: number;
  chainId: Networks;
  totalValueLockedUSD: number;
  poolType: PoolType;
}
