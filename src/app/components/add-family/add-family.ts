import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
export class AddFamily {

  private familyService = inject(Familyservice)

  private dialogRef = inject(MatDialogRef<AddFamily>);

  family={
    familyName: ''
  };


save(): void{
  console.log("Form submitted data : ", this.family);
  // Agle step me service call lagayenge, abhi sirf dialog close karke data pass kar rhe hain

  this.familyService.saveFamily(this.family).subscribe({
    next: (savedFamilyFromBackend) => {
      console.log("Success ! Database me save hogya ", savedFamilyFromBackend);
      this.dialogRef.close(savedFamilyFromBackend);
    },error: (error) => {
      console.error("Backend save error trace : ",error);
      alert("Family save nhi ho payi ! Server console check kro.");
    }
  });
  

  // this.dialogRef.close(this.family);
}

}
