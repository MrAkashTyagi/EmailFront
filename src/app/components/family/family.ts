import { Component, inject, ChangeDetectorRef, ViewChild, OnInit, AfterViewInit, OnDestroy, effect } from '@angular/core';
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
import { NavbarActionService } from '../../service/navbar-action-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-family',
  standalone: true,
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
export class Family implements OnInit, AfterViewInit, OnDestroy {

  expandedElement: any | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private navBarService = inject(NavbarActionService);
  private navBarAddSubscription!: Subscription;

  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'id',
    'name',
    'actions'
  ];

  // RawFamilies initialized as MatTableDataSource
  rawFamilies = new MatTableDataSource<any>([]);

  constructor(private familyService: Familyservice, private cdr: ChangeDetectorRef) {
    // Angular Signal effect hook listens globally to Navbar query emissions
    effect(() => {
      const query = this.navBarService.searchQuery();
      console.log('Navbar action signal se live search text aaya:', query);
      
      if (this.rawFamilies) {
        this.rawFamilies.filter = query.trim().toLowerCase();
      }
    });
  }

  ngAfterViewInit() {
    this.rawFamilies.paginator = this.paginator;
  }
  
  ngOnInit(): void {
    // Backend API trigger to load initial table content arrays
    this.familyService.getData().subscribe({
      next: (response: any) => {
        console.log('Data loaded successfully:', response);

        let parsedData = typeof response === 'string' ? JSON.parse(response) : response;
        const dataArray = parsedData?.content || parsedData?.familyList || (Array.isArray(parsedData) ? parsedData : [parsedData]);

        setTimeout(() => {
          this.rawFamilies.data = dataArray;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error: any) => {
        console.error('Error loading data:', error);
      }
    });

    // FIX FIXED: Variable spelling alignment matching 'navBarAddSubscription' pointer reference
    this.navBarAddSubscription = this.navBarService.addClick$.subscribe(() => {
      if (window.location.pathname.includes('family')) {
        console.log('Navbar header click sequence se family popup trigger fire hua!');
        this.openAddFamilyDialog(); 
      }
    });
  }

  // FIX FIXED: Explicitly added OnDestroy engine declaration to tear down subscription variables
  ngOnDestroy(): void {
    if (this.navBarAddSubscription) {
      this.navBarAddSubscription.unsubscribe();
    }
  }

  openAddFamilyDialog(): void {
    console.log("Add Family Button Clicked!");
    const dialogRef = this.dialog.open(AddFamily, {
      width: '500px',
      disableClose: true 
    });

    dialogRef.afterClosed().subscribe(result => {     
      if (result) {
        console.log("Database se save hoke aaya live object:", result);

        setTimeout(() => {
          const isAlreadyPresent = this.rawFamilies.data.some((f: any) => f.id === result.id);
          if (isAlreadyPresent) {
            console.log("Yeh family pehle se table me hai, duplicate push roka gaya.");
            alert("Family Already Exists !!");
          } else {
            this.rawFamilies.data = [...this.rawFamilies.data, result];
          }
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  deleteFamilyRecord(id: number): void {
    if (confirm("Kya aap sach me is family ko delete karna chahte hain?")) {
      this.familyService.deleteFamily(id).subscribe({
        next: () => {
          console.log(`Family ID ${id} successfully delete ho gayi!`);
          this.rawFamilies.data = this.rawFamilies.data.filter((family: any) => family.id !== id);
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
      data: familyData 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log("Databse se aaya hua updated object : ", result);

        setTimeout(() => {
          this.rawFamilies.data = this.rawFamilies.data.map((family: any) => family.id === result.id ? result : family);
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  applyFamilyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.rawFamilies.filter = filterValue.trim().toLowerCase();

    if (this.rawFamilies.paginator) {
      this.rawFamilies.paginator.firstPage();
    }
  }
}
