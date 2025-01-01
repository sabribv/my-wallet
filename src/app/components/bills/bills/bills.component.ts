import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {BehaviorSubject, combineLatest, map, Observable, shareReplay, switchMap} from 'rxjs';
import {Bill, BillWithExpense} from '@models/bill.model';
import { BillsService } from '@services/bill.service';
import { CommonModule} from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {ExpenseService} from '@services/expense.service';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import moment from 'moment';
import {MatMenuModule} from '@angular/material/menu';
import {StatusIndicatorComponent} from '@components/misc/status-indicator/status-indicator.component';
import {MatDatepicker, MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter';
import {RouterModule} from '@angular/router';

const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatChipsModule,
    MatIconModule,
    MatMenuModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    StatusIndicatorComponent,
    RouterModule,
  ],
  providers: [provideMomentDateAdapter(MY_FORMATS),],
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.scss'],
})
export class BillsComponent {
  today = moment().endOf('day').valueOf();
  cashBills$: Observable<BillWithExpense[]>;
  debitBills$: Observable<BillWithExpense[]>;
  selectedDate: moment.Moment | null = moment();
  selectedDate$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment());

  constructor(private dialog: MatDialog, private billsService: BillsService, private expensesService: ExpenseService) {
    const bills$ = combineLatest([
      this.selectedDate$.pipe(
        switchMap(date => {
          return this.billsService.getBills().pipe(
            map((bills: Bill[]) => {
              const filteredBills = bills.filter(bill =>
                bill.dueDate >= date.startOf('month').valueOf() &&
                bill.dueDate <= date.endOf('month').valueOf());

              return filteredBills.sort((a, b) => b.dueDate - a.dueDate)
            }),
          )
        })
      ),
      this.expensesService.getAllExpenses(),
    ]).pipe(
      map(([bills, expenses]) => {
        const expenseMap = new Map(expenses.map(exp => [exp.id, exp]));
        return bills.map(bill => ({
          ...bill,
          expense: expenseMap.get(bill.expenseId), // Asocia la Expense a cada Bill
        }));
      }),
      shareReplay(1)
    );

    this.cashBills$ = bills$.pipe(
      map((bills) =>
        bills.filter(bill => (bill.expense?.paymentType === 'cash')))
    );

    this.debitBills$ = bills$.pipe(
      map((bills) =>
        bills.filter(bill => (bill.expense?.paymentType === 'debit')))
    );
  }

  selectMonthAndYear(normalizedMonth: moment.Moment, datepicker: MatDatepicker<moment.Moment>): void {
    this.selectedDate = normalizedMonth.clone(); // Guardamos el mes y año seleccionados
    datepicker.close(); // Cerramos el selector
    this.selectedDate$.next(this.selectedDate);
  }

  deleteBill(id: string | undefined): void {
    if (!id) {
      console.warn('El ID del bill no es válido');
      return;
    }
    this.billsService.deleteBill(id);
  }
}
