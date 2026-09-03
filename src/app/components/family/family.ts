import { Component, inject, ChangeDetectorRef, ViewChild, OnInit, AfterViewInit, OnDestroy, effect, signal, computed, untracked } from '@angular/core';
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
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NavbarActionService } from '../../service/navbar-action-service';
import { Subscription } from 'rxjs';
import { AddGuestComponent } from '../add-guest/add-guest';

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
export class Family implements OnInit, OnDestroy {

  expandedElement: any | null = null;

  // @ViewChild(MatPaginator) paginator!: MatPaginator;

  private navBarService = inject(NavbarActionService);
  private navBarAddSubscription!: Subscription;

  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'name',
    'actions'
  ];

  rawFamilies = signal<any[]>([]);
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  familySearchQuery = signal<string>('');
  totalElements = signal<number>(0);

  pagedFamilies = computed(() => {
    return this.filteredFamilies();
  });

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.fetchPaginatedFamily();
  }

  filteredFamilies = computed(() => {
    return this.rawFamilies();
  });


  constructor(private familyService: Familyservice, private cdr: ChangeDetectorRef) {
    // Angular Signal effect hook listens globally to Navbar query emissions
    effect(() => {
      const query = this.navBarService.searchQuery();
      console.log('Navbar action signal se live search text aaya:', query);
      untracked(() => {
        this.familySearchQuery.set(query);
        this.currentPage.set(0); // Sirf search badalne par hi page 0 hoga
        this.fetchPaginatedFamily();
      });
    });
  }


  ngOnInit(): void {
    this.fetchPaginatedFamily();

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
          Promise.resolve().then(() => {
            this.rawFamilies.set([...this.rawFamilies(), result]);
            this.cdr.detectChanges();
          });
        });
      }
    });
  }

  deleteFamilyRecord(id: number): void {
    if (confirm("Kya aap sach me is family ko delete karna chahte hain?")) {
      this.familyService.deleteFamily(id).subscribe({
        next: () => {
          console.log(`Family ID ${id} successfully delete ho gayi!`);
          this.fetchPaginatedFamily();
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
        console.log(
          "Database se aaya hua updated object:",
          result
        );
        this.fetchPaginatedFamily();
      }
    });
  }

  applyFamilyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.familySearchQuery.set(filterValue);
    this.currentPage.set(0);
  }

  fetchPaginatedFamily(): void {

    const page = this.currentPage();
    const size = this.pageSize();
    const search = this.familySearchQuery();

    this.familyService.getFamilyPaginated(page, size, search).subscribe({

      next: (response: any) => {

  this.rawFamilies.set(response.content || []);

  this.totalElements.set(
    response.totalElements || 0
  );

  this.cdr.detectChanges();

  this.navBarService.totalGuestCount.set(
  response.totalElements
);

},
      error: (err) => {
        console.error("Pagination data fetch error: ", err);
      }

    });
  }


  openEditGuestDialog(
    guestData: any,
    familyData: any
  ): void {

    const guestToEdit = {
      ...guestData,
      family: {
        id: familyData.id,
        familyName: familyData.familyName
      }
    };

    console.log("Guest Data =", guestToEdit);

    const dialogRef = this.dialog.open(
      AddGuestComponent,
      {
        width: '500px',
        disableClose: false,
        data: guestToEdit
      }
    );

    dialogRef.afterClosed().subscribe(result => {

      if (result) {
        this.fetchPaginatedFamily();
      }

    });
  }
}
