import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';

@Injectable()
export class GraphQLService {
  private readonly client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(
      'https://api.studio.thegraph.com/query/98435/zup-dexs-sepolia/version/latest',
    );
  }

  async query<T>(query: string, variables?: Record<string, any>): Promise<T> {
    return this.client.request<T>(query, variables);
  }
}
