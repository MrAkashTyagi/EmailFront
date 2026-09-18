import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Familyservice } from '../../service/familyservice';
import { NotificationService } from '../../service/notification-service';

@Component({
  selector: 'app-add-family',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormField,
    MatDialogModule,
    CommonModule,
    MatButtonModule,
    MatLabel,
    MatInputModule

  ],
  templateUrl: './add-family.html',
  styleUrl: './add-family.css',
})
export class AddFamily implements OnInit {

  private readonly notificationService =
    inject(NotificationService);


  private readonly familyService =
    inject(Familyservice);

  private readonly dialogRef =
    inject(MatDialogRef<AddFamily>);


  readonly passData =
    inject(
      MAT_DIALOG_DATA,
      { optional: true }
    );

  family = {
    familyName: ''
  };

  isEditMode: boolean = false;

  ngOnInit(): void {
    if (this.passData) {
      this.isEditMode = true;
      this.family = { ...this.passData };

    }
  }



  save(): void {

    const payload = this.family;

    if (this.isEditMode) {

      this.familyService
        .updateFamily(payload)
        .subscribe({

          next: (updatedFamilyFromBackend) => {

            this.notificationService.success(
              'Family updated successfully.'
            );

            this.dialogRef?.close(
              updatedFamilyFromBackend
            );

          },


          error: (error) => {

            console.error(
              'Backend update error:',
              error
            );

            this.notificationService.error(
              error?.error?.message ||
              error?.error ||
              'Family save nahi ho payi.'
            );
          }

        });

      return;
    }

    this.familyService
      .saveFamily(payload)
      .subscribe({

        next: (savedFamilyFromBackend) => {

          this.notificationService.success(
            'Family saved successfully.'
          );

          this.dialogRef?.close(
            savedFamilyFromBackend
          );

        },

        error: (error) => {

          console.error(
            'Backend save error:',
            error
          );

          this.notificationService.error(
            error?.error?.message ||
            error?.error ||
            'Family save nahi ho payi.'
          );
        }

      });
  }


}
