import { SortDirection } from 'src/_utils/pagination/requests/paginated-query.dto';

export class GetPaginatedTransactionsDto {
  walletId: string;
  page: number;
  limit: number;
  sortBy: string;
  sortDirection: SortDirection;
}
