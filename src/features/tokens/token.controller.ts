import { isEthereumAddress } from '@/core/utils/string-utils';
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { TokenMetadata } from './dto/token.dto';
import { Networks } from './network.enum';
import { TokenService } from './token.service';

@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('/search')
  async searchTokens(
    @Query('network') network: Networks,
    @Query('query') query: string,
  ): Promise<Array<TokenMetadata>> {
    if (!network) {
      throw new BadRequestException(`No network specified, please provide one`);
    }

    if (isEthereumAddress(query)) {
      return [
        await this.tokenService.getTokenMetadataByAddress(query, network),
      ];
    }

    return this.tokenService.getTokenMetadataBySymbolOrName(query, network);
  }

  @Get('/')
  getTokens(@Query('network') network: Networks): any {
    if (!network) {
      throw new BadRequestException('No network specified');
    }

    return {
      popularTokens: this.tokenService.getPopularTokens(network),
    };
  }
}
