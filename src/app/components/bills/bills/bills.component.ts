import {Component, ViewChild} from '@angular/core';
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
import {MetricComponent} from '@components/misc/metric/metric.component';
import {LayoutService} from '@services/layout.service';
import {Expense} from '@models/expense.model';
import {InfoPanelComponent} from '@components/misc/info-panel/info-panel.component';
import {MatProgressBar} from '@angular/material/progress-bar';

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
    MetricComponent,
    StatusIndicatorComponent,
    RouterModule,
    InfoPanelComponent,
    MatProgressBar,
  ],
  providers: [provideMomentDateAdapter(MY_FORMATS),],
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.scss'],
})
export class BillsComponent {
  @ViewChild('picker') picker!: MatDatepicker<moment.Moment>;

  today = moment().startOf('day').valueOf();
  cashBills$: Observable<BillWithExpense[]>;
  debitBills$: Observable<BillWithExpense[]>;
  expensesWithNoBills$: Observable<string | undefined>;
  showEmptyState$: Observable<boolean>;
  selectedDate: moment.Moment = moment();
  selectedDate$: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment());
  metrics$: Observable<{
    total: number,
    cash: number,
    debit: number,
    pending: number,
  }>;
  isMobile$: Observable<boolean>;

  constructor(private layoutService: LayoutService,
              private billsService: BillsService,
              private expensesService: ExpenseService) {
    this.isMobile$ = this.layoutService.isHandset$;

    const bills$ = combineLatest([
      this.selectedDate$.pipe(
        switchMap(date => {
          return this.billsService.getBills().pipe(
            map((bills: Bill[]) => {
              const filteredBills = bills.filter(bill =>
                bill.dueDate >= date.startOf('month').valueOf() &&
                bill.dueDate <= date.endOf('month').valueOf());

              return filteredBills.sort((a, b) =>  a.dueDate - b.dueDate)
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

    this.metrics$ = combineLatest([bills$, this.cashBills$, this.debitBills$]).pipe(
      map(([bills, cash, debit]) => {
        return {
          total: bills.reduce((acc, current) => acc + current.amount, 0),
          cash: cash.reduce((acc, current) => acc + current.amount, 0),
          debit: debit.reduce((acc, current) => acc + current.amount, 0),
          pending: bills
            .filter((bill) => !bill.isPaid)
            .reduce((acc, current) => acc + current.amount, 0),
        }
      })
    );

    this.expensesWithNoBills$ = this.selectedDate$.pipe(
      switchMap((date) => this.billsService.getExpensesWithNoBills(date.month(), date.year())),
      map((expenses: Expense[] | null) => expenses?.map((expense: Expense) => expense.name).join(', ')),
    );

    this.showEmptyState$ = bills$.pipe(map(bills => !bills.length));
  }

  openPicker() {
    this.picker.open();
  }

  selectMonthAndYear(normalizedMonth: moment.Moment, datepicker: MatDatepicker<moment.Moment>): void {
    this.selectedDate = normalizedMonth.clone();
    datepicker.close();
    this.selectedDate$.next(this.selectedDate);
  }

  previousMonth() {
    this.selectedDate.subtract(1, 'month');
    this.selectedDate$.next(this.selectedDate);
  }

  nextMonth() {
    this.selectedDate.add(1, 'month');
    this.selectedDate$.next(this.selectedDate);
  }
}
