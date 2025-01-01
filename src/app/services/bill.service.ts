import { Injectable } from '@angular/core';
import {catchError, combineLatest, concatMap, forkJoin, from, map, Observable, of, switchMap, toArray} from 'rxjs';
import {Bill, BillWithExpense} from '@models/bill.model';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {Expense} from '@models/expense.model';

@Injectable({
  providedIn: 'root',
})
export class BillsService {
  private billsCollection = 'bills';

  constructor(private firestore: AngularFirestore) {}

  getBills(): Observable<Bill[]> {
    return this.firestore
      .collection<Bill>(this.billsCollection)
      .valueChanges({ idField: 'id' });
  }

  getBillsWithExpenses(): Observable<BillWithExpense[]> {
    // Obtenemos todas las bills de la colección "bills"
    return this.firestore.collection<Bill>('bills').snapshotChanges().pipe(
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
            .doc<Expense>(`expenses/${bill.expenseId}`)
            .valueChanges()
            .pipe(
              map((expense) => ({
                ...bill,
                expense: expense || { id: '', name: 'Desconocido', paymentType: 'cash', isFixed: false },
              }))
            );
        });

        // Regresamos un observable que emite la lista de bills con las expenses
        return combineLatest(billsWithExpenses);  // combineLatest emite cuando todos los observables se resuelven
      })
    );
  }

  getBillById(id: string): Observable<Bill | null> {
    return this.firestore
      .collection<Bill>(this.billsCollection)
      .doc(id)
      .get()
      .pipe(
        map((doc) => {
          if (doc.exists) {
            return { id: doc.id, ...doc.data() } as Bill;
          } else {
            return null;
          }
        }),
        catchError((error) => {
          console.error('Error fetching bill:', error);
          return of(null);
        })
      );
  }

  addBill(bill: Bill): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore.collection(this.billsCollection).doc(id).set({ ...bill, id });
  }

  updateBill(id: string, bill: Partial<Bill>): Promise<void> {
    return this.firestore.collection(this.billsCollection).doc(id).update(bill);
  }

  deleteBill(id: string): Promise<void> {
    return this.firestore.collection(this.billsCollection).doc(id).delete();
  }
}
