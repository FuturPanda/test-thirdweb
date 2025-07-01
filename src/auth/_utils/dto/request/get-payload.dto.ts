import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetPayloadDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsNumber()
  chainId?: number;
}
