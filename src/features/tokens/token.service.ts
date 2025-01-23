import { Injectable } from '@nestjs/common';
import { Networks } from './network.enum';
import { supportedTokens } from './supported-tokens';
import { Token } from './token.dto';

@Injectable()
export class TokenService {
  constructor() {}

  getPopularTokens(network: Networks): Record<string, Token[]> {
    if (network !== Networks.ALL) {
      return { [network]: supportedTokens[network.toString()] };
    } else return supportedTokens;
  }

  async getRecentTokens(): Promise<string[]> {
    return ['token1', 'token2', 'token3'];
  }

  // TODO: get tokens from user wallet
  getUserTokens(network: Networks): Array<Record<string, Token[]>> {
    const searchNetworks = [];
    if (network !== Networks.ALL) {
      searchNetworks.push(
        Object.values(network)
          .map((network) => network.toString())
          .filter((network) => network !== 'all'),
      );
    } else searchNetworks.push(network.toString());
    return searchNetworks;
  }
}
