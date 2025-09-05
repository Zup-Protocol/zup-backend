import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GraphQLService } from 'src/core/graphql-service';
import { TokensService } from '../tokens/tokens.service';
import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [PoolsController],
  providers: [
    TokensService,
    PoolsService,
    {
      provide: 'GraphqlClient',
      useValue: GraphQLService.shared.client,
    },
  ],
  exports: [PoolsService],
})
export class PoolsModule {}
