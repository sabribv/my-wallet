import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {catchError, combineLatest, lastValueFrom, map, Observable, of, switchMap} from 'rxjs';
import {AuthService} from '@services/auth.service';
import {collection} from '../constants/collections';
import {WalletTransaction} from '@models/wallet-transaction.model';
import {Wallet} from '@models/wallet.model';

@Injectable({
  providedIn: 'root',
})
export class WalletTransactionService {
  constructor(private firestore: AngularFirestore, private authService: AuthService) {}

  async addTransaction(transaction: WalletTransaction): Promise<void> {
    const user = await this.authService.getCurrentUser();

    try {
      const batch = this.firestore.firestore.batch();

      // Save new transaction
      const transactionsRef = this.firestore
        .collection(`${collection.users}/${user.uid}/${collection.walletTransactions}`)
        .ref;

      const transactionDoc = transactionsRef.doc();
      batch.set(transactionDoc, transaction);
      const sign = transaction.type !== 'income' ? -1 : 1;

      // Update source wallet
      const walletDoc = this.firestore
        .collection<Wallet>(`${collection.users}/${user.uid}/${collection.wallets}`)
        .doc(transaction.walletId);
      const walletSnapshot = await lastValueFrom(walletDoc.get());
      const wallet = {
        id: walletSnapshot.id, ...walletSnapshot.data()
      } as Wallet;
      wallet.balance += (transaction.sourceAmount * sign);
      batch.update(walletDoc.ref, wallet);

      // Update destination wallet
      if (transaction.type === 'transfer' && transaction.toWalletId) {
        const destinationWalletDoc = this.firestore
          .collection<Wallet>(`${collection.users}/${user.uid}/${collection.wallets}`)
          .doc(transaction.toWalletId);

        const destinationWalletSnapshot = await lastValueFrom(destinationWalletDoc.get());
        const destinationWallet = {
          id: destinationWalletSnapshot.id, ...destinationWalletSnapshot.data()
        } as Wallet;
        destinationWallet.balance += transaction.destinationAmount;
        batch.update(destinationWalletDoc.ref, destinationWallet);
      }

      return batch.commit();
    } catch (error) {
      console.error('Error al ejecutar el batch:', error);
    }
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

  async deleteTransaction(transaction: WalletTransaction): Promise<void> {
    const user = await this.authService.getCurrentUser();

    try {
      const batch = this.firestore.firestore.batch();

      // Save new transaction
      const transactionRef = this.firestore
        .collection(`${collection.users}/${user.uid}/${collection.walletTransactions}`)
        .doc(transaction.id)
        .ref;

      const sign = transaction.type !== 'income' ? 1 : -1;

      // Update source wallet
      const walletDoc = this.firestore
        .collection<Wallet>(`${collection.users}/${user.uid}/${collection.wallets}`)
        .doc(transaction.walletId);
      const walletSnapshot = await lastValueFrom(walletDoc.get());
      const wallet = {
        id: walletSnapshot.id, ...walletSnapshot.data()
      } as Wallet;
      wallet.balance += (transaction.sourceAmount * sign);
      batch.update(walletDoc.ref, wallet);

      // Update destination wallet
      if (transaction.type === 'transfer' && transaction.toWalletId) {
        const destinationWalletDoc = this.firestore
          .collection<Wallet>(`${collection.users}/${user.uid}/${collection.wallets}`)
          .doc(transaction.toWalletId);

        const destinationWalletSnapshot = await lastValueFrom(destinationWalletDoc.get());
        const destinationWallet = {
          id: destinationWalletSnapshot.id, ...destinationWalletSnapshot.data()
        } as Wallet;
        destinationWallet.balance += (transaction.destinationAmount * -1);
        batch.update(destinationWalletDoc.ref, destinationWallet);
      }

      batch.delete(transactionRef);
      return batch.commit();
    } catch (error) {
      console.error('Error al ejecutar el batch:', error);
    }
  }
}
