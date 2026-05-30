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
      console.log("Edit mode activated for:", this.family);
    }
  }

  save(): void {
    console.log("Form submitted data : ", this.family);

      // 4. Agar EDIT mode hai toh Update API call hogi
    if (this.isEditMode) {
      // Yahan hum assumed name 'updateFamily' use kar rahe hain, aap apni service ke mutabik change kar sakte hain
      this.familyService.updateFamily(this.family).subscribe({
        next: (updatedFamilyFromBackend) => {
          console.log("Success ! Database me update hogya ", updatedFamilyFromBackend);
          this.dialogRef.close(updatedFamilyFromBackend);
        },
        error: (error) => {
          console.error("Backend update error trace : ", error);
          alert("Family update nahi ho payi ! Server console check kro.");
        }
      });
    } 




    // Agle step me service call lagayenge, abhi sirf dialog close karke data pass kar rhe hain

    this.familyService.saveFamily(this.family).subscribe({
      next: (savedFamilyFromBackend) => {
        console.log("Success ! Database me save hogya ", savedFamilyFromBackend);
        this.dialogRef.close(savedFamilyFromBackend);
      }, error: (error) => {
        console.error("Backend save error trace : ", error);
        alert("Family save nhi ho payi ! Server console check kro.");
      }
    });


    // this.dialogRef.close(this.family);
  }

}
