import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import {
  MatDialogRef
} from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import {
  ElementRef,
  ViewChild
} from '@angular/core';

import {
  HostListener
} from '@angular/core';


@Component({
  selector: 'app-bill-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './bill-preview-dialog.html',
  styleUrl: './bill-preview-dialog.css'
})
export class BillPreviewDialog {

  data = inject(MAT_DIALOG_DATA);

  isFullscreen = false;

  @HostListener(
    'document:fullscreenchange'
  )
  onFullscreenChange(): void {

    this.isFullscreen =
      !!document.fullscreenElement;

  }

  private dialogRef =
    inject(MatDialogRef<BillPreviewDialog>);

  @ViewChild(
    'previewContainer'
  )
  previewContainer!:
    ElementRef;

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

  // toggleFullscreen(): void {

  //   const element =
  //     document.documentElement;

  //   if (
  //     !document.fullscreenElement
  //   ) {

  //     element.requestFullscreen();

  //   } else {

  //     document.exitFullscreen();

  //   }

  // }

  toggleFullscreen(): void {

    const element =
      this.previewContainer
        .nativeElement;

    if (
      !document.fullscreenElement
    ) {

      element.requestFullscreen();

    } else {

      document.exitFullscreen();

    }

  }
}
