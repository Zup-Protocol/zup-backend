import { Networks } from '../enums/networks';

export interface TokenDTO {
  id?: string;
  name: string;
  symbol: string;
  address: string | Record<Networks, string | null>;
  decimals: number;
  logoUrl?: string;
}
