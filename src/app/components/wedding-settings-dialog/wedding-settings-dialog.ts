import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatDatepickerModule
} from '@angular/material/datepicker';

import {
  MatNativeDateModule
} from '@angular/material/core';
import { NotificationService } from '../../service/notification-service';
import { WeddingSettingsService, WeddingSettings, WeddingSettingsRequest } from '../../service/wedding-settings-service';

@Component({
  selector:
    'app-wedding-settings-dialog',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],

  templateUrl:
    './wedding-settings-dialog.html',

  styleUrl:
    './wedding-settings-dialog.css'
})
export class WeddingSettingsDialog
  implements OnInit {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly settingsService =
    inject(WeddingSettingsService);

  private readonly notificationService =
    inject(NotificationService);

  private readonly dialogRef =
    inject(
      MatDialogRef<
        WeddingSettingsDialog
      >
    );

  readonly data =
    inject<WeddingSettings | null>(
      MAT_DIALOG_DATA,
      {
        optional: true
      }
    );

  readonly today =
    new Date();

  isSaving =
    false;

  readonly settingsForm =
    this.formBuilder.group({

      partnerName: [
        '',
        [
          Validators.maxLength(100)
        ]
      ],

      weddingDate: [
        null as Date | null,
        [
          Validators.required
        ]
      ],

      weddingTime: [
        '',
        [
          Validators.required
        ]
      ]

    });

  ngOnInit(): void {

    if (
      !this.data
      || !this.data.weddingDateTime
    ) {
      return;
    }

    const weddingDate =
      new Date(
        this.data.weddingDateTime
      );

    const weddingTime =
      this.formatTime(
        weddingDate
      );

    this.settingsForm.patchValue({

      partnerName:
        this.data.partnerName ?? '',

      weddingDate,

      weddingTime

    });
  }

  save(): void {

    if (
      this.settingsForm.invalid
      || this.isSaving
    ) {

      this.settingsForm
        .markAllAsTouched();

      return;
    }

    const weddingDateTime =
      this.buildWeddingDateTime();

    if (!weddingDateTime) {

      this.notificationService.error(
        'Wedding date and time are required.'
      );

      return;
    }

    const partnerName =
      this.settingsForm.controls
        .partnerName.value
        ?.trim()
      || null;

    const request:
      WeddingSettingsRequest = {

        partnerName,

        weddingDateTime

      };

    this.isSaving =
      true;

    this.settingsService
      .saveSettings(
        request
      )
      .subscribe({

        next: settings => {

          this.isSaving =
            false;

          this.notificationService
            .success(
              'Wedding details saved successfully.'
            );

          this.dialogRef.close(
            settings
          );

        },

        error: error => {

          console.error(
            'Wedding settings save failed:',
            error
          );

          this.isSaving =
            false;

          this.notificationService
            .error(
              error?.error?.message
              || error?.error?.detail
              || 'Wedding details save nahi ho payi.'
            );

        }

      });
  }

  close(): void {

    this.dialogRef.close();

  }

  private buildWeddingDateTime():
    string | null {

    const selectedDate =
      this.settingsForm.controls
        .weddingDate.value;

    const selectedTime =
      this.settingsForm.controls
        .weddingTime.value;

    if (
      !selectedDate
      || !selectedTime
    ) {
      return null;
    }

    const [
      hours,
      minutes
    ] =
      selectedTime
        .split(':')
        .map(Number);

    const weddingDate =
      new Date(
        selectedDate
      );

    weddingDate.setHours(
      hours,
      minutes,
      0,
      0
    );

    return this
      .formatLocalDateTime(
        weddingDate
      );
  }

  private formatLocalDateTime(
    date: Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        '0'
      );

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      );

    const hours =
      String(
        date.getHours()
      ).padStart(
        2,
        '0'
      );

    const minutes =
      String(
        date.getMinutes()
      ).padStart(
        2,
        '0'
      );

    return (
      `${year}-${month}-${day}`
      + `T${hours}:${minutes}:00`
    );
  }

  private formatTime(
    date: Date
  ): string {

    const hours =
      String(
        date.getHours()
      ).padStart(
        2,
        '0'
      );

    const minutes =
      String(
        date.getMinutes()
      ).padStart(
        2,
        '0'
      );

    return `${hours}:${minutes}`;
  }
}
