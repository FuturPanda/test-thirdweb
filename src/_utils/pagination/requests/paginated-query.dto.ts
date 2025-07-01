import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { Optional } from 'class-validator-extended';
import { PipelineStage } from 'mongoose';

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginatedQueryDto {
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsNumber()
  @Min(1)
  pageSize: number = 10;

  @IsString()
  @Optional()
  sortBy?: string;

  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.DESC;

  get skip(): number {
    return (this.page - 1) * this.pageSize;
  }

  private get toMongoDbSortDirection() {
    return this.sortDirection === SortDirection.ASC ? 1 : -1;
  }

  get toMongoDbSort(): PipelineStage {
    return {
      $sort: this.sortBy
        ? { [this.sortBy]: this.toMongoDbSortDirection }
        : { _id: this.toMongoDbSortDirection },
    };
  }

  get toMongoDbFacet(): PipelineStage {
    return {
      $facet: {
        items: [{ $skip: this.skip }, { $limit: this.pageSize }],
        total: [{ $count: 'total' }],
      },
    };
  }
}
