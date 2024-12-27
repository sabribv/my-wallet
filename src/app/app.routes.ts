import { Routes } from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import {authGuard} from './auth/auth.guard';
import {HomeComponent} from './home/home.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
