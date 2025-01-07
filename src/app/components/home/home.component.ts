import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { BillsService } from '@services/bill.service';
import moment from 'moment';
import { BillWithExpense } from '@models/bill.model';
import {combineLatest, map, Observable, shareReplay} from 'rxjs';
import {MatCardModule} from '@angular/material/card';
import {MetricComponent} from '@components/misc/metric/metric.component';
import {LayoutService} from '@services/layout.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatListModule, MatCardModule, MetricComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  today: moment.Moment = moment();
  overdueBills$: Observable<BillWithExpense[]>;
  upcomingBills$: Observable<BillWithExpense[]>;
  metrics$: Observable<{
    total: number,
    overdue: number,
    upcoming: number,
  }>;
  isMobile$: Observable<boolean>;

  constructor(private billsService: BillsService, private layoutService: LayoutService) {
    this.isMobile$ = this.layoutService.isHandset$;

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

    this.metrics$ = combineLatest([this.overdueBills$, this.upcomingBills$]).pipe(
      map(([overdueBills, upcomingBills]) => {
        const overdue = overdueBills.reduce((acc, current) => acc + current.amount, 0);
        const upcoming = upcomingBills.reduce((acc, current) => acc + current.amount, 0);

        return {
          total: overdue + upcoming,
          overdue,
          upcoming,
        }
      })
    )
  }
}
