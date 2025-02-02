import { Controller, Get, Query } from '@nestjs/common';
import { TokenService } from './token.service';
import { Networks } from './network.enum';
import { TokenMetadata } from './dto/token.dto';

@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('/tokens/popular')
  getPopularTokens(
    @Query('network') network: Networks,
  ): Record<string, TokenMetadata[]> {
    return this.tokenService.getPopularTokens(network);
  }

  @Get('/tokens/recent')
  async getRecentTokens(): Promise<string[]> {
    return this.tokenService.getRecentTokens();
  }

  @Get('/tokens')
  getTokens(
    @Query('network') network: Networks,
  ): Array<Record<string, TokenMetadata[]>> {
    return this.tokenService.getUserTokens(network);
  }
}
