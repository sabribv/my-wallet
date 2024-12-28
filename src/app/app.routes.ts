import { Routes } from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import {authGuard} from './auth/auth.guard';
import {HomeComponent} from './home/home.component';
import {LayoutComponent} from './layout/layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full',
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      // {
      //   path: 'profile',
      //   loadComponent: () =>
      //     import('./profile/profile.component').then((m) => m.ProfileComponent),
      // },
      // {
      //   path: 'settings',
      //   loadComponent: () =>
      //     import('./settings/settings.component').then(
      //       (m) => m.SettingsComponent
      //     ),
      // },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  // {
  //   path: 'home',
  //   component: HomeComponent,
  //   canActivate: [authGuard],
  // },
  // {
  //   path: '',
  //   redirectTo: '/home',
  //   pathMatch: 'full',
  // },
  {
    path: '**',
    redirectTo: '/login',
  },
];
