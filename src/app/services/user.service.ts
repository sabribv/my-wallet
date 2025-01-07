import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AuthService} from '@services/auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userCollection = 'users';
  private tokensCollection = 'tokens';

  constructor(private firestore: AngularFirestore, private authService: AuthService) {}

  async updateToken(userId: string, token: string) {
    const tokenRef = this.firestore
      .collection(this.userCollection)
      .doc(userId)
      .collection(this.tokensCollection)
      .doc(token);

    try {
      await tokenRef.set({
        token,
        device: navigator.userAgent,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error al guardar el token:', error);
    }
  }
}
