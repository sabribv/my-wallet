import { Routes } from '@angular/router';
import {LoginComponent} from '@components/auth/login/login.component';
import {authGuard} from './guards/auth.guard';
import {HomeComponent} from '@components/home/home.component';
import {LayoutComponent} from '@components/layout/layout/layout.component';
import {ExpensesComponent} from '@components/expenses/expenses/expenses.component';
import {BillsComponent} from '@components/bills/bills/bills.component';

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
      { path: 'expenses', component: ExpensesComponent },
      { path: 'bills', component: BillsComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
