import { Component } from '@angular/core';
import {map, Observable} from 'rxjs';
import {WalletService} from '@services/wallet.service';
import {Wallet} from '@models/wallet.model';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {RouterLink} from '@angular/router';
import {MatProgressBar} from '@angular/material/progress-bar';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    RouterLink,
    MatCardModule,
    MatMenuModule,
    MatProgressBar,
  ],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.scss'
})
export class WalletsComponent {
  wallets$: Observable<Wallet[]>;

  constructor(private walletService: WalletService) {
    this.wallets$ = this.walletService.getAllWallets().pipe(
      map(wallets => wallets.sort((a,b) => a.name.localeCompare(b.name))),
    );
  }
}
