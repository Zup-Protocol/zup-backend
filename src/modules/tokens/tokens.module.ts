import { Module } from '@nestjs/common';
import { alchemyFactory } from 'src/core/alchemy.factory';
import { GraphQLService } from 'src/core/graphql-service';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';

@Module({
  controllers: [TokensController],
  exports: [TokensService],
  providers: [
    TokensService,
    {
      provide: 'AlchemyFactory',
      useFactory: alchemyFactory,
    },
    {
      provide: 'GraphqlClients',
      useValue: GraphQLService.shared.zupSubgraphClients,
    },
  ],
})
export class TokensModule {}
