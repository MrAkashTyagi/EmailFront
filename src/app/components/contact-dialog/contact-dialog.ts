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
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';

import { WeddingContactService } from '../../service/wedding-contact-service';
import { NotificationService } from '../../service/notification-service';



@Component({
  selector: 'app-contact-dialog',
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
    MatProgressSpinnerModule
  ],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.css'
})
export class ContactDialog {

  private readonly dialogRef =
    inject(
      MatDialogRef<ContactDialog>
    );

  private readonly contactService =
    inject(
      WeddingContactService
    );

  private readonly notificationService =
    inject(
      NotificationService
    );

  readonly dialogData =
    inject(
      MAT_DIALOG_DATA,
      {
        optional: true
      }
    );

  readonly categories = [
    'Food & Catering',
    'Photography',
    'Decoration',
    'Music & DJ',
    'Venue',
    'Accommodation',
    'Travel',
    'Coordinator',
    'Emergency',
    'Other'
  ];

  isEditMode =
    Boolean(
      this.dialogData?.id
    );

  saving = false;

  contact = {
    id:
      this.dialogData?.id
      ?? undefined,

    name:
      this.dialogData?.name
      ?? '',

    category:
      this.dialogData?.category
      ?? '',

    contactPerson:
      this.dialogData?.contactPerson
      ?? '',

    mobileNumber:
      this.dialogData?.mobileNumber
      ?? '',

    alternateNumber:
      this.dialogData?.alternateNumber
      ?? '',

    whatsappNumber:
      this.dialogData?.whatsappNumber
      ?? '',

    address:
      this.dialogData?.address
      ?? '',

    mapLink:
      this.dialogData?.mapLink
      ?? '',

    notes:
      this.dialogData?.notes
      ?? '',

    advancePaid:
      this.dialogData?.advancePaid
      ?? 0,

    pendingAmount:
      this.dialogData?.pendingAmount
      ?? 0
  };

  save(): void {

    if (!this.contact.name.trim()) {

      this.notificationService.warning(
        'Name is required.'
      );

      return;
    }

    if (!this.contact.category) {

      this.notificationService.warning(
        'Category is required.'
      );

      return;
    }

    if (
      this.contact.mobileNumber &&
      !/^[0-9]{10}$/.test(
        this.contact.mobileNumber
      )
    ) {

      this.notificationService.warning(
        'Mobile number must be exactly 10 digits.'
      );

      return;
    }

    if (
      this.contact.alternateNumber &&
      !/^[0-9]{10}$/.test(
        this.contact.alternateNumber
      )
    ) {

      this.notificationService.warning(
        'Alternate number must be exactly 10 digits.'
      );

      return;
    }

    if (
      !this.contact.whatsappNumber &&
      this.contact.mobileNumber
    ) {

      this.contact.whatsappNumber =
        this.contact.mobileNumber;
    }

    if (
      this.contact.whatsappNumber &&
      !/^[0-9]{10}$/.test(
        this.contact.whatsappNumber
      )
    ) {

      this.notificationService.warning(
        'WhatsApp number must be exactly 10 digits.'
      );

      return;
    }

    const payload = {

      name:
        this.contact.name.trim(),

      category:
        this.contact.category,

      contactPerson:
        this.contact.contactPerson.trim(),

      mobileNumber:
        this.contact.mobileNumber.trim(),

      alternateNumber:
        this.contact.alternateNumber.trim(),

      whatsappNumber:
        this.contact.whatsappNumber.trim(),

      address:
        this.contact.address.trim(),

      mapLink:
        this.contact.mapLink.trim(),

      notes:
        this.contact.notes.trim(),

      advancePaid:
        Number(
          this.contact.advancePaid
          || 0
        ),

      pendingAmount:
        Number(
          this.contact.pendingAmount
          || 0
        )
    };

    this.saving = true;

    const request$ =
      this.isEditMode

        ? this.contactService
            .updateContact(
              Number(this.contact.id),
              payload
            )

        : this.contactService
            .createContact(
              payload
            );

   request$.subscribe({

  next: savedContact => {

    this.notificationService.success(
      this.isEditMode
        ? 'Contact updated successfully.'
        : 'Contact added successfully.'
    );

    this.dialogRef.close(
      savedContact
    );
  },

  error: error => {

    console.error(
      'Contact save failed:',
      error
    );

    queueMicrotask(() => {
      this.saving = false;
    });

    this.notificationService.error(
      error?.error?.message
      || error?.error?.detail
      || (
        this.isEditMode
          ? 'Contact update nahi ho paya.'
          : 'Contact add nahi ho paya.'
      )
    );
  }
});
  }

  close(): void {

    this.dialogRef.close();
  }
}
