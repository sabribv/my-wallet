import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {catchError, lastValueFrom, map, Observable, of, switchMap} from 'rxjs';
import {AuthService} from '@services/auth.service';
import {collection} from '../constants/collections';
import {Wallet} from '@models/wallet.model';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  constructor(private firestore: AngularFirestore, private authService: AuthService) {}

  async addWallet(wallet: Wallet): Promise<void> {
    const user = await this.authService.getCurrentUser();
    const id = this.firestore.createId();

    return this.firestore
      .collection(`${collection.users}/${user.uid}/${collection.wallets}`)
      .doc(id)
      .set({ ...wallet, id });
  }

  getAllWallets(): Observable<Wallet[]> {
    return  this.authService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth) {
          return this.firestore
            .collection<Wallet>(`${collection.users}/${auth.uid}/${collection.wallets}`)
            .valueChanges({idField: 'id'});
        } else {
          return of([]);
        }
      })
    )
  }

  getWalletById(id: string): Observable<Wallet | null> {
    return this.authService.getAuthState().pipe(
      switchMap((auth) => {
        if (auth) {
          return this.firestore
            .collection<Wallet>(`${collection.users}/${auth.uid}/${collection.wallets}`)
            .doc(id)
            .get()
            .pipe(
              map((doc) => {
                if (doc.exists) {
                  return {id: doc.id, ...doc.data()} as Wallet;
                } else {
                  return null;
                }
              }),
              catchError((error) => {
                console.error('Error fetching wallet:', error);
                return of(null);
              })
            );
        } else {
          return of(null);
        }
      })
    )
  }

  async updateWallet(id: string, wallet: Wallet): Promise<void> {
    const user = await this.authService.getCurrentUser();

    return this.firestore
      .collection(`${collection.users}/${user.uid}/${collection.wallets}`)
      .doc(id)
      .update(wallet);
  }

  async updateWalletBalance(walletId: string, amount: number): Promise<void> {
    const user = await this.authService.getCurrentUser();
    const walletDoc = this.firestore
      .collection<Wallet>(`${collection.users}/${user.uid}/${collection.wallets}`)
      .doc(walletId);

    return lastValueFrom(walletDoc.get()).then((doc) => {
      if (doc.exists) {
        const currentBalance = doc.data()?.balance || 0;
        const newBalance = currentBalance + amount;

        return walletDoc.update({ balance: newBalance });
      } else {
        throw new Error('Wallet not found!');
      }
    });
  }

  async deleteWallet(id: string): Promise<void> {
    const user = await this.authService.getCurrentUser();

    return this.firestore
      .collection(`${collection.users}/${user.uid}/${collection.wallets}`)
      .doc(id)
      .delete();
  }
}
