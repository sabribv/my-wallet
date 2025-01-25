export interface Expense {
  id?: string;
  name: string;
  isFixed: boolean;
  paymentType: 'cash' | 'debit';
}
