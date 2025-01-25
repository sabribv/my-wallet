import { Injectable } from '@angular/core';
import {catchError, lastValueFrom, map, Observable, of, switchMap} from 'rxjs';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AuthService} from '@services/auth.service';
import {collection} from '../constants/collections';
import {Exchange} from '@models/exchange.model';
import {WalletTransaction} from '@models/wallet-transaction.model';
import {Wallet} from '@models/wallet.model';

@Injectable({
  providedIn: 'root',
})
export class ExchangeService {
  constructor(private firestore: AngularFirestore, private authService: AuthService) {}

  getExchanges(): Observable<Exchange[]> {
    return this.authService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth) {
          return this.firestore
            .collection<Exchange>(`${collection.users}/${auth.uid}/${collection.exchanges}`)
            .valueChanges({idField: 'id'});
        } else {
          return of([]);
        }
      })
    );
  }

  getExchangeById(id: string): Observable<Exchange | null> {
    return  this.authService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth) {
          return this.firestore
            .collection<Exchange>(`${collection.users}/${auth.uid}/${collection.exchanges}`)
            .doc(id)
            .get()
            .pipe(
              map((doc) => {
                if (doc.exists) {
                  return {id: doc.id, ...doc.data()} as Exchange;
                } else {
                  return null;
                }
              }),
              catchError((error) => {
                console.error('Error fetching exchange:', error);
                return of(null);
              })
            );
        } else {
          return of(null);
        }
      })
    );
  }

  async addExchange(exchange: Exchange, createTransactions: boolean): Promise<void> {
    const user = await this.authService.getCurrentUser();

    try {
      if (createTransactions) {
        const batch = this.firestore.firestore.batch();

        const transactionsRef = this.firestore
          .collection(`${collection.users}/${user.uid}/${collection.walletTransactions}`)
          .ref;

        const exchangesRef = this.firestore
          .collection(`${collection.users}/${user.uid}/${collection.exchanges}`)
          .ref;

        const exchangeTransactions = [];
        const sourceTransactionDoc = transactionsRef.doc();
        const sourceTransaction: WalletTransaction = {
          id: sourceTransactionDoc.id,
          walletId: exchange.walletId,
          date: exchange.date,
          type: 'expense',
          sourceAmount: exchange.sourceAmount,
          destinationAmount: exchange.sourceAmount,
          fee: 0,
          currency: exchange.sourceCurrency,
          note: exchange.note,
        };
        batch.set(sourceTransactionDoc, sourceTransaction);
        exchangeTransactions.push(sourceTransaction.id);

        const sourceWalletDoc = this.firestore
          .collection<Wallet>(`${collection.users}/${user.uid}/${collection.wallets}`)
          .doc(exchange.walletId);

        const sourceWalletSnapshot = await lastValueFrom(sourceWalletDoc.get());
        const sourceWallet = {
          id: sourceWalletSnapshot.id, ...sourceWalletSnapshot.data()
        } as Wallet;
        sourceWallet.balance = sourceWallet.balance - exchange.sourceAmount;
        batch.update(sourceWalletDoc.ref, sourceWallet);

        if (exchange.toWalletId) {
          const destinationTransactionDoc = transactionsRef.doc();
          const destinationTransaction: WalletTransaction = {
            id: destinationTransactionDoc.id,
            walletId: exchange.toWalletId,
            date: exchange.date,
            type: 'income',
            sourceAmount: exchange.destinationAmount,
            destinationAmount: exchange.destinationAmount,
            fee: 0,
            currency: exchange.destinationCurrency,
            note: exchange.note,
          };
          batch.set(destinationTransactionDoc, destinationTransaction);
          exchangeTransactions.push(destinationTransaction.id);

          const destinationWalletDoc = this.firestore
            .collection<Wallet>(`${collection.users}/${user.uid}/${collection.wallets}`)
            .doc(exchange.toWalletId);

          const destinationWalletSnapshot = await lastValueFrom(destinationWalletDoc.get());
          const destinationWallet = {
            id: destinationWalletSnapshot.id, ...destinationWalletSnapshot.data()
          } as Wallet;
          destinationWallet.balance = destinationWallet.balance + exchange.destinationAmount;
          batch.update(destinationWalletDoc.ref, destinationWallet);
        }

        const exchangeDoc = exchangesRef.doc();
        const exchangeData = {
          ...exchange,
          transactions: exchangeTransactions,
        };

        batch.set(exchangeDoc, exchangeData);
        return batch.commit();
      } else {
        const id = this.firestore.createId();
        return this.firestore
          .collection(`${collection.users}/${user.uid}/${collection.exchanges}`)
          .doc(id)
          .set({...exchange, id});
      }
    } catch (error) {
      console.error('Error al ejecutar el batch:', error);
    }
  }

  async deleteExchange(exchange: Exchange): Promise<void> {
    const user = await this.authService.getCurrentUser();

    try {
      if (exchange.transactions.length > 0) {
        const batch = this.firestore.firestore.batch();

        const exchangeRef = this.firestore
          .collection(`${collection.users}/${user.uid}/${collection.exchanges}`)
          .doc(exchange.id)
          .ref;

        for(let i=0; i < exchange.transactions.length; i++) {
          const transactionDoc = this.firestore
            .collection<WalletTransaction>(`${collection.users}/${user.uid}/${collection.walletTransactions}`)
            .doc(exchange.transactions[i]);

          const transactionSnapshot = await lastValueFrom(transactionDoc.get());
          const transaction = {
            id: transactionSnapshot.id, ...transactionSnapshot.data()
          } as WalletTransaction;

          const walletDoc = this.firestore
            .collection<Wallet>(`${collection.users}/${user.uid}/${collection.wallets}`)
            .doc(transaction.walletId);

          const walletSnapshot = await lastValueFrom(walletDoc.get());
          const wallet = {
            id: walletSnapshot.id, ...walletSnapshot.data()
          } as Wallet;
          wallet.balance = wallet.balance + (transaction.sourceAmount * (transaction.type === 'income' ? -1 : 1));
          batch.update(walletDoc.ref, wallet);
          batch.delete(transactionDoc.ref);
        }

        batch.delete(exchangeRef);
        return batch.commit();
      } else {
        return this.firestore
          .collection(`${collection.users}/${user.uid}/${collection.exchanges}`)
          .doc(exchange.id)
          .delete();
      }
    } catch (error) {
      console.error('Error al ejecutar el batch:', error);
    }
  }
}
