import { Routes } from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import {authGuard} from './auth/auth.guard';
import {HomeComponent} from './home/home.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent, // Página de login
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent, // Página principal
    canActivate: [authGuard], // Solo puede acceder si está autenticado
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: '**', // Ruta comodín para redirigir a login si no se encuentra la ruta
    redirectTo: '/login',
  },
];
