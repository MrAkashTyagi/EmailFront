import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

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
  StayLocation
} from '../../models/stay-location';

import {
  StayRoom
} from '../../models/stay-room';

import {
  StayLocationService
} from '../../service/stay-location-service';

import {
  StayRoomService
} from '../../service/stay-room-service';

import {
  NotificationService
} from '../../service/notification-service';

import {
  StayLocationDialog
} from '../stay-location-dialog/stay-location-dialog';

import {
  StayRoomDialog
} from '../stay-room-dialog/stay-room-dialog';

import {
  StayAllocation
} from '../../models/stay-allocation';

import {
  StayAllocationService
} from '../../service/stay-allocation-service';

import {
  StayAllocationDialog
} from '../stay-allocation-dialog/stay-allocation-dialog';

@Component({
  selector: 'app-stay-management',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './stay-management.html',
  styleUrl: './stay-management.css'
})
export class StayManagement
  implements OnInit {

  private readonly locationService =
    inject(StayLocationService);

  private readonly roomService =
    inject(StayRoomService);

  private readonly notificationService =
    inject(NotificationService);

  private readonly dialog =
    inject(MatDialog);

  readonly locations =
    signal<StayLocation[]>([]);

  readonly selectedLocation =
    signal<StayLocation | null>(
      null
    );

  readonly rooms =
    signal<StayRoom[]>([]);

  readonly loadingLocations =
    signal(false);

  readonly loadingRooms =
    signal(false);

  private readonly allocationService =
    inject(StayAllocationService);

  readonly roomAllocations =
    signal<StayAllocation[]>([]);

  constructor(
    private stayAllocationService: StayAllocationService
  ) { }


  ngOnInit(): void {

    this.loadLocations();
  }

  loadLocations(): void {

    this.loadingLocations.set(
      true
    );

    this.locationService
      .getLocations(
        '',
        false
      )
      .subscribe({

        next: locations => {

          this.locations.set(
            locations
          );

          this.loadingLocations.set(
            false
          );

          const currentSelection =
            this.selectedLocation();

          if (currentSelection) {

            const refreshedSelection =
              locations.find(
                location =>
                  location.id
                  === currentSelection.id
              );

            if (refreshedSelection) {

              this.selectedLocation.set(
                refreshedSelection
              );
            }
          }
        },

        error: error => {

          console.error(
            'Stay locations load failed:',
            error
          );

          this.loadingLocations.set(
            false
          );

          this.notificationService.error(
            'Stay locations load nahi ho paye.'
          );
        }
      });
  }

  selectLocation(
    location: StayLocation
  ): void {

    this.selectedLocation.set(
      location
    );

    this.loadRooms(
      location.id!
    );

    this.roomAllocations.set([]);
  }

  loadRooms(
    locationId: number
  ): void {

    this.loadingRooms.set(
      true
    );

    this.roomService
      .getRoomsWithCapacity(
        locationId
      )
      .subscribe({

        next: rooms => {

          this.rooms.set(
            rooms
          );

          this.loadingRooms.set(
            false
          );
        },

        error: error => {

          console.error(
            'Rooms load failed:',
            error
          );

          this.loadingRooms.set(
            false
          );

          this.notificationService.error(
            'Rooms load nahi ho paye.'
          );
        }
      });
  }

  openAddLocationDialog(): void {

    const dialogRef =
      this.dialog.open(
        StayLocationDialog,
        {
          width: '760px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          autoFocus: false,
          disableClose: true
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(
        result => {

          if (result) {

            this.loadLocations();
          }
        }
      );
  }

  openEditLocationDialog(
    location: StayLocation
  ): void {

    const dialogRef =
      this.dialog.open(
        StayLocationDialog,
        {
          width: '760px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          autoFocus: false,
          data: {
            ...location
          }
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(
        result => {

          if (result) {

            this.loadLocations();
          }
        }
      );
  }

  deleteLocation(
    location: StayLocation
  ): void {

    if (!location.id) {
      return;
    }

    const confirmed =
      confirm(
        `"${location.name}" location delete karna hai?`
      );

    if (!confirmed) {
      return;
    }

    this.locationService
      .deleteLocation(
        location.id
      )
      .subscribe({

        next: () => {

          this.notificationService.success(
            'Stay location deleted successfully.'
          );

          if (
            this.selectedLocation()?.id
            === location.id
          ) {

            this.selectedLocation.set(
              null
            );

            this.rooms.set([]);
          }

          this.loadLocations();
        },

        error: error => {

          console.error(
            'Location delete failed:',
            error
          );

          this.notificationService.error(
            error?.error?.message
            || error?.error?.detail
            || 'Location delete nahi ho payi.'
          );
        }
      });
  }

  openAddRoomDialog(): void {

    const location =
      this.selectedLocation();

    if (!location?.id) {

      this.notificationService.warning(
        'Pehle location select karein.'
      );

      return;
    }

    const dialogRef =
      this.dialog.open(
        StayRoomDialog,
        {
          width: '720px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          autoFocus: false,
          disableClose: true,
          data: {
            locationId:
              location.id,

            locationName:
              location.name
          }
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(
        result => {

          if (result) {

            this.loadRooms(
              location.id!
            );
          }
        }
      );
  }

  openEditRoomDialog(
    room: StayRoom
  ): void {

    const location =
      this.selectedLocation();

    if (!location?.id) {
      return;
    }

    const dialogRef =
      this.dialog.open(
        StayRoomDialog,
        {
          width: '720px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          autoFocus: false,
          data: {
            locationId:
              location.id,

            locationName:
              location.name,

            room: {
              ...room
            }
          }
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(
        result => {

          if (result) {

            this.loadRooms(
              location.id!
            );
          }
        }
      );
  }

  deleteRoom(
    room: StayRoom
  ): void {

    if (!room.id) {
      return;
    }

    const confirmed =
      confirm(
        `"${room.name}" delete karna hai?`
      );

    if (!confirmed) {
      return;
    }

    this.roomService
      .deleteRoom(
        room.id
      )
      .subscribe({

        next: () => {

          this.notificationService.success(
            'Room deleted successfully.'
          );

          const locationId =
            this.selectedLocation()?.id;

          if (locationId) {

            this.loadRooms(
              locationId
            );
          }
        },

        error: error => {

          console.error(
            'Room delete failed:',
            error
          );

          this.notificationService.error(
            error?.error?.message
            || error?.error?.detail
            || 'Room delete nahi ho paya.'
          );
        }
      });
  }

  getLocationIcon(
    type: string
  ): string {

    switch (type) {

      case 'HOME':
        return 'home';

      case 'RENTED_HOUSE':
        return 'cottage';

      case 'DHARAMSHALA':
        return 'temple_hindu';

      case 'HOTEL':
        return 'hotel';

      default:
        return 'location_on';
    }
  }

  getOccupancyPercentage(
    room: StayRoom
  ): number {

    if (!room.capacity) {
      return 0;
    }

    return Math.min(
      Math.round(
        (
          (room.occupiedBeds || 0)
          / room.capacity
        ) * 100
      ),
      100
    );
  }

  loadRoomAllocations(
    roomId: number
  ): void {

    this.allocationService
      .getAllocations(
        undefined,
        roomId
      )
      .subscribe({

        next: allocations => {

          this.roomAllocations.set(
            allocations.filter(
              allocation =>
                allocation.status === 'PLANNED'
                || allocation.status === 'CHECKED_IN'
            )
          );
        },

        error: error => {

          console.error(
            'Room allocations load failed:',
            error
          );

          this.notificationService.error(
            'Room occupants load nahi ho paye.'
          );
        }
      });
  }

  openAllocateGuestsDialog(
    room?: StayRoom
  ): void {

    const location =
      this.selectedLocation();

    if (!location?.id) {

      this.notificationService.warning(
        'Pehle location select karein.'
      );

      return;
    }

    const dialogRef =
      this.dialog.open(
        StayAllocationDialog,
        {
          width: '950px',
          maxWidth: '96vw',
          maxHeight: '94vh',
          autoFocus: false,
          disableClose: true,
          data: {
            defaultLocationId:
              location.id,

            defaultRoomId:
              room?.id
          }
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(
        result => {

          if (result) {

            this.loadRooms(
              location.id!
            );

            if (room?.id) {

              this.loadRoomAllocations(
                room.id
              );
            }
          }
        }
      );
  }

  openEditAllocationDialog(
    allocation: StayAllocation
  ): void {

    const location =
      this.selectedLocation();

    const dialogRef =
      this.dialog.open(
        StayAllocationDialog,
        {
          width: '950px',
          maxWidth: '96vw',
          maxHeight: '94vh',
          autoFocus: false,
          disableClose: true,
          data: {
            allocation: {
              ...allocation
            }
          }
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(
        result => {

          if (
            result
            && location?.id
          ) {

            this.loadRooms(
              location.id
            );

            this.loadRoomAllocations(
              result.roomId
            );
          }
        }
      );
  }

  checkInAllocation(
    allocation: StayAllocation
  ): void {

    this.updateAllocationStatus(
      allocation,
      'CHECKED_IN'
    );
  }

  checkOutAllocation(
    allocation: StayAllocation
  ): void {

    this.updateAllocationStatus(
      allocation,
      'CHECKED_OUT'
    );
  }

  cancelStayAllocation(
    allocation: StayAllocation
  ): void {

    const confirmed =
      confirm(
        `${allocation.guestName} ki stay allocation cancel karni hai?`
      );

    if (!confirmed) {
      return;
    }

    this.allocationService
      .cancelAllocation(
        allocation.id
      )
      .subscribe({

        next: () => {

          this.notificationService.success(
            'Stay allocation cancelled successfully.'
          );

          this.refreshAllocationView(
            allocation.roomId
          );
        },

        error: error => {

          console.error(
            'Allocation cancel failed:',
            error
          );

          this.notificationService.error(
            error?.error?.message
            || error?.error?.detail
            || 'Allocation cancel nahi ho payi.'
          );
        }
      });
  }

  private updateAllocationStatus(
    allocation: StayAllocation,
    status:
      'CHECKED_IN'
      | 'CHECKED_OUT'
  ): void {

    this.allocationService
      .updateStatus(
        allocation.id,
        status
      )
      .subscribe({

        next: () => {

          this.notificationService.success(
            status === 'CHECKED_IN'
              ? 'Guest checked in successfully.'
              : 'Guest checked out successfully.'
          );

          this.refreshAllocationView(
            allocation.roomId
          );
        },

        error: error => {

          console.error(
            'Allocation status update failed:',
            error
          );

          this.notificationService.error(
            error?.error?.message
            || error?.error?.detail
            || 'Allocation status update nahi ho paya.'
          );
        }
      });
  }

  private refreshAllocationView(
    roomId: number
  ): void {

    const locationId =
      this.selectedLocation()?.id;

    if (locationId) {

      this.loadRooms(
        locationId
      );
    }

    this.loadRoomAllocations(
      roomId
    );
  }

  exportStayAllocations(): void {

    this.stayAllocationService
      .exportStayAllocations()
      .subscribe({

        next: (blob) => {

          const url =
            window.URL.createObjectURL(blob);

          const anchor =
            document.createElement('a');

          anchor.href = url;
          anchor.download =
            'stay-allocation-report.xlsx';

          anchor.click();

          window.URL.revokeObjectURL(url);
        },

        error: error => {

          console.error(error);
        }
      });
  }

}
