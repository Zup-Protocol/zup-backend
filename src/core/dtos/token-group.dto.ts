import { TokenDTO } from './token.dto';

export interface TokenGroupDTO {
  id: string;
  name: string;
  tokens: TokenDTO[];
}
