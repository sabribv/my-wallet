import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import {BehaviorSubject, from, map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private router: Router) {
    // Configurar la persistencia al iniciar el servicio
    this.afAuth.setPersistence('local')  // Esto asegura que la sesión persista en localStorage
      .catch((error) => {
        console.error('Error setting persistence: ', error);
      });
  }

  // Iniciar sesión con correo y contraseña
  login(email: string, password: string): Observable<any> {
    return from(this.afAuth.signInWithEmailAndPassword(email, password));
  }

  // Registrar un nuevo usuario
  register(email: string, password: string): Observable<any> {
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

  // Verificar si el usuario está autenticado
  isAuthenticated(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      map(user => !!user)  // Devuelve true si el usuario está autenticado, false si no
    );
  }
}
