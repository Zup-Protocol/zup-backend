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

  async getTokenMetadataBySymbolOrName(
    tokenSymbolOrName: string,
    network: Networks,
  ): Promise<Array<TokenMetadata> | null> {
    console.log(
      `Getting token metadata for symbol or name: ${tokenSymbolOrName}`,
    );

    const tokensMatchingInRemoteList = (
      await this.getRemoteTokenList(network)
    ).filter(
      (token) =>
        token.symbol.toLowerCase().includes(tokenSymbolOrName.toLowerCase()) ||
        token.name.toLowerCase().includes(tokenSymbolOrName.toLowerCase()),
    );

    if (tokensMatchingInRemoteList.length === 0) {
      return supportedTokens[network.toString()].filter(
        (token) =>
          token.symbol
            .toLowerCase()
            .includes(tokenSymbolOrName.toLowerCase()) ||
          token.name.toLowerCase().includes(tokenSymbolOrName.toLowerCase()),
      );
    }

    return tokensMatchingInRemoteList;
  }

  getPopularTokens(network: Networks): TokenMetadata[] {
    return supportedTokens[network.toString()];
  }

  async getRemoteTokenList(network: Networks): Promise<TokenMetadata[]> {
    const alchemy = new Alchemy({
      apiKey: process.env.ALCHEMY_API_KEY,
      network: Networks.getAlchemyNetwork(network),
    });

    const response = await fetch('https://ipfs.io/ipns/tokens.uniswap.org', {
      method: 'GET',
    }).then((response) => response.json());

    const tokensResponse = response.tokens as Array<any>;

    const promises = tokensResponse
      .filter((token) => token.chainId === Networks.getChainId(network))
      .map(async (token) => ({
        name: token.name,
        symbol: token.symbol,
        address: token.address,
        decimals: token.decimals,
        logoUrl: (await alchemy.core.getTokenMetadata(token.address)).logo,
      }));

    return await Promise.all(promises);
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

    const alchemyTokens = await alchemy.core.getTokensForOwner(userAddress, {
      contractAddresses: supportedTokens[network.toString()].map(
        (token) => token.address,
      ),
    });

    return alchemyTokens.tokens
      .filter((token) => token.rawBalance !== '0')
      .map((token) => ({
        name: token.name,
        symbol: token.symbol,
        address: token.contractAddress,
        decimals: token.decimals,
        logoUrl: token.logo,
      }));
  }
}
