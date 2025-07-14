import { GraphQLClient } from 'graphql-request';
import { Networks, NetworksUtils } from 'src/core/enums/networks';

export class GraphQLService {
  constructor() {
    this.zupSubgraphClients = NetworksUtils.values().reduce(
      (acc, network) => {
        const graphqlClientUrl = NetworksUtils.getSubgraphUrl(network);

        acc[network] = new GraphQLClient(graphqlClientUrl, {
          headers: {
            authorization: `Bearer ${process.env.GRAPHQL_API_KEY}`,
          },
        });

        return acc;
      },
      {} as Record<Networks, GraphQLClient>,
    );
  }

  private static instance: GraphQLService;

  static get shared(): GraphQLService {
    if (!GraphQLService.instance) {
      GraphQLService.instance = new GraphQLService();
    }

    return GraphQLService.instance;
  }

  zupSubgraphClients: Record<Networks, GraphQLClient>;
}
