import { PreparedTransaction } from 'thirdweb';
import { TOKENS } from '../enums';

/**
 * @param tokenSymbol - The symbol of the token to be used for the transaction.
 * @param tokenBalance - The balance of the token to be used for the transaction.
 * @param from - The address of the account that will be used to send the transaction.
 */
export class CreateOnChainTransactionParams {
  transaction: PreparedTransaction;
  tokenSymbol: TOKENS;
  tokenBalance: number;
  from: string;
}
