import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { Networks } from './network.enum';
import { TokenService } from './token.service';

@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

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
