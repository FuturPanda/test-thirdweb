import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, ValidateNested } from 'class-validator';
import { Optional } from 'class-validator-extended';
import { PaginatedQueryDto } from 'src/_utils/pagination/requests/paginated-query.dto';
import { TokenFilters } from './token-filters';

export class PaginatedTransactionsQueryDto extends PaginatedQueryDto {
  @ApiProperty({
    description: 'Use cursor property to access the next page',
  })
  @IsNumber()
  @Optional()
  pageCursor?: number;

  @ValidateNested()
  tokenFilters?: TokenFilters;
}
