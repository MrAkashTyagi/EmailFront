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
  MatSelectModule
} from '@angular/material/select';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  WeddingTaskService
} from '../../service/wedding-task-service';

import {
  NotificationService
} from '../../service/notification-service';

import {
  MatDatepickerModule
} from '@angular/material/datepicker';

import {
  MatNativeDateModule
} from '@angular/material/core';

@Component({
  selector: 'app-task-dialog',
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
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.css'
})
export class TaskDialog {

  private readonly dialogRef =
    inject(
      MatDialogRef<TaskDialog>
    );

  private readonly taskService =
    inject(
      WeddingTaskService
    );

  private readonly notificationService =
    inject(
      NotificationService
    );

  readonly dialogData =
    inject(
      MAT_DIALOG_DATA,
      {
        optional: true
      }
    );

  readonly isEditMode =
    Boolean(
      this.dialogData?.id
    );

  saving = false;

  task = {
    id:
      this.dialogData?.id
      ?? undefined,

    title:
      this.dialogData?.title
      ?? '',

    description:
      this.dialogData?.description
      ?? '',

    status:
      this.dialogData?.status
      ?? 'TODO',

    priority:
      this.dialogData?.priority
      ?? 'MEDIUM',

    dueDate:
      this.dialogData?.dueDate
      ?? '',

    assignedTo:
      this.dialogData?.assignedTo
      ?? ''
  };

  save(): void {

    if (!this.task.title.trim()) {

      this.notificationService.warning(
        'Task title is required.'
      );

      return;
    }

    const payload = {
      title:
        this.task.title.trim(),

      description:
        this.task.description?.trim()
        || '',

      status:
        this.task.status,

      priority:
        this.task.priority,

      dueDate:
        this.task.dueDate
        || null,

      assignedTo:
        this.task.assignedTo?.trim()
        || ''
    };

    this.saving = true;

    const request$ =
      this.isEditMode

        ? this.taskService.updateTask(
            Number(this.task.id),
            payload
          )

        : this.taskService.createTask(
            payload
          );

    request$.subscribe({

      next: (savedTask: any) => {

        this.notificationService.success(
          this.isEditMode
            ? 'Task updated successfully.'
            : 'Task added successfully.'
        );

        this.dialogRef.close(
          savedTask
        );
      },

      error: (error: any) => {

        console.error(
          'Task save failed:',
          error
        );

        queueMicrotask(() => {
          this.saving = false;
        });

        this.notificationService.error(
          error?.error?.message
          || error?.error?.detail
          || (
            this.isEditMode
              ? 'Task update nahi ho paya.'
              : 'Task add nahi ho paya.'
          )
        );
      }
    });
  }

  close(): void {

    this.dialogRef.close();
  }
}
