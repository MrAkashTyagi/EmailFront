import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectorRef, inject, effect } from '@angular/core';
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
    MatInputModule
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
    'id',
    'name',
    'gender',
    'adultOrChild',
    'phoneNumber',
    'whatsapp_Number',
    'guestCategory',
    'familyName',
    'actions'
  ];

  rawGuests = signal<any[]>([]);
  guestSearchQuery = signal<string>('');
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  totalElements = signal<number>(0);

  pagedGuests = computed(() => {
    // const startIndex = this.currentPage() * this.pageSize();
    // const endIndex = startIndex + this.pageSize();
    // return this.filteredGuests().slice(startIndex, endIndex);

    return this.filteredGuests();
  });

  filteredGuests = computed(() => {
    // const query = this.guestSearchQuery().trim().toLowerCase();
    // const allGuests = this.rawGuests();

    // if (!query) {
    //   return allGuests; 
    // }

    // return allGuests.filter((element: any) =>
    //   element.name?.toLowerCase().includes(query) ||
    //   element.id?.toString().includes(query)
    // );

    return this.rawGuests();

  });

  constructor(
    private emailService: EmailService,
    private cdr: ChangeDetectorRef
  ) {
    // FIX FIXED: Angular Signal effect globally listens to central navbar search emissions
    effect(() => {
      const query = this.navBarService.searchQuery();
      console.log('Navbar action signal se live guest search text aaya:', query);

      // Navbar input query ko standard computed signal me map kar diya layout refresh ke liye
      this.guestSearchQuery.set(query);
      this.currentPage.set(0); // Search hone par page 1 par reset karega hamesha
      this.fetchPaginatedGuests();
    });
  }

  ngOnInit(): void {
    // Initial content array stream grid load

    this.fetchPaginatedGuests();
    // this.emailService.getData().subscribe({
    //   next: (response: any) => {
    //     let parsedData = response;

    //     if (typeof response === 'string') {
    //       try {
    //         parsedData = JSON.parse(response);
    //       } catch (e) {
    //         console.error("JSON Parse Error:", e);
    //       }
    //     }

    //     let dataArray = [];
    //     if (parsedData && Array.isArray(parsedData)) {
    //       dataArray = parsedData;
    //     } else if (parsedData && parsedData.content) {
    //       dataArray = parsedData.content;
    //     } else {
    //       dataArray = parsedData ? [parsedData] : [];
    //     }

    //     console.log("Sahi Array Length:", dataArray.length);
    //     this.rawGuests.set(dataArray);
    //     this.cdr.detectChanges();
    //   },
    //   error: (err) => {
    //     console.error("API Error: ", err);
    //   }
    // });

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
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
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

  deleteGuestRecord(id: number): void {
    if (confirm("Kya aap sach me is guest ko delete karna<li>hante hain?")) {
      this.guestService.deleteGuest(id).subscribe({
        next: () => {
          console.log(`Guest ID ${id} database se delete ho gaya!`);
          const filteredList = this.rawGuests().filter(guest => guest.id !== id);
          this.rawGuests.set(filteredList);
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
      width: '500px',
      disableClose: true,
      data: guestData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
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

  applyGuestFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.guestSearchQuery.set(filterValue);
    this.currentPage.set(0);
  }

  // Naya method jo har baar fresh paginated data layega
  fetchPaginatedGuests(): void {
    const page = this.currentPage();
    const size = this.pageSize();

    // Apni API matching pagination query url params ke sath hit karein
    this.guestService.getGuestsPaged(page, size).subscribe({
      next: (response: any) => {
        // Spring Boot Page object se content aur totalElements nikaalein
         console.log("Sahi Array Length:", response);
        this.rawGuests.set(response.content || []);
        this.totalElements.set(response.totalElements || 0);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Pagination data fetch error: ", err);
      }
    });
  }

}
