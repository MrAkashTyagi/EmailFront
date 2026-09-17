import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit, Optional } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Familyservice } from '../../service/familyservice';
import { error } from 'console';

@Component({
  selector: 'app-add-family',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormField,
    MatCardModule,
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

  private familyService = inject(Familyservice)

  private dialogRef = inject(MatDialogRef<AddFamily>);


  public passData = inject(MAT_DIALOG_DATA, { optional: true });

  family = {
    familyName: ''
  };

  isEditMode: boolean = false;

ngOnInit(): void {
    // 3. Agar data aaya hai, iska matlab edit button se aaye hain
    if (this.passData) {
      this.isEditMode = true;
      // Purane pure data ki copy bana li aur input box me naam dikha diya
      this.family = { ...this.passData }; 
      
    }
  }



  save(): void {

  const payload = {
  ...this.family
};


  if (this.isEditMode) {

    this.familyService
      .updateFamily(payload)
      .subscribe({

        next: (updatedFamilyFromBackend) => {

          console.log(
            'Family updated successfully:',
            updatedFamilyFromBackend
          );

          this.dialogRef.close(
            updatedFamilyFromBackend
          );
        },

        error: (error) => {

          console.error(
            'Backend update error:',
            error
          );

          alert(
            error?.error?.message ||
            error?.error ||
            'Family update nahi ho payi.'
          );
        }

      });

    return;
  }

  this.familyService
    .saveFamily(payload)
    .subscribe({

      next: (savedFamilyFromBackend) => {

        console.log(
          'Family saved successfully:',
          savedFamilyFromBackend
        );

        this.dialogRef.close(
          savedFamilyFromBackend
        );
      },

      error: (error) => {

        console.error(
          'Backend save error:',
          error
        );

        alert(
          error?.error?.message ||
          error?.error ||
          'Family save nahi ho payi.'
        );
      }

    });
}


}
