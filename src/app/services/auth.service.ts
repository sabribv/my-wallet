import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private router: Router) {
    this.afAuth.setPersistence('local')
      .catch((error) => {
        console.error('Error setting persistence: ', error);
      });
  }

  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  register(email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  logout() {
    this.afAuth.signOut();
    this.router.navigate(['/login']);
  }

  getAuthState() {
    return this.afAuth.authState;
  }

  getCurrentUser() {
    return this.afAuth.currentUser
      .then((user) => {
        if (!user) {
          throw new Error('No user is logged in');
        }
        return user;
      });
  }
}
