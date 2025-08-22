import { GraphQLClient } from 'graphql-request';
import { NetworksUtils } from 'src/core/enums/networks';

export class GraphQLService {
  constructor() {
    this.client = new GraphQLClient(NetworksUtils.getIndexerUrl());
  }

  private static instance: GraphQLService;

  static get shared(): GraphQLService {
    if (!GraphQLService.instance) {
      GraphQLService.instance = new GraphQLService();
    }

    return GraphQLService.instance;
  }

  client: GraphQLClient;
}
