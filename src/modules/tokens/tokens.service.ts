import { Inject } from '@nestjs/common';
import { TokenMetadataResponse } from 'alchemy-sdk';
import { GraphQLClient } from 'graphql-request';
import { AlchemyFactory } from 'src/core/alchemy.factory';
import { zeroEthereumAddress } from 'src/core/constants';
import { TokenPriceDTO } from 'src/core/dtos/token-price-dto';
import { TokenDTO } from 'src/core/dtos/token.dto';
import { Networks, NetworksUtils } from 'src/core/enums/networks';
import { tokenList } from 'src/core/token-list';
import {
  GetTokenDocument,
  GetTokenQuery,
  GetTokenQueryVariables,
} from 'src/gen/graphql.gen';
import '../../core/extensions/string.extension';

export class TokensService {
  constructor(
    @Inject('AlchemyFactory') private readonly alchemyFactory: AlchemyFactory,
    @Inject('GraphqlClients')
    private readonly graphqlClients: Record<Networks, GraphQLClient>,
  ) {}

  getPopularTokens(network?: Networks): TokenDTO[] {
    if (network === undefined) return tokenList;

    return tokenList
      .filter((token) => {
        const tokenAddress = token.addresses[network];
        return tokenAddress !== undefined && tokenAddress !== null;
      })
      .sort((a, b) => {
        const aIsZero = a.addresses[network] === zeroEthereumAddress;
        const bIsZero = b.addresses[network] === zeroEthereumAddress;

        if (aIsZero && !bIsZero) return -1;
        if (!aIsZero && bIsZero) return 1;
        return 0;
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
    if (address === zeroEthereumAddress) {
      return this._getNativeTokenData(network);
    }

    const alchemy = this.alchemyFactory(
      NetworksUtils.getAlchemyNetwork(network),
    );
    let alchemyTokenMetadata: TokenMetadataResponse | undefined;

    try {
      alchemyTokenMetadata = await alchemy.core.getTokenMetadata(address);
    } catch {
      // ignore
    }
    const internalTokenMetadata = tokenList.find((token) => {
      return token.addresses[network]?.lowercasedEquals(address);
    });

    return {
      addresses: {
        [network]: address,
      } as Record<Networks, string>,
      name: alchemyTokenMetadata?.name ?? internalTokenMetadata?.name ?? '',
      symbol:
        alchemyTokenMetadata?.symbol ?? internalTokenMetadata?.symbol ?? '',
      decimals:
        alchemyTokenMetadata?.decimals ?? internalTokenMetadata?.decimals ?? 18,
      logoUrl:
        internalTokenMetadata?.logoUrl ?? alchemyTokenMetadata!.logo ?? '', // using internal token logo if available to match the token list
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

  _getNativeTokenData(network: Networks): TokenDTO {
    const internalTokenMetadata = tokenList.find((token) => {
      return token.addresses[network]?.lowercasedEquals(zeroEthereumAddress);
    });

    return internalTokenMetadata!; // Assuming the native token is always present in the tokenList (Should be!)
  }
}
