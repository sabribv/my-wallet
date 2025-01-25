import { Component } from '@angular/core';
import {combineLatest, map, Observable} from 'rxjs';
import {Exchange} from '@models/exchange.model';
import {ExchangeService} from '@services/exchange.service';
import {AsyncPipe, CurrencyPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatListItem, MatListItemLine, MatListItemTitle, MatNavList} from '@angular/material/list';
import {MatProgressBar} from '@angular/material/progress-bar';
import {RouterLink} from '@angular/router';
import {StatusIndicatorComponent} from '@components/misc/status-indicator/status-indicator.component';
import {Wallet} from '@models/wallet.model';
import {WalletService} from '@services/wallet.service';
import {MatDivider} from '@angular/material/divider';

interface ExchangesExtended extends Exchange {
  sourceWallet?: Wallet;
  destinationWallet?: Wallet;
}

@Component({
  selector: 'app-exchanges',
  standalone: true,
  imports: [
    AsyncPipe,
    MatCard,
    MatCardContent,
    MatIcon,
    MatIconButton,
    MatListItem,
    MatListItemLine,
    MatListItemTitle,
    MatNavList,
    MatProgressBar,
    NgForOf,
    NgIf,
    RouterLink,
    StatusIndicatorComponent,
    DatePipe,
    CurrencyPipe,
    MatDivider
  ],
  templateUrl: './exchanges.component.html',
  styleUrl: './exchanges.component.scss'
})
export class ExchangesComponent {
  exchanges$: Observable<ExchangesExtended[]>;
  wallets$: Observable<Wallet[]>

  constructor(private exchangeService: ExchangeService, private walletService: WalletService) {
    this.wallets$ = this.walletService.getAllWallets();
    const exchanges$ = this.exchangeService.getExchanges();

    this.exchanges$ = combineLatest([
      exchanges$, this.wallets$
    ]).pipe(
      map(([exchanges, wallets]) => {
        return exchanges.map(exchange => ({
          ...exchange,
          sourceWallet: wallets.find(wallet => wallet.id === exchange.walletId),
          destinationWallet: exchange.toWalletId ? wallets.find(wallet => wallet.id === exchange.toWalletId) : undefined,
        })).sort((a,b) =>  b.date - a.date);
      })
    );
  }
}
