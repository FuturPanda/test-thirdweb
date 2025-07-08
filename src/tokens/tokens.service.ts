import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  THIRDWEB_CLIENT_TOKEN,
  THIRDWEB_CONTRACTS_TOKEN,
} from "src/_utils/constants";
import { TOKENS } from "src/thirdweb/_utils/enums";
import { TokenFilters } from "src/tokens/_utils/dto/request/token-filters";
import { UserDocument } from "src/users/users.schema";
import { ThirdwebClient, ThirdwebContract } from "thirdweb";
import { getBalance, GetBalanceResult } from "thirdweb/extensions/erc20";
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
}
