import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  THIRDWEB_CLIENT_TOKEN,
  THIRDWEB_CONTRACTS_TOKEN,
  THIRDWEB_SERVER_WALLET_TOKEN,
} from "src/_utils/constants";
import { UserDocument } from "src/users/users.schema";
import {
  Engine,
  getContract,
  PreparedTransaction,
  sendTransaction,
  ThirdwebClient,
} from "thirdweb";
import { baseSepolia, monadTestnet } from "thirdweb/chains";
import { getAllActiveSigners } from "thirdweb/extensions/erc4337";
import { TOKENS } from "./_utils/enums";
import { Contracts } from "./_utils/type/contracts.type";

@Injectable()
export class ThirdwebService {
  constructor(
    @Inject(THIRDWEB_SERVER_WALLET_TOKEN)
    private readonly serverWallet: Engine.ServerWallet,
    @Inject(THIRDWEB_CONTRACTS_TOKEN)
    private readonly thirdwebContracts: Contracts,
    @Inject(THIRDWEB_CLIENT_TOKEN)
    private readonly thirdwebClient: ThirdwebClient,
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * @function createOnChainTransaction use server wallet to send transaction onto any EVM chain
   */
  async createOnChainTransaction(
    transaction: PreparedTransaction,
  ): Promise<string> {
    const { transactionId } = await this.serverWallet.enqueueTransaction({
      transaction: transaction,
    });

    this.logger.log(`transactionId: ${transactionId}`, ThirdwebService.name);

    const executionResult = await Engine.getTransactionStatus({
      client: this.thirdwebClient,
      transactionId,
    });

    this.logger.log(
      `executionResult: ${JSON.stringify(executionResult)}`,
      ThirdwebService.name,
    );

    const result = await Engine.waitForTransactionHash({
      client: this.thirdwebClient,
      transactionId,
    });

    this.logger.log(
      `Transaction hash: ${result.transactionHash}`,
      ThirdwebService.name,
    );
    return result.transactionHash;
  }

  /**
   * @function Initiate a transaction from user's smart wallet, signed with the backend wallet's private key account
   */
  async createTransactionFromUserSmartWallet(user: UserDocument) {
    const VAULT_ACCESS_TOKEN =
      this.configService.get("THIRDWEB").THIRDWEB_VAULT_ACCESS_TOKEN;
    const serverWalletAddress =
      this.configService.get("THIRDWEB").THIRDWEB_SERVER_WALLET_ADDRESS;

    return this.httpService.axiosRef
      .post(`https://engine.thirdweb.com/v1/write/contract`, {
        params: {
          method: "POST",
          headers: {
            content_type: "application/json",
            "x-secret-key":
              "-05lrrO4NEiNh31z1th9k3KcyGKbCbWje4jngrP3D0qAxob5grCf_Uv9YZBQq6sLdGB5W7tTVWy87I-Wge5tGw",
            "x-vault-access-token":
              "vt_act_EV6TAZJX3I5U6C45VQH5EMAGIYQYS2J4PW2XBNK5OPRA6BU5WVHCSWZHS6HUSS77SS556Q4NFMD6MAEAGHLW2JLKIVKIEL3UBJ56EJWT",
            "x-client-id": "db7cc2f0f77bbbf7b74a0afd5a8b21b0",
          },
          body: {
            executionOptions: {
              chainId: 10143,
              signerAddress: "0x317b4b63E056162098458E418aaA80b323b5A6Fd",
              smartAccountAddress: "0xC70f4AB22e20ceB934F0379c5CEaDd0A42F8d9b6",
              type: "ERC4337",
              entrypointVersion: "0.6",
            },
            params: [
              {
                contractAddress: "0xe1D1Ad22e082D657B0434400394D6c6BF58679B7",
                method:
                  "function transfer(address to, uint256 amount) returns (bool)",
                params: [
                  "0xAad8E2F2275C82D5360ad1CB3F2691e41d182F7a",
                  10000000000,
                ],
                abi: null,
                value: null,
              },
            ],
            webhookOptions: [
              {
                url: "",
                secret: null,
              },
            ],
          },
        },
      })
      .catch((error) => {
        console.log("error : ", error);
        throw new BadRequestException(
          "Error during transaction creation",
          error,
        );
      })
      .then((response) => JSON.stringify(response));
  }

  async testCreateTransaction(user: UserDocument) {
    const VAULT_ACCESS_TOKEN =
      this.configService.get("THIRDWEB").THIRDWEB_VAULT_ACCESS_TOKEN;
    const serverWalletAddress =
      this.configService.get("THIRDWEB").THIRDWEB_SERVER_WALLET_ADDRESS;

    const smartAccountAddress = "0xbeE8E724217A8eE04a5b5fb3366f817e1dD18Cdf";
    const oreContract = this.thirdwebContracts.get(TOKENS.OR);

    const serverWallet = Engine.serverWallet({
      address: serverWalletAddress,
      chain: baseSepolia,
      client: this.thirdwebClient,
      executionOptions: {
        entrypointAddress: "0.6",
        signerAddress: serverWalletAddress,
        smartAccountAddress: smartAccountAddress,
        type: "ERC4337",
      },
      vaultAccessToken: VAULT_ACCESS_TOKEN,
    });

    const signers = await getAllActiveSigners({
      contract: getContract({
        address: smartAccountAddress,
        chain: monadTestnet,
        client: this.thirdwebClient,
      }),
    });
    console.log(signers);

    const tx = await sendTransaction({
      account: serverWallet,
      transaction: {
        chain: baseSepolia,
        client: this.thirdwebClient,
        to: serverWalletAddress,
        value: 0n,
      },
    });

    console.log(tx);
  }
}
