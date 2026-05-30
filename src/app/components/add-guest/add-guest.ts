import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { EmailService } from '../../service/emailService';
import { GuestService } from '../../service/guest-service';
import { Familyservice } from '../../service/familyservice';
import { error } from 'console';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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
  private dialogRef = inject(MatDialogRef<AddGuestComponent>, { optional: true });
  public dialogData = inject(MAT_DIALOG_DATA, { optional: true });

  private guestService = inject(GuestService);
  private familyService = inject(Familyservice);
  private cdr = inject(ChangeDetectorRef);
  public editData = inject(MAT_DIALOG_DATA, { optional: true });

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
    family: {
      id: undefined as number | undefined,
      familyName: ''
    }
  };

  ngOnInit(): void {
    // Families list loading for simple dropdown selection mapping
    this.familyService.getData().subscribe({
      next: (response: any) => {
        let parsedData = typeof response === 'string' ? JSON.parse(response) : response;


        setTimeout(() => {
          this.families = parsedData?.content || parsedData?.familyList || (Array.isArray(parsedData) ? parsedData : [parsedData]);
          this.filteredFamilies = this.families;
          console.log("Dropdown ke liye loaded families:", this.families);
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => console.error("Error loading families:", err)
    });

    // Edit configuration tracking layer load
    if (this.editData) {
      this.isEditMode = true;
      this.guest = { ...this.editData };

      if (!this.guest.family) {
        this.guest.family = { id: undefined, familyName: '' };
      }

      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    }
  }


  filterFamilies(): void {
    const value = this.guest.family?.familyName ? this.guest.family.familyName.toLowerCase().trim() : '';

    if (!value) {
      this.filteredFamilies = this.families;
    } else {
      this.filteredFamilies = this.families.filter(family =>
        family.familyName?.toLowerCase().includes(value)
      );
    }
  }

  save(): void {
    if (!this.guest.whatsapp_Number) {
      this.guest.whatsapp_Number = this.guest.phoneNumber;
    }

    // ====================================================
    // 1. EDIT MODE CONFIGURATION LAYER (WORKING PROPERLY)
    // ====================================================
    if (this.isEditMode) {
      const guestId = this.guest.id ? Number(this.guest.id) : (this.editData?.id ? Number(this.editData.id) : null);
      if (!guestId) {
        alert("Error: Guest ID nahi mil paa rahi hai!");
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
        family: {
          familyName: this.guest.family?.familyName || 'General'
        }
      };

      console.log("Database me update karne ke liye data ja rha h:", updatePayload);

      this.guestService.updateGuest(+this.guest.id!, updatePayload).subscribe({
        next: (updatedGuestFromBackend) => {
          if (this.dialogRef) this.dialogRef.close(updatedGuestFromBackend);
        },
        error: (err) => alert("Guest details update nahi ho payi!")
      });

      // ====================================================
      // 2. ADD MODE HANDLER (FIXED: CLEAN POST USING BASE API)
      // ====================================================
    } else {

      // Extraction Check: Dropdown item se direct clean text target content read kiya
      const selectedFamilyName = this.guest.family?.familyName ? this.guest.family.familyName : 'General';

      // 100% POSTMAN VERIFIED FIXED STRUCTURE PAYLOAD (No custom URLs needed)
      const exactPayload = {
        name: this.guest.name,
        phoneNumber: this.guest.phoneNumber,
        whatsapp_Number: this.guest.whatsapp_Number,
        email: this.guest.email || '',
        guestCategory: this.guest.guestCategory || '',
        gender: this.guest.gender,
        adultOrchild: this.guest.adultOrchild,
        family: {
          familyName: selectedFamilyName // Flat string text mapping matching backend constraints
        }
      };

      console.log("Postman verified format sending from Angular via base save:", exactPayload);

      // Direct dynamic single pipeline trigger to standard endpoint http://localhost:8090/guests
      this.guestService.save(exactPayload).subscribe({
        next: (savedGuestFromBackend) => {
          console.log("Mubarak ho! Database me successfully save ho gaya:", savedGuestFromBackend);
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
