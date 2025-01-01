import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {ExpenseService} from '@services/expense.service';
import {ActivatedRoute, Router} from '@angular/router';
import {take} from 'rxjs';
import {MatSelectModule} from '@angular/material/select';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatSelectModule,
  ],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.scss'
})
export class ExpenseFormComponent implements OnInit {
  isEdit = false;
  expenseId!: string;
  expenseForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private expensesService: ExpenseService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.expenseForm = this.fb.group({
      name: ['', Validators.required],
      paymentType: ['debit', Validators.required],
      isFixed: [false],
    });
  }

  ngOnInit() {
    this.route.params.pipe(take(1)).subscribe((params) => {
      if (params['id']) {
        this.isEdit = true;
        this.expenseId = params['id'];
        this.loadExpenseData();
      }
    });
  }

  loadExpenseData() {
    this.expensesService.getExpenseById(this.expenseId).pipe(take(1)).subscribe((expense) => {
      if (expense) {
        this.expenseForm.patchValue(expense);
      }
    });
  }

  async onSubmit() {
    if (this.expenseForm.invalid) return;

    const expenseData = this.expenseForm.value;
    try {
      if (this.isEdit) {
        await this.expensesService.updateExpense(this.expenseId, expenseData);
      } else {
        await this.expensesService.addExpense(expenseData)
      }
    } finally {
      this.router.navigate(['/expenses']);
    }
  }

  onCancel() {
    this.router.navigate(['/expenses']);
  }
}
