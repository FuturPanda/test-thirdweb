import { GetBalanceResult } from 'thirdweb/extensions/erc20';

export const getOreBalanceNumber = (oreBalance: GetBalanceResult): number =>
  Number(oreBalance.value) * 10 ** -oreBalance.decimals;
