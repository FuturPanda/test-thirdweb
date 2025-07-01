export class GetTokenDto {
  chainId: number;
  displayValue: string;
  name: string;
  symbol: string;
  tokenAddress: string;
}

export class GetUserTokensDto {
  id: string;
  walletId: string | null;
  tokens: GetTokenDto[];
}
