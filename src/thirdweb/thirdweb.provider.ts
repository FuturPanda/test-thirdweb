import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/_utils/config/env.config';
import {
  THIRDWEB_ADMIN_ACCOUNT_TOKEN,
  THIRDWEB_AUTH_TOKEN,
  THIRDWEB_CLIENT_TOKEN,
  THIRDWEB_CONTRACTS_TOKEN,
} from 'src/_utils/constants';
import { createThirdwebClient, getContract, ThirdwebClient } from 'thirdweb';
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
      try {
        const client = createThirdwebClient({
          secretKey: secretKey,
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
    provide: THIRDWEB_ADMIN_ACCOUNT_TOKEN,
    useFactory: async (
      configService: ConfigService<EnvironmentVariables, true>,
      thirdwebClient: ThirdwebClient,
      logger: Logger,
    ): Promise<Account> => {
      const privateKey = configService.get('THIRDWEB').THIRDWEB_PRIVATE_KEY;
      const adminAccount = privateKeyToAccount({
        client: thirdwebClient,
        privateKey: privateKey,
      });
      logger.log(
        'Thirdweb Admin Account initialized successfully',
        THIRDWEB_AUTH_TOKEN,
      );
      return adminAccount;
    },
    inject: [ConfigService, THIRDWEB_CLIENT_TOKEN, Logger],
  },
  {
    provide: THIRDWEB_AUTH_TOKEN,
    useFactory: async (
      configService: ConfigService<EnvironmentVariables, true>,
      thirdwebClient: ThirdwebClient,
      thirdwebAdminAccount: Account,
      logger: Logger,
    ): Promise<ThirdwebAuth> => {
      const domain = configService.get('THIRDWEB').THIRDWEB_DOMAIN;
      const auth = createAuth({
        domain: domain,
        client: thirdwebClient,
        adminAccount: thirdwebAdminAccount,
      });
      logger.log('Thirdweb AUTH initialized successfully', THIRDWEB_AUTH_TOKEN);
      return auth;
    },
    inject: [
      ConfigService,
      THIRDWEB_CLIENT_TOKEN,
      THIRDWEB_ADMIN_ACCOUNT_TOKEN,
      Logger,
    ],
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
