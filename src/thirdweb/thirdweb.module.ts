import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  THIRDWEB_ADMIN_ACCOUNT_TOKEN,
  THIRDWEB_AUTH_TOKEN,
  THIRDWEB_CLIENT_TOKEN,
  THIRDWEB_CONTRACTS_TOKEN,
} from 'src/_utils/constants';
import { thirdwebProviders } from './thirdweb.provider';

@Module({
  imports: [ConfigModule],
  providers: [...thirdwebProviders, Logger],
  exports: [
    THIRDWEB_CLIENT_TOKEN,
    THIRDWEB_AUTH_TOKEN,
    THIRDWEB_CONTRACTS_TOKEN,
    THIRDWEB_ADMIN_ACCOUNT_TOKEN,
  ],
})
export class ThirdwebModule {}
