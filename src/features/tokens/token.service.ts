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

  async getTokenMetadataByName(
    tokenName: string,
    network: Networks,
  ): Promise<Array<TokenMetadata> | null> {
    console.log(`Getting token metadata for name: ${tokenName}`);

    const tokensInSupportedTokens = supportedTokens[network.toString()].filter(
      (token) => token.name.toLowerCase().includes(tokenName.toLowerCase()),
    );

    return tokensInSupportedTokens;
  }

  async getTokenMetadataBySymbol(
    tokenSymbol: string,
    network: Networks,
  ): Promise<Array<TokenMetadata> | null> {
    console.log(`Getting token metadata for symbol: ${tokenSymbol}`);

    const tokensInSupportedTokens = supportedTokens[network.toString()].filter(
      (token) => token.symbol.toLowerCase().includes(tokenSymbol.toLowerCase()),
    );

    console.log(tokensInSupportedTokens);

    return tokensInSupportedTokens;
  }

  async getTokenMetadataBySymbolOrName(
    tokenSymbolOrName: string,
    network: Networks,
  ): Promise<Array<TokenMetadata> | null> {
    console.log(
      `Getting token metadata for symbol or name: ${tokenSymbolOrName}`,
    );

    const tokensInSupportedTokens = supportedTokens[network.toString()].filter(
      (token) =>
        token.symbol.toLowerCase().includes(tokenSymbolOrName.toLowerCase()) ||
        token.name.toLowerCase().includes(tokenSymbolOrName.toLowerCase()),
    );

    console.log(tokensInSupportedTokens);

    return tokensInSupportedTokens;
  }

  getPopularTokens(network: Networks): TokenMetadata[] {
    return supportedTokens[network.toString()];
  }

  async getUserTokens(
    network: Networks,
    userAddress: string,
  ): Promise<TokenMetadata[]> {
    console.log(`Getting user tokens for address: ${userAddress}`);

    const alchemy = new Alchemy({
      apiKey: process.env.ALCHEMY_API_KEY,
      network: Networks.getAlchemyNetwork(network),
    });

    const alchemyTokens = await alchemy.core.getTokensForOwner(userAddress);

    console.log(alchemyTokens);

    return alchemyTokens.tokens.map((token) => ({
      name: token.name,
      symbol: token.symbol,
      address: token.contractAddress,
      decimals: token.decimals,
      logoUrl: token.logo,
    }));
  }
}
