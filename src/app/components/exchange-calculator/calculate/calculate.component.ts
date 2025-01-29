import {Component, model, OnDestroy, OnInit, signal} from '@angular/core';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {AsyncPipe, DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {map, Observable, Subject, take, takeUntil} from 'rxjs';
import {
  MatAccordion, MatExpansionModule,
} from '@angular/material/expansion';
import {MatButton, MatIconButton} from '@angular/material/button';
import {WalletService} from '@services/wallet.service';
import {Wallet} from '@models/wallet.model';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatCheckbox, MatCheckboxChange} from '@angular/material/checkbox';
import {ExchangeCalculatorService} from '@services/exchange-calculator.service';
import {ActivatedRoute, Router} from '@angular/router';
import moment from 'moment';
import {MatIcon} from '@angular/material/icon';
import {ConfirmDialogService} from '@components/misc/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-calculate',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    MatLabel,
    MatSuffix,
    DecimalPipe,
    ReactiveFormsModule,
    MatAccordion,
    MatExpansionModule,
    MatButton,
    NgIf,
    AsyncPipe,
    MatOption,
    MatSelect,
    NgForOf,
    MatCheckbox,
    FormsModule,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './calculate.component.html',
  styleUrl: './calculate.component.scss'
})
export class CalculateComponent implements OnInit, OnDestroy {
  isEdit = false;
  calcId!: string;
  arsForm: FormGroup;
  usdForm: FormGroup;
  transactionsForm: FormGroup;
  wallets$!: Observable<Wallet[]>;
  readonly saveTransactions = model(true);

  totalExpensesArs= signal(0);
  totalExpensesUsd= signal(0);
  exchangeAmount = signal(0);
  step = signal(0);

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private exchangeCalculatorService: ExchangeCalculatorService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmDialogService: ConfirmDialogService
    ) {
    this.arsForm = this.fb.group({
      cashExpenses: [0, [Validators.required]],
      billing: [0, [Validators.required]],
      extra: [0, Validators.required],
      rate: [0, [Validators.required, Validators.min(1)]],
      expenses: [0, [Validators.required, Validators.min(1)]],
    });

    this.usdForm = this.fb.group({
      netAmount: [0, [Validators.required, Validators.min(1)]],
      commission: [0, Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
    });

    this.transactionsForm = this.fb.group({
      walletId: ['', Validators.required],
      toWalletId: ['', Validators.required],
      note: ['', Validators.required],
      transactions: [[]],
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe((params) => {
      if (params['id']) {
        this.isEdit = true;
        this.calcId = params['id'];
        this.loadCalcData();
      }
    });

    this.wallets$ = this.walletService.getAllWallets().pipe(
      map(wallets => wallets.filter(wallet => wallet.currency === 'USD')),
    );

    this.arsForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(calculator => {
      const totalExpenses = calculator.cashExpenses + calculator.billing + calculator.extra;
      const rate = calculator.rate ?? 0;
      const usdExpenses = +(rate ? totalExpenses / rate : 0).toFixed(2);

      this.totalExpensesArs.set(totalExpenses);
      this.totalExpensesUsd.set(usdExpenses);

      this.arsForm.patchValue({
        expenses: usdExpenses,
      }, { emitEvent: false });
    });

    this.usdForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(calculator => {
      const amount = +(calculator.netAmount / (1 - (calculator.commission / 100))).toFixed(2);
      this.exchangeAmount.set(amount);

      this.usdForm.patchValue({
        amount: amount,
      }, { emitEvent: false });
    });
  }

  onCancel() {
    this.router.navigate(['/calculator']);
  }

  loadCalcData() {
    this.exchangeCalculatorService.getCalculationById(this.calcId).pipe(take(1)).subscribe((calc) => {
      if (calc) {
        this.arsForm.patchValue({
          ...calc,
        }, { emitEvent: false });
        this.arsForm.disable();
        this.totalExpensesArs.set(calc.cashExpenses + calc.billing + calc.extra);
        this.totalExpensesUsd.set(+(calc.rate ? this.totalExpensesArs() / calc.rate : 0).toFixed(2));

        this.usdForm.patchValue({
          ...calc,
        }, { emitEvent: false });
        this.usdForm.disable();
        this.exchangeAmount.set(calc.amount);

        this.transactionsForm.patchValue({
          ...calc,
        }, { emitEvent: false });
        this.transactionsForm.disable();
        this.saveTransactions.set(!!calc.transactions.length);
      }
    });
  }

  setStep(index: number) {
    this.step.set(index);

    if (this.step() === 1) {
      this.usdForm.patchValue({
        netAmount: Math.ceil(this.arsForm.value.expenses / 100) * 100,
      });
    }
  }

  nextStep() {
    this.setStep(this.step() + 1);
  }

  prevStep() {
    this.setStep(this.step() - 1);
  }

  onSaveTransactionsChange(event: MatCheckboxChange){
    let disableWalletFields = !event.checked;

    if (disableWalletFields) {
      this.transactionsForm.patchValue({
        walletId: '',
        toWalletId: '',
      });
      this.transactionsForm.controls['walletId'].disable({ emitEvent: false });
      this.transactionsForm.controls['toWalletId'].disable({ emitEvent: false });
      this.transactionsForm.controls['walletId'].clearValidators();
      this.transactionsForm.controls['toWalletId'].clearValidators();

    } else {
      this.transactionsForm.controls['walletId'].enable({ emitEvent: false });
      this.transactionsForm.controls['toWalletId'].enable({ emitEvent: false });
      this.transactionsForm.controls['walletId'].addValidators(Validators.required);
      this.transactionsForm.controls['toWalletId'].addValidators(Validators.required);
    }

    this.transactionsForm.controls['walletId'].updateValueAndValidity({ emitEvent: false });
    this.transactionsForm.controls['toWalletId'].updateValueAndValidity({ emitEvent: false });
    this.transactionsForm.updateValueAndValidity();
  }

  async delete(id: string) {
    const calc = {
      id,
      ...this.arsForm.getRawValue(),
      ...this.usdForm.getRawValue(),
      ...this.transactionsForm.getRawValue()
    };

    if (!calc.id) {
      console.warn('El ID de cálculo no es válido');
      return;
    }

    const confirmed = await this.confirmDialogService.confirm(
      'Esta acción eliminará el cálculo de cambio y las transacciones asociadas.',
      'Eliminar'
    );

    if (confirmed) {
      await this.exchangeCalculatorService.deleteCalc(calc);
      await this.router.navigate(['/calculator']);
    }
  }

  async onSubmit() {
    if (this.arsForm.invalid || this.usdForm.invalid || this.transactionsForm.invalid) return;

    const calcData = {
      ...this.arsForm.getRawValue(),
      ...this.usdForm.getRawValue(),
      ...this.transactionsForm.getRawValue(),
      date: moment().valueOf(),
    };

    try {
      await this.exchangeCalculatorService.addCalc(calcData, this.saveTransactions())
    } finally {
      this.router.navigate(['/calculator']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
