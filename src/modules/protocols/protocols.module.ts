import { Module } from '@nestjs/common';
import { GraphQLService } from 'src/core/graphql-service';
import { ProtocolsController } from './protocols.controller';
import { ProtocolsService } from './protocols.service';

@Module({
  controllers: [ProtocolsController],
  providers: [
    ProtocolsService,
    {
      provide: 'GraphqlClient',
      useValue: GraphQLService.shared.client,
    },
  ],
  exports: [ProtocolsService],
})
export class ProtocolsModule {}
