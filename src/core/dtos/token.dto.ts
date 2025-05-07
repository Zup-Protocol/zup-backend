import { Networks } from '../networks';

export interface TokenDTO {
  name: string;
  symbol: string;
  address: string | Record<Networks, string | null>;
  decimals: number;
  logoUrl?: string;
}
