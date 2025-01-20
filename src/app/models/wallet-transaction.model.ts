export interface WalletTransaction {
  id?: string;
  walletId: string;
  date: number;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  toWalletId?: string;
  note?: string;
}
