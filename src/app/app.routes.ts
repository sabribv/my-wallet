import { Routes } from '@angular/router';
import {LoginComponent} from './auth/login/login.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login', // Redirigir a login por defecto
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent, // Ruta para el login
  },
];
