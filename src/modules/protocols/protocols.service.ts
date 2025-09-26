import { Inject } from '@nestjs/common';

import { GraphQLClient } from 'graphql-request';
import { ProtocolDTO } from 'src/core/dtos/protocol.dto';
import { GetProtocolsDocument, GetProtocolsQuery, GetProtocolsQueryVariables } from 'src/gen/graphql.gen';

export class ProtocolsService {
  constructor(
    @Inject('GraphqlClient')
    private readonly graphqlClient: GraphQLClient,
  ) {}
  async getAllSupportedProtocols(): Promise<ProtocolDTO[]> {
    const response = await this.graphqlClient.request<GetProtocolsQuery, GetProtocolsQueryVariables>(
      GetProtocolsDocument,
    );

    // TODO: REMOVE HOTFIX FOR Base when the issue is resolved
    const baseResponse = await new GraphQLClient('https://indexer.dedicated.hyperindex.xyz/0454ac3/v1/graphql').request<
      GetProtocolsQuery,
      GetProtocolsQueryVariables
    >(GetProtocolsDocument);

    // TODO: REMOVE HOTFIX FOR Ethereum when the issue is resolved
    const ethereumResponse = await new GraphQLClient(
      'https://indexer.dedicated.hyperindex.xyz/aefe5f4/v1/graphql',
    ).request<GetProtocolsQuery, GetProtocolsQueryVariables>(GetProtocolsDocument);

    // TODO: REMOVE HOTFIX FOR Ethereum and Base when the issue is resolved
    const allProtocols = [...response.Protocol, ...baseResponse.Protocol, ...ethereumResponse.Protocol];
    const uniqueProtocols = Array.from(new Map(allProtocols.map((p) => [p.id, p])).values());

    return uniqueProtocols;
  }
}
