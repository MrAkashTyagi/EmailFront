import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';

import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  MatTableModule
} from '@angular/material/table';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  takeUntilDestroyed,
  toObservable
} from '@angular/core/rxjs-interop';


import {
  NavbarActionService
} from '../../service/navbar-action-service';

import {
  NotificationService
} from '../../service/notification-service';

import {
  AddReceivedGiftDialog
} from '../../add-received-gift-dialog/add-received-gift-dialog';
import { ReceivedGiftService } from '../../service/received-gift';

@Component({
  selector: 'app-received-gift',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './received-gift.html',
  styleUrl: './received-gift.css'
})
export class ReceivedGift
  implements OnInit {

  readonly displayedColumns = [
    'giverName',
    'mobileNumber',
    'giftType',
    'gift',
    'quantity',
    'receivedAt',
    'notes',
    'actions'
  ];

  readonly receivedGifts =
    signal<any[]>([]);

  readonly summary =
    signal<any>({
      totalRecords: 0,
      totalQuantity: 0,
      cashGiftRecords: 0,
      totalCashReceived: 0,
      physicalGiftQuantity: 0
    });

  readonly searchQuery =
    signal('');

  readonly selectedGiftType =
    signal('');

  readonly minCashAmount =
    signal('');

  readonly maxCashAmount =
    signal('');

  readonly currentPage =
    signal(0);

  readonly pageSize =
    signal(10);

  readonly totalElements =
    signal(0);

  private readonly receivedGiftService =
    inject(ReceivedGiftService);

  private readonly dialog =
    inject(MatDialog);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly navbarService =
    inject(NavbarActionService);

  private readonly notificationService =
    inject(NotificationService);

  constructor() {

    toObservable(
      this.navbarService.searchQuery
    )
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(search => {

        const value =
          search?.trim() || '';

        if (
          value ===
          this.searchQuery()
        ) {
          return;
        }

        this.searchQuery.set(
          value
        );

        this.currentPage.set(
          0
        );

        this.fetchReceivedGifts();
      });
  }

  ngOnInit(): void {

    this.loadSummary();

    this.fetchReceivedGifts();

    this.navbarService
      .countLabel
      .set(
        'Gifts Received'
      );

    this.navbarService
      .addClick$
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(() => {

        this.openAddDialog();

      });
  }
  onSearch(
    event: Event
  ): void {

    const value =
      (event.target as HTMLInputElement).value;

    this.navbarService
      .searchQuery
      .set(value);
  }

  openAddDialog(): void {

    const dialogRef =
      this.dialog.open(
        AddReceivedGiftDialog,
        {
          width: '700px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          disableClose: true,
          autoFocus: false
        }
      );

    dialogRef
      .afterClosed()
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(result => {

        if (!result) {
          return;
        }

        this.currentPage.set(
          0
        );

        this.fetchReceivedGifts();

        this.loadSummary();
      });
  }

  editGift(
    gift: any
  ): void {

    const dialogRef =
      this.dialog.open(
        AddReceivedGiftDialog,
        {
          width: '700px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          autoFocus: false,
          data: gift
        }
      );

    dialogRef
      .afterClosed()
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(result => {

        if (!result) {
          return;
        }

        this.fetchReceivedGifts();

        this.loadSummary();
      });
  }

  deleteGift(
    gift: any
  ): void {

    const confirmed =
      confirm(
        `Delete received gift from "${gift.giverName}"?`
      );

    if (!confirmed) {
      return;
    }

    this.receivedGiftService
      .deleteReceivedGift(
        gift.id
      )
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({

        next: () => {

          if (
            this.receivedGifts().length === 1
            &&
            this.currentPage() > 0
          ) {

            this.currentPage.set(
              this.currentPage() - 1
            );
          }

          this.notificationService
            .success(
              'Received gift deleted successfully.'
            );

          this.fetchReceivedGifts();

          this.loadSummary();
        },

        error: (error: any) => {

          console.error(
            'Delete received gift failed:',
            error
          );

          this.notificationService
            .error(
              'Unable to delete the received gift.'
            );
        }

      });
  }

  loadSummary(): void {

    this.receivedGiftService
      .getReceivedGiftSummary()
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({

        next: (response: any) => {

          this.summary.set({
            totalRecords:
              response?.totalRecords ?? 0,

            totalQuantity:
              response?.totalQuantity ?? 0,

            cashGiftRecords:
              response?.cashGiftRecords ?? 0,

            totalCashReceived:
              response?.totalCashReceived ?? 0,

            physicalGiftQuantity:
              response?.physicalGiftQuantity ?? 0
          });
        },

        error: (error: any) => {

          console.error(
            'Received gift summary failed:',
            error
          );

          this.summary.set({
            totalRecords: 0,
            totalQuantity: 0,
            cashGiftRecords: 0,
            totalCashReceived: 0,
            physicalGiftQuantity: 0
          });
        }

      });
  }

  fetchReceivedGifts(): void {

    this.receivedGiftService
      .getReceivedGiftsPaged(
        this.currentPage(),
        this.pageSize(),
        this.searchQuery(),
        this.selectedGiftType(),
        this.minCashAmount(),
        this.maxCashAmount()
      )
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({

        next: (response: any) => {

          this.receivedGifts.set(
            response?.content || []
          );

          this.totalElements.set(
            response?.totalElements || 0
          );

          this.navbarService
            .totalGuestCount
            .set(
              response?.totalElements || 0
            );

          this.navbarService
            .countLabel
            .set(
              'Gifts Received'
            );
        },

        error: (error: any) => {

          console.error(
            'Received gifts load failed:',
            error
          );

          this.notificationService
            .error(
              'Received gifts load nahi ho paye.'
            );
        }

      });
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

    this.fetchReceivedGifts();
  }

  onGiftTypeChange(
    value: string
  ): void {

    this.selectedGiftType.set(
      value
    );

    this.currentPage.set(
      0
    );

    this.fetchReceivedGifts();
  }

  onMinCashAmountChange(
    event: Event
  ): void {

    const value =
      (event.target as HTMLInputElement).value;

    this.minCashAmount.set(
      value
    );

    this.currentPage.set(
      0
    );

    this.fetchReceivedGifts();
  }
  
  onMaxCashAmountChange(
    event: Event
  ): void {

    const value =
      (event.target as HTMLInputElement).value;

    this.maxCashAmount.set(
      value
    );

    this.currentPage.set(
      0
    );

    this.fetchReceivedGifts();
  }

  clearFilters(): void {

    this.selectedGiftType.set('');

    this.minCashAmount.set('');

    this.maxCashAmount.set('');

    this.searchQuery.set('');

    this.navbarService
      .searchQuery
      .set('');

    this.currentPage.set(
      0
    );

    this.fetchReceivedGifts();
  }

  getGiftDisplay(
    gift: any
  ): string {

    if (
      gift?.giftType === 'CASH'
    ) {

      return `₹ ${gift.cashAmount ?? 0
        }`;
    }

    return gift?.giftDescription
      || '-';
  }

  formatGiftType(
    giftType: string
  ): string {

    if (!giftType) {
      return '-';
    }

    return giftType
      .replaceAll(
        '_',
        ' '
      )
      .toLowerCase()
      .replace(
        /\b\w/g,
        character =>
          character.toUpperCase()
      );
  }
}
