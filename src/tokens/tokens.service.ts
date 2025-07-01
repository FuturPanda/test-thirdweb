import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  THIRDWEB_CLIENT_TOKEN,
  THIRDWEB_CONTRACTS_TOKEN,
} from "src/_utils/constants";
import { TOKENS } from "src/thirdweb/_utils/enums";
import { TokenFilters } from "src/tokens/_utils/dto/request/token-filters";
import { UserDocument } from "src/users/users.schema";
import { Engine, ThirdwebClient, ThirdwebContract } from "thirdweb";
import { monadTestnet } from "thirdweb/chains";
import {
  getBalance,
  GetBalanceResult,
  transfer,
} from "thirdweb/extensions/erc20";
import { TokensMapper } from "./tokens.mapper";

@Injectable()
export class TokensService {
  constructor(
    @Inject(THIRDWEB_CONTRACTS_TOKEN)
    private readonly thirdwebContracts: Map<TOKENS, ThirdwebContract>,
    private readonly tokensMapper: TokensMapper,
    @Inject(THIRDWEB_CLIENT_TOKEN)
    private readonly thirdwebClient: ThirdwebClient,
    private readonly configService: ConfigService,
  ) {}

  async getUserTokens(user: UserDocument, filters?: TokenFilters) {
    if (!user.walletId) throw new BadRequestException("User wallet not found");
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
    if (!user.walletId) throw new BadRequestException("User wallet not found");
    const oreContract = this.thirdwebContracts.get(TOKENS.OR);
    if (!oreContract) throw new BadRequestException("ORE contract not found");
    return getBalance({
      address: user.walletId,
      contract: oreContract,
    });
  }

  async createTransaction(user: UserDocument) {
    const serverWallet = Engine.serverWallet({
      client: this.thirdwebClient,
      address: this.configService.get("THIRDWEB").SERVER_WALLET_ADDRESS,
      vaultAccessToken: this.configService.get("THIRDWEB").VAULT_ACCESS_TOKEN,
      chain: monadTestnet,
    });

    const oreContract = this.thirdwebContracts.get(TOKENS.OR);

    const transaction = transfer({
      contract: oreContract!,
      to: this.configService.get("THIRDWEB").TEST_WALLET_RECIPIENT,
      amount: 1,
    });

    const { transactionId } = await serverWallet.enqueueTransaction({
      transaction,
    });

    console.log("transactionId:", transactionId);

    const executionResult = await Engine.getTransactionStatus({
      client: this.thirdwebClient,
      transactionId,
    });

    console.log("executionResult:", executionResult);

    const txHash = await Engine.waitForTransactionHash({
      client: this.thirdwebClient,
      transactionId,
    });
    console.log("Transaction hash:", txHash);
  }
}
