import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLClient } from 'graphql-request';
import { alchemyFactory } from 'src/core/alchemy.factory';
import { Networks, NetworksUtils } from 'src/core/enums/networks';
import { TokensService } from '../tokens/tokens.service';
import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';

const graphqlClients = () =>
  NetworksUtils.values().reduce(
    (acc, network) => {
      const graphqlClientUrl = NetworksUtils.getSubgraphUrl(network);
      console.log('New graphQL client', graphqlClientUrl);

      acc[network] = new GraphQLClient(graphqlClientUrl, {
        headers: {
          authorization: `Bearer ${process.env.GRAPHQL_API_KEY}`,
        },
      });

      return acc;
    },
    {} as Record<Networks, GraphQLClient>,
  );

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [PoolsController],
  providers: [
    TokensService,
    PoolsService,
    {
      provide: 'AlchemyFactory',
      useFactory: alchemyFactory,
    },
    {
      provide: 'GraphqlClients',
      useFactory: graphqlClients,
    },
  ],
  exports: [PoolsService],
})
export class PoolsModule {}
