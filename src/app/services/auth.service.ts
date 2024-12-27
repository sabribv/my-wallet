import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  // Iniciar sesión con correo y contraseña
  login(email: string, password: string) {
    return from(this.afAuth.signInWithEmailAndPassword(email, password));
  }

  // Registrar un nuevo usuario
  register(email: string, password: string) {
    return from(this.afAuth.createUserWithEmailAndPassword(email, password));
  }

  // Cerrar sesión
  logout() {
    this.afAuth.signOut();
    this.router.navigate(['/login']);
  }

  // Obtener el estado de autenticación
  getAuthState() {
    return this.afAuth.authState;
  }
}
