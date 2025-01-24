import { TokenMetadata } from '@/features/tokens/dto/token.dto';
import { PoolMetadata } from './pool-metadata.dto';
import { Networks } from '@/features/tokens/network.enum';

export class PoolMetadataByNetwork {
  poolsMetadata: PoolMetadata[];
  token0: TokenMetadata;
  token1: TokenMetadata;
  network: Networks;
}
