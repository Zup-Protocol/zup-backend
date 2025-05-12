import {
  BadRequestException,
  Controller,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TokenDTO } from 'src/core/dtos/token.dto';
import { Networks, NetworksUtils } from 'src/core/enums/networks';
import { isEthereumAddress } from 'src/core/utils/string-utils';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get('/popular')
  getPopularTokens(@Query('chainId') chainId?: Networks): TokenDTO[] {
    return this.tokensService.getPopularTokens(chainId);
  }

  @Get('/search')
  async searchTokens(
    @Query('query') query: string,
    @Query(
      'chainId',
      new ParseIntPipe({
        optional: true,
      }),
    )
    network?: number,
  ): Promise<TokenDTO[]> {
    const isSearchByAddress = isEthereumAddress(query);

    if (network !== undefined && !NetworksUtils.isValidChainId(network)) {
      throw new BadRequestException(
        `The provided chain id (${network}) is not supported. Please provide a valid chain id`,
      );
    }

    if (!query) {
      throw new BadRequestException(
        'A query string should be provided in order to perform a search',
      );
    }

    if (!network && isSearchByAddress) {
      throw new BadRequestException(
        'A chain id should be provided to get a token by address',
      );
    }

    return !isSearchByAddress
      ? this.tokensService.searchTokensByNameOrSymbol(query, network)
      : [await this.tokensService.getTokenByAddress(network!, query)];
  }
}
