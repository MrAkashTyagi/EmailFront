import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  MatTableModule
} from '@angular/material/table';

import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatTooltipModule
} from '@angular/material/tooltip';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';



import {
  NotificationService
} from '../../service/notification-service';


import { WeddingContactService } from '../../service/wedding-contact-service';
import { ContactDialog } from '../contact-dialog/contact-dialog';

@Component({
  selector: 'app-contacts-vendors',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './contacts-vendors.html',
  styleUrl: './contacts-vendors.css'
})
export class ContactsVendors
  implements OnInit {

  private readonly contactService =
    inject(
      WeddingContactService
    );

  private readonly dialog =
    inject(MatDialog);

  private readonly notificationService =
    inject(
      NotificationService
    );

  readonly contacts =
    signal<any[]>([]);

  readonly totalElements =
    signal<number>(0);

  readonly currentPage =
    signal<number>(0);

  readonly pageSize =
    signal<number>(10);

  readonly searchText =
    signal<string>('');

  readonly loading =
    signal<boolean>(false);

  readonly displayedColumns = [
    'name',
    'category',
    'contactPerson',
    'mobileNumber',
    'address',
    'advancePaid',
    'pendingAmount',
    'actions'
  ];

  ngOnInit(): void {

    this.loadContacts();
  }

  loadContacts(): void {



    this.loading.set(true);

    this.contactService
      .getContacts(
        this.currentPage(),
        this.pageSize(),
        this.searchText()
      )
      .subscribe({

        next: response => {

          console.log(
            'CONTACT RESPONSE',
            response
          );

          this.contacts.set(
            response?.content
            || []
          );

          this.totalElements.set(
            response?.totalElements
            || 0
          );

          this.loading.set(false);
        },

        error: error => {

          this.loading.set(false);

          console.error(
            'Contacts load failed:',
            error
          );

          this.notificationService.error(
            'Contacts load nahi ho paye.'
          );
        }
      });
  }

  onSearch(
    event: Event
  ): void {

    const value =
      (
        event.target as HTMLInputElement
      )?.value || '';

    this.searchText.set(
      value
    );

    this.currentPage.set(0);

    this.loadContacts();
  }

  onPageChange(
    event: PageEvent
  ): void {

    this.currentPage.set(
      event.pageIndex
    );

    this.pageSize.set(
      event.pageSize
    );

    this.loadContacts();
  }

  openAddDialog(): void {

    const dialogRef =
      this.dialog.open(
        ContactDialog,
        {
          width: '820px',
          maxWidth: '95vw',
          maxHeight: '92vh',
          autoFocus: false,
          disableClose: true
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(result => {

        if (!result) {
          return;
        }

        this.currentPage.set(0);

        this.loadContacts();
      });
  }

  openEditDialog(
    contact: any
  ): void {

    const dialogRef =
      this.dialog.open(
        ContactDialog,
        {
          width: '820px',
          maxWidth: '95vw',
          maxHeight: '92vh',
          autoFocus: false,
          disableClose: true,
          data: {
            ...contact
          }
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(result => {

        if (!result) {
          return;
        }

        this.loadContacts();
      });
  }

  deleteContact(
    id: number
  ): void {

    const confirmed =
      confirm(
        'Do you want to delete this contact?'
      );

    if (!confirmed) {
      return;
    }

    this.contactService
      .deleteContact(id)
      .subscribe({

        next: () => {

          if (
            this.contacts().length === 1 &&
            this.currentPage() > 0
          ) {

            this.currentPage.update(
              page => page - 1
            );
          }

          this.notificationService.success(
            'Contact deleted successfully.'
          );

          this.loadContacts();
        },

        error: error => {

          console.error(
            'Contact delete failed:',
            error
          );

          this.notificationService.error(
            error?.error?.message
            || error?.error?.detail
            || 'Contact delete nahi ho paya.'
          );
        }
      });
  }

  callContact(
    mobileNumber: string
  ): void {

    if (!mobileNumber) {
      return;
    }

    window.location.href =
      `tel:${mobileNumber}`;
  }

  openWhatsApp(
    contact: any
  ): void {

    const number =
      contact.whatsappNumber
      || contact.mobileNumber;

    if (!number) {

      this.notificationService.warning(
        'WhatsApp number available nahi hai.'
      );

      return;
    }

    const normalizedNumber =
      number.startsWith('91')
        ? number
        : `91${number}`;

    window.open(
      `https://wa.me/${normalizedNumber}`,
      '_blank',
      'noopener,noreferrer'
    );
  }


  openMap(
    mapLink: string
  ): void {

    if (!mapLink) {
      return;
    }

    window.open(
      mapLink,
      '_blank',
      'noopener,noreferrer'
    );
  }

  get totalAdvancePaid(): number {

    return this.contacts()
      .reduce(
        (
          total,
          contact
        ) =>
          total
          + Number(
            contact.advancePaid
            || 0
          ),
        0
      );
  }

  get totalPendingAmount(): number {

    return this.contacts()
      .reduce(
        (
          total,
          contact
        ) =>
          total
          + Number(
            contact.pendingAmount
            || 0
          ),
        0
      );
  }

exportContacts(): void {

  const contacts =
    this.contacts();

  const headers = [
    'Name',
    'Category',
    'Contact Person',
    'Mobile',
    'Advance Paid',
    'Pending Amount'
  ];

  const rows =
    contacts.map(contact => [

      contact.name,
      contact.category,
      contact.contactPerson,
      contact.mobileNumber,
      contact.advancePaid,
      contact.pendingAmount

    ]);

  const csvContent = [

    headers.join(','),

    ...rows.map(row =>
      row.join(',')
    )

  ].join('\n');

  const blob =
    new Blob(
      [csvContent],
      {
        type: 'text/csv;charset=utf-8;'
      }
    );

  const url =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement('a');

  link.href = url;

  link.download =
    'contacts-vendors.csv';

  link.click();

  window.URL.revokeObjectURL(url);
}



}
