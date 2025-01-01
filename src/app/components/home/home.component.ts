import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { BillsService } from '@services/bill.service';
import moment from 'moment';
import { BillWithExpense } from '@models/bill.model';
import { map, Observable, shareReplay } from 'rxjs';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatListModule, MatCardModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  today: moment.Moment = moment();
  overdueBills$: Observable<BillWithExpense[]>;
  upcomingBills$: Observable<BillWithExpense[]>;

  constructor(private billsService: BillsService) {
    const bills$ = this.billsService.getBillsWithExpenses().pipe(
      map(bills => bills.filter((bill) => !bill.isPaid)),
      shareReplay(1)
    );

    this.overdueBills$ = bills$.pipe(
      map(bills => bills.filter((bill) =>
        moment(bill.dueDate).isBefore(this.today, 'day')
      ))
    );

    this.upcomingBills$ = bills$.pipe(
      map(bills => bills.filter((bill) =>
        moment(bill.dueDate).isSameOrAfter(this.today)
      ))
    );
  }
}
