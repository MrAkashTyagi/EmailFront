import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';

import {
  isPlatformBrowser,
  JsonPipe
} from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';

import {
  MatTableModule
} from '@angular/material/table';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatTooltipModule
} from '@angular/material/tooltip';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  Familyservice
} from '../../service/familyservice';

import {
  GuestService
} from '../../service/guest-service';

import {
  NavbarActionService
} from '../../service/navbar-action-service';

import {
  NotificationService
} from '../../service/notification-service';

import {
  AddFamily
} from '../add-family/add-family';

import {
  AddGuestComponent
} from '../add-guest/add-guest';

@Component({
  selector: 'app-family',
  standalone: true,
  imports: [
    FormsModule,
    JsonPipe,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDialogModule,
    MatPaginatorModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './family.html',
  styleUrl: './family.css'
})
export class Family {

  private readonly familyService =
    inject(Familyservice);

  private readonly guestService =
    inject(GuestService);

  private readonly navBarService =
    inject(NavbarActionService);

  private readonly notificationService =
    inject(NotificationService);

  private readonly dialog =
    inject(MatDialog);

  private readonly cdr =
    inject(ChangeDetectorRef);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly platformId =
    inject(PLATFORM_ID);

  private searchInitialized = false;

  expandedElement: any | null = null;

  readonly displayedColumns = [
    'name',
    'actions'
  ];

  readonly rawFamilies =
    signal<any[]>([]);

  readonly pageSize =
    signal<number>(10);

  readonly currentPage =
    signal<number>(0);

  readonly familySearchQuery =
    signal<string>('');

  readonly totalElements =
    signal<number>(0);

  readonly pagedFamilies =
    computed(
      () => this.rawFamilies()
    );

  constructor() {

    effect(() => {

      const query =
        this.navBarService
          .searchQuery()
          .trim();

      untracked(() => {

        if (
          this.searchInitialized &&
          query === this.familySearchQuery()
        ) {
          return;
        }

        this.searchInitialized = true;

        this.familySearchQuery.set(
          query
        );

        this.currentPage.set(0);

        if (this.isBrowser()) {
          this.fetchPaginatedFamily();
        }

      });

    });

    this.navBarService
      .exportClick$
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(() => {
        this.downloadExcel();
      });

    this.navBarService
      .addClick$
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(() => {
        this.openAddFamilyDialog();
      });
  }

  private isBrowser(): boolean {

    return isPlatformBrowser(
      this.platformId
    );
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

    this.fetchPaginatedFamily();
  }

  applyFamilyFilter(
    event: Event
  ): void {

    const filterValue =
      (
        event.target as HTMLInputElement
      ).value.trim();

    this.familySearchQuery.set(
      filterValue
    );

    this.currentPage.set(0);

    this.fetchPaginatedFamily();
  }

  fetchPaginatedFamily(): void {

    if (!this.isBrowser()) {
      return;
    }

    const page =
      this.currentPage();

    const size =
      this.pageSize();

    const search =
      this.familySearchQuery();

    this.familyService
      .getFamilyPaginated(
        page,
        size,
        search
      )
      .subscribe({
        next: (response: any) => {

          this.rawFamilies.set(
            response.content || []
          );

          this.totalElements.set(
            response.totalElements || 0
          );

          this.navBarService
            .totalGuestCount
            .set(
              response.totalElements || 0
            );

          if (this.expandedElement) {

            this.expandedElement =
              this.rawFamilies()
                .find(
                  family =>
                    family.id ===
                    this.expandedElement.id
                )
              || null;
          }

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Pagination data fetch error:',
            error
          );

          this.notificationService.error(
            'Family data load nahi ho paya.'
          );
        }
      });
  }

  openAddFamilyDialog(): void {

    const dialogRef =
      this.dialog.open(
        AddFamily,
        {
          width: '500px',
          disableClose: true
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

        this.currentPage.set(0);

        this.fetchPaginatedFamily();
      });
  }

  openEditFamilyDialog(
    familyData: any
  ): void {

    const dialogRef =
      this.dialog.open(
        AddFamily,
        {
          width: '500px',
          disableClose: true,
          data: familyData
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

        this.fetchPaginatedFamily();
      });
  }

  deleteFamilyRecord(
    id: number
  ): void {

    const confirmed =
      confirm(
        'Do you want to delete this family?'
      );

    if (!confirmed) {
      return;
    }

    this.familyService
      .deleteFamily(id)
      .subscribe({
        next: () => {

          if (
            this.rawFamilies().length === 1 &&
            this.currentPage() > 0
          ) {
            this.currentPage.update(
              page => page - 1
            );
          }

          if (
            this.expandedElement?.id === id
          ) {
            this.expandedElement = null;
          }

          this.notificationService.success(
            'Family deleted successfully.'
          );

          this.fetchPaginatedFamily();
        },

        error: (error) => {

          console.error(
            'Family delete failed:',
            error
          );

          const message =
            error?.error?.message
            || error?.error?.detail
            || (
              error?.status === 409
                ? 'This family contains guests. Delete the guests first.'
                : 'Family delete nahi ho payi.'
            );

          this.notificationService.error(
            message
          );
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
        familyName:
          familyData.familyName
      }
    };

    const dialogRef =
      this.dialog.open(
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

        const updatedFamilies =
          this.rawFamilies()
            .map(family => {

              if (
                family.id !==
                familyData.id
              ) {
                return family;
              }

              const updatedGuestList =
                (
                  family.guestList || []
                ).map(
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
                guestList:
                  updatedGuestList
              };
            });

        this.rawFamilies.set(
          updatedFamilies
        );

        this.expandedElement =
          updatedFamilies.find(
            family =>
              family.id === familyData.id
          )
          || null;

        this.cdr.detectChanges();
      });
  }

  deleteGuestFromFamily(
    guestId: number,
    familyId: number
  ): void {

    const confirmed =
      confirm(
        'Do you want to delete this guest?'
      );

    if (!confirmed) {
      return;
    }

    this.guestService
      .deleteGuest(guestId)
      .subscribe({
        next: () => {

          const updatedFamilies =
            this.rawFamilies()
              .map(family => {

                if (
                  family.id !== familyId
                ) {
                  return family;
                }

                return {
                  ...family,

                  guestList:
                    (
                      family.guestList || []
                    ).filter(
                      (guest: any) =>
                        guest.id !== guestId
                    )
                };
              });

          this.rawFamilies.set(
            updatedFamilies
          );

          this.expandedElement =
            updatedFamilies.find(
              family =>
                family.id === familyId
            )
            || null;

          this.notificationService.success(
            'Guest deleted successfully.'
          );

          setTimeout(() => {
            this.cdr.detectChanges();
          }, 100);

          // this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Guest delete failed:',
            error
          );

          this.notificationService.error(
            error?.error?.message
            || error?.error?.detail
            || 'Guest delete nahi ho paya.'
          );
        }
      });
  }

  downloadExcel(): void {

    if (!this.isBrowser()) {
      return;
    }

    this.familyService
      .downloadFamilies()
      .subscribe({
        next: (response: Blob) => {

          const blob =
            new Blob(
              [response],
              {
                type:
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              }
            );

          const url =
            window.URL
              .createObjectURL(
                blob
              );

          const link =
            document.createElement(
              'a'
            );

          link.href = url;

          link.download =
            'Families.xlsx';

          document.body
            .appendChild(
              link
            );

          link.click();
          link.remove();

          window.URL
            .revokeObjectURL(
              url
            );
        },

        error: (error) => {

          console.error(
            'Family export failed:',
            error
          );

          this.notificationService.error(
            'Family export nahi ho paya.'
          );
        }
      });
  }
}
