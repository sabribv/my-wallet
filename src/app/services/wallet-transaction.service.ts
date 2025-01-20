import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {catchError, combineLatest, map, Observable, of, switchMap} from 'rxjs';
import {AuthService} from '@services/auth.service';
import {collection} from '../constants/collections';
import {WalletTransaction} from '@models/wallet-transaction.model';

@Injectable({
  providedIn: 'root',
})
export class WalletTransactionService {
  constructor(private firestore: AngularFirestore, private authService: AuthService) {}

  async addTransaction(transaction: WalletTransaction): Promise<void> {
    const user = await this.authService.getCurrentUser();
    const id = this.firestore.createId();

    return this.firestore
      .collection(`${collection.users}/${user.uid}/${collection.walletTransactions}`)
      .doc(id)
      .set({ ...transaction, id });
  }

  getWalletTransactions(walletId: string): Observable<WalletTransaction[]> {
    return this.authService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth) {
          const walletIdQuery = this.firestore.collection<WalletTransaction>(
            `${collection.users}/${auth.uid}/${collection.walletTransactions}`,
            (ref) => ref.where('walletId', '==', walletId)
          ).valueChanges({ idField: 'id' });

          const toWalletIdQuery = this.firestore.collection<WalletTransaction>(
            `${collection.users}/${auth.uid}/${collection.walletTransactions}`,
            (ref) => ref.where('toWalletId', '==', walletId)
          ).valueChanges({ idField: 'id' });

          // Combine the two queries
          return combineLatest([walletIdQuery, toWalletIdQuery]).pipe(
            map(([walletIdResults, toWalletIdResults]) =>
              // Merge the results and remove duplicates
              [...walletIdResults, ...toWalletIdResults].filter(
                (transaction, index, self) =>
                  self.findIndex((t) => t.id === transaction.id) === index
              ).sort((a,b) => b.date - a.date)
            )
          );
        } else {
          return of([]);
        }
      })
    );
  }

  getTransactionById(id: string): Observable<WalletTransaction | null> {
    return this.authService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth) {
          return this.firestore
            .collection<WalletTransaction>(`${collection.users}/${auth.uid}/${collection.walletTransactions}`)
            .doc(id)
            .get()
            .pipe(
              map((doc) => {
                if (doc.exists) {
                  return {id: doc.id, ...doc.data()} as WalletTransaction;
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

  async updateTransaction(id: string, transaction: WalletTransaction): Promise<void> {
    const user = await this.authService.getCurrentUser();

    return this.firestore
      .collection(`${collection.users}/${user.uid}/${collection.walletTransactions}`)
      .doc(id)
      .update(transaction);
  }

  async deleteTransaction(id: string): Promise<void> {
    const user = await this.authService.getCurrentUser();

    return this.firestore
      .collection(`${collection.users}/${user.uid}/${collection.walletTransactions}`)
      .doc(id)
      .delete();
  }
}
