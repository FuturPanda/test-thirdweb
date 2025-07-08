import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/_utils/config/env.config';
import {
  THIRDWEB_AUTH_TOKEN,
  THIRDWEB_CLIENT_TOKEN,
  THIRDWEB_CONTRACTS_TOKEN,
  THIRDWEB_SERVER_WALLET_TOKEN,
} from 'src/_utils/constants';
import {
  createThirdwebClient,
  Engine,
  getContract,
  ThirdwebClient,
} from 'thirdweb';
import { createAuth } from 'thirdweb/auth';
import { monadTestnet } from 'thirdweb/chains';
import { Account, privateKeyToAccount } from 'thirdweb/wallets';
import { TOKENS } from './_utils/enums';
import { ThirdwebAuth, ThirdwebContract } from './_utils/thirdweb.types';

export const thirdwebProviders: Provider[] = [
  {
    provide: THIRDWEB_CLIENT_TOKEN,
    useFactory: async (
      configService: ConfigService<EnvironmentVariables, true>,
      logger: Logger,
    ): Promise<ThirdwebClient> => {
      const secretKey = configService.get('THIRDWEB').THIRDWEB_SECRET_KEY;
      const clientId = 'db7cc2f0f77bbbf7b74a0afd5a8b21b0';
      try {
        const client = createThirdwebClient({
          secretKey: secretKey,
          clientId: clientId,
        });
        logger.log(
          'Thirdweb SDK initialized successfully',
          THIRDWEB_CLIENT_TOKEN,
        );
        return client;
      } catch (error) {
        logger.error(
          `Failed to initialize Thirdweb SDK, ${error.message}`,
          THIRDWEB_CLIENT_TOKEN,
        );
        throw error;
      }
    },
    inject: [ConfigService, Logger],
  },
  {
    provide: THIRDWEB_SERVER_WALLET_TOKEN,
    useFactory: async (
      configService: ConfigService<EnvironmentVariables, true>,
      thirdwebClient: ThirdwebClient,
      logger: Logger,
    ): Promise<Account> => {
      const serverWalletAddress =
        configService.get('THIRDWEB').THIRDWEB_SERVER_WALLET_ADDRESS;
      const vaultAccessToken =
        configService.get('THIRDWEB').THIRDWEB_VAULT_ACCESS_TOKEN;
      try {
        const serverWallet = Engine.serverWallet({
          client: thirdwebClient,
          address: serverWalletAddress,
          vaultAccessToken: vaultAccessToken,
          chain: monadTestnet,
        });
        logger.log(
          'Thirdweb server wallet initialized successfully',
          THIRDWEB_SERVER_WALLET_TOKEN,
        );
        return serverWallet;
      } catch (error) {
        logger.error(
          `Failed to initialize Thirdweb server wallet, ${error.message}`,
          THIRDWEB_SERVER_WALLET_TOKEN,
        );
        throw error;
      }
    },
    inject: [ConfigService, THIRDWEB_CLIENT_TOKEN, Logger],
  },
  {
    provide: THIRDWEB_AUTH_TOKEN,
    useFactory: async (
      configService: ConfigService<EnvironmentVariables, true>,
      thirdwebClient: ThirdwebClient,
      logger: Logger,
    ): Promise<ThirdwebAuth> => {
      const domain = configService.get('THIRDWEB').THIRDWEB_DOMAIN;
      const privateKey = configService.get('THIRDWEB').THIRDWEB_PRIVATE_KEY;
      try {
        const auth = createAuth({
          domain: domain,
          client: thirdwebClient,
          adminAccount: privateKeyToAccount({
            client: thirdwebClient,
            privateKey: privateKey,
          }),
        });
        logger.log(
          'Thirdweb AUTH initialized successfully',
          THIRDWEB_AUTH_TOKEN,
        );
        return auth;
      } catch (error) {
        logger.error(
          `Failed to initialize Thirdweb AUTH, ${error.message}`,
          THIRDWEB_AUTH_TOKEN,
        );
        throw error;
      }
    },
    inject: [ConfigService, THIRDWEB_CLIENT_TOKEN, Logger],
  },
  /**
   * TODO :
   *  Si plus de contracts / token alors faire une fonction
   * qui créer dynamiquement les contracts selon les variables contracts dans
   * le env.
   **/
  {
    provide: THIRDWEB_CONTRACTS_TOKEN,
    useFactory: async (
      configService: ConfigService<EnvironmentVariables, true>,
      thirdwebClient: ThirdwebClient,
      logger: Logger,
    ): Promise<Map<string, ThirdwebContract>> => {
      const contracts = new Map<string, ThirdwebContract>();
      const oreContractAddress =
        configService.get('THIRDWEB').THIRDWEB_ORE_CONTRACT_ADDRESS;
      const usdcContractAddress =
        configService.get('THIRDWEB').THIRDWEB_USDC_CONTRACT_ADDRESS;
      const oreContract = getContract({
        client: thirdwebClient,
        chain: monadTestnet,
        address: oreContractAddress,
      });
      const usdcContract = getContract({
        client: thirdwebClient,
        chain: monadTestnet,
        address: usdcContractAddress,
      });
      contracts.set(TOKENS.OR, oreContract);
      contracts.set(TOKENS.USDC, usdcContract);
      logger.log(
        'Thirdweb contracts initialized successfully',
        THIRDWEB_CONTRACTS_TOKEN,
      );
      return contracts;
    },
    inject: [ConfigService, THIRDWEB_CLIENT_TOKEN, Logger],
  },
];
