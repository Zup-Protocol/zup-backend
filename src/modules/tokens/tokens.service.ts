import { Inject } from '@nestjs/common';
import { AlchemyFactory } from 'src/core/alchemy.factory';
import { tokenList } from 'src/core/token-list';

import { TokenDTO } from 'src/core/dtos/token.dto';
import { Networks } from 'src/core/networks';

export class TokensService {
  constructor(
    @Inject('AlchemyFactory') private readonly alchemyFactory: AlchemyFactory,
  ) {}

  getPopularTokens(network?: Networks): TokenDTO[] {
    if (network === undefined) return tokenList;

    return tokenList.filter((token) => {
      const tokenAddress = token.address[network];
      return tokenAddress !== undefined && tokenAddress !== null;
    });
  }

  searchTokensByNameOrSymbol(query: string, network?: Networks): TokenDTO[] {
    const _tokenList =
      network === undefined
        ? tokenList
        : tokenList.filter((token) => token.address[network] !== null);

    return _tokenList.filter((token) => {
      return (
        token.name.toLowerCase().includes(query.toLowerCase()) ||
        token.symbol.toLowerCase().includes(query.toLowerCase())
      );
    });
  }

  async getTokenByAddress(
    network: Networks,
    address: string,
  ): Promise<TokenDTO> {
    const alchemy = this.alchemyFactory(Networks.getAlchemyNetwork(network));
    const tokenMetadata = await alchemy.core.getTokenMetadata(address);

    return {
      address: address,
      name: tokenMetadata.name ?? '',
      symbol: tokenMetadata.symbol ?? '',
      decimals: tokenMetadata.decimals ?? 0,
      ...(tokenMetadata.logo && { logoUrl: tokenMetadata.logo }),
    };
  }
}
