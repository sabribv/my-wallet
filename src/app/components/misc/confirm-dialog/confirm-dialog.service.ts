import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private dialog = inject(MatDialog);

  confirm(message: string, title: string = 'Confirm'): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message, title },
      disableClose: true,
    });

    return dialogRef.afterClosed().toPromise(); // Returns true or false
  }
}
