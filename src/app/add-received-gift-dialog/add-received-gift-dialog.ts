import {
  CommonModule
} from '@angular/common';

import {
  Component,
  inject,
  OnInit
} from '@angular/core';

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
  MatButtonModule
} from '@angular/material/button';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatDatepickerModule
} from '@angular/material/datepicker';

import {
  MatNativeDateModule
} from '@angular/material/core';

import {
  NotificationService
} from '../service/notification-service';
import { ReceivedGiftService } from '../service/received-gift';


@Component({
  selector: 'app-add-received-gift-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl:
    './add-received-gift-dialog.html',
  styleUrl:
    './add-received-gift-dialog.css'
})
export class AddReceivedGiftDialog
  implements OnInit {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly receivedGiftService =
    inject(ReceivedGiftService);

  private readonly dialogRef =
    inject(
      MatDialogRef<
        AddReceivedGiftDialog
      >
    );

  private readonly notificationService =
    inject(NotificationService);

  readonly data =
    inject(
      MAT_DIALOG_DATA,
      {
        optional: true
      }
    );

  readonly giftTypes = [
    {
      value: 'CASH',
      label: 'Cash'
    },
    {
      value: 'JEWELLERY',
      label: 'Jewellery'
    },
    {
      value: 'APPLIANCE',
      label: 'Appliance'
    },
    {
      value: 'CLOTHING',
      label: 'Clothing'
    },
    {
      value: 'HOME_ITEM',
      label: 'Home Item'
    },
    {
      value: 'ELECTRONICS',
      label: 'Electronics'
    },
    {
      value: 'DECORATION',
      label: 'Decoration'
    },
    {
      value: 'OTHER',
      label: 'Other'
    }
  ];

  isSaving = false;

  saveError = '';

  readonly receivedGiftForm =
    this.formBuilder.group({

      giverName: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      mobileNumber: [
        '',
        [
          Validators.maxLength(20)
        ]
      ],

      giftType: [
        'CASH',
        [
          Validators.required
        ]
      ],

      cashAmount: [
        null as number | null
      ],

      giftDescription: [
        '',
        [
          Validators.maxLength(500)
        ]
      ],

      quantity: [
        1,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(1000)
        ]
      ],

      receivedAt: [
        new Date()
      ],

      notes: [
        '',
        [
          Validators.maxLength(1000)
        ]
      ]

    });

  get isEditMode(): boolean {

    return Boolean(
      this.data?.id
    );
  }

  get isCashGift(): boolean {

    return (
      this.receivedGiftForm
        .get('giftType')
        ?.value === 'CASH'
    );
  }

  ngOnInit(): void {

    this.updateConditionalValidators();

    this.receivedGiftForm
      .get('giftType')
      ?.valueChanges
      .subscribe(() => {

        this.updateConditionalValidators();

      });

    if (!this.data) {
      return;
    }

    this.receivedGiftForm.patchValue({

      giverName:
        this.data.giverName ?? '',

      mobileNumber:
        this.data.mobileNumber ?? '',

      giftType:
        this.data.giftType ?? 'CASH',

      cashAmount:
        this.data.cashAmount ?? null,

      giftDescription:
        this.data.giftDescription ?? '',

      quantity:
        this.data.quantity ?? 1,

      receivedAt:
        this.resolveReceivedDate(
          this.data.receivedAt
        ),

      notes:
        this.data.notes ?? ''

    });

    this.updateConditionalValidators();
  }

  saveGift(): void {

    if (
      this.receivedGiftForm.invalid
      || this.isSaving
    ) {

      this.receivedGiftForm
        .markAllAsTouched();

      return;
    }

    const formValue =
      this.receivedGiftForm
        .getRawValue();

    const giverName =
      formValue.giverName
        ?.trim();

    if (!giverName) {

      this.saveError =
        'Giver name is required.';

      return;
    }

    const quantity =
      Number(
        formValue.quantity ?? 1
      );

    if (
      !Number.isInteger(quantity)
      || quantity < 1
      || quantity > 1000
    ) {

      this.saveError =
        'Quantity must be between 1 and 1000.';

      return;
    }

    let cashAmount:
      number | null = null;

    let giftDescription:
      string | null = null;

    if (
      formValue.giftType === 'CASH'
    ) {

      cashAmount =
        Number(
          formValue.cashAmount
        );

      if (
        Number.isNaN(cashAmount)
        || cashAmount <= 0
      ) {

        this.saveError =
          'Cash amount must be greater than zero.';

        return;
      }

    } else {

      giftDescription =
        this.cleanValue(
          formValue.giftDescription
        );

      if (!giftDescription) {

        this.saveError =
          'Gift description is required.';

        return;
      }
    }

    const payload = {

      giverName,

      mobileNumber:
        this.cleanValue(
          formValue.mobileNumber
        ),

      giftType:
        formValue.giftType,

      cashAmount,

      giftDescription,

      quantity,

      receivedAt:
        this.formatReceivedAt(
          formValue.receivedAt
        ),

      notes:
        this.cleanValue(
          formValue.notes
        )

    };

    this.isSaving = true;

    this.saveError = '';

    const request$ =
      this.isEditMode

        ? this.receivedGiftService
          .updateReceivedGift(
            this.data.id,
            payload
          )

        : this.receivedGiftService
          .createReceivedGift(
            payload
          );

    request$.subscribe({

      next: (savedGift: any) => {

        this.isSaving = false;

        this.notificationService.success(
          this.isEditMode
            ? 'Received gift updated successfully.'
            : 'Received gift added successfully.'
        );

        this.dialogRef.close(
          savedGift
        );
      },

      error: (error: any) => {

        console.error(
          'Received gift save failed:',
          error
        );

        this.isSaving = false;

        this.saveError =
          error?.error?.message
          || error?.error?.detail
          || (
            this.isEditMode
              ? 'Unable to update received gift.'
              : 'Unable to add received gift.'
          );

        this.notificationService.error(
          this.saveError
        );
      }

    });
  }

  close(): void {

    if (this.isSaving) {
      return;
    }

    this.dialogRef.close(
      false
    );
  }

  private updateConditionalValidators():
    void {

    const cashAmountControl =
      this.receivedGiftForm
        .get('cashAmount');

    const descriptionControl =
      this.receivedGiftForm
        .get('giftDescription');

    if (this.isCashGift) {

      cashAmountControl
        ?.setValidators([
          Validators.required,
          Validators.min(0.01)
        ]);

      descriptionControl
        ?.clearValidators();

      descriptionControl
        ?.setValue(
          '',
          {
            emitEvent: false
          }
        );

    } else {

      descriptionControl
        ?.setValidators([
          Validators.required,
          Validators.maxLength(500)
        ]);

      cashAmountControl
        ?.clearValidators();

      cashAmountControl
        ?.setValue(
          null,
          {
            emitEvent: false
          }
        );
    }

    cashAmountControl
      ?.updateValueAndValidity({
        emitEvent: false
      });

    descriptionControl
      ?.updateValueAndValidity({
        emitEvent: false
      });
  }

  private cleanValue(
    value?: string | null
  ): string | null {

    const cleanedValue =
      value?.trim();

    return cleanedValue
      ? cleanedValue
      : null;
  }

  private resolveReceivedDate(
    value?: string
  ): Date {

    if (!value) {
      return new Date();
    }

    const date =
      new Date(value);

    return Number.isNaN(
      date.getTime()
    )
      ? new Date()
      : date;
  }

  private formatReceivedAt(
    value: Date | string | null
  ): string | null {

    if (!value) {
      return null;
    }

    const date =
      value instanceof Date
        ? value
        : new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

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

    const seconds =
      String(
        date.getSeconds()
      ).padStart(
        2,
        '0'
      );

    return (
      `${year}-${month}-${day}`
      + `T${hours}:${minutes}:${seconds}`
    );
  }
}
