import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {Expense} from '@models/expense.model';
import {catchError, map, Observable, of} from 'rxjs';

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

  getExpenseById(id: string): Observable<Expense | null> {
    return this.firestore
      .collection<Expense>(this.expenseCollection)
      .doc(id)
      .get()
      .pipe(
        map((doc) => {
          if (doc.exists) {
            return { id: doc.id, ...doc.data() } as Expense;
          } else {
            return null;
          }
        }),
        catchError((error) => {
          console.error('Error fetching expense:', error);
          return of(null);
        })
      );
  }

  updateExpense(id: string, expense: Expense): Promise<void> {
    return this.firestore.collection(this.expenseCollection).doc(id).update(expense);
  }

  deleteExpense(id: string): Promise<void> {
    return this.firestore.collection(this.expenseCollection).doc(id).delete();
  }
}
