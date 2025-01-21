import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {take} from 'rxjs';
import {WalletService} from '@services/wallet.service';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {CommonModule} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {ConfirmDialogService} from '@components/misc/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-wallet-form',
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
    MatIcon,
  ],
  templateUrl: './wallet-form.component.html',
  styleUrl: './wallet-form.component.scss'
})
export class WalletFormComponent implements OnInit {
  isEdit = false;
  walletId!: string;
  walletForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmDialogService: ConfirmDialogService
  ) {
    this.walletForm = this.fb.group({
      name: ['', Validators.required],
      type: ['bank', Validators.required],
      currency: ['ARS', Validators.required],
      balance: [0, Validators.required],
    });
  }

  ngOnInit() {
    this.route.params.pipe(take(1)).subscribe((params) => {
      if (params['id']) {
        this.isEdit = true;
        this.walletId = params['id'];
        this.loadWalletData();
      }
    });
  }

  loadWalletData() {
    this.walletService.getWalletById(this.walletId).pipe(take(1)).subscribe((wallet) => {
      if (wallet) {
        this.walletForm.patchValue(wallet);
      }
    });
  }

  async onSubmit() {
    if (this.walletForm.invalid) return;

    const walletData = this.walletForm.value;
    try {
      if (this.isEdit) {
        await this.walletService.updateWallet(this.walletId, walletData);
      } else {
        await this.walletService.addWallet(walletData);
      }
    } finally {
      this.router.navigate(['/wallets']);
    }
  }

  onCancel() {
    const route = this.isEdit ? `/wallets/${this.walletId}/transactions` : 'wallets';
    this.router.navigate([route]);
  }

  async deleteWallet(): Promise<void> {
    if (!this.walletId) {
      console.warn('El ID de wallet no es válido');
      return;
    }

    const confirmed = await this.confirmDialogService.confirm(
      'Esta acción eliminará la billetera.',
      'Eliminar'
    );

    if (confirmed) {
      await this.walletService.deleteWallet(this.walletId);
      await this.router.navigate(['/wallets']);
    }
  }
}
