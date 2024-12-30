import {Expense} from '@models/expense.model';

export interface Bill {
  id?: string; // ID generado por Firebase
  expenseId: string; // Referencia al ID del gasto
  dueDate: number; // Fecha de vencimiento
  amount: number; // Monto
  isPaid: boolean; // Indica si está pagado
}

export interface BillWithExpense extends Bill {
  expense?: Expense;
}
