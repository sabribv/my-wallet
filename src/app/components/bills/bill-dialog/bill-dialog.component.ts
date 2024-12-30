import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Expense } from '@models/expense.model';
import { ExpenseService } from '@services/expense.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import moment from 'moment';

@Component({
  selector: 'app-bill-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './bill-dialog.component.html',
  styleUrls: ['./bill-dialog.component.scss'],
})
export class BillDialogComponent {
  billForm: FormGroup;
  expenses$: Observable<Expense[]>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BillDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private expensesService: ExpenseService
  ) {
    this.expenses$ = this.expensesService.getAllExpenses();

    this.billForm = this.fb.group({
      expenseId: [data?.expenseId || '', Validators.required],
      dueDate: [data?.dueDate ? moment(data.dueDate) : '', Validators.required],
      amount: [data?.amount || 0, Validators.required],
      isPaid: [data?.isPaid || false],
    });
  }

  save(): void {
    if (this.billForm.valid) {
      this.dialogRef.close({
        ...this.billForm.value,
        dueDate: this.billForm.value.dueDate.valueOf(), // Convierte Moment a timestamp
      });

    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
