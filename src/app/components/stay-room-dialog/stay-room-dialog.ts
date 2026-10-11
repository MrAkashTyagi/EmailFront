import {
  Component,
  inject
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
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatSlideToggleModule
} from '@angular/material/slide-toggle';

import {
  StayRoom,
  StayRoomRequest
} from '../../models/stay-room';

import {
  StayRoomService
} from '../../service/stay-room-service';

import {
  NotificationService
} from '../../service/notification-service';

export interface StayRoomDialogData {

  locationId: number;

  locationName: string;

  room?: StayRoom;
}

@Component({
  selector: 'app-stay-room-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule
  ],
  templateUrl: './stay-room-dialog.html',
  styleUrl: './stay-room-dialog.css'
})
export class StayRoomDialog {

  private readonly dialogRef =
    inject(
      MatDialogRef<StayRoomDialog>
    );

  private readonly roomService =
    inject(StayRoomService);

  private readonly notificationService =
    inject(NotificationService);

  readonly data =
    inject<StayRoomDialogData>(
      MAT_DIALOG_DATA
    );

  readonly isEditMode =
    Boolean(
      this.data.room?.id
    );

  saving = false;

  form: StayRoomRequest = {
    locationId:
      this.data.locationId,

    name:
      this.data.room?.name
      ?? '',

    capacity:
      this.data.room?.capacity
      ?? 1,

    floor:
      this.data.room?.floor
      ?? '',

    notes:
      this.data.room?.notes
      ?? '',

    active:
      this.data.room?.active
      ?? true
  };

  save(): void {

    if (!this.form.name.trim()) {

      this.notificationService.warning(
        'Room name is required.'
      );

      return;
    }

    if (
      !this.form.capacity
      || this.form.capacity <= 0
    ) {

      this.notificationService.warning(
        'Capacity must be greater than zero.'
      );

      return;
    }

    const payload: StayRoomRequest = {
      locationId:
        this.data.locationId,

      name:
        this.form.name.trim(),

      capacity:
        Number(
          this.form.capacity
        ),

      floor:
        this.cleanValue(
          this.form.floor
        ),

      notes:
        this.cleanValue(
          this.form.notes
        ),

      active:
        this.form.active
    };

    this.saving = true;

    const request$ =
      this.isEditMode

        ? this.roomService
          .updateRoom(
            this.data.room!.id!,
            payload
          )

        : this.roomService
          .createRoom(
            payload
          );

    request$.subscribe({

      next: savedRoom => {

        this.notificationService.success(
          this.isEditMode
            ? 'Room updated successfully.'
            : 'Room added successfully.'
        );

        this.dialogRef.close(
          savedRoom
        );
      },

      error: error => {

        console.error(
          'Room save failed:',
          error
        );

        this.saving = false;

        this.notificationService.error(
          error?.error?.message
          || error?.error?.detail
          || 'Room save nahi ho paya.'
        );
      }
    });
  }

  close(): void {

    this.dialogRef.close();
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
