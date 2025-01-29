export interface ExchangeCalculator {
  id?: string;
  cashExpenses: number;
  billing: number;
  extra: number;
  rate: number;
  netAmount: number;
  commission: number;
  amount: number;
  walletId?: string;
  toWalletId?: string;
  transactions: string[];
  note?: string;
  date: number;
}
