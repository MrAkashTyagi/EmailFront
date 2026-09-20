import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { GuestService } from '../../service/guest-service';
import { Familyservice } from '../../service/familyservice';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NotificationService } from '../../service/notification-service';
@Component({
  selector: 'app-add-guest',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatAutocompleteModule
  ],
  templateUrl: './add-guest.html',
  styleUrls: ['./add-guest.css']
})
export class AddGuestComponent implements OnInit {

  private readonly dialogRef = inject(MatDialogRef<AddGuestComponent>, { optional: true });
  private readonly guestService = inject(GuestService);
  private readonly familyService = inject(Familyservice);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly notificationService = inject(NotificationService);

  readonly editData = inject(MAT_DIALOG_DATA, { optional: true });

  isEditMode = false;
  families: any[] = [];
  filteredFamilies: any[] = [];

  guest = {
    id: undefined,
    name: '',
    gender: '',
    adultOrchild: 'Adult',
    phoneNumber: '',
    whatsapp_Number: '',
    email: '',
    guestCategory: '',
    gift: '',
    cash: '',
    stay: '',
    invitationSent: false,
    family: {
      id: undefined as number | undefined,
      familyName: ''
    }
  };


  readonly giftOptions = [
    'Saree',
    'Joda',
    'Comforter',
    'Cash',
    'Kurta_Payjama',
    'Suit',
    'Dabba',
    'Other',
    'None'
  ];

  selectedGifts: string[] = [];

  ngOnInit(): void {

    if (this.editData) {

      this.isEditMode = true;

      this.guest = {
        ...this.guest,
        ...this.editData,
        family: this.editData.family || {
          id: undefined,
          familyName: ''
        }
      };

      this.selectedGifts =
        this.guest.gift
          ? this.guest.gift
            .split(',')
            .map(gift => gift.trim())
            .filter(Boolean)
          : [];
    }

    this.familyService
      .getAllFamiliesForDropdown()
      .subscribe({
        next: (response: any) => {

          this.families =
            response || [];

          this.filteredFamilies =
            [...this.families];

          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error(
            'Error loading families:',
            err
          );
        }
      });
  }

  filterFamilies(): void {

    const value =
      this.guest.family?.familyName
        ?.trim()
        .toLowerCase() || '';

    this.filteredFamilies =
      value
        ? this.families.filter(
          family =>
            family.familyName
              ?.toLowerCase()
              .includes(value)
        )
        : [...this.families];
  }

  save(): void {

    this.guest.gift =
      this.selectedGifts.join(',');

    if (!this.guest.whatsapp_Number) {
      this.guest.whatsapp_Number = this.guest.phoneNumber;
    }


    if (!/^[0-9]{10}$/.test(this.guest.phoneNumber)) {

      this.notificationService.warning(
        'Phone number must be exactly 10 digits'
      );

      return;
    }

    if (
      this.guest.whatsapp_Number &&
      !/^[0-9]{10}$/.test(
        this.guest.whatsapp_Number
      )
    ) {

      this.notificationService.warning(
        'Whatsapp number must be exactly 10 digits'
      );

      return;
    }

    if (this.isEditMode) {
      const guestId =
        this.guest.id
          ? Number(this.guest.id)
          : this.editData?.id
            ? Number(this.editData.id)
            : null;

      if (!guestId) {

        this.notificationService.error(
          'Error: Could not found guest id!'
        );

        return;
      }

      const updatePayload = {
        id: guestId,
        name: this.guest.name,
        phoneNumber: this.guest.phoneNumber,
        whatsapp_Number: this.guest.whatsapp_Number,
        email: this.guest.email || '',
        guestCategory: this.guest.guestCategory || '',
        gender: this.guest.gender,
        adultOrchild: this.guest.adultOrchild,
        gift: this.guest.gift,
        cash: this.guest.cash,
        stay: this.guest.stay,

        invitationSent: this.guest.invitationSent,

        family: {
          familyName:
            this.guest.family?.familyName?.trim()
            || ''
        }

      };

      this.guestService.updateGuest(
        guestId,
        updatePayload
      ).subscribe({
        next: (updatedGuestFromBackend) => {

          this.notificationService.success(
            'Guest updated successfully.'
          );

          this.dialogRef?.close(
            updatedGuestFromBackend
          );

        },
        error: () => {

          this.notificationService.error(
            'Guest details update nahi ho payi!'
          );

        }
      });

    } else {

      const selectedFamilyName =
        this.guest.family?.familyName
        || '';

      const exactPayload = {
        name: this.guest.name,
        phoneNumber: this.guest.phoneNumber,
        whatsapp_Number: this.guest.whatsapp_Number,
        email: this.guest.email || '',
        guestCategory: this.guest.guestCategory || '',
        gender: this.guest.gender,
        adultOrchild: this.guest.adultOrchild,

        gift: this.guest.gift,
        cash: this.guest.cash,
        stay: this.guest.stay,

        invitationSent: this.guest.invitationSent,

        family: {
          familyName: selectedFamilyName
        }
      };

      this.guestService.save(exactPayload).subscribe({
        next: (savedGuestFromBackend) => {

          this.notificationService.success(
            'Guest saved successfully.'
          );

          this.dialogRef?.close(
            savedGuestFromBackend
          );

        },

        error: (err) => {

          console.error(
            'Guest save failed:',
            err
          );

          this.notificationService.error(
            'Naya guest save nahi ho paya!'
          );

        }
      });
    }
  }
}
