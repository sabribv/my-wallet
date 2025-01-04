import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {Expense} from '@models/expense.model';
import {catchError, map, Observable, of, switchMap} from 'rxjs';
import {AuthService} from '@services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private userCollection = 'users';
  private expenseCollection = 'expenses';

  constructor(private firestore: AngularFirestore, private authService: AuthService) {}

  async addExpense(expense: Expense): Promise<void> {
    const user = await this.authService.getCurrentUser();
    const id = this.firestore.createId();

    return this.firestore
      .collection(`${this.userCollection}/${user.uid}/${this.expenseCollection}`)
      .doc(id)
      .set({ ...expense, id });
  }

  getAllExpenses(): Observable<Expense[]> {
    return  this.authService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth) {
          return this.firestore
            .collection<Expense>(`${this.userCollection}/${auth.uid}/${this.expenseCollection}`)
            .valueChanges({idField: 'id'});
        } else {
          return of([]);
        }
      })
    )
  }

  getExpenseById(id: string): Observable<Expense | null> {
    return this.authService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth) {
          return this.firestore
            .collection<Expense>(`${this.userCollection}/${auth.uid}/${this.expenseCollection}`)
            .doc(id)
            .get()
            .pipe(
              map((doc) => {
                if (doc.exists) {
                  return {id: doc.id, ...doc.data()} as Expense;
                } else {
                  return null;
                }
              }),
              catchError((error) => {
                console.error('Error fetching expense:', error);
                return of(null);
              })
            );
        } else {
          return of(null);
        }
      })
    )
  }

  async updateExpense(id: string, expense: Expense): Promise<void> {
    const user = await this.authService.getCurrentUser();

    return this.firestore
      .collection(`${this.userCollection}/${user.uid}/${this.expenseCollection}`)
      .doc(id)
      .update(expense);
  }

  async deleteExpense(id: string): Promise<void> {
    const user = await this.authService.getCurrentUser();

    return this.firestore
      .collection(`${this.userCollection}/${user.uid}/${this.expenseCollection}`)
      .doc(id)
      .delete();
  }
}
