import { Component } from '@angular/core';
import { ExpenseService } from '@services/expense.service';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {map, Observable} from 'rxjs';
import {Expense} from '@models/expense.model';
import {MatListModule} from '@angular/material/list';
import {RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatMenuModule} from '@angular/material/menu';
import {StatusIndicatorComponent} from '@components/misc/status-indicator/status-indicator.component';
import {MatProgressBar} from '@angular/material/progress-bar';

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
    MatProgressBar,
  ],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
})
export class ExpensesComponent {
  expenses$: Observable<Expense[]>;

  constructor(private expenseService: ExpenseService) {
    this.expenses$ = this.expenseService.getAllExpenses().pipe(
      map(expenses => expenses.sort((a,b) => a.name.localeCompare(b.name))),
    );
  }
}
