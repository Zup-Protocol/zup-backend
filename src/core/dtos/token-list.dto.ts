import { TokenGroupDTO } from './token-group.dto';
import { TokenDTO } from './token.dto';

export interface TokenListDTO {
  popularTokens: TokenDTO[];
  tokenGroups: TokenGroupDTO[];
}
