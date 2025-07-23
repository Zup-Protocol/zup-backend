import { Inject } from '@nestjs/common';
import { Networks, NetworksUtils } from 'src/core/enums/networks';

import { GraphQLClient } from 'graphql-request';
import { ProtocolDTO } from 'src/core/dtos/protocol.dto';
import {
  GetProtocolsDocument,
  GetProtocolsQuery,
  GetProtocolsQueryVariables,
} from 'src/gen/graphql.gen';

export class ProtocolsService {
  constructor(
    @Inject('GraphqlClients')
    private readonly graphqlClients: Record<Networks, GraphQLClient>,
  ) {}
  async getAllSupportedProtocols(): Promise<ProtocolDTO[]> {
    const supportedNetworks = NetworksUtils.values();

    const responses = await Promise.all(
      supportedNetworks.map((network) => {
        return this.graphqlClients[network].request<
          GetProtocolsQuery,
          GetProtocolsQueryVariables
        >(GetProtocolsDocument);
      }),
    );

    const protocolList: ProtocolDTO[] = [];

    responses.forEach((response) => {
      protocolList.push(
        ...response.protocols
          .filter(
            (rawProtocol) =>
              !protocolList.some((protocol) => protocol.id === rawProtocol.id),
          )
          .map((rawProtocol) => {
            const protocol: ProtocolDTO = {
              id: rawProtocol.id,
              name: rawProtocol.name,
              url: rawProtocol.url,
              logo: rawProtocol.logo,
            };

            return protocol;
          }),
      );
    });

    return protocolList;
  }
}
