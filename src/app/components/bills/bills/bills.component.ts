import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {combineLatest, map, Observable} from 'rxjs';
import {Bill, BillWithExpense} from '@models/bill.model';
import { BillsService } from '@services/bill.service';
import { BillDialogComponent } from '@components/bills/bill-dialog/bill-dialog.component';
import {AsyncPipe, NgFor, DatePipe, CurrencyPipe, CommonModule} from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {ExpenseService} from '@services/expense.service';
import {MatTableModule} from '@angular/material/table';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    DatePipe,
    CurrencyPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.scss'],
})
export class BillsComponent {
  displayedColumns: string[] = ['name', 'paymentType', 'amount', 'dueDate', 'status', 'actions'];
  bills$: Observable<BillWithExpense[]>;

  constructor(private dialog: MatDialog, private billsService: BillsService, private expensesService: ExpenseService) {
    this.bills$ = combineLatest([
      this.billsService.getBills(),
      this.expensesService.getAllExpenses(),
    ]).pipe(
      map(([bills, expenses]) => {
        const expenseMap = new Map(expenses.map(exp => [exp.id, exp]));
        return bills.map(bill => ({
          ...bill,
          expense: expenseMap.get(bill.expenseId), // Asocia la Expense a cada Bill
        }));
      })
    );
  }

  openBillDialog(bill?: Bill): void {
    const dialogRef = this.dialog.open(BillDialogComponent, {
      data: bill || null,
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (bill?.id) {
          this.billsService.updateBill(bill.id, result);
        } else {
          this.billsService.addBill(result);
        }
      }
    });
  }

  deleteBill(id: string | undefined): void {
    if (!id) {
      console.warn('El ID del bill no es válido');
      return;
    }
    this.billsService.deleteBill(id);
  }
}
