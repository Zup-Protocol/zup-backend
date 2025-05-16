import { Networks } from '../enums/networks';

export interface TokenDTO {
  id?: string;
  name: string;
  symbol: string;
  decimals: number;
  addresses: Record<Networks, string | null>;
  logoUrl?: string;
}
