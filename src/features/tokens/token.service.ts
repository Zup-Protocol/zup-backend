import { Injectable } from '@nestjs/common';
import { Networks } from './network.enum';
import { supportedTokens } from './supported-tokens';
import { TokenMetadata } from './dto/token.dto';

@Injectable()
export class TokenService {
  constructor() {}

  // TODO: Get with Alchemy
  async getTokenMetadataBySymbol(tokenSymbol: string): Promise<TokenMetadata> {
    console.log(`Getting token metadata for symbol: ${tokenSymbol}`);
    return {
      name: 'TEST',
      symbol: 'TST',
      address: '0xabc',
      decimals: 18,
      logoUrl: 'www.xxx.xyz',
    };
  }

  getPopularTokens(network: Networks): Record<string, TokenMetadata[]> {
    if (network !== Networks.ALL) {
      return { [network]: supportedTokens[network.toString()] };
    } else return supportedTokens;
  }

  async getRecentTokens(): Promise<string[]> {
    return ['token1', 'token2', 'token3'];
  }

  // TODO: get tokens from user wallet
  getUserTokens(network: Networks): Array<Record<string, TokenMetadata[]>> {
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
