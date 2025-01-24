import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';

@Injectable()
export class GraphQLService {
  private readonly clients: Map<string, GraphQLClient> = new Map();

  constructor(endpoints: Record<string, string>) {
    // Initialize a client for each endpoint
    Object.entries(endpoints).forEach(([name, url]) => {
      this.clients.set(name, new GraphQLClient(url));
    });
  }

  async query<T>(
    clientName: string,
    query: string,
    variables?: Record<string, any>,
  ): Promise<T> {
    const client = this.clients.get(clientName);
    if (!client) {
      throw new Error(`GraphQL client "${clientName}" not found`);
    }
    return client.request<T>(query, variables);
  }
}
