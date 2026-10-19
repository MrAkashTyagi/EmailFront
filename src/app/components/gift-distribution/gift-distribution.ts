import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

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
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  toObservable
} from '@angular/core/rxjs-interop';
import { AddGiftDistributionDialog } from '../../add-gift-distribution-dialog/add-gift-distribution-dialog';
import { NavbarActionService } from '../../service/navbar-action-service';
import { NotificationService } from '../../service/notification-service';
import { GiftDistributionService } from '../../service/gift-distribution.service';



@Component({
  selector: 'app-gift-distribution',
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
  templateUrl: './gift-distribution.html',
  styleUrl: './gift-distribution.css'
})
export class GiftDistribution
  implements OnInit {

  readonly displayedColumns = [
    'recipientName',
    'mobileNumber',
    'giftType',
    'amount',
    'quantity',
    'totalAmount',
    'notes',
    'actions'
  ];

  readonly gifts =
    signal<any[]>([]);

  readonly summary =
    signal<any>({
      totalRecords: 0,
      totalQuantity: 0,
      totalAmount: 0
    });

  readonly searchQuery =
    signal('');

  readonly selectedGiftType =
    signal('');

  readonly minAmount =
    signal('');

  readonly maxAmount =
    signal('');

  readonly currentPage =
    signal(0);

  readonly pageSize =
    signal(10);

  readonly totalElements =
    signal(0);

  private readonly giftService =
    inject(GiftDistributionService);

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

        this.fetchGiftDistributions();
      });

  }

  ngOnInit(): void {

    this.loadSummary();

    this.fetchGiftDistributions();

    this.navbarService.countLabel.set(
      'Total Gifts'
    );

    this.navbarService.addClick$
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(() => {

        this.openAddDialog();

      });

    this.navbarService.exportClick$
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(() => {

        this.exportGifts();

      });

  }

  onSearch(
    event: Event
  ): void {

    const value =
      (event.target as HTMLInputElement)
        .value;

    this.navbarService
      .searchQuery
      .set(value);

  }

  openAddDialog(): void {

    const dialogRef =
      this.dialog.open(
        AddGiftDistributionDialog,
        {
          width: '700px',
          maxWidth: '95vw',
          disableClose: true
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(result => {

        if (!result) {
          return;
        }

        this.fetchGiftDistributions();

        this.loadSummary();

      });

  }

  editGift(
    gift: any
  ): void {

    const dialogRef =
      this.dialog.open(
        AddGiftDistributionDialog,
        {
          width: '700px',
          maxWidth: '95vw',
          data: gift
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(result => {

        if (!result) {
          return;
        }

        this.fetchGiftDistributions();

        this.loadSummary();

      });

  }

  deleteGift(
    gift: any
  ): void {

    const confirmed =
      confirm(
        `Delete gift for ${gift.recipientName}?`
      );

    if (!confirmed) {
      return;
    }

    this.giftService
      .deleteGiftDistribution(
        gift.id
      )
      .subscribe({

        next: () => {

          this.notificationService.success(
            'Gift deleted successfully.'
          );

          this.fetchGiftDistributions();

          this.loadSummary();

        },

        error: () => {

          this.notificationService.error(
            'Unable to delete gift.'
          );

        }

      });

  }

  loadSummary(): void {

    this.giftService
      .getGiftDistributionSummary()
      .subscribe({

        next: response => {

          this.summary.set(
            response
          );

        }

      });

  }

  fetchGiftDistributions(): void {

    this.giftService
      .getGiftDistributionsPaged(
        this.currentPage(),
        this.pageSize(),
        this.searchQuery(),
        this.selectedGiftType(),
        this.minAmount(),
        this.maxAmount()
      )
      .subscribe({

        next: response => {

          this.gifts.set(
            response.content || []
          );

          this.totalElements.set(
            response.totalElements || 0
          );

          this.navbarService
            .totalGuestCount
            .set(
              response.totalElements || 0
            );

        },

        error: error => {

          console.error(
            error
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

    this.fetchGiftDistributions();

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

    this.fetchGiftDistributions();

  }

  clearFilters(): void {

    this.selectedGiftType.set('');

    this.minAmount.set('');

    this.maxAmount.set('');

    this.searchQuery.set('');

    this.navbarService
      .searchQuery
      .set('');

    this.currentPage.set(0);

    this.fetchGiftDistributions();

  }

  exportGifts(): void {

    this.giftService
      .exportGiftDistributions(
        this.searchQuery(),
        this.selectedGiftType(),
        this.minAmount(),
        this.maxAmount()
      )
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({

        next: (blob: Blob) => {

          const url =
            URL.createObjectURL(
              blob
            );

          const link =
            document.createElement(
              'a'
            );

          link.href =
            url;

          link.download =
            'Gift-Distribution.xlsx';

          link.style.display =
            'none';

          document.body.appendChild(
            link
          );

          link.click();

          link.remove();

          setTimeout(
            () => {

              URL.revokeObjectURL(
                url
              );

            },
            1000
          );
        },

        error: (error: any) => {

          console.error(
            'Gift distribution export failed:',
            error
          );

          this.notificationService.error(
            'Gift distribution export nahi ho paya.'
          );
        }

      });
  }

}
