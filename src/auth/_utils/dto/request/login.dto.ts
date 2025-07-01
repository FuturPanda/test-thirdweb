import { Type } from 'class-transformer';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Optional } from 'class-validator-extended';

export class LoginPayloadDto {
  @IsString()
  domain: string;

  @IsString()
  address: string;

  @IsString()
  statement: string;

  @IsString()
  @IsOptional()
  uri?: string;

  @IsString()
  version: string;

  @IsString()
  @IsOptional()
  chain_id?: string;

  @IsString()
  nonce: string;

  @IsString()
  issued_at: string;

  @IsString()
  expiration_time: string;

  @IsString()
  invalid_before: string;

  @IsArray()
  @IsString({ each: true })
  @Optional()
  resources?: string[];
}

export class LoginThirdWebDto {
  @ValidateNested()
  @IsObject()
  @Type(() => LoginPayloadDto)
  payload: LoginPayloadDto;

  @IsString()
  signature: string;
}
