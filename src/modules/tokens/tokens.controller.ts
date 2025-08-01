import {
  BadRequestException,
  Controller,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { zeroEthereumAddress } from 'src/core/constants';
import { TokenGroupDTO } from 'src/core/dtos/token-group.dto';
import { TokenListDTO } from 'src/core/dtos/token-list.dto';
import { TokenPriceDTO } from 'src/core/dtos/token-price-dto';
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

  @Get('/groups')
  getTokenGroups(@Query('chainId') chainId?: Networks): TokenGroupDTO[] {
    return this.tokensService.getTokenGroups(chainId);
  }

  @Get('/list')
  getTokenList(@Query('chainId') chainId?: Networks): TokenListDTO {
    const tokens = this.tokensService.getPopularTokens(chainId);
    const groups = this.tokensService.getTokenGroups(chainId);

    return {
      popularTokens: tokens,
      tokenGroups: groups,
    };
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

  @Get('/price')
  async getTokenPrice(
    @Query('address') address: string,
    @Query('chainId', ParseIntPipe) chainId: number,
  ): Promise<TokenPriceDTO> {
    if (!isEthereumAddress(address)) {
      throw new BadRequestException('A valid address should be provided');
    }

    if (!NetworksUtils.isValidChainId(chainId)) {
      throw new BadRequestException(
        `The provided chain id (${chainId}) is not supported. Please provide a valid chain id`,
      );
    }

    const tokenPrice = await this.tokensService.getTokenPrice(address, chainId);

    if (
      tokenPrice.usdPrice === 0 &&
      address.lowercasedEquals(zeroEthereumAddress)
    ) {
      return await this.tokensService.getTokenPrice(
        NetworksUtils.wrappedNativeAddress(chainId),
        chainId,
      );
    }

    return tokenPrice;
  }
}
