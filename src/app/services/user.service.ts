import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AuthService} from '@services/auth.service';
import {collection} from '../constants/collections';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private firestore: AngularFirestore, private authService: AuthService) {}

  async updateToken(userId: string, token: string) {
    const tokenRef = this.firestore
      .collection(collection.users)
      .doc(userId)
      .collection(collection.tokens)
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
