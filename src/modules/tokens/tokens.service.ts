import { Inject } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { AlchemyFactory } from 'src/core/alchemy.factory';
import { TokenPriceDTO } from 'src/core/dtos/token-price-dto';
import { TokenDTO } from 'src/core/dtos/token.dto';
import { Networks, NetworksUtils } from 'src/core/enums/networks';
import { tokenList } from 'src/core/token-list';
import {
  GetTokenDocument,
  GetTokenQuery,
  GetTokenQueryVariables,
} from 'src/gen/graphql.gen';

export class TokensService {
  constructor(
    @Inject('AlchemyFactory') private readonly alchemyFactory: AlchemyFactory,
    @Inject('GraphqlClients')
    private readonly graphqlClients: Record<Networks, GraphQLClient>,
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

  async getTokenPrice(
    tokenAddress: string,
    network: Networks,
  ): Promise<TokenPriceDTO> {
    const request = await this.graphqlClients[network].request<
      GetTokenQuery,
      GetTokenQueryVariables
    >(GetTokenDocument, {
      tokenId: tokenAddress,
    });

    return {
      address: tokenAddress,
      usdPrice: Number.parseFloat(request.token?.usdPrice ?? '0'),
    };
  }
}
