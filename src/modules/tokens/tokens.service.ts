import { Inject } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { zeroEthereumAddress } from 'src/core/constants';
import { TokenGroupDTO } from 'src/core/dtos/token-group.dto';
import { TokenPriceDTO } from 'src/core/dtos/token-price-dto';
import { TokenDTO } from 'src/core/dtos/token.dto';
import { Networks } from 'src/core/enums/networks';
import { tokenGroupList } from 'src/core/token-group-list';
import { tokenList } from 'src/core/token-list';
import { GetTokenDocument, GetTokenQuery, GetTokenQueryVariables } from 'src/gen/graphql.gen';
import '../../core/extensions/string.extension';

export class TokensService {
  constructor(
    @Inject('GraphqlClient')
    private readonly graphqlClient: GraphQLClient,
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

  getTokenGroups(network?: Networks): TokenGroupDTO[] {
    let rawGroups = structuredClone(tokenGroupList);

    if (network === undefined) return rawGroups;

    rawGroups = rawGroups.map((group) => {
      group.tokens = group.tokens.filter((groupToken) => {
        const tokenAddress = groupToken?.addresses[network];
        return tokenAddress !== undefined && tokenAddress !== null;
      });

      return group;
    });

    return rawGroups.filter((group) => group.tokens.length > 0);
  }

  searchTokensByNameOrSymbol(query: string, network?: Networks): TokenDTO[] {
    const _tokenList =
      network === undefined ? tokenList : tokenList.filter((token) => token.addresses[network] !== null);

    return _tokenList.filter((token) => {
      return (
        token.name.toLowerCase().includes(query.toLowerCase()) ||
        token.symbol.toLowerCase().includes(query.toLowerCase())
      );
    });
  }

  async getTokenByAddress(network: Networks, address: string): Promise<TokenDTO> {
    if (address === zeroEthereumAddress) {
      return this._getNativeTokenData(network);
    }

    const internalTokenMetadata = tokenList.find((token) => {
      return token.addresses[network]?.lowercasedEquals(address);
    });

    if (internalTokenMetadata) return internalTokenMetadata;

    const indexerToken: () => Promise<GetTokenQuery> = async () => {
      // TODO: REMOVE HOTFIX FOR ETHEREUM ONCE ISSUE IS FIXED
      if (network === Networks.ETHEREUM) {
        return await new GraphQLClient('https://indexer.dedicated.hyperindex.xyz/aefe5f4/v1/graphql').request<
          GetTokenQuery,
          GetTokenQueryVariables
        >(GetTokenDocument, {
          tokenFilter: {
            id: {
              _eq: `${network}-${address}`.toLowerCase(),
            },
          },
        });
      }

      // TODO: REMOVE HOTFIX FOR BASE ONCE ISSUE IS FIXED
      if (network === Networks.BASE) {
        return await new GraphQLClient('https://indexer.dedicated.hyperindex.xyz/0454ac3/v1/graphql').request<
          GetTokenQuery,
          GetTokenQueryVariables
        >(GetTokenDocument, {
          tokenFilter: {
            id: {
              _eq: `${network}-${address}`.toLowerCase(),
            },
          },
        });
      }

      return await this.graphqlClient.request<GetTokenQuery, GetTokenQueryVariables>(GetTokenDocument, {
        tokenFilter: {
          id: {
            _eq: `${network}-${address}`.toLowerCase(),
          },
        },
      });
    };

    const token = (await indexerToken()).Token[0];

    return {
      addresses: {
        [network]: address,
      } as Record<Networks, string>,
      decimals: { [network]: token.decimals } as Record<Networks, number>,
      name: token.name,
      symbol: token.symbol,
      logoUrl: '',
    };
  }

  async getTokenPrice(tokenAddress: string, network: Networks): Promise<TokenPriceDTO> {
    // TODO: REMOVE HOTFIX FOR ETHEREUM ONCE ISSUE IS FIXED
    if (network == Networks.ETHEREUM) {
      const tokenPrice = await new GraphQLClient('https://indexer.dedicated.hyperindex.xyz/aefe5f4/v1/graphql')
        .request<GetTokenQuery, GetTokenQueryVariables>(GetTokenDocument, {
          tokenFilter: {
            id: {
              _eq: `${network}-${tokenAddress}`.toLowerCase(),
            },
          },
        })
        .then((response) => response.Token[0].usdPrice)
        .catch(() => 0);

      return {
        address: tokenAddress,
        usdPrice: Number.parseFloat(String(tokenPrice ?? 0)),
      };
    }

    // TODO: REMOVE HOTFIX FOR BASE ONCE ISSUE IS FIXED
    if (network == Networks.BASE) {
      const tokenPrice = await new GraphQLClient('https://indexer.dedicated.hyperindex.xyz/0454ac3/v1/graphql')
        .request<GetTokenQuery, GetTokenQueryVariables>(GetTokenDocument, {
          tokenFilter: {
            id: {
              _eq: `${network}-${tokenAddress}`.toLowerCase(),
            },
          },
        })
        .then((response) => response.Token[0].usdPrice)
        .catch(() => 0);

      return {
        address: tokenAddress,
        usdPrice: Number.parseFloat(String(tokenPrice ?? 0)),
      };
    }

    const tokenPrice = await this.graphqlClient
      .request<GetTokenQuery, GetTokenQueryVariables>(GetTokenDocument, {
        tokenFilter: {
          id: {
            _eq: `${network}-${tokenAddress}`.toLowerCase(),
          },
        },
      })
      .then((response) => response.Token[0].usdPrice)
      .catch(() => 0);

    return {
      address: tokenAddress,
      usdPrice: Number.parseFloat(String(tokenPrice ?? 0)),
    };
  }

  _getNativeTokenData(network: Networks): TokenDTO {
    const internalTokenMetadata = tokenList.find((token) => {
      return token.addresses[network]?.lowercasedEquals(zeroEthereumAddress);
    });

    return internalTokenMetadata!; // Assuming the native token is always present in the tokenList (Should be!)
  }
}
