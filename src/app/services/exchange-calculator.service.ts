import { Injectable } from '@angular/core';
import {catchError, lastValueFrom, map, Observable, of, switchMap} from 'rxjs';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AuthService} from '@services/auth.service';
import {collection} from '../constants/collections';
import {WalletTransaction} from '@models/wallet-transaction.model';
import {Wallet} from '@models/wallet.model';
import {ExchangeCalculator} from '@models/exchange-calculator.model';

@Injectable({
  providedIn: 'root',
})
export class ExchangeCalculatorService {
  constructor(private firestore: AngularFirestore, private authService: AuthService) {}

  getCalculations(): Observable<ExchangeCalculator[]> {
    return this.authService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth) {
          return this.firestore
            .collection<ExchangeCalculator>(`${collection.users}/${auth.uid}/${collection.exchangeCalculators}`)
            .valueChanges({idField: 'id'});
        } else {
          return of([]);
        }
      })
    );
  }

  getCalculationById(id: string): Observable<ExchangeCalculator | null> {
    return  this.authService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth) {
          return this.firestore
            .collection<ExchangeCalculator>(`${collection.users}/${auth.uid}/${collection.exchangeCalculators}`)
            .doc(id)
            .get()
            .pipe(
              map((doc) => {
                if (doc.exists) {
                  return {id: doc.id, ...doc.data()} as ExchangeCalculator;
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

  async addCalc(calc: ExchangeCalculator, createTransactions: boolean): Promise<void> {
    const user = await this.authService.getCurrentUser();

    try {
      if (createTransactions) {
        const batch = this.firestore.firestore.batch();

        const calculationsRef = this.firestore
          .collection(`${collection.users}/${user.uid}/${collection.exchangeCalculators}`)
          .ref;

        const transactionsRef = this.firestore
          .collection(`${collection.users}/${user.uid}/${collection.walletTransactions}`)
          .ref;

        const transactions = [];
        const sourceTransactionDoc = transactionsRef.doc();
        const sourceTransaction: WalletTransaction = {
          id: sourceTransactionDoc.id,
          walletId: calc.walletId ?? '',
          date: calc.date,
          type: 'expense',
          sourceAmount: calc.amount,
          destinationAmount: calc.amount,
          fee: 0,
          currency: 'USD',
          note: calc.note,
        };
        batch.set(sourceTransactionDoc, sourceTransaction);
        transactions.push(sourceTransaction.id);

        const sourceWalletDoc = this.firestore
          .collection<Wallet>(`${collection.users}/${user.uid}/${collection.wallets}`)
          .doc(calc.walletId);

        const sourceWalletSnapshot = await lastValueFrom(sourceWalletDoc.get());
        const sourceWallet = {
          id: sourceWalletSnapshot.id, ...sourceWalletSnapshot.data()
        } as Wallet;
        sourceWallet.balance = sourceWallet.balance - sourceTransaction.sourceAmount;
        batch.update(sourceWalletDoc.ref, sourceWallet);

        if (calc.toWalletId) {
          const destinationTransactionDoc = transactionsRef.doc();
          const destinationTransaction: WalletTransaction = {
            id: destinationTransactionDoc.id,
            walletId: calc.toWalletId,
            date: calc.date,
            type: 'income',
            sourceAmount: calc.netAmount,
            destinationAmount: calc.netAmount,
            fee: 0,
            currency: 'USD',
            note: calc.note,
          };
          batch.set(destinationTransactionDoc, destinationTransaction);
          transactions.push(destinationTransaction.id);

          const destinationWalletDoc = this.firestore
            .collection<Wallet>(`${collection.users}/${user.uid}/${collection.wallets}`)
            .doc(calc.toWalletId);

          const destinationWalletSnapshot = await lastValueFrom(destinationWalletDoc.get());
          const destinationWallet = {
            id: destinationWalletSnapshot.id, ...destinationWalletSnapshot.data()
          } as Wallet;
          destinationWallet.balance = destinationWallet.balance + destinationTransaction.sourceAmount;
          batch.update(destinationWalletDoc.ref, destinationWallet);
        }

        const calcDoc = calculationsRef.doc();
        const calcData = {
          ...calc,
          transactions,
          date: calc.date,
        };
        batch.set(calcDoc, calcData);

        return batch.commit();
      } else {
        const id = this.firestore.createId();
        return this.firestore
          .collection(`${collection.users}/${user.uid}/${collection.exchangeCalculators}`)
          .doc(id)
          .set({...calc, id});
      }
    } catch (error) {
      console.error('Error al ejecutar el batch:', error);
    }
  }

  async deleteCalc(exchangeCalculator: ExchangeCalculator): Promise<void> {
    const user = await this.authService.getCurrentUser();

    try {
      if (exchangeCalculator.transactions.length > 0) {
        const batch = this.firestore.firestore.batch();

        const calculationsRef = this.firestore
          .collection(`${collection.users}/${user.uid}/${collection.exchangeCalculators}`)
          .doc(exchangeCalculator.id)
          .ref;

        for(let i=0; i < exchangeCalculator.transactions.length; i++) {
          const transactionDoc = this.firestore
            .collection<WalletTransaction>(`${collection.users}/${user.uid}/${collection.walletTransactions}`)
            .doc(exchangeCalculator.transactions[i]);

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

        batch.delete(calculationsRef);
        return batch.commit();
      } else {
        return this.firestore
          .collection(`${collection.users}/${user.uid}/${collection.exchangeCalculators}`)
          .doc(exchangeCalculator.id)
          .delete();
      }
    } catch (error) {
      console.error('Error al ejecutar el batch:', error);
    }
  }
}
