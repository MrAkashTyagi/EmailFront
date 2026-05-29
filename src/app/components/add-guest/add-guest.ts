import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog'; // MAT_DIALOG_DATA add kiya
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { EmailService } from '../../service/emailService';
import { GuestService } from '../../service/guest-service';
import { error } from 'console';


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
    MatCardModule
  ],
  templateUrl: './add-guest.html',
  styleUrls: ['./add-guest.css']
})
export class AddGuestComponent implements OnInit {
  // ISKO OPTIONAL BANA DIYA TA KI AGAR DIRECT PAGE PAR BHI RENDER HO TO ERROR NA AAYE
  private dialogRef = inject(MatDialogRef<AddGuestComponent>, { optional: true });
  public dialogData = inject(MAT_DIALOG_DATA, { optional: true });

  private guestService = inject(GuestService);

  public editData = inject(MAT_DIALOG_DATA, { optional: true });

  isEditMode = false;

  guest = {
    id: undefined,
    name: '',
    gender: '',
    adultOrchild: 'Adult',
    phoneNumber: '',
    whatsapp_Number: '',
    email: '',
    guestCategory: '',
    family: {
      familyName: ''
    }
  };

  ngOnInit(): void {
    // 2. Agar editData khali nahi hai, matlab user Edit click karke aaya hai
    if (this.editData) {
      this.isEditMode = true;
      // Purane data ki copy bana kar inputs me bind kar di
      this.guest = { ...this.editData };

      if (!this.guest.family) {
        this.guest.family = { familyName: '' };
      }
    }
  }

  save(): void {
    // 1. Agar whatsapp number khali choda hai toh phone number copy karlo
    if (!this.guest.whatsapp_Number) {
      this.guest.whatsapp_Number = this.guest.phoneNumber;
    }

    // ----------------------------------------------------
    // EDIT MODE LOGIC (Yahan se data UPDATE hone database me jayega)
    // ----------------------------------------------------
    if (this.isEditMode) {

      const guestId = this.guest.id ? Number(this.guest.id) : (this.editData?.id ? Number(this.editData.id) : null);
      if (!guestId) {
        console.error("Angular side validation fail: ID nahi mili!", this.guest);
        alert("Error: Guest ID nahi mil paa rahi hai!");
        return;
      }

      // Update payload me ID bhejna mandatory (zaroori) hai taaki backend ko pata chale kis row ko badalna hai

      // const guestId = Number(this.guest.id);
      const updatePayload = {
        id: guestId,
        name: this.guest.name,
        phoneNumber: this.guest.phoneNumber,
        whatsapp_Number: this.guest.whatsapp_Number,
        email: this.guest.email || '',
        guestCategory: this.guest.guestCategory || '',
        gender: this.guest.gender,
        adultOrchild: this.guest.adultOrchild,
        family: {
          familyName: this.guest.family?.familyName || 'General'
        }
      };

      console.log("Database me update karne ke liye data ja rha h:", updatePayload);

      // API PUT call trigger kiya (guest.id ke sath)
      this.guestService.updateGuest(+this.guest.id!, updatePayload).subscribe({
        next: (updatedGuestFromBackend) => {
          console.log("Mubarak ho! Database me record successfully update ho gaya:", updatedGuestFromBackend);

          // Popup close karenge aur backend se aaya naya updated data main table ko de denge
          if (this.dialogRef) {
            this.dialogRef.close(updatedGuestFromBackend);
          }
        },
        error: (err) => {
          console.error("Database update failed error trace:", err);
          alert("Guest details update nahi ho payi! Console check karein.");
        }
      });

      // ----------------------------------------------------
      // ADD MODE LOGIC (Aapka purana superhit code jo bina kisi change ke chalega)
      // ----------------------------------------------------
    } else {

      // 2. ABSOLUTE PERFECT PAYLOAD (Bina kisi ID ke jaisa aapke postman response me h)
      const exactPayload = {
        name: this.guest.name,
        phoneNumber: this.guest.phoneNumber,
        whatsapp_Number: this.guest.whatsapp_Number,
        email: this.guest.email || '',
        guestCategory: this.guest.guestCategory || '',
        gender: this.guest.gender,
        adultOrchild: this.guest.adultOrchild,
        family: {
          familyName: this.guest.family.familyName || 'General' // No ID here!
        }
      };

      console.log("Postman verified format sending from Angular:", exactPayload);

      // 3. API POST call trigger kiya
      this.guestService.save(exactPayload).subscribe({
        next: (savedGuestFromBackend) => {
          console.log("Mubarak ho! Database me successfully save ho gaya:", savedGuestFromBackend);

          // Popup close karke naya data main table ko pass kar denge
          if (this.dialogRef) {
            this.dialogRef.close(savedGuestFromBackend);
          }
        },
        error: (err) => {
          console.error("Angular side post error detail:", err);
          alert("Naya guest save nahi ho paya! Please console check karein.");
        }
      });
    }
  }


}