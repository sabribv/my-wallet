import { Injectable } from '@angular/core';
import {catchError, combineLatest, map, Observable, of, switchMap} from 'rxjs';
import {Bill, BillWithExpense} from '@models/bill.model';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {Expense} from '@models/expense.model';
import {AuthService} from '@services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class BillsService {
  private userCollection = 'users';
  private billsCollection = 'bills';
  private expenseCollection = 'expenses';

  constructor(private firestore: AngularFirestore, private authService: AuthService) {}

  getBills(): Observable<Bill[]> {
    return this.authService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth) {
          return this.firestore
            .collection<Bill>(`${this.userCollection}/${auth.uid}/${this.billsCollection}`)
            .valueChanges({idField: 'id'});
        } else {
          return of([]);
        }
      })
    );
  }

  getBillsWithExpenses(): Observable<BillWithExpense[]> {
    return this.authService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth) {
          return this.firestore
            .collection<Bill>(`${this.userCollection}/${auth.uid}/${this.billsCollection}`)
            .snapshotChanges()
            .pipe(
                map((billsSnapshot) => {
                  // Mapeamos las bills a su formato adecuado
                  return billsSnapshot.map((doc) => {
                    const data = doc.payload.doc.data() as Bill;
                    return {
                      ...data,
                      id: doc.payload.doc.id,
                    };
                  });
                }),
                switchMap((bills: Bill[]) => {
                  // Para cada bill, obtenemos la expense asociada
                  const billsWithExpenses = bills.map((bill) => {
                    return this.firestore
                      .doc<Expense>(`${this.userCollection}/${auth.uid}/${this.expenseCollection}/${bill.expenseId}`)
                      .valueChanges()
                      .pipe(
                        map((expense) => ({
                          ...bill,
                          expense: expense || {id: '', name: 'Desconocido', paymentType: 'cash', isFixed: false},
                        }))
                      );
                  });

                  // Regresamos un observable que emite la lista de bills con las expenses
                  return combineLatest(billsWithExpenses);  // combineLatest emite cuando todos los observables se resuelven
                })
          );
        } else {
          return of([]);
        }
      })
    );
  }

  getBillById(id: string): Observable<Bill | null> {
    return  this.authService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth) {
          return this.firestore
            .collection<Bill>(`${this.userCollection}/${auth.uid}/${this.billsCollection}`)
            .doc(id)
            .get()
            .pipe(
              map((doc) => {
                if (doc.exists) {
                  return {id: doc.id, ...doc.data()} as Bill;
                } else {
                  return null;
                }
              }),
              catchError((error) => {
                console.error('Error fetching bill:', error);
                return of(null);
              })
            );
        } else {
          return of(null);
        }
      })
    );
  }

  async addBill(bill: Bill): Promise<void> {
    const user = await this.authService.getCurrentUser();
    const id = this.firestore.createId();

    return this.firestore
      .collection(`${this.userCollection}/${user.uid}/${this.billsCollection}`)
      .doc(id)
      .set({ ...bill, id });
  }

  async updateBill(id: string, bill: Partial<Bill>): Promise<void> {
    const user = await this.authService.getCurrentUser();

    return this.firestore
      .collection(`${this.userCollection}/${user.uid}/${this.billsCollection}`)
      .doc(id)
      .update(bill);
  }

  async deleteBill(id: string): Promise<void> {
    const user = await this.authService.getCurrentUser();

    return this.firestore
      .collection(`${this.userCollection}/${user.uid}/${this.billsCollection}`)
      .doc(id)
      .delete();
  }
}
