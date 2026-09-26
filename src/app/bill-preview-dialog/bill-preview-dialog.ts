import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import {
  MatDialogRef
} from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-bill-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './bill-preview-dialog.html',
  styleUrl: './bill-preview-dialog.css'
})
export class BillPreviewDialog {

  data = inject(MAT_DIALOG_DATA);

  private dialogRef =
    inject(MatDialogRef<BillPreviewDialog>);

  close(): void {
    this.dialogRef.close();
  }

  get isPdf(): boolean {

    return this.data.contentType ===
      'application/pdf';
  }

get billName(): string {

  return this.data?.bill?.billOriginalName
    ?? 'Bill Preview';

}

get expenseDate(): string {

  return this.data?.bill?.expenseDate
    ?? '';

}

}
