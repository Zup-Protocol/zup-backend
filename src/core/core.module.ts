import { Networks } from '@/features/tokens/network.enum';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLService } from './services/graphql.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: GraphQLService,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Define multiple endpoints
        const endpoints = {
          [Networks.SEPOLIA]: configService.get<string>('GRAPHQL_URL_SEPOLIA'),
          [Networks.MAINNET]: configService.get<string>('GRAPHQL_URL_MAINNET'),
          [Networks.SCROLL]: configService.get<string>('GRAPHQL_URL_SCROLL'),
        };
        return new GraphQLService(endpoints);
      },
    },
  ],
  exports: [GraphQLService],
})
export class CoreModule {}
