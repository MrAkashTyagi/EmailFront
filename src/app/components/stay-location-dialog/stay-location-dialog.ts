import {
  Component,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

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
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatSlideToggleModule
} from '@angular/material/slide-toggle';

import {
  StayLocation,
  StayLocationRequest,
  StayLocationType
} from '../../models/stay-location';

import {
  StayLocationService
} from '../../service/stay-location-service';

import {
  NotificationService
} from '../../service/notification-service';

@Component({
  selector: 'app-stay-location-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule
  ],
  templateUrl: './stay-location-dialog.html',
  styleUrl: './stay-location-dialog.css'
})
export class StayLocationDialog {

  private readonly dialogRef =
    inject(
      MatDialogRef<StayLocationDialog>
    );

  private readonly locationService =
    inject(StayLocationService);

  private readonly notificationService =
    inject(NotificationService);

  readonly dialogData =
    inject<StayLocation | null>(
      MAT_DIALOG_DATA,
      {
        optional: true
      }
    );

  readonly isEditMode =
    Boolean(
      this.dialogData?.id
    );

  saving = false;

  locationTypes: {
    value: StayLocationType;
    label: string;
  }[] = [
    {
      value: 'HOME',
      label: 'Own Home'
    },
    {
      value: 'RENTED_HOUSE',
      label: 'Rented House'
    },
    {
      value: 'DHARAMSHALA',
      label: 'Dharamshala'
    },
    {
      value: 'HOTEL',
      label: 'Hotel'
    },
    {
      value: 'OTHER',
      label: 'Other'
    }
  ];

  form: StayLocationRequest = {
    name:
      this.dialogData?.name
      ?? '',

    type:
      this.dialogData?.type
      ?? 'HOME',

    address:
      this.dialogData?.address
      ?? '',

    contactPerson:
      this.dialogData?.contactPerson
      ?? '',

    contactNumber:
      this.dialogData?.contactNumber
      ?? '',

    notes:
      this.dialogData?.notes
      ?? '',

    active:
      this.dialogData?.active
      ?? true
  };

  save(): void {

    if (!this.form.name.trim()) {

      this.notificationService.warning(
        'Location name is required.'
      );

      return;
    }

    const payload: StayLocationRequest = {
      name:
        this.form.name.trim(),

      type:
        this.form.type,

      address:
        this.cleanValue(
          this.form.address
        ),

      contactPerson:
        this.cleanValue(
          this.form.contactPerson
        ),

      contactNumber:
        this.cleanValue(
          this.form.contactNumber
        ),

      notes:
        this.cleanValue(
          this.form.notes
        ),

      active:
        this.form.active
    };

    this.saving = true;

    const request$ =
      this.isEditMode

        ? this.locationService
          .updateLocation(
            this.dialogData!.id!,
            payload
          )

        : this.locationService
          .createLocation(
            payload
          );

    request$.subscribe({

      next: savedLocation => {

        this.notificationService.success(
          this.isEditMode
            ? 'Stay location updated successfully.'
            : 'Stay location added successfully.'
        );

        this.dialogRef.close(
          savedLocation
        );
      },

      error: error => {

        console.error(
          'Stay location save failed:',
          error
        );

        this.saving = false;

        this.notificationService.error(
          error?.error?.message
          || error?.error?.detail
          || (
            this.isEditMode
              ? 'Stay location update nahi ho paya.'
              : 'Stay location add nahi ho paya.'
          )
        );
      }
    });
  }

  close(): void {

    this.dialogRef.close();
  }

  private cleanValue(
    value?: string | null
  ): string | null {

    const cleaned =
      value?.trim();

    return cleaned
      ? cleaned
      : null;
  }
}
