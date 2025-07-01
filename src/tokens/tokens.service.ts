import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  THIRDWEB_ADMIN_ACCOUNT_TOKEN,
  THIRDWEB_CLIENT_TOKEN,
  THIRDWEB_CONTRACTS_TOKEN,
} from 'src/_utils/constants';
import { TOKENS } from 'src/thirdweb/_utils/enums';
import { TokenFilters } from 'src/tokens/_utils/dto/request/token-filters';
import { UserDocument } from 'src/users/users.schema';
import { Engine, ThirdwebClient, ThirdwebContract } from 'thirdweb';
import { monadTestnet } from 'thirdweb/chains';
import {
  getBalance,
  GetBalanceResult,
  transfer,
} from 'thirdweb/extensions/erc20';
import { Account } from 'thirdweb/wallets';
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
  private readonly ST_WALLET = '0xe840D217aF07e483Cc954aFf6B98fDD02dA0961f';

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

    return this.monadExplorerRequest.requestTransactions(params);*/
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
    const serverWallet = Engine.serverWallet({
      client: this.thirdwebClient,
      address: '0x317b4b63E056162098458E418aaA80b323b5A6Fd',
      vaultAccessToken:
        'vt_act_EV6TAZJX3I5U6C45VQH5EMAGIYQYS2J4PW2XBNK5OPRA6BU5WVHCSWZHS6HUSS77SS556Q4NFMD6MAEAGHLW2JLKIVKIEL3UBJ56EJWT',
      chain: monadTestnet,
    });

    const oreContract = this.thirdwebContracts.get(TOKENS.OR);

    const transaction = transfer({
      contract: oreContract!,
      to: '0xe840D217aF07e483Cc954aFf6B98fDD02dA0961f',
      amount: 1,
    });

    const { transactionId } = await serverWallet.enqueueTransaction({
      transaction,
    });

    console.log('transactionId:', transactionId);

    const executionResult = await Engine.getTransactionStatus({
      client: this.thirdwebClient,
      transactionId,
    });

    console.log('executionResult:', executionResult);

    const txHash = await Engine.waitForTransactionHash({
      client: this.thirdwebClient,
      transactionId,
    });
    console.log('Transaction hash:', txHash);
  }
  /*
  async createTransaction(user: UserDocument) {
    const address = user.walletId;
    if (!address) throw new BadRequestException('User wallet not found');
    const ORE_CONTRACT = this.thirdwebContracts.get(TOKENS.OR);
    if (!ORE_CONTRACT) throw new BadRequestException('ORE contract not found');
    const wallet = smartWallet({
      chain: monadTestnet,
      sponsorGas: true,
    });

    const smartAccount = await wallet.connect({
      client: this.thirdwebClient,
      personalAccount: this.thirdwebAdminAccount,
    });
    console.log('smartAccount', smartAccount);

    const smartContract = getContract({
      address: user.walletId!,
      chain: monadTestnet,
      client: this.thirdwebClient,
    });

    console.log('transaction', transaction);
    const result = await sendTransaction({
      transaction,
      account: smartAccount,
    });

    console.log('Transaction hash:', result);
  }
  */
}
