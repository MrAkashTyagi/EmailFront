import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectorRef, inject, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailService } from '../../service/emailService';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AddGuestComponent } from '../add-guest/add-guest';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { GuestService } from '../../service/guest-service';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NavbarActionService } from '../../service/navbar-action-service'; // Sahi path inject kiya
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
    MatFormField,
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
  private navBarService = inject(NavbarActionService); // Navbar Service Inject Ki
  private navBarAddSubscription!: Subscription; // Unsubscribe track handle karne ke liye variable

  displayedColumns: string[] = [
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

  rawGuests = signal<any[]>([]);
  guestSearchQuery = signal<string>('');
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  totalElements = signal<number>(0);
  selectedGender = signal<string>('');
  selectedType = signal<string>('');
  selectedCategory = signal<string>('');
  selectedGift = signal<string>('');
  selectedStay = signal<string>('');
  selectedCash = signal<string>('');
  selectedInvitationStatus = signal<string>('');

  guestCategorySummary = signal<any[]>([]);

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

 

  pagedGuests = computed(() => {
    return this.filteredGuests();
  });

  filteredGuests = computed(() => {
    return this.rawGuests();
  });
  

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
    console.log('Invitation Filter =>', status);
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
    private emailService: EmailService,
    private cdr: ChangeDetectorRef
  ) {
    // FIX FIXED: Angular Signal effect globally listens to central navbar search emissions
    effect(() => {
      const query = this.navBarService.searchQuery();
      console.log('Navbar action signal se live guest search text aaya:', query);

      // Navbar input query ko standard computed signal me map kar diya layout refresh ke liye
      // 2. Untracked block ke andar page reset aur fetch karein taaki loop na bane
      untracked(() => {
        this.guestSearchQuery.set(query);
        this.currentPage.set(0); // Sirf search badalne par hi page 0 hoga
        this.fetchPaginatedGuests();
      });
    });
  }


  ngOnInit(): void {
    this.loadGuestSummary();
    this.loadGuestCategorySummary();

    this.navBarService.searchQuery.set('');
    // Initial content array stream grid load

    this.navBarService.exportClick$
      .subscribe(() => {

        if (
          window.location.pathname.includes('guests')
        ) {
          this.downloadExcel();
        }

      });

    this.fetchPaginatedGuests();

    // FIX FIXED: Top dynamic navbar button subscription trigger setup
    this.navBarAddSubscription = this.navBarService.addClick$.subscribe(() => {
      if (window.location.pathname.includes('guests')) {
        console.log('Navbar header click sequence se guest popup trigger fire hua!');
        this.openAddGuestDialog();
      }
    });
  }

  // FIX FIXED: Explicitly added component destroy hook to tear down references
  ngOnDestroy(): void {
    if (this.navBarAddSubscription) {
      this.navBarAddSubscription.unsubscribe();
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
        this.loadGuestSummary();
        console.log("Database se save hoke aaya live object:", result);
        Promise.resolve().then(() => {
          // Naya record smoothly array ke sabse aakhiri kone (end) me append hoga
          this.rawGuests.set([...this.rawGuests(), result]);
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadAllGuests(): void {
    this.emailService.getData().subscribe({
      next: (response: any) => {
        let parsedData = typeof response === 'string' ? JSON.parse(response) : response;
        let dataArray = parsedData?.content || parsedData?.guestList || (Array.isArray(parsedData) ? parsedData : [parsedData]);
        this.rawGuests.set(dataArray);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
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
    if (confirm("Kya aap sach me is guest ko delete karna<li>hante hain?")) {
      this.guestService.deleteGuest(id).subscribe({
        next: () => {
          console.log(`Guest ID ${id} database se delete ho gaya!`);
          const filteredList = this.rawGuests().filter(guest => guest.id !== id);
          this.rawGuests.set(filteredList);
          this.loadGuestSummary();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Delete karne me koi error aaya:", err);
          alert("Backend se record delete nahi ho paya! Console trace check karein.");
        }
      });
    }
  }

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
        console.log("Database se update hokar aaya live object:", result);
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

  applyGuestFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.guestSearchQuery.set(filterValue);
    this.currentPage.set(0);
  }

  // Naya method jo har baar fresh paginated data layega
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


    // Apni API matching pagination query url params ke sath hit karein
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

          console.log("Sahi Array Length:", response);


          this.loadGuestSummary();

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

}
