import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectorRef, inject, effect, untracked, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AddGuestComponent } from '../add-guest/add-guest';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { GuestService } from '../../service/guest-service';
import { MatInputModule } from '@angular/material/input';
import { NavbarActionService } from '../../service/navbar-action-service';
import { Subscription } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCard } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";

import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  PieController,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

import { ChartOptions } from 'chart.js';


Chart.register(
  PieController,
  ArcElement,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-guest',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    AddGuestComponent,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatExpansionModule,
    MatCard,
    MatIcon,
    BaseChartDirective
  ],
  templateUrl: './guest.html',
  styleUrls: ['./guest.css']
})
export class GuestComponent implements OnInit, OnDestroy {

  private dialog = inject(MatDialog);
  private guestService = inject(GuestService);
  private navBarService = inject(NavbarActionService); 
  private navBarAddSubscription!: Subscription;
  private exportSubscription!: Subscription;

  readonly displayedColumns = [
    'name',
    'gender',
    'adultOrChild',
    // 'phoneNumber',
    // 'whatsapp_Number',
    'contact',
    'guestCategory',
    'gift',
    'cash',
    'stay',
    'invitationSent',
    'familyName',
    'actions'
  ];

  readonly rawGuests = signal<any[]>([]);
  readonly guestSearchQuery = signal<string>('');
  readonly pageSize = signal<number>(10);
  readonly currentPage = signal<number>(0);
  readonly totalElements = signal<number>(0);
  readonly selectedGender = signal<string>('');
  readonly selectedType = signal<string>('');
  readonly selectedCategory = signal<string>('');
  readonly selectedGift = signal<string>('');
  readonly selectedStay = signal<string>('');
  readonly selectedCash = signal<string>('');
  readonly selectedInvitationStatus = signal<string>('');
  readonly guestCategorySummary = signal<any[]>([]);
  readonly giftSummary = signal<any[]>([]);

  selectedFile: File | null = null;

  private platformId =
    inject(PLATFORM_ID);

  private isBrowser(): boolean {

    return isPlatformBrowser(
      this.platformId
    );

  }


  guestPieChartData: any = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#8b5cf6',
        '#ec4899',
        '#f59e0b',
        '#10b981'
      ]
    }]
  };

  guestPieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  loadGiftSummary(): void {

    this.guestService
      .getGiftSummary()
      .subscribe({

        next: (response) => {

          this.giftSummary.set(
            response || []
          );

        }

      });

  }

  loadGuestCategorySummary(): void {

    this.guestService
      .getGuestCategorySummary()
      .subscribe({

        next: (response) => {

          this.guestCategorySummary.set(response);

          this.guestPieChartData = {

            labels: response.map(
              (x: any) => x.category
            ),

            datasets: [{
              data: response.map(
                (x: any) => x.count
              ),
              backgroundColor: [
                '#8b5cf6',
                '#ec4899',
                '#f59e0b',
                '#10b981'
              ]
            }]

          };

        }

      });

  }

  pagedGuests = computed(
    () => this.rawGuests()
  );

  onGenderChange(gender: string): void {
    this.selectedGender.set(gender);
    this.currentPage.set(0);
    this.fetchPaginatedGuests();
  }

  summary = signal({
    totalGuests: 0,
    invitationSent: 0,
    invitationPending: 0,
    stayRequired: 0
  });

  loadGuestSummary(): void {
    this.guestService
      .getGuestSummary()
      .subscribe({

        next: (data) => {
          this.summary.set(data);
        }

      });

  }

  onInvitationStatusChange(status: string): void {

    this.selectedInvitationStatus.set(status);
    this.currentPage.set(0);
    this.fetchPaginatedGuests();
  }

  onTypeChange(type: string): void {
    this.selectedType.set(type);
    this.currentPage.set(0);
    this.fetchPaginatedGuests();
  }

  onCategoryChange(value: string) {
    this.selectedCategory.set(value);
    this.currentPage.set(0);
    this.fetchPaginatedGuests();
  }

  onCashChange(cash: string) {
    this.selectedCash.set(cash);
    this.currentPage.set(0);
    this.fetchPaginatedGuests();
  }

  onGiftChange(gift: string) {
    this.selectedGift.set(gift);
    this.currentPage.set(0);
    this.fetchPaginatedGuests();
  }

  onStayChange(stay: string) {
    this.selectedStay.set(stay);
    this.currentPage.set(0);
    this.fetchPaginatedGuests();
  }

  constructor(
    private cdr: ChangeDetectorRef
  ) {


    effect(() => {

      const query =
        this.navBarService.searchQuery();

      untracked(() => {

        if (
          query ===
          this.guestSearchQuery()
        ) {
          return;
        }

        this.guestSearchQuery.set(query);

        this.currentPage.set(0);

        this.fetchPaginatedGuests();

      });

    });
  }


  ngOnInit(): void {

    this.loadGuestSummary();
    this.loadGuestCategorySummary();
    this.loadGiftSummary();

    this.exportSubscription =
      this.navBarService.exportClick$
        .subscribe(() => {

          if (this.isBrowser()) {
            this.downloadExcel();
          }

        });

    this.fetchPaginatedGuests();

    // FIX FIXED: Top dynamic navbar button subscription trigger setup
    this.navBarAddSubscription = this.navBarService.addClick$.subscribe(() => {
      if (this.isBrowser()) {
        this.openAddGuestDialog();
      }
    });
  }

  // FIX FIXED: Explicitly added component destroy hook to tear down references
  ngOnDestroy(): void {

    if (this.navBarAddSubscription) {
      this.navBarAddSubscription.unsubscribe();
    }

    if (this.exportSubscription) {
      this.exportSubscription.unsubscribe();
    }

  }

  openAddGuestDialog(): void {
    const dialogRef = this.dialog.open(AddGuestComponent, {
      width: '950px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clearFilters();
        this.loadGuestSummary();
        this.loadGiftSummary();

        Promise.resolve().then(() => {
          this.rawGuests.set([...this.rawGuests(), result]);
          this.cdr.detectChanges();
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.fetchPaginatedGuests();
  }

  clearFilters() {
    this.selectedGender.set('');
    this.selectedType.set('');
    this.selectedCategory.set('');
    this.selectedGift.set('');
    this.selectedStay.set('');
    this.selectedCash.set('');
    this.selectedInvitationStatus.set('')
    this.currentPage.set(0);
    this.fetchPaginatedGuests();
  }

  deleteGuestRecord(id: number): void {
    if (confirm("Do you want to delete the record?")) {
      this.guestService.deleteGuest(id).subscribe({
        next: () => {

          const filteredList = this.rawGuests().filter(guest => guest.id !== id);
          this.rawGuests.set(filteredList);
          this.loadGuestSummary();
          this.loadGiftSummary();
          this.fetchPaginatedGuests();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Delete karne me koi error aaya:", err);
          alert("Backend se record delete nahi ho paya! Console trace check karein.");
        }
      });
    }
  }

  // edit guest

  openEditGuestDialog(guestData: any): void {
    const dialogRef = this.dialog.open(AddGuestComponent, {
      width: '950px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      data: guestData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadGuestSummary();
        this.loadGiftSummary();
        this.fetchPaginatedGuests();

        setTimeout(() => {
          const updatedList = this.rawGuests().map(guest =>
            guest.id === result.id ? result : guest
          );
          this.rawGuests.set(updatedList);
          this.cdr.detectChanges();

        });
      }
    });
  }

  downloadExcel(): void {
    this.guestService.downloadGuests(
      this.selectedGender(),
      this.selectedType(),
      this.selectedGift(),
      this.selectedCash(),
      this.selectedCategory(),
      this.selectedStay(),
      this.selectedInvitationStatus()
    ).subscribe({
      next: (response: Blob) => {

        const blob = new Blob(
          [response],
          {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        );

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'Guests.xlsx';

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Excel download failed', err);
      }
    });
  }

  // guest filter
  applyGuestFilter(event: Event): void {

    const filterValue =
      (event.target as HTMLInputElement).value;

    this.guestSearchQuery.set(
      filterValue
    );

    this.currentPage.set(0);

    this.fetchPaginatedGuests();

  }

  fetchPaginatedGuests(): void {
    const page = this.currentPage();
    const size = this.pageSize();
    const search = this.guestSearchQuery();
    const gender = this.selectedGender();
    const type = this.selectedType();
    const category = this.selectedCategory();
    const gift = this.selectedGift();
    const stay = this.selectedStay();
    const cash = this.selectedCash();
    const invitationSent = this.selectedInvitationStatus();

    this.guestService.getGuestsPaged(
      page,
      size,
      search,
      gender,
      type,
      category,
      gift,
      stay,
      cash,
      invitationSent).subscribe({
        next: (response: any) => {

          this.rawGuests.set(response.content || []);

          this.totalElements.set(response.totalElements || 0);

          this.navBarService.totalGuestCount.set(
            response.totalElements
          );

          this.cdr.detectChanges();
        }
        ,
        error: (err) => {
          console.error("Pagination data fetch error: ", err);
        }
      });
  }

  onFileSelected(event: any): void {

    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;
    }
  }

}
