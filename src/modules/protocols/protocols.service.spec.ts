import { GraphQLClient } from 'graphql-request';
import { mock } from 'jest-mock-extended';
import { _MockProxy } from 'jest-mock-extended/lib/Mock';
import { ProtocolsService } from './protocols.service';

describe('ProtocolsService', () => {
  let graphqlClient: _MockProxy<GraphQLClient> & GraphQLClient;
  let sut: ProtocolsService;

  beforeEach(() => {
    graphqlClient = mock<GraphQLClient>();
    graphqlClient.request.mockResolvedValue({
      protocols: [
        {
          id: 'protocol-1',
          name: 'name-1',
          url: 'url-1',
          logo: 'logo-1',
        },
        {
          id: 'protocol-2',
          name: 'name-2',
          url: 'url-2',
          logo: 'logo-2',
        },
      ],
    });

    sut = new ProtocolsService(graphqlClient);
  });

  it('Should get the list of protocols for all supported networks and return it', async () => {
    const protocols = [
      {
        id: 'protocol-1',
        name: 'name-1',
        url: 'url-1',
        logo: 'logo-1',
      },
      {
        id: 'protocol-2',
        name: 'name-2',
        url: 'url-2',
        logo: 'logo-2',
      },
      {
        id: 'protocol-3',
        name: 'name-3',
        url: 'url-3',
        logo: 'logo-3',
      },
    ];

    graphqlClient.request.mockResolvedValue({
      Protocol: protocols,
    });

    const result = await sut.getAllSupportedProtocols();

    expect(graphqlClient.request).toHaveBeenCalledTimes(1);
    expect(result).toEqual(protocols);
  });
});
