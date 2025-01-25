import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmDialogService} from '@components/misc/confirm-dialog/confirm-dialog.service';
import {ExchangeService} from '@services/exchange.service';
import moment from 'moment';
import {combineLatest, map, Observable, Subject, take, takeUntil} from 'rxjs';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {Wallet} from '@models/wallet.model';
import {WalletService} from '@services/wallet.service';
import {MatCheckbox} from '@angular/material/checkbox';

@Component({
  selector: 'app-exchange-form',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButton,
    MatCard,
    MatCardContent,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatSuffix,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    MatCheckbox,
    FormsModule
  ],
  templateUrl: './exchange-form.component.html',
  styleUrl: './exchange-form.component.scss'
})
export class ExchangeFormComponent implements AfterViewInit, OnInit, OnDestroy {
  isEdit = false;
  exchangeId!: string;
  exchangeForm: FormGroup;
  wallets$: Observable<Wallet[]>;
  toWallets$!: Observable<Wallet[]>;
  currencies = [
    'ARS',
    'USD',
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private exchangeService: ExchangeService,
    private walletService: WalletService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmDialogService: ConfirmDialogService
  ) {
    this.exchangeForm = this.fb.group({
      date: [moment(), Validators.required],
      walletId: ['', Validators.required],
      toWalletId: [''],
      sourceAmount: [0, Validators.required],
      sourceCurrency: ['', Validators.required],
      rate: [0, Validators.required],
      destinationAmount: [{value: 0, disabled: true}, Validators.required],
      destinationCurrency: ['', Validators.required],
      note: ['', Validators.required],
      transactions: [[]],
      createTransactions: [true],
    });

    this.wallets$ = this.walletService.getAllWallets();
  }

  ngOnInit() {
    this.route.params.pipe(take(1)).subscribe((params) => {
      if (params['id']) {
        this.isEdit = true;
        this.exchangeId = params['id'];
        this.loadExchangeData();
      }
    });

    this.toWallets$ = combineLatest([
      this.exchangeForm.valueChanges,
      this.wallets$,
    ]).pipe(
      map(([form, wallets]) => {
        const sourceWallet =  form.walletId ? wallets.find(wallet => wallet.id === form.walletId) : undefined;
        const defaultCurrency = this.currencies.find(currency => currency !== sourceWallet?.currency) ?? this.currencies[0];

        this.exchangeForm.patchValue({
          destinationCurrency: defaultCurrency,
        }, {emitEvent: false});

        if (sourceWallet) {
          this.exchangeForm.patchValue({
            sourceCurrency: sourceWallet?.currency,
          }, {emitEvent: false});

          return wallets.filter(wallet => {
            return wallet.id !== sourceWallet?.id && wallet.currency !== sourceWallet?.currency;
          });
        } else {
          return [];
        }
      })
    );

    this.exchangeForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(exchange => {
      this.exchangeForm.patchValue({
        destinationAmount: exchange.sourceAmount * exchange.rate,
      }, {emitEvent: false});
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.exchangeId) {
        this.exchangeForm.get('date')?.disable();
        this.exchangeForm.get('walletId')?.disable();
        this.exchangeForm.get('toWalletId')?.disable();
        this.exchangeForm.get('sourceAmount')?.disable();
        this.exchangeForm.get('rate')?.disable();
        this.exchangeForm.get('note')?.disable();
      }
    })
  }

  loadExchangeData() {
    this.exchangeService.getExchangeById(this.exchangeId).pipe(take(1)).subscribe((exchange) => {
      if (exchange) {
        const value = {
          ...exchange,
          date: moment(exchange.date),
        }
        this.exchangeForm.patchValue(value);
      }
    });
  }

  async onSubmit() {
    if (this.exchangeForm.invalid) return;

    const exchangeData = {
      ...this.exchangeForm.getRawValue(),
      date: this.exchangeForm.value.date.valueOf(),
    };
    delete exchangeData.createTransactions;

    try {
        await this.exchangeService.addExchange(exchangeData, this.exchangeForm.value.createTransactions)
    } finally {
      this.router.navigate(['/exchanges']);
    }
  }

  async deleteExchange(id: string | undefined): Promise<void> {
    const exchange = {
      id,
      ...this.exchangeForm.getRawValue()
    };

    if (!exchange.id) {
      console.warn('El ID de exchange no es válido');
      return;
    }

    const confirmed = await this.confirmDialogService.confirm(
      'Esta acción eliminará el cambio de divisas.',
      'Eliminar'
    );

    if (confirmed) {
      await this.exchangeService.deleteExchange(exchange);
      await this.router.navigate(['/exchanges']);
    }
  }

  onCancel() {
    this.router.navigate(['/exchanges']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
