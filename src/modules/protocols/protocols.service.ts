import { Inject } from '@nestjs/common';

import { GraphQLClient } from 'graphql-request';
import { ProtocolDTO } from 'src/core/dtos/protocol.dto';
import {
  GetProtocolsDocument,
  GetProtocolsQuery,
  GetProtocolsQueryVariables,
} from 'src/gen/graphql.gen';

export class ProtocolsService {
  constructor(
    @Inject('GraphqlClient')
    private readonly graphqlClient: GraphQLClient,
  ) {}
  async getAllSupportedProtocols(): Promise<ProtocolDTO[]> {
    const response = await this.graphqlClient.request<
      GetProtocolsQuery,
      GetProtocolsQueryVariables
    >(GetProtocolsDocument);

    return response.Protocol;
  }
}
