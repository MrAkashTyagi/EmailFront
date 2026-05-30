import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Familyservice } from '../../service/familyservice';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { JsonPipe } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddFamily } from '../add-family/add-family';

@Component({
  selector: 'app-family',
  imports: [

    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    JsonPipe,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDialogModule,
    AddFamily

  ],
  templateUrl: './family.html',
  styleUrl: './family.css',
})
export class Family {

  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'id',
    'name',
    'actions'
  ];

  rawFamilies: any[] = [];

  constructor(private familyService: Familyservice, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // App ke load hote hi yeh automatic trigger ho jayega
    this.familyService.getData().subscribe({
      next: (response: any) => {
        console.log('Data loaded successfully:', response);

        let parsedData = typeof response === 'string' ? JSON.parse(response) : response;
        const dataArray = this.rawFamilies = parsedData?.content || parsedData?.familyList || (Array.isArray(parsedData) ? parsedData : [parsedData]);


        setTimeout(() => {
          this.rawFamilies = dataArray;
          this.cdr.detectChanges();
        }, 0);

        // this.cdr.detectChanges();


      },
      error: (error: any) => {
        console.error('Error loading data:', error);
      }
    });
  }

  // ADD BUTTON CLICK PAR POPUP FORM KHOLNE KA LOGIC
  openAddFamilyDialog(): void {
    console.log("Add Family Button Clicked!");
    const dialogRef = this.dialog.open(AddFamily, {
      width: '500px', // Premium standard desktop size layout
      disableClose: true // Taki bahar click karne par data galti se loose na ho
    });

    dialogRef.afterClosed().subscribe(result => {
      // Jab form successful database me save hoke data dega       
      if (result) {
        console.log("Database se save hoke aaya live object:", result);


        setTimeout(() => {
          //     // Table me automatic top par push ho jayega bina refresh ke
          this.rawFamilies = ([...this.rawFamilies, result]);
          // 2. Table ko refresh karne ke liye force trigger lagaya
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  deleteFamilyRecord(id: number): void {
    // Pahle browser popup se confirmation puchenge
    if (confirm("Kya aap sach me is family ko delete karna chahte hain?")) {

      // Service ka delete method call kiya
      this.familyService.deleteFamily(id).subscribe({
        next: () => {
          console.log(`Family ID ${id} successfully delete ho gayi!`);

          // UI se us record ko live bina page reload kiye hatane ka tarika
          this.rawFamilies = this.rawFamilies.filter(family => family.id !== id);

          // Screen ko refresh ka signal diya
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("Delete karne me error aaya:", error);
          alert("Family delete nahi ho payi! Pehle check karein ki is family me koi guest mapped toh nahi hai.");
        }
      });
    }
  }

  openEditFamilyDialog(familyData: any): void{
    console.log("Clicked edit button", familyData);

    const dialogRef = this.dialog.open(AddFamily, {

      width: '500px',
      disableClose: true,
      data: familyData // <--- Yeh purana data hum popup ke andar bhej rahe hain
    });

    dialogRef.afterClosed().subscribe(result => {
      // Jab user edit form save karke live updated object wapas bhejega
      if(result){
        console.log("Databse se aaya hua updated object : ",result);

        setTimeout(()=> {
           // UI ke array me se purane record ko naye (result) se replace karne ka live tarika
          this.rawFamilies = this.rawFamilies.map(family => family.id === result.id ? result : family);

          this.cdr.detectChanges();
        },0);

      }
    });

  }

}
