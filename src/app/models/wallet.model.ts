export interface Wallet {
  id?: string;
  name: string;
  type: 'bank' | 'virtual' | 'cash';
  currency: 'USD' | 'ARS';
  balance: number;
}
