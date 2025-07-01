import { Module } from '@nestjs/common';
import { ThirdwebModule } from 'src/thirdweb/thirdweb.module';
import { TokensController } from './tokens.controller';
import { TokensMapper } from './tokens.mapper';
import { TokensService } from './tokens.service';

@Module({
  imports: [ThirdwebModule],
  controllers: [TokensController],
  providers: [TokensService, TokensMapper],
  exports: [TokensService, TokensMapper],
})
export class TokensModule {}

/*
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  THIRDWEB_ADMIN_ACCOUNT_TOKEN,
  THIRDWEB_CLIENT_TOKEN,
  THIRDWEB_CONTRACTS_TOKEN,
} from 'src/_utils/constants';
import { TOKENS } from 'src/thirdweb/_utils/enums';
import { TokenFilters } from 'src/tokens/_utils/dto/request/token-filters';
import { UserDocument } from 'src/users/users.schema';
import {
  prepareContractCall,
  sendTransaction,
  ThirdwebClient,
  ThirdwebContract,
  toWei,
} from 'thirdweb';
import { monadTestnet } from 'thirdweb/chains';
import { getBalance, GetBalanceResult } from 'thirdweb/extensions/erc20';
import { Account, getWalletBalance } from 'thirdweb/wallets';
import { PaginatedTransactionsQueryDto } from './_utils/dto/request/paginated-transactions-query.dto';
import { TokensMapper } from './tokens.mapper';

@Injectable()
export class TokensService {
  constructor(
    @Inject(THIRDWEB_CONTRACTS_TOKEN)
    private readonly thirdwebContracts: Map<TOKENS, ThirdwebContract>,
    private readonly tokensMapper: TokensMapper,
    @Inject(THIRDWEB_CLIENT_TOKEN)
    private readonly thirdwebClient: ThirdwebClient,
    @Inject(THIRDWEB_ADMIN_ACCOUNT_TOKEN)
    private readonly thirdwebAdminAccount: Account,
  ) {}

  private readonly TEST_ACCOUNT_A_ADDRESS =
    '0xe840D217aF07e483Cc954aFf6B98fDD02dA0961f';
  private readonly TEST_ACCOUNT_B_ADDRESS =
    '0xbeE8E724217A8eE04a5b5fb3366f817e1dD18Cdf';

  async getTransactionsPaginated(
    user: UserDocument,
    paginatedRequestDto: PaginatedTransactionsQueryDto,
  ): Promise<any> {
    /* const walletId = user.walletId;
    if (!walletId)
      throw new BadRequestException('User needs a wallet to see transactions');
    const params: PaginatedAccountTransactionsParams = {
      address: walletId,
      ...(paginatedRequestDto.pageCursor && {
        cursor: paginatedRequestDto.pageCursor.toString(),
      }),
      limit:
        paginatedRequestDto.pageSize > 50 ? 50 : paginatedRequestDto.pageSize,
      ascendingOrder: paginatedRequestDto.sortBy == SortDirection.ASC,
    };

    return this.monadExplorerRequest.requestTransactions(params);
  }

  async getUserTokens(user: UserDocument, filters?: TokenFilters) {
    if (!user.walletId) throw new BadRequestException('User wallet not found');
    const tokensBalance: GetBalanceResult[] = [];
    for (const [key, value] of this.thirdwebContracts) {
      if (filters?.tokens && !filters.tokens.includes(key)) {
        continue;
      }

      const result = await getBalance({
        address: user.walletId,
        contract: value,
      });
      tokensBalance.push(result);
    }
    return this.tokensMapper.toGetUserTokensDto(user, tokensBalance);
  }

  async getUserOreBalance(user: UserDocument): Promise<GetBalanceResult> {
    if (!user.walletId) throw new BadRequestException('User wallet not found');
    const oreContract = this.thirdwebContracts.get(TOKENS.OR);
    if (!oreContract) throw new BadRequestException('ORE contract not found');
    return getBalance({
      address: user.walletId,
      contract: oreContract,
    });
  }

  async createTransaction(user: UserDocument) {
    const address = user.walletId;
    if (!address) throw new BadRequestException('User wallet not found');
    const oreContract = this.thirdwebContracts.get(TOKENS.OR);
    if (!oreContract) throw new BadRequestException('ORE contract not found');

    console.log('Addresse user : ', user.walletId);
    const tx = prepareContractCall({
      contract: oreContract,
      method: 'function transferFrom(address from, address to, uint256 amount)',
      params: [
        this.TEST_ACCOUNT_B_ADDRESS,
        this.TEST_ACCOUNT_A_ADDRESS,
        toWei('1'),
      ],
    });

    const result = await sendTransaction({
      transaction: tx,
      account: this.thirdwebAdminAccount,
    });
    console.log('Result:', result);

    const balance1 = await getWalletBalance({
      client: this.thirdwebClient,
      chain: monadTestnet,
      address: this.TEST_ACCOUNT_A_ADDRESS,
      tokenAddress: oreContract.address,
    });
    console.log('Smart account balance:', balance1.displayValue);

    const balance2 = await getWalletBalance({
      client: this.thirdwebClient,
      chain: monadTestnet,
      address: this.TEST_ACCOUNT_B_ADDRESS,
      tokenAddress: oreContract.address,
    });
    console.log('Smart account balance:', balance2.displayValue);
  }
}
*/
