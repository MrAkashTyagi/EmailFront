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
  MatSelectModule
} from '@angular/material/select';

import {
  WeddingTaskService
} from '../../service/wedding-task-service';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
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

  task = {

    title: '',

    description: '',

    status: 'TODO',

    priority: 'MEDIUM',

    dueDate: '',

    assignedTo: ''

  };

  save(): void {

    if (!this.task.title.trim()) {

      return;
    }

    this.taskService
      .createTask(
        this.task
      )
      .subscribe({

        next: () => {

          this.dialogRef.close(
            true
          );
        },

        error: (error: any) => {

          console.error(
            error
          );
        }

      });
  }

  close(): void {

    this.dialogRef.close();
  }
}
