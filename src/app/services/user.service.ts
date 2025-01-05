import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AuthService} from '@services/auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userCollection = 'users';

  constructor(private firestore: AngularFirestore, private authService: AuthService) {}

  async updateToken(userId: string, token: string) {
    const userRef = this.firestore.collection(this.userCollection).doc(userId);
    await userRef.set(
      { pushToken: token },
      { merge: true }
    );
  }
}
