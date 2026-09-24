import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { GuestAccountService } from '../../service/guest-account-service';
import { MatIconModule } from '@angular/material/icon';



import { CommonModule } from '@angular/common';

import { MatDialogModule } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../service/notification-service';



@Component({
  selector: 'app-create-guest-account-dialog',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],

  templateUrl: './create-guest-account-dialog.html',
  styleUrl: './create-guest-account-dialog.css'
})
export class CreateGuestAccountDialog {

  private fb = inject(FormBuilder);

  private guestAccountService =
    inject(
      GuestAccountService
    );

  private dialogRef =
    inject(
      MatDialogRef<CreateGuestAccountDialog>
    );

  private notificationService = inject(NotificationService);

  form =
    this.fb.group({

      name: [
        '',
        Validators.required
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ]
    });

  createGuestAccount(): void {

    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

      return;
    }

    this.guestAccountService
      .createGuestAccount(
        this.form.getRawValue() as any
      )
      .subscribe({

        next: response => {

          this.notificationService.success(
            `Guest account created: ${response.email}`
          );
          this.dialogRef.close(
            true
          );
        },
        error: error => {

          console.error(error);

          const validationMessage =
            error?.error?.errors?.[0]?.defaultMessage;

          this.notificationService.error(
            validationMessage
            || error?.error?.message
            || 'Failed to create guest account.'
          );
        }

      });
  }
}
