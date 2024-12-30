import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { BillsService } from '@services/bill.service';
import moment from 'moment';
import { BillWithExpense } from '@models/bill.model';
import {map, Observable, tap} from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatListModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  overdueBills: BillWithExpense[] = [];
  upcomingBills: BillWithExpense[] = [];
  today: moment.Moment = moment();
  bills$: Observable<BillWithExpense[]>;

  constructor(private billsService: BillsService) {
    this.bills$ = this.billsService.getBillsWithExpenses().pipe(
      map((bills) => {
        // Filtrar las bills no pagadas
        const unpaidBills = bills.filter((bill) => !bill.isPaid);

        // Clasificar las bills
        this.overdueBills = unpaidBills.filter((bill) =>
          moment(bill.dueDate).isBefore(this.today, 'day')
        );

        this.upcomingBills = unpaidBills.filter((bill) =>
          moment(bill.dueDate).isSameOrAfter(this.today)
        );

        return bills;
      })
    );
  }
}
