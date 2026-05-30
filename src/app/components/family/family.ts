import { Component, inject, ChangeDetectorRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Familyservice } from '../../service/familyservice';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { JsonPipe } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddFamily } from '../add-family/add-family';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

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
    AddFamily,
    MatPaginatorModule


  ],
  templateUrl: './family.html',
  styleUrl: './family.css',
})
export class Family implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator

  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'id',
    'name',
    'actions'
  ];

  // rawFamilies: any[] = [];

  // 3. rawFamilies ko ab hum MatTableDataSource banayenge
  rawFamilies = new MatTableDataSource(<any>[]);

  constructor(private familyService: Familyservice, private cdr: ChangeDetectorRef) { }

  // 3. Yeh naya hook add kijiye jo data loading ke baad paginator link karega
  ngAfterViewInit() {
    this.rawFamilies.paginator = this.paginator;
  }

  ngOnInit(): void {
    // App ke load hote hi yeh automatic trigger ho jayega
    this.familyService.getData().subscribe({
      next: (response: any) => {
        console.log('Data loaded successfully:', response);

        let parsedData = typeof response === 'string' ? JSON.parse(response) : response;
        const dataArray = parsedData?.content || parsedData?.familyList || (Array.isArray(parsedData) ? parsedData : [parsedData]);


        setTimeout(() => {
          // 4. Data ko data source me dala aur paginator connect kiya
          this.rawFamilies.data = dataArray;
          // this.rawFamilies.paginator = this.paginator;

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
          this.rawFamilies.data = [...this.rawFamilies.data, result];
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
          this.rawFamilies.data = this.rawFamilies.data.filter((family: any) => family.id !== id);

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

  openEditFamilyDialog(familyData: any): void {
    console.log("Clicked edit button", familyData);

    const dialogRef = this.dialog.open(AddFamily, {

      width: '500px',
      disableClose: true,
      data: familyData // <--- Yeh purana data hum popup ke andar bhej rahe hain
    });

    dialogRef.afterClosed().subscribe(result => {
      // Jab user edit form save karke live updated object wapas bhejega
      if (result) {
        console.log("Databse se aaya hua updated object : ", result);

        setTimeout(() => {
          // UI ke array me se purane record ko naye (result) se replace karne ka live tarika
          this.rawFamilies.data = this.rawFamilies.data.map((family: any) => family.id === result.id ? result : family);

          this.cdr.detectChanges();
        }, 0);

      }
    });

  }


  applyFamilyFilter(event: Event): void {
    // User ne input box me jo type kiya use pakda
    const filterValue = (event.target as HTMLInputElement).value;

    // Data source me filter value pass kar di (automatic trim aur lowercase hoke search karega)
    this.rawFamilies.filter = filterValue.trim().toLowerCase();

    // Agar user page 2 par baitha hai aur search karta hai, toh table automatic page 1 par aa jaye
    if (this.rawFamilies.paginator) {
      this.rawFamilies.paginator.firstPage();
    }
  }

}
