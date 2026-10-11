import { Guest } from '../../models/guest';

import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatCheckboxModule
} from '@angular/material/checkbox';

import {
  MatDatepickerModule
} from '@angular/material/datepicker';

import {
  MatNativeDateModule
} from '@angular/material/core';

import {
  forkJoin
} from 'rxjs';

import {
  StayLocation
} from '../../models/stay-location';

import {
  StayRoom
} from '../../models/stay-room';

import {
  StayAllocation,
  StayRoomCapacity
} from '../../models/stay-allocation';

import {
  GuestService
} from '../../service/guest-service';

import {
  StayLocationService
} from '../../service/stay-location-service';

import {
  StayRoomService
} from '../../service/stay-room-service';

import {
  StayAllocationService
} from '../../service/stay-allocation-service';

import {
  NotificationService
} from '../../service/notification-service';

import {
  ChangeDetectorRef
} from '@angular/core';

export interface StayAllocationDialogData {

  allocation?: StayAllocation;

  defaultLocationId?: number;

  defaultRoomId?: number;
}

interface GuestFamilyGroup {

  familyId: number | null;

  familyName: string;

  guests: Guest[];
}

@Component({
  selector: 'app-stay-allocation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './stay-allocation-dialog.html',
  styleUrl: './stay-allocation-dialog.css'
})
export class StayAllocationDialog
  implements OnInit {

  private readonly dialogRef =
    inject(
      MatDialogRef<StayAllocationDialog>
    );

  private readonly guestService =
    inject(GuestService);

  private readonly locationService =
    inject(StayLocationService);

  private readonly roomService =
    inject(StayRoomService);

  private readonly allocationService =
    inject(StayAllocationService);

  private readonly notificationService =
    inject(NotificationService);

  readonly data =
    inject<StayAllocationDialogData>(
      MAT_DIALOG_DATA,
      {
        optional: true
      }
    );

  readonly isEditMode =
    Boolean(
      this.data?.allocation?.id
    );

  readonly locations =
    signal<StayLocation[]>([]);

  readonly rooms =
    signal<StayRoom[]>([]);

  readonly guests =
    signal<Guest[]>([]);

  readonly activeAllocations =
    signal<StayAllocation[]>([]);

  readonly roomCapacity =
    signal<StayRoomCapacity | null>(
      null
    );

  readonly selectedGuestIds =
    signal<number[]>([]);

  private readonly cdr =
    inject(ChangeDetectorRef);

  loading = true;

  saving = false;

  selectedLocationId:
    number | null =
    this.data?.defaultLocationId
    ?? this.data?.allocation?.locationId
    ?? null;

  selectedRoomId:
    number | null =
    this.data?.defaultRoomId
    ?? this.data?.allocation?.roomId
    ?? null;

  checkInDate:
    Date | null =
    this.parseDate(
      this.data?.allocation?.checkInDate
    );

  checkOutDate:
    Date | null =
    this.parseDate(
      this.data?.allocation?.checkOutDate
    );

  notes =
    this.data?.allocation?.notes
    ?? '';

  readonly availableGuests =
    computed<Guest[]>(() => {

      const activeGuestIds =
        new Set(
          this.activeAllocations()
            .filter(
              allocation =>
                allocation.status === 'PLANNED'
                || allocation.status === 'CHECKED_IN'
            )
            .map(
              allocation =>
                allocation.guestId
            )
        );

      const currentGuestId =
        this.data?.allocation?.guestId;

      return this.guests()
        .filter(
          guest =>
            guest.stay
              ?.trim()
              .toLowerCase()
            === 'yes'
        )
        .filter(
          guest =>
            !guest.id
            || !activeGuestIds.has(
              guest.id
            )
            || guest.id === currentGuestId
        );
    });

  readonly familyGroups =
  computed(() => [
    {
      familyId: null,
      familyName: 'All Guests',
      guests: this.availableGuests()
    }
  ]);

  readonly selectedGuestCount =
    computed<number>(
      () =>
        this.selectedGuestIds()
          .length
    );

  ngOnInit(): void {

    // this.loading = true;

    forkJoin({
      locations:
        this.locationService
          .getLocations(
            '',
            true
          ),

      guests:
        this.guestService
          .getAllGuests(),

      allocations:
        this.allocationService
          .getAllocations()
    }).subscribe({

      next: response => {

        this.locations.set(
          response.locations
        );

        console.log(
          'Guests Response',
          response.guests
        );

        this.guests.set(
          response.guests
        );

        this.activeAllocations.set(
          response.allocations
        );

        queueMicrotask(() => {

          this.loading = false;

        });
      },

      error: error => {

        console.error(
          'Allocation dialog data load failed:',
          error
        );

        this.loading = false;

        this.notificationService.error(
          'Stay allocation data load nahi ho paya.'
        );
      }
    });
  }

  onLocationChange(
    locationId: number
  ): void {

    this.selectedLocationId =
      locationId;

    this.selectedRoomId =
      null;

    this.rooms.set([]);

    this.roomCapacity.set(
      null
    );

    this.loadRooms(
      locationId
    );
  }

  loadRooms(
    locationId: number
  ): void {

    this.roomService
      .getRooms(
        locationId,
        true
      )
      .subscribe({

        next: rooms => {

          this.rooms.set(
            rooms
          );

          if (this.selectedRoomId) {

            this.loadRoomCapacity(
              this.selectedRoomId
            );
          }
        },

        error: error => {

          console.error(
            'Active rooms load failed:',
            error
          );

          this.notificationService.error(
            'Rooms load nahi ho paye.'
          );
        }
      });
  }

  onRoomChange(
    roomId: number
  ): void {

    this.selectedRoomId =
      roomId;

    this.loadRoomCapacity(
      roomId
    );
  }

  loadRoomCapacity(
    roomId: number
  ): void {

    this.allocationService
      .getRoomCapacity(
        roomId
      )
      .subscribe({

        next: capacity => {

          this.roomCapacity.set(
            capacity
          );
        },

        error: error => {

          console.error(
            'Room capacity load failed:',
            error
          );

          this.roomCapacity.set(
            null
          );
        }
      });
  }

  // isGuestSelected(
  //   guestId?: number
  // ): boolean {

  //   if (!guestId) {
  //     return false;
  //   }

  //   return this.selectedGuestIds()
  //     .includes(
  //       guestId
  //     );
  // }

  // toggleGuest(
  //   guest: Guest,
  //   checked: boolean
  // ): void {

  //   if (!guest.id) {
  //     return;
  //   }

  //   if (this.isEditMode) {

  //     this.selectedGuestIds.set(
  //       checked
  //         ? [guest.id]
  //         : []
  //     );

  //     return;
  //   }

  //   this.selectedGuestIds.update(
  //     guestIds => {

  //       if (checked) {

  //         return Array.from(
  //           new Set([
  //             ...guestIds,
  //             guest.id!
  //           ])
  //         );
  //       }

  //       return guestIds.filter(
  //         guestId =>
  //           guestId !== guest.id
  //       );
  //     }
  //   );
  // }

  // isWholeFamilySelected(
  //   group: GuestFamilyGroup
  // ): boolean {

  //   const validGuestIds =
  //     group.guests
  //       .map(
  //         guest =>
  //           guest.id
  //       )
  //       .filter(
  //         (
  //           guestId
  //         ): guestId is number =>
  //           Boolean(guestId)
  //       );

  //   return (
  //     validGuestIds.length > 0
  //     && validGuestIds.every(
  //       guestId =>
  //         this.selectedGuestIds()
  //           .includes(
  //             guestId
  //           )
  //     )
  //   );
  // }

  // toggleWholeFamily(
  //   group: GuestFamilyGroup,
  //   checked: boolean
  // ): void {

  //   if (this.isEditMode) {
  //     return;
  //   }

  //   const familyGuestIds =
  //     group.guests
  //       .map(
  //         guest =>
  //           guest.id
  //       )
  //       .filter(
  //         (
  //           guestId
  //         ): guestId is number =>
  //           Boolean(guestId)
  //       );

  //   this.selectedGuestIds.update(
  //     selectedIds => {

  //       if (checked) {

  //         return Array.from(
  //           new Set([
  //             ...selectedIds,
  //             ...familyGuestIds
  //           ])
  //         );
  //       }

  //       return selectedIds.filter(
  //         selectedId =>
  //           !familyGuestIds.includes(
  //             selectedId
  //           )
  //       );
  //     }
  //   );
  // }

  // clearSelection(): void {

  //   if (this.isEditMode) {
  //     return;
  //   }

  //   this.selectedGuestIds.set([]);
  // }

  save(): void {

    if (!this.selectedRoomId) {

      this.notificationService.warning(
        'Room select karein.'
      );

      return;
    }

    if (
      this.selectedGuestCount()
      === 0
    ) {

      this.notificationService.warning(
        'Kam se kam ek guest select karein.'
      );

      return;
    }

    const capacity =
      this.roomCapacity();

    const currentAllocationInSameRoom =
      this.isEditMode
      && this.data?.allocation?.roomId
      === this.selectedRoomId;

    if (
      !currentAllocationInSameRoom
      && capacity
      && this.selectedGuestCount()
      > capacity.availableBeds
    ) {

      this.notificationService.warning(
        `Room me sirf ${capacity.availableBeds} bed(s) available hain.`
      );

      return;
    }

    const formattedCheckInDate =
      this.formatLocalDate(
        this.checkInDate
      );

    const formattedCheckOutDate =
      this.formatLocalDate(
        this.checkOutDate
      );

    if (
      formattedCheckInDate
      && formattedCheckOutDate
      && formattedCheckOutDate
      < formattedCheckInDate
    ) {

      this.notificationService.warning(
        'Check-out date, check-in date se pehle nahi ho sakti.'
      );

      return;
    }

    this.saving = true;

    if (
      this.isEditMode
      && this.data?.allocation
    ) {

      const request = {
        guestId:
          this.selectedGuestIds()[0],

        roomId:
          this.selectedRoomId,

        checkInDate:
          formattedCheckInDate,

        checkOutDate:
          formattedCheckOutDate,

        notes:
          this.cleanValue(
            this.notes
          )
      };

      this.allocationService
        .updateAllocation(
          this.data.allocation.id,
          request
        )
        .subscribe({

          next: allocation => {

            this.notificationService.success(
              'Stay allocation updated successfully.'
            );

            this.dialogRef.close(
              allocation
            );
          },

          error: error => {

            this.handleSaveError(
              error
            );
          }
        });

      return;
    }

    const request = {
      guestIds:
        this.selectedGuestIds(),

      roomId:
        this.selectedRoomId,

      checkInDate:
        formattedCheckInDate,

      checkOutDate:
        formattedCheckOutDate,

      notes:
        this.cleanValue(
          this.notes
        )
    };

    this.allocationService
      .allocateGuests(
        request
      )
      .subscribe({

        next: allocations => {

          this.notificationService.success(
            `${allocations.length} guest(s) allocated successfully.`
          );

          this.dialogRef.close(
            allocations
          );
        },

        error: error => {

          this.handleSaveError(
            error
          );
        }
      });
  }

  close(): void {

    this.dialogRef.close();
  }

  private handleSaveError(
    error: any
  ): void {

    console.error(
      'Stay allocation save failed:',
      error
    );

    this.saving = false;

    this.notificationService.error(
      error?.error?.message
      || error?.error?.detail
      || 'Stay allocation save nahi ho paya.'
    );
  }

  private formatLocalDate(
    value: Date | null
  ): string | null {

    if (!value) {
      return null;
    }

    const year =
      value.getFullYear();

    const month =
      String(
        value.getMonth() + 1
      ).padStart(
        2,
        '0'
      );

    const day =
      String(
        value.getDate()
      ).padStart(
        2,
        '0'
      );

    return `${year}-${month}-${day}`;
  }

  private parseDate(
    value?: string | null
  ): Date | null {

    if (!value) {
      return null;
    }

    const [
      year,
      month,
      day
    ] =
      value
        .split('-')
        .map(Number);

    return new Date(
      year,
      month - 1,
      day
    );
  }

  private cleanValue(
    value?: string | null
  ): string | null {

    const cleaned =
      value?.trim();

    return cleaned
      ? cleaned
      : null;
  }
}
