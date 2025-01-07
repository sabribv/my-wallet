import { Injectable } from '@angular/core';
import {catchError, combineLatest, forkJoin, from, map, Observable, of, switchMap} from 'rxjs';
import {Bill, BillWithExpense} from '@models/bill.model';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {Expense} from '@models/expense.model';
import {AuthService} from '@services/auth.service';
import {collection} from '../constants/collections';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class BillsService {
  constructor(private firestore: AngularFirestore, private authService: AuthService) {}

  getBills(): Observable<Bill[]> {
    return this.authService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth) {
          return this.firestore
            .collection<Bill>(`${collection.users}/${auth.uid}/${collection.bills}`)
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
            .collection<Bill>(`${collection.users}/${auth.uid}/${collection.bills}`)
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
                      .doc<Expense>(`${collection.users}/${auth.uid}/${collection.expenses}/${bill.expenseId}`)
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
            .collection<Bill>(`${collection.users}/${auth.uid}/${collection.bills}`)
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


  getExpensesWithNoBills(month: number, year: number): Observable<Expense[] | null> {
    return this.authService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth) {
          // Calcular el rango de fechas para el mes y año específicos
          const startOfMonth = moment().year(year).month(month).startOf('month');
          const endOfMonth = moment().year(year).month(month).endOf('month');

          // Obtener las expenses con isFixed === true
          return this.firestore.collection<Expense>(`${collection.users}/${auth.uid}/${collection.expenses}`, ref =>
            ref.where('isFixed', '==', true)
          ).snapshotChanges().pipe(
            map(snaps => snaps.map(doc => {
              const data = doc.payload.doc.data();
              const id = doc.payload.doc.id;
              return { id, ...data } as Expense;
            })),
            switchMap(expenses => {
              // Usar forkJoin para esperar todas las promesas de bills
              return forkJoin(
                expenses.map(expense =>
                  this.firestore
                    .collection<Bill>(`${collection.users}/${auth.uid}/${collection.bills}`, ref =>
                      ref
                        .where('expenseId', '==', expense.id) // Asegúrate de que expenseId coincida
                        .where('dueDate', '>=', startOfMonth.valueOf())
                        .where('dueDate', '<', endOfMonth.valueOf())
                    )
                    .get()
                    .toPromise()
                    .then(billsSnapshot => {
                      // Si no hay bills para esta expense en el mes/año, la expense es relevante
                      if (billsSnapshot?.empty) {
                        return expense; // Devolver la expense si no tiene bills
                      }
                      return null; // Si tiene bills, ignorarla
                    })
                )
              ).pipe(
                // Filtrar los nulls, asegurándose de que el resultado sea un array de `Expense`
                map((result) => result.filter((expense) => expense !== null) as Expense[])
              );
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
      .collection(`${collection.users}/${user.uid}/${collection.bills}`)
      .doc(id)
      .set({ ...bill, id });
  }

  async updateBill(id: string, bill: Partial<Bill>): Promise<void> {
    const user = await this.authService.getCurrentUser();

    return this.firestore
      .collection(`${collection.users}/${user.uid}/${collection.bills}`)
      .doc(id)
      .update(bill);
  }

  async deleteBill(id: string): Promise<void> {
    const user = await this.authService.getCurrentUser();

    return this.firestore
      .collection(`${collection.users}/${user.uid}/${collection.bills}`)
      .doc(id)
      .delete();
  }
}
