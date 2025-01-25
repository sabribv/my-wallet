export interface Exchange {
  id?: string;
  walletId: string;
  toWalletId?: string;
  sourceAmount: number;
  sourceCurrency: 'USD' | 'ARS';
  destinationAmount: number;
  destinationCurrency: 'USD' | 'ARS';
  rate: number;
  transactions: string[];
  note?: string;
  date: number;
}
