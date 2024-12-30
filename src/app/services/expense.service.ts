import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {Expense} from '@models/expense.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private expenseCollection = 'expenses';

  constructor(private firestore: AngularFirestore) {}

  addExpense(expense: Expense): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore.collection(this.expenseCollection).doc(id).set({ ...expense, id });
  }

  getAllExpenses(): Observable<Expense[]> {
    return this.firestore
      .collection<Expense>(this.expenseCollection)
      .valueChanges({ idField: 'id' });
  }

  updateExpense(id: string, expense: Expense): Promise<void> {
    return this.firestore.collection(this.expenseCollection).doc(id).update(expense);
  }

  deleteExpense(id: string): Promise<void> {
    return this.firestore.collection(this.expenseCollection).doc(id).delete();
  }
}
