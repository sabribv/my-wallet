import {Expense} from '@models/expense.model';

export interface Bill {
  id?: string;
  expenseId: string;
  dueDate: number;
  amount: number;
  isPaid: boolean;
}

export interface BillWithExpense extends Bill {
  expense?: Expense;
}
