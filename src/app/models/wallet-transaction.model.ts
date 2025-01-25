export interface WalletTransaction {
  id?: string;
  walletId: string;
  date: number;
  type: 'income' | 'expense' | 'transfer';
  sourceAmount: number;
  destinationAmount: number;
  fee?: number;
  currency: string;
  toWalletId?: string;
  note?: string;
}
