import { Routes } from '@angular/router';
import {LoginComponent} from '@components/auth/login/login.component';
import {authGuard} from './guards/auth.guard';
import {HomeComponent} from '@components/home/home.component';
import {LayoutComponent} from '@components/layout/layout/layout.component';
import {ExpensesComponent} from '@components/expenses/expenses/expenses.component';
import {BillsComponent} from '@components/bills/bills/bills.component';
import {BillFormComponent} from '@components/bills/bill-form/bill-form.component';
import {ExpenseFormComponent} from '@components/expenses/expense-form/expense-form.component';
import {WalletsComponent} from '@components/wallets/wallets/wallets.component';
import {WalletFormComponent} from '@components/wallets/wallet-form/wallet-form.component';
import {WalletTransactionsComponent} from '@components/wallets/wallet-transactions/wallet-transactions.component';
import {
  WalletTransactionFormComponent
} from '@components/wallets/wallet-transaction-form/wallet-transaction-form.component';

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
      { path: 'home', component: HomeComponent, title: 'Home' },
      { path: 'expenses', component: ExpensesComponent, title: 'Categorías de Gastos' },
      { path: 'expenses/create', component: ExpenseFormComponent, title: 'Crear categoría de Gastos' },
      { path: 'expenses/edit/:id', component: ExpenseFormComponent, title: 'Editar categorías de gastos' },
      { path: 'bills', component: BillsComponent, title: 'Cuentas por pagar' },
      { path: 'bills/create', component: BillFormComponent, title: 'Crear cuenta por pagar' },
      { path: 'bills/edit/:id', component: BillFormComponent, title: 'Editar cuenta por pagar' },
      { path: 'wallets', component: WalletsComponent, title: 'Billeteras' },
      { path: 'wallets/create', component: WalletFormComponent, title: 'Crear billetera' },
      { path: 'wallets/edit/:id', component: WalletFormComponent, title: 'Editar billetera' },
      { path: 'wallets/:id/transactions', component: WalletTransactionsComponent, title: 'Movimientos' },
      { path: 'wallets/:walletId/transactions/create', component: WalletTransactionFormComponent, title: 'Crear movimiento' },
      { path: 'wallets/:walletId/transactions/view/:id', component: WalletTransactionFormComponent, title: 'Ver movimiento' },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
