import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {inject} from '@angular/core';
import {map} from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Se inyecta el servicio de autenticación
  const router = inject(Router); // Se inyecta el router para redirigir si no está autenticado

  // Verificamos el estado del usuario antes de permitir la navegación
  return authService.getAuthState().pipe(
    map(user => {
      if (user) {
        // El usuario está autenticado, se puede acceder a la ruta
        return true;
      } else {
        // El usuario no está autenticado, se redirige al login
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
