import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Protect } from 'src/auth/_utils/decorator/protect.decorator';
import { TokenFilters } from 'src/tokens/_utils/dto/request/token-filters';
import { ConnectedUser } from 'src/users/_utils/decorator/connecter-user.decorator';
import { UserDocument } from 'src/users/users.schema';
import { PaginatedTransactionsQueryDto } from './_utils/dto/request/paginated-transactions-query.dto';
import { TokensService } from './tokens.service';

@ApiTags('Tokens')
@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Protect()
  @Get()
  @ApiOperation({ summary: "Get the current user's tokens balance" })
  getUserTokens(
    @ConnectedUser() user: UserDocument,
    @Query() filters: TokenFilters,
  ) {
    return this.tokensService.getUserTokens(user, filters);
  }

  @Protect()
  @Get('transactions')
  @ApiOperation({ summary: "Get the current user's wallet transactions" })
  getTransactions(
    @ConnectedUser() user: UserDocument,
    @Query() paginatedQueryDto: PaginatedTransactionsQueryDto,
  ) {
    return this.tokensService.getTransactionsPaginated(user, paginatedQueryDto);
  }

  @Protect()
  @Post('transfer')
  @ApiOperation({ summary: 'Transfer tokens to another wallet' })
  async transferTokens(@ConnectedUser() user: UserDocument) {
    return this.tokensService.createTransaction(user);
  }
}
