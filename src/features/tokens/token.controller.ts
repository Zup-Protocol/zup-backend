import { Controller, Get, Query } from '@nestjs/common';
import { TokenMetadata } from './dto/token.dto';
import { Networks } from './network.enum';
import { TokenService } from './token.service';

@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('/popular')
  getPopularTokens(
    @Query('network') network: Networks,
  ): Record<string, TokenMetadata[]> {
    return this.tokenService.getPopularTokens(network);
  }

  // @Get('/search')
  // searchToken(
  //   @Query('name') name: string,
  //   @Query('symbol') symbol: string,
  //   @Query('address') address: string,
  //   @Query('network') network: Networks,
  // ) {
  //   return this.tokenService.getTokenMetadataByAddress(address, network);
  // }

  // @Get('/recent')
  // async getRecentTokens(): Promise<string[]> {
  //   return this.tokenService.getRecentTokens();
  // }

  @Get('/')
  getTokens(
    @Query('network') network: Networks,
  ): Array<Record<string, TokenMetadata[]>> {
    return this.tokenService.getUserTokens(network);
  }
}
