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

import {
  PLATFORM_ID
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';

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

  private exportSubscription!: Subscription;

  private platformId =
    inject(PLATFORM_ID);

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


  constructor(
    private familyService: Familyservice,
    private cdr: ChangeDetectorRef
  ) {

    effect(() => {

      const query =
        this.navBarService.searchQuery();

      untracked(() => {

        this.familySearchQuery.set(query);

        if (this.isBrowser()) {

          this.currentPage.set(0);

          this.fetchPaginatedFamily();

        }

      });

    });

  }


  ngOnInit(): void {

    // this.fetchPaginatedFamily();

    this.exportSubscription =
      this.navBarService.exportClick$
        .subscribe(() => {

          if (this.isBrowser()) {

            this.downloadExcel();

          }

        });

    this.navBarAddSubscription =
      this.navBarService.addClick$
        .subscribe(() => {

          this.openAddFamilyDialog();

        });

  }

  // FIX FIXED: Explicitly added OnDestroy engine declaration to tear down subscription variables
  ngOnDestroy(): void {

    if (this.navBarAddSubscription) {
      this.navBarAddSubscription.unsubscribe();
    }

    if (this.exportSubscription) {
      this.exportSubscription.unsubscribe();
    }


  }


  private isBrowser(): boolean {

    return isPlatformBrowser(
      this.platformId
    );

  }

  // family edit dialog
  openAddFamilyDialog(): void {

    const dialogRef = this.dialog.open(AddFamily, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {


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
    if (confirm("Do you want to delete the record? Deleting the family will leads to deletion of all the guests related to this family !!")) {
      this.familyService.deleteFamily(id).subscribe({
        next: () => {

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

    const dialogRef = this.dialog.open(AddFamily, {
      width: '500px',
      disableClose: true,
      data: familyData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

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

    const dialogRef = this.dialog.open(
      AddGuestComponent,
      {
        width: '950px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        autoFocus: false,
        disableClose: false,
        data: guestToEdit
      }
    );

    dialogRef.afterClosed().subscribe(result => {

      if (!result) {
        return;
      }

      const updatedFamilies =
        this.rawFamilies().map(family => {

          if (family.id !== familyData.id) {
            return family;
          }

          const updatedGuestList =
            (family.guestList || []).map(
              (guest: any) =>
                guest.id === result.id
                  ? {
                    ...guest,
                    ...result
                  }
                  : guest
            );

          return {
            ...family,
            guestList: updatedGuestList
          };
        });

      this.rawFamilies.set(updatedFamilies);

      /*
       * Signal update ke baad expandedElement ko
       * updated family object ka reference dena zaroori hai.
       */
      this.expandedElement =
        updatedFamilies.find(
          family => family.id === familyData.id
        ) || null;

      this.cdr.detectChanges();
    });
  }



  // Download Excel

  downloadExcel(): void {

    this.familyService
      .downloadFamilies()
      .subscribe({

        next: (response: Blob) => {

          const blob = new Blob(
            [response],
            {
              type:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
          );

          const url =
            window.URL.createObjectURL(
              blob
            );

          const link =
            document.createElement('a');

          link.href = url;

          link.download =
            'Families.xlsx';

          document.body.appendChild(
            link
          );

          link.click();

          document.body.removeChild(
            link
          );

          window.URL.revokeObjectURL(
            url
          );
        },

        error: (error) => {

          console.error(
            'Family export failed',
            error
          );
        }
      });
  }

}
