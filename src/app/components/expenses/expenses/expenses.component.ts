import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseService } from '@services/expense.service';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {Observable} from 'rxjs';
import {Expense} from '@models/expense.model';
import {MatListModule} from '@angular/material/list';
import {RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatMenuModule} from '@angular/material/menu';
import {StatusIndicatorComponent} from '@components/misc/status-indicator/status-indicator.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    RouterLink,
    MatCardModule,
    MatMenuModule,
    StatusIndicatorComponent,
  ],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent {
  expenses$: Observable<Expense[]>;

  constructor(private dialog: MatDialog, private expenseService: ExpenseService) {
    this.expenses$ = this.expenseService.getAllExpenses();
  }

  deleteExpense(id: string | undefined): void {
    if (!id) {
      console.warn('El ID del bill no es válido');
      return;
    }
    this.expenseService.deleteExpense(id);
  }
}
