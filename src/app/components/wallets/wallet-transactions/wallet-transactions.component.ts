import {Component, OnInit} from '@angular/core';
import {map, Observable, take} from 'rxjs';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {WalletTransactionService} from '@services/wallet-transaction.service';
import {WalletTransaction} from '@models/wallet-transaction.model';
import {Wallet} from '@models/wallet.model';
import {WalletService} from '@services/wallet.service';
import {MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatListItem, MatListItemLine, MatListItemTitle, MatNavList} from '@angular/material/list';
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MetricComponent} from '@components/misc/metric/metric.component';

@Component({
  selector: 'app-wallet-transactions',
  standalone: true,
  imports: [
    MatIcon,
    RouterLink,
    AsyncPipe,
    NgIf,
    CurrencyPipe,
    NgForOf,
    DatePipe,
    MatIconButton,
    MatMiniFabButton,
    MatCard,
    MatCardContent,
    MatListItem,
    MatListItemLine,
    MatListItemTitle,
    MatNavList,
    MatCardHeader,
    MatCardTitle,
    MatProgressBar,
    MatProgressSpinner,
    MetricComponent,
    DecimalPipe,
  ],
  templateUrl: './wallet-transactions.component.html',
  styleUrl: './wallet-transactions.component.scss'
})
export class WalletTransactionsComponent implements OnInit {
  private walletId!: string;
  wallet$!: Observable<Wallet | null>;
  transactions$!: Observable<WalletTransaction[]>;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private walletService: WalletService,
              private transactionService: WalletTransactionService) {}

  ngOnInit() {
    this.route.params.pipe(take(1)).subscribe((params) => {
      if (params['id']) {
        this.walletId = params['id'];
        this.loadData();
      } else {
        this.router.navigate(['/wallets']);
      }
    });
  }

  loadData() {
    this.wallet$ = this.walletService.getWalletById(this.walletId);
    this.transactions$ = this.transactionService.getWalletTransactions(this.walletId).pipe(
      map((transactions) => {
        return transactions.map(transaction => {
          let amount = transaction.sourceAmount;
          let sign = transaction.type === 'income' ? 1 : -1;
          if (transaction.type === 'transfer') {
            amount = this.walletId === transaction.toWalletId ? transaction.destinationAmount : transaction.sourceAmount;
            sign = this.walletId === transaction.toWalletId ? 1 : -1;
          }

          return {
            ...transaction,
            sourceAmount: amount * sign,
          }
        })
      }),
      map(transactions =>
        transactions.reverse().sort((a, b) => b.date - a.date )
      ),
    );
  }
}
