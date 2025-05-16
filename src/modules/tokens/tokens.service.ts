import { Inject } from '@nestjs/common';
import { AlchemyFactory } from 'src/core/alchemy.factory';
import { tokenList } from 'src/core/token-list';

import { TokenDTO } from 'src/core/dtos/token.dto';
import { Networks, NetworksUtils } from 'src/core/enums/networks';

export class TokensService {
  constructor(
    @Inject('AlchemyFactory') private readonly alchemyFactory: AlchemyFactory,
  ) {}

  getPopularTokens(network?: Networks): TokenDTO[] {
    if (network === undefined) return tokenList;

    return tokenList.filter((token) => {
      const tokenAddress = token.addresses[network];
      return tokenAddress !== undefined && tokenAddress !== null;
    });
  }

  searchTokensByNameOrSymbol(query: string, network?: Networks): TokenDTO[] {
    const _tokenList =
      network === undefined
        ? tokenList
        : tokenList.filter((token) => token.addresses[network] !== null);

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
    const alchemy = this.alchemyFactory(
      NetworksUtils.getAlchemyNetwork(network),
    );

    const alchemyTokenMetadata = await alchemy.core.getTokenMetadata(address);

    const internalTokenMetadata = tokenList.find((token) => {
      return token.addresses[network]?.toLowerCase() === address.toLowerCase();
    });

    return {
      addresses: {
        [network]: address,
      } as Record<Networks, string>,
      name: alchemyTokenMetadata.name ?? '',
      symbol: alchemyTokenMetadata.symbol ?? '',
      decimals: alchemyTokenMetadata.decimals ?? 0,
      logoUrl:
        internalTokenMetadata?.logoUrl ?? alchemyTokenMetadata.logo ?? '',
    };
  }
}
