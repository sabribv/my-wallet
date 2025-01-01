import { Routes } from '@angular/router';
import {LoginComponent} from '@components/auth/login/login.component';
import {authGuard} from './guards/auth.guard';
import {HomeComponent} from '@components/home/home.component';
import {LayoutComponent} from '@components/layout/layout/layout.component';
import {ExpensesComponent} from '@components/expenses/expenses/expenses.component';
import {BillsComponent} from '@components/bills/bills/bills.component';
import {BillFormComponent} from '@components/bills/bill-form/bill-form.component';
import {ExpenseFormComponent} from '@components/expenses/expense-form/expense-form.component';

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
      { path: 'expenses/create', component: ExpenseFormComponent },
      { path: 'expenses/edit/:id', component: ExpenseFormComponent },
      { path: 'bills', component: BillsComponent },
      { path: 'bills/create', component: BillFormComponent },
      { path: 'bills/edit/:id', component: BillFormComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
