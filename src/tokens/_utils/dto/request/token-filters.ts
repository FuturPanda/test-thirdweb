import { Transform } from 'class-transformer';
import { IsArray, IsEnum } from 'class-validator';
import { Optional } from 'class-validator-extended';
import { TOKENS } from 'src/thirdweb/_utils/enums';

export class TokenFilters {
  @IsArray()
  @Optional()
  @IsEnum(TOKENS, { each: true })
  @Transform(({ value }) => [value].flat())
  tokens?: TOKENS[];
}
