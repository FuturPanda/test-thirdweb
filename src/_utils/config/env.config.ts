import { Logger } from '@nestjs/common';
import { plainToInstance, Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  ValidateNested,
  validateSync,
} from 'class-validator';
import { exit } from 'process';

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

export class OpenAI {
  @IsString()
  OPENAI_API_KEY: string;
}

export class MonadExplorerConfig {
  @IsString()
  MONAD_EXPLORER_API_KEY: string;

  @IsString()
  MONAD_EXPLORER_BASE_URL: string;
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
}

export class EnvironmentVariables {
  @ValidateNested()
  @Type(() => ServerConfig)
  SERVER: ServerConfig;

  @ValidateNested()
  @Type(() => DatabaseConfig)
  DATABASE: DatabaseConfig;

  @ValidateNested()
  @Type(() => OpenAI)
  OPENAI: OpenAI;

  @ValidateNested()
  @Type(() => ThirdWebConfig)
  THIRDWEB: ThirdWebConfig;

  @ValidateNested()
  @Type(() => MonadExplorerConfig)
  MONADEXPLORER: MonadExplorerConfig;
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
    OPENAI: {
      OPENAI_API_KEY: config.OPENAI_API_KEY,
    },
    THIRDWEB: {
      THIRDWEB_SECRET_KEY: config.THIRDWEB_SECRET_KEY,
      THIRDWEB_DOMAIN: config.THIRDWEB_DOMAIN,
      THIRDWEB_PRIVATE_KEY: config.THIRDWEB_PRIVATE_KEY,
      THIRDWEB_ORE_CONTRACT_ADDRESS: config.THIRDWEB_ORE_CONTRACT_ADDRESS,
      THIRDWEB_USDC_CONTRACT_ADDRESS: config.THIRDWEB_USDC_CONTRACT_ADDRESS,
    },
    MONADEXPLORER: {
      MONAD_EXPLORER_API_KEY: config.MONAD_EXPLORER_API_KEY,
      MONAD_EXPLORER_BASE_URL: config.MONAD_EXPLORER_BASE_URL,
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
