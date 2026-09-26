import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  BillPreviewDialog
} from '../bill-preview-dialog/bill-preview-dialog';

@Component({
  selector: 'app-expense-bills-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl:
    './expense-bills-dialog.html',
  styleUrl:
    './expense-bills-dialog.css'
})
export class ExpenseBillsDialog {

  readonly data =
    inject(MAT_DIALOG_DATA);

  private dialog =
    inject(MatDialog);

  private dialogRef =
    inject(
      MatDialogRef<
        ExpenseBillsDialog
      >
    );

  close(): void {

    this.dialogRef.close();

  }

  openBill(
    bill: any
  ): void {

    this.dialog.open(
      BillPreviewDialog,
      {
        width: '95vw',
        maxWidth: '1400px',
        height: '90vh',
        data: {

          url: bill.billUrl,

          contentType:
            bill.billContentType,

          billName:
            bill.billOriginalName,

          expenseDate:
            this.data.expenseDate

        }
      }
    );

  }

}
