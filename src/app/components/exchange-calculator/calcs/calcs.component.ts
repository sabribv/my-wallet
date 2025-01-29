import { Component } from '@angular/core';
import {AsyncPipe, CurrencyPipe, DatePipe, NgForOf, NgIf} from "@angular/common";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatListItem, MatListItemLine, MatListItemTitle, MatNavList} from "@angular/material/list";
import {MatProgressBar} from "@angular/material/progress-bar";
import {RouterLink} from "@angular/router";
import {StatusIndicatorComponent} from "@components/misc/status-indicator/status-indicator.component";
import {combineLatest, map, Observable} from 'rxjs';
import {Wallet} from '@models/wallet.model';
import {ExchangeCalculator} from '@models/exchange-calculator.model';
import {WalletService} from '@services/wallet.service';
import {ExchangeCalculatorService} from '@services/exchange-calculator.service';

interface ExchangeCalculatorExtended extends ExchangeCalculator {
  sourceWallet?: Wallet;
  destinationWallet?: Wallet;
}

@Component({
  selector: 'app-calcs',
  standalone: true,
    imports: [
        AsyncPipe,
        CurrencyPipe,
        DatePipe,
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
        StatusIndicatorComponent
    ],
  templateUrl: './calcs.component.html',
  styleUrl: './calcs.component.scss'
})
export class CalcsComponent {
  calculations$: Observable<ExchangeCalculatorExtended[]>;
  wallets$: Observable<Wallet[]>;

  constructor(private exchangeCalculatorService: ExchangeCalculatorService, private walletService: WalletService) {
    this.wallets$ = this.walletService.getAllWallets();
    const calculations$ = this.exchangeCalculatorService.getCalculations();

    this.calculations$ = combineLatest([
      calculations$, this.wallets$
    ]).pipe(
      map(([calcs, wallets]) => {
        return calcs.map(calc => ({
          ...calc,
          sourceWallet: wallets.find(wallet => wallet.id === calc.walletId),
          destinationWallet: calc.toWalletId ? wallets.find(wallet => wallet.id === calc.toWalletId) : undefined,
        })).sort((a,b) =>  b.date - a.date);
      })
    );
  }
}
