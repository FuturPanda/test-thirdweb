import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  THIRDWEB_AUTH_TOKEN,
  THIRDWEB_CLIENT_TOKEN,
  THIRDWEB_CONTRACTS_TOKEN,
} from 'src/_utils/constants';
import { thirdwebProviders } from './thirdweb.provider';
import { ThirdwebService } from './thirdweb.service';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [...thirdwebProviders, Logger, ThirdwebService],
  exports: [
    ThirdwebService,
    THIRDWEB_CONTRACTS_TOKEN,
    THIRDWEB_CLIENT_TOKEN,
    THIRDWEB_AUTH_TOKEN,
  ],
})
export class ThirdwebModule {}
