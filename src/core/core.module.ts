import { Global, Module } from '@nestjs/common';
import { GraphQLService } from './services/graphql.service';

@Global()
@Module({
  providers: [GraphQLService],
  exports: [GraphQLService],
})
export class CoreModule {}
