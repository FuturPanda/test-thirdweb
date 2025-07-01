import { Logger } from "@nestjs/common";
import { plainToInstance, Type } from "class-transformer";
import {
  IsNumber,
  IsString,
  ValidateNested,
  validateSync,
} from "class-validator";
import { exit } from "process";

export class ServerConfig {
  @IsNumber()
  PORT: number;
}

export class DatabaseConfig {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  DATABASE_NAME: string;
}

export class ThirdWebConfig {
  @IsString()
  THIRDWEB_SECRET_KEY: string;

  @IsString()
  THIRDWEB_DOMAIN: string;

  @IsString()
  THIRDWEB_PRIVATE_KEY: string;

  @IsString()
  THIRDWEB_ORE_CONTRACT_ADDRESS: string;

  @IsString()
  THIRDWEB_USDC_CONTRACT_ADDRESS: string;

  @IsString()
  TEST_WALLET_RECIPIENT: string;

  @IsString()
  SERVER_WALLET_ADDRESS: string;

  @IsString()
  VAULT_ACCESS_TOKEN: string;
}

export class EnvironmentVariables {
  @ValidateNested()
  @Type(() => ServerConfig)
  SERVER: ServerConfig;

  @ValidateNested()
  @Type(() => DatabaseConfig)
  DATABASE: DatabaseConfig;

  @ValidateNested()
  @Type(() => ThirdWebConfig)
  THIRDWEB: ThirdWebConfig;
}

export function validateEnv(config: Record<string, unknown>) {
  const structuredConfig = {
    SERVER: {
      PORT: config.PORT,
    },
    DATABASE: {
      DATABASE_URL: config.DATABASE_URL,
      DATABASE_NAME: config.DATABASE_NAME,
    },
    THIRDWEB: {
      THIRDWEB_SECRET_KEY: config.THIRDWEB_SECRET_KEY,
      THIRDWEB_DOMAIN: config.THIRDWEB_DOMAIN,
      THIRDWEB_PRIVATE_KEY: config.THIRDWEB_PRIVATE_KEY,
      THIRDWEB_ORE_CONTRACT_ADDRESS: config.THIRDWEB_ORE_CONTRACT_ADDRESS,
      THIRDWEB_USDC_CONTRACT_ADDRESS: config.THIRDWEB_USDC_CONTRACT_ADDRESS,
      TEST_WALLET_RECIPIENT: config.TEST_WALLET_RECIPIENT,
      SERVER_WALLET_ADDRESS: config.SERVER_WALLET_ADDRESS,
      VAULT_ACCESS_TOKEN: config.VAULT_ACCESS_TOKEN,
    },
  };

  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    structuredConfig,
    {
      enableImplicitConversion: true,
    },
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length) {
    new Logger(validateEnv.name).error(errors.toString());
    exit();
  }

  return validatedConfig;
}
