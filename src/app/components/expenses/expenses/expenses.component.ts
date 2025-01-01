import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseDialogComponent } from '@components/expenses/expense-dialog/expense-dialog.component';
import { ExpenseService } from '@services/expense.service';
import {CommonModule} from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {Observable, take} from 'rxjs';
import {Expense} from '@models/expense.model';
import {MatListModule} from '@angular/material/list';
import {RouterLink} from '@angular/router';
import {MatCard, MatCardContent, MatCardHeader, MatCardModule, MatCardTitle} from '@angular/material/card';
import {MatMenu, MatMenuContent, MatMenuItem, MatMenuModule} from '@angular/material/menu';
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

  openDialog(expense?: any): void {
    const dialogRef = this.dialog.open(ExpenseDialogComponent, {
      data: expense || null,
      width: '400px',
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe((result) => {
      if (result) {
        if (result.id) {
          this.expenseService.updateExpense(result.id, result);
        } else {
          this.expenseService.addExpense(result);
        }
      }
    });
  }

  deleteExpense(id: string | undefined): void {
    if (!id) {
      console.warn('El ID del bill no es válido');
      return;
    }
    this.expenseService.deleteExpense(id);
  }
}
