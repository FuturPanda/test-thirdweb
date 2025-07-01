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
  @Type(() => ThirdWebConfig)
  THIRDWEB: ThirdWebConfig;
}

export function validateEnv(config: Record<string, unknown>) {
  const structuredConfig = {
    SERVER: {
      PORT: config.PORT,
    },
    THIRDWEB: {
      THIRDWEB_SECRET_KEY: config.THIRDWEB_SECRET_KEY,
      THIRDWEB_DOMAIN: config.THIRDWEB_DOMAIN,
      THIRDWEB_PRIVATE_KEY: config.THIRDWEB_PRIVATE_KEY,
      THIRDWEB_ORE_CONTRACT_ADDRESS: config.THIRDWEB_ORE_CONTRACT_ADDRESS,
      THIRDWEB_USDC_CONTRACT_ADDRESS: config.THIRDWEB_USDC_CONTRACT_ADDRESS,
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
