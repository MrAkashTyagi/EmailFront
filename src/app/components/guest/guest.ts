import { Component, OnInit, signal, computed, ChangeDetectorRef, inject } from '@angular/core'; // computed import kiya
import { CommonModule } from '@angular/common';
import { EmailService } from '../../service/emailService';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'; // MatPaginatorModule add kiya
import { AddGuestComponent } from '../add-guest/add-guest';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { GuestService } from '../../service/guest-service';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


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

  ], // Dono modules yahan rkhein
  templateUrl: './guest.html',
  styleUrls: ['./guest.css']
})
export class GuestComponent implements OnInit {
  private dialog = inject(MatDialog);
  private guestService = inject(GuestService);

  // Aapke naye HTML ke matColumnDef ke hisab se columns array updated h
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

  // Asli data store karne ke liye main signal
  rawGuests = signal<any[]>([]);

  // 2. Naya signal user ke search text ko track karne ke liye
  guestSearchQuery = signal<string>('');

  // Pagination states ke liye naye signals
  pageSize = signal<number>(5);  // Ek page par default 5 rows dikhengi
  currentPage = signal<number>(0); // Default page index 0 rahega

  // Yeh computed signal automatic data ko slice (page) karega jab bhi rawGuests, currentPage ya pageSize badlega
  pagedGuests = computed(() => {
    const startIndex = this.currentPage() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.filteredGuests().slice(startIndex, endIndex);
  });

  constructor(
    private emailService: EmailService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.emailService.getData().subscribe({
      next: (response: any) => {
        let parsedData = response;

        if (typeof response === 'string') {
          try {
            parsedData = JSON.parse(response);
          } catch (e) {
            console.error("JSON Parse Error:", e);
          }
        }

        let dataArray = [];
        if (parsedData && Array.isArray(parsedData)) {
          dataArray = parsedData;
        } else if (parsedData && parsedData.content) {
          dataArray = parsedData.content;
        } else {
          dataArray = parsedData ? [parsedData] : [];
        }

        console.log("Sahi Array Length:", dataArray.length);
        this.rawGuests.set(dataArray);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("API Error: ", err);
      }
    });
  }



  // ADD BUTTON CLICK PAR POPUP FORM KHOLNE KA LOGIC
  openAddGuestDialog(): void {
    const dialogRef = this.dialog.open(AddGuestComponent, {
      width: '500px', // Premium standard desktop size layout
      disableClose: true // Taki bahar click karne par data galti se loose na ho
    });

    dialogRef.afterClosed().subscribe(result => {
      // Jab form successful database me save hoke data dega
      if (result) {
        console.log("Database se save hoke aaya live object:", result);
        // Table me automatic top par push ho jayega bina refresh ke
        this.rawGuests.set([result, ...this.rawGuests()]);
      }
    });
  }


  loadAllGuests(): void {
    this.emailService.getData().subscribe({ // Jo bhi aapka fetch data method naam ho
      next: (response: any) => {
        let parsedData = typeof response === 'string' ? JSON.parse(response) : response;
        let dataArray = parsedData?.content || parsedData?.guestList || (Array.isArray(parsedData) ? parsedData : [parsedData]);
        this.rawGuests.set(dataArray);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  // Jab user page badlega to ye function chalega aur signals ko update karega
  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  // 2. DELETE FUNCTION LOGIC
  deleteGuestRecord(id: number): void {
    // Browser popup se confirmation confirmation puchenge
    if (confirm("Kya aap sach me is guest ko delete karna chahte hain?")) {

      // GuestService ka delete method call kiya
      this.guestService.deleteGuest(id).subscribe({
        next: () => {
          console.log(`Guest ID ${id} database se delete ho gaya!`);

          // UI se us record ko live bina reload ke hatane ka tarika
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
    // Dialog open karte waqt hum 'data' property me row ka data bhej rahe hain
    const dialogRef = this.dialog.open(AddGuestComponent, {
      width: '500px',
      disableClose: true,
      data: guestData // <-- Isse naye component ko pura data mil jayega
    });

    dialogRef.afterClosed().subscribe(result => {
      // Jab user update karke form close karega, toh result me naya updated data milega
      if (result) {
        console.log("Database se update hokar aaya live object:", result);

        // UI Table me us specific row ko live change karne ka modern signal map tarika
        const updatedList = this.rawGuests().map(guest =>
          guest.id === result.id ? result : guest
        );

        this.rawGuests.set(updatedList);
        this.cdr.detectChanges();
      }
    });
  }


  // 3. Yeh magic computed signal hai jo automatic filter karega jab bhi rawGuests ya searchQuery badlegi
  filteredGuests = computed(() => {
    const query = this.guestSearchQuery().trim().toLowerCase();
    const allGuests = this.rawGuests();

    if (!query) {
      return allGuests; // Agar search box khali hai toh saare guests dikhao
    }

    // Yahan check karein ki guest ka naam filter se match ho raha hai ya nahi
    // Note: Agar aapki key 'name' ki jagah 'guestName' hai, toh element.guestName likh lena
    return allGuests.filter((element: any) =>
      element.name?.toLowerCase().includes(query) ||
      element.id?.toString().includes(query)
    );
  });

  applyGuestFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.guestSearchQuery.set(filterValue);
    this.currentPage.set(0);
  }

}
