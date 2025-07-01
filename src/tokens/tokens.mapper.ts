import { Injectable } from '@nestjs/common';
import {
  GetTokenDto,
  GetUserTokensDto,
} from 'src/tokens/_utils/dto/response/get-tokens.dto';
import { UserDocument } from 'src/users/users.schema';
import { GetBalanceResult } from 'thirdweb/extensions/erc20';

@Injectable()
export class TokensMapper {
  toGetUserTokensDto = (
    user: UserDocument,
    tokens: GetBalanceResult[],
  ): GetUserTokensDto => ({
    id: user._id.toString(),
    walletId: user.walletId?.toString() ?? null,
    tokens: tokens.map(token => this.toGetTokenDto(token)),
  });

  toGetTokenDto = (token: GetBalanceResult): GetTokenDto => ({
    chainId: token.chainId,
    displayValue: token.displayValue,
    name: token.name,
    symbol: token.symbol,
    tokenAddress: token.tokenAddress,
  });
}
