import { Injectable } from '@nestjs/common';
import { GetBalanceResult } from 'thirdweb/extensions/erc20';
import {
  GetTokenDto,
  GetUserTokensDto,
} from '../tokens/_utils/dto/response/get-tokens.dto';
import { GetUserDto } from './_utils/dto/response/get-user.dto';
import { UserDocument } from './users.schema';

@Injectable()
export class UsersMapper {
  toGetUserDto = (
    user: UserDocument,
    oreBalance: GetBalanceResult,
  ): GetUserDto => ({
    id: user._id.toString(),
    role: user.role,
    walletId: user.walletId?.toString() ?? null,
    oreBalance: oreBalance.displayValue,
  });

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
