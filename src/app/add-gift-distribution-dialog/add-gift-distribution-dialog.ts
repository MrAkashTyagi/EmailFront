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
  GiftDistributionService
} from '../gift-distribution.service';

import {
  NotificationService
} from '../service/notification-service';

@Component({
  selector: 'app-add-gift-distribution-dialog',
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
    MatIconModule
  ],
  templateUrl:
    './add-gift-distribution-dialog.html',
  styleUrl:
    './add-gift-distribution-dialog.css'
})
export class AddGiftDistributionDialog
  implements OnInit {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly giftService =
    inject(GiftDistributionService);

  private readonly dialogRef =
    inject(
      MatDialogRef<
        AddGiftDistributionDialog
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
      value: 'ENVELOPE',
      label: 'Envelope'
    },
    {
      value: 'CASH',
      label: 'Cash'
    },
    {
      value: 'SAREE',
      label: 'Saree'
    },
    {
      value: 'SUIT',
      label: 'Suit'
    },
    {
      value: 'JEWELLERY',
      label: 'Jewellery'
    },
    {
      value: 'ELECTRONICS',
      label: 'Electronics'
    },
    {
      value: 'UTENSILS',
      label: 'Utensils'
    },
    {
      value: 'OTHER',
      label: 'Other'
    }
  ];

  readonly giftForm =
    this.formBuilder.group({

      recipientName: [
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
        'ENVELOPE',
        [
          Validators.required
        ]
      ],

      amount: [
        null as number | null,
        [
          Validators.required,
          Validators.min(0)
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

      notes: [
        '',
        [
          Validators.maxLength(1000)
        ]
      ]

    });

  isSaving = false;

  saveError = '';

  get isEditMode(): boolean {

    return Boolean(
      this.data?.id
    );
  }

  get calculatedTotal(): number {

    const amount =
      Number(
        this.giftForm
          .get('amount')
          ?.value ?? 0
      );

    const quantity =
      Number(
        this.giftForm
          .get('quantity')
          ?.value ?? 1
      );

    if (
      Number.isNaN(amount)
      || Number.isNaN(quantity)
    ) {
      return 0;
    }

    return amount * quantity;
  }

  ngOnInit(): void {

    if (!this.data) {
      return;
    }

    this.giftForm.patchValue({

      recipientName:
        this.data.recipientName ?? '',

      mobileNumber:
        this.data.mobileNumber ?? '',

      giftType:
        this.data.giftType
        ?? 'ENVELOPE',

      amount:
        this.data.amount ?? null,

      quantity:
        this.data.quantity ?? 1,

      notes:
        this.data.notes ?? ''

    });
  }

  saveGift(): void {

    if (
      this.giftForm.invalid
      || this.isSaving
    ) {

      this.giftForm
        .markAllAsTouched();

      return;
    }

    const formValue =
      this.giftForm.getRawValue();

    const recipientName =
      formValue.recipientName
        ?.trim();

    if (!recipientName) {

      this.saveError =
        'Recipient name is required.';

      return;
    }

    const amount =
      Number(
        formValue.amount
      );

    const quantity =
      Number(
        formValue.quantity
      );

    if (
      Number.isNaN(amount)
      || amount < 0
    ) {

      this.saveError =
        'Please enter a valid amount.';

      return;
    }

    if (
      !Number.isInteger(quantity)
      || quantity < 1
    ) {

      this.saveError =
        'Quantity must be a whole number greater than zero.';

      return;
    }

    const payload = {

      recipientName,

      mobileNumber:
        this.cleanValue(
          formValue.mobileNumber
        ),

      giftType:
        formValue.giftType,

      amount,

      quantity,

      notes:
        this.cleanValue(
          formValue.notes
        )

    };

    this.isSaving = true;

    this.saveError = '';

    const request$ =
      this.isEditMode

        ? this.giftService
          .updateGiftDistribution(
            this.data.id,
            payload
          )

        : this.giftService
          .createGiftDistribution(
            payload
          );

    request$.subscribe({

      next: savedGift => {

        this.isSaving = false;

        this.notificationService.success(

          this.isEditMode

            ? 'Gift updated successfully.'

            : 'Gift added successfully.'

        );

        this.dialogRef.close(
          savedGift
        );
      },

      error: error => {

        console.error(
          'Gift distribution save failed:',
          error
        );

        this.isSaving = false;

        this.saveError =
          error?.error?.message
          || error?.error?.detail
          || (
            this.isEditMode
              ? 'Unable to update the gift.'
              : 'Unable to add the gift.'
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

  private cleanValue(
    value?: string | null
  ): string | null {

    const cleanedValue =
      value?.trim();

    return cleanedValue
      ? cleanedValue
      : null;
  }
}
