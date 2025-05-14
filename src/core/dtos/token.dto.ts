import { Networks } from '../enums/networks';

interface _TokenDTO {
  id?: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
}

export interface MultichainTokenDTO extends _TokenDTO {
  addresses: Record<Networks, string | null>;
}

export interface SinglechainTokenDTO extends _TokenDTO {
  address: string;
}
