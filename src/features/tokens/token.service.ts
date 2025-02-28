import { Injectable } from '@nestjs/common';
import { Alchemy } from 'alchemy-sdk';
import { TokenMetadata } from './dto/token.dto';
import { Networks } from './network.enum';
import { supportedTokens } from './supported-tokens';

@Injectable()
export class TokenService {
  constructor() {}

  async getTokenMetadataByAddress(
    tokenAddress: string,
    network: Networks,
  ): Promise<TokenMetadata> {
    console.log(`Getting token metadata for address: ${tokenAddress}`);

    const tokenInSupportedTokens = supportedTokens[network.toString()].find(
      (token) => token.address.toLowerCase() === tokenAddress.toLowerCase(),
    );

    if (tokenInSupportedTokens !== undefined) {
      return tokenInSupportedTokens;
    }

    const alchemy = new Alchemy({
      apiKey: process.env.ALCHEMY_API_KEY,
      network: Networks.getAlchemyNetwork(network),
    });

    const alchemyTokenMetadata =
      await alchemy.core.getTokenMetadata(tokenAddress);

    return {
      name: alchemyTokenMetadata.name,
      symbol: alchemyTokenMetadata.symbol,
      address: tokenAddress,
      decimals: alchemyTokenMetadata.decimals,
      logoUrl: alchemyTokenMetadata.logo,
    };
  }

  getPopularTokens(network: Networks): TokenMetadata[] {
    return supportedTokens[network.toString()];
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
