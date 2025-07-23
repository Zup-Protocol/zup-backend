import { GraphQLClient } from 'graphql-request';
import { mock } from 'jest-mock-extended';
import { _MockProxy } from 'jest-mock-extended/lib/Mock';
import { Networks, NetworksUtils } from 'src/core/enums/networks';
import { ProtocolsService } from './protocols.service';

describe('ProtocolsService', () => {
  let graphqlClients: Record<Networks, GraphQLClient>;
  let sut: ProtocolsService;

  beforeEach(() => {
    graphqlClients = NetworksUtils.values().reduce(
      (acc, network) => {
        (acc[network] = mock<GraphQLClient>()).request.mockResolvedValue({
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

        return acc;
      },
      {} as Record<Networks, GraphQLClient>,
    );

    sut = new ProtocolsService(graphqlClients);
  });

  it('Should get the list of protocols for all supported networks and return it. (excluding duplicates)', async () => {
    const sepoliaProtocols = [
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

    const ethereumProtocols = [
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
    ];

    (
      graphqlClients[Networks.SEPOLIA] as _MockProxy<GraphQLClient> &
        GraphQLClient
    ).request.mockResolvedValue({
      protocols: sepoliaProtocols,
    });

    (
      graphqlClients[Networks.ETHEREUM] as _MockProxy<GraphQLClient> &
        GraphQLClient
    ).request.mockResolvedValue({
      protocols: ethereumProtocols,
    });

    const result = await sut.getAllSupportedProtocols();

    NetworksUtils.values().forEach((network) => {
      expect(graphqlClients[network].request).toHaveBeenCalledTimes(1);
    });

    expect(result).toEqual([
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
    ]);
  });
});
