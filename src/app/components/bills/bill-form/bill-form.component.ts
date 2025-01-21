import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {Observable, take} from 'rxjs';
import {Expense} from '@models/expense.model';
import {ExpenseService} from '@services/expense.service';
import {ActivatedRoute, Router} from '@angular/router';
import {BillsService} from '@services/bill.service';
import moment from 'moment';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {MatCardModule} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {ConfirmDialogService} from '@components/misc/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-bill-form',
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
    MatMomentDateModule,
    MatCardModule,
    MatIcon,
  ],
  templateUrl: './bill-form.component.html',
  styleUrl: './bill-form.component.scss'
})
export class BillFormComponent implements OnInit {
  isEdit = false;
  billId!: string;
  billForm: FormGroup;
  expenses$: Observable<Expense[]>;

  constructor(
    private fb: FormBuilder,
    private expensesService: ExpenseService,
    private billService: BillsService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmDialogService: ConfirmDialogService
  ) {
    this.billForm = this.fb.group({
      expenseId: ['', Validators.required],
      dueDate: [moment(), Validators.required],
      amount: [0, Validators.required],
      isPaid: [false],
    });

    this.expenses$ = this.expensesService.getAllExpenses();
  }

  ngOnInit() {
    this.route.params.pipe(take(1)).subscribe((params) => {
      if (params['id']) {
        this.isEdit = true;
        this.billId = params['id'];
        this.loadBillData();
      }
    });
  }

  loadBillData() {
    this.billService.getBillById(this.billId).pipe(take(1)).subscribe((bill) => {
      if (bill) {
        const value = {
          ...bill,
          dueDate: moment(bill.dueDate),
        }
        this.billForm.patchValue(value);
      }
    });
  }

  async onSubmit() {
    if (this.billForm.invalid) return;

    const billData = {
      ...this.billForm.value,
      dueDate: this.billForm.value.dueDate.valueOf(),
    };

    try {
      if (this.isEdit) {
        await this.billService.updateBill(this.billId, billData);
      } else {
        await this.billService.addBill(billData)
      }
    } finally {
      this.router.navigate(['/bills']);
    }
  }

  async deleteBill(id: string | undefined): Promise<void> {
    if (!id) {
      console.warn('El ID del bill no es válido');
      return;
    }

    const confirmed = await this.confirmDialogService.confirm(
      'Esta acción eliminará la cuenta a pagar.',
      'Eliminar'
    );

    if (confirmed) {
      await this.billService.deleteBill(id);
      await this.router.navigate(['/bills']);
    }
  }

  onCancel() {
    this.router.navigate(['/bills']);
  }
}
