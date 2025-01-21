import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {AsyncPipe, NgForOf, NgIf, NgTemplateOutlet} from '@angular/common';
import {WalletService} from '@services/wallet.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {map, Observable, shareReplay, switchMap, take, tap} from 'rxjs';
import moment from 'moment/moment';
import {WalletTransactionService} from '@services/wallet-transaction.service';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatTab, MatTabChangeEvent, MatTabGroup} from '@angular/material/tabs';
import {Wallet} from '@models/wallet.model';
import {MatIcon} from "@angular/material/icon";
import {ConfirmDialogService} from '@components/misc/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-wallet-transaction-form',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatFormField,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    NgIf,
    ReactiveFormsModule,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatTabGroup,
    MatTab,
    NgForOf,
    NgTemplateOutlet,
    AsyncPipe,
    MatIcon,
    MatIconButton,
    RouterLink
  ],
  templateUrl: './wallet-transaction-form.component.html',
  styleUrl: './wallet-transaction-form.component.scss'
})
export class WalletTransactionFormComponent implements AfterViewInit, OnInit {
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  isEdit = false;
  walletId!: string;
  wallet$!: Observable<Wallet | undefined>;
  wallets$!: Observable<Wallet[]>;
  walletTransactionId!: string;
  walletTransactionForm: FormGroup;
  types = [
    { id: 'income', label: 'Ingreso'},
    { id: 'expense', label: 'Egreso'},
    { id: 'transfer', label: 'Transferencia'}
  ];

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private walletTransactionService: WalletTransactionService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmDialogService: ConfirmDialogService
  ) {
    this.walletTransactionForm = this.fb.group({
      walletId: ['', Validators.required],
      date: [moment(), Validators.required],
      type: ['income', Validators.required],
      toWalletId: [''],
      amount: [0, Validators.required],
      currency: ['', Validators.required],
      note: '',
    });
  }

  ngOnInit() {
    this.route.params.pipe(
      take(1),
      tap((params) => {
        this.walletId = params['walletId'];

        const wallets$ = this.walletService.getAllWallets().pipe(
          shareReplay(1)
        );

        this.wallet$ = wallets$.pipe(
          map(wallets => wallets.find(wallet => wallet.id === this.walletId)),
          tap(wallet => this.walletTransactionForm.patchValue({
            walletId: this.walletId,
            currency: wallet?.currency || ''
          }))
        );

        this.wallets$ = this.wallet$.pipe(
          switchMap((currentWallet) => {
            return wallets$.pipe(
              map((wallets: Wallet[]) => {
                return wallets.filter((wallet: Wallet) =>
                  wallet.id !== currentWallet?.id && wallet.currency === currentWallet?.currency);
              }));
          }),
        );

        if (params['id']) {
          this.isEdit = true;
          this.walletTransactionId = params['id'];
        }
      })
    ).subscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.walletTransactionId) {
        this.walletTransactionForm.get('date')?.disable();
        this.walletTransactionForm.get('amount')?.disable();
        this.walletTransactionForm.get('toWalletId')?.disable();
        this.walletTransactionForm.get('note')?.disable();
        this.loadWalletData();
      }
    })
  }

  loadWalletData() {
    this.walletTransactionService.getTransactionById(this.walletTransactionId).pipe(take(1)).subscribe((transaction) => {
      if (transaction) {
        const tabIndex = this.types.findIndex(type => type.id === transaction.type);
        if (tabIndex !== -1 && this.tabGroup) {
          this.tabGroup.selectedIndex = tabIndex;
        }
        this.walletTransactionForm.patchValue({
          ...transaction,
          date: moment(transaction.date),
        });
        console.log(this.walletTransactionForm.getRawValue());
      }
    });
  }

  onSelectedTabChange(event: MatTabChangeEvent) {
    // debugger
    this.walletTransactionForm.patchValue({
      type: this.types[event.index].id,
    });

    if (this.walletTransactionForm.value.type !== 'transfer') {
      this.walletTransactionForm.patchValue({
        toWalletId: null,
      });
    }
  }

  async onSubmit(wallet: Wallet) {
    if (this.walletTransactionForm.invalid) return;

    const transactionData = {
      ...this.walletTransactionForm.value,
      date: this.walletTransactionForm.value.date.valueOf(),
    };

    const sign = transactionData.type !== 'income' ? -1 : 1;

    try {
      if (!this.isEdit) {
        await this.walletTransactionService.addTransaction(transactionData);
        await this.walletService.updateWalletBalance(this.walletId, transactionData.amount * sign)

        if (transactionData.type === 'transfer' && transactionData.toWalletId) {
          await this.walletService.updateWalletBalance(transactionData.toWalletId, transactionData.amount)
        }
      }
    } finally {
      this.router.navigate([`/wallets/${this.walletId}/transactions`]);
    }
  }

  async deleteTransactions() {
    if (!this.walletTransactionId) {
      console.warn('El ID del wallet no es válido');
      return;
    }

    const confirmed = await this.confirmDialogService.confirm(
      'Esta acción eliminará el movimiento.',
      'Eliminar'
    );

    if (confirmed) {
      const transactionData = this.walletTransactionForm.getRawValue();

      await this.walletTransactionService.deleteTransaction(this.walletTransactionId);
      await this.walletService.updateWalletBalance(
        transactionData.walletId,
        transactionData.amount * (transactionData.type === 'income' ? -1 : 1)
      );

      if (transactionData.type === 'transfer' && transactionData.toWalletId) {
        await this.walletService.updateWalletBalance(transactionData.toWalletId, transactionData.amount * -1)
      }
      await this.router.navigate(['/wallets']);
    }
  }
}
