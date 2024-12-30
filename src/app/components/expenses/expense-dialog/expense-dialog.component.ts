import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { Expense } from '@models/expense.model';

@Component({
  selector: 'app-expense-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
  ],
  templateUrl: './expense-dialog.component.html',
  styleUrl: './expense-dialog.component.scss'
})
export class ExpenseDialogComponent {
  expenseForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExpenseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Expense | null
  ) {
    this.expenseForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      paymentType: [data?.paymentType || 'cash', Validators.required],
      isFixed: [data?.isFixed || false],
    });
  }

  save(): void {
    if (this.expenseForm.valid) {
      this.dialogRef.close({
        id: this.data?.id,
        ...this.expenseForm.value
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
