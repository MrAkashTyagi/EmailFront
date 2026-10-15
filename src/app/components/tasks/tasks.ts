import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  WeddingTask
} from '../../models/wedding-task';

import {
  WeddingTaskService
} from '../../service/wedding-task-service';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import {
  TaskDialog
} from '../task-dialog/task-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

import {
  MatTooltipModule
} from '@angular/material/tooltip';


import {
  NotificationService
} from '../../service/notification-service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import {
  MatExpansionModule
} from '@angular/material/expansion';

import { MatInputModule } from '@angular/material/input';

import {
  finalize
} from 'rxjs/operators';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatExpansionModule
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class Tasks
  implements OnInit {

  private readonly taskService =
    inject(
      WeddingTaskService
    );

  readonly todoTasks =
    signal<WeddingTask[]>([]);

  readonly inProgressTasks =
    signal<WeddingTask[]>([]);

  readonly completedTasks =
    signal<WeddingTask[]>([]);

  private readonly dialog =
    inject(
      MatDialog
    );

  private readonly notificationService =
    inject(
      NotificationService
    );


  searchText = signal('');

  selectedStatus = signal('');

  selectedPriority = signal('');

  readonly importLoading =
    signal<boolean>(false);

  ngOnInit(): void {

    this.loadTasks();
  }

  loadTasks(): void {

    this.taskService
      .getTasks(
        this.searchText(),
        this.selectedStatus(),
        this.selectedPriority()
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'TASK RESPONSE',
            response
          );

          const tasks: WeddingTask[] =
            response?.content || [];

          this.todoTasks.set(

            tasks.filter(
              task =>
                task.status === 'TODO'
            )

          );

          this.inProgressTasks.set(

            tasks.filter(
              task =>
                task.status === 'IN_PROGRESS'
            )

          );

          this.completedTasks.set(

            tasks.filter(
              task =>
                task.status === 'DONE'
            )

          );

        },

        error: (error: any) => {

          console.error(
            'Tasks load failed',
            error
          );
        }

      });
  }

  openAddTaskDialog(): void {

    const dialogRef =

      this.dialog.open(
        TaskDialog,
        {
          width: '1000px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          autoFocus: false,
          panelClass: 'task-dialog-panel',
          disableClose: true
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(

        result => {

          if (result) {

            this.loadTasks();
          }
        }

      );
  }

  openEditTaskDialog(
    task: WeddingTask
  ): void {

    const dialogRef =
      this.dialog.open(
        TaskDialog,
        {
          width: '1000px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          panelClass: 'task-dialog-panel',
          autoFocus: false,
          disableClose: false,
          data: {
            ...task
          }
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(
        (result: any) => {

          if (!result) {
            return;
          }

          this.loadTasks();
        }
      );
  }
  deleteTask(
    task: WeddingTask
  ): void {

    if (!task.id) {

      this.notificationService.error(
        'Task id available nahi hai.'
      );

      return;
    }

    const confirmed =
      confirm(
        `"${task.title}" task delete karna hai?`
      );

    if (!confirmed) {
      return;
    }

    this.taskService
      .deleteTask(
        task.id
      )
      .subscribe({

        next: () => {

          this.notificationService.success(
            'Task deleted successfully.'
          );

          this.loadTasks();
        },

        error: (error: any) => {

          console.error(
            'Task delete failed:',
            error
          );

          this.notificationService.error(
            error?.error?.message
            || error?.error?.detail
            || 'Task delete nahi ho paya.'
          );
        }
      });
  }

  changeTaskStatus(
    task: WeddingTask,
    newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE'
  ): void {

    if (!task.id) {

      this.notificationService.error(
        'Task id available nahi hai.'
      );

      return;
    }

    this.taskService
      .updateStatus(
        task.id,
        newStatus
      )
      .subscribe({

        next: () => {

          this.notificationService.success(
            'Task status updated successfully.'
          );

          this.loadTasks();
        },

        error: (error: any) => {

          console.error(
            'Task status update failed:',
            error
          );

          this.notificationService.error(
            error?.error?.message
            || error?.error?.detail
            || 'Task status update nahi ho paya.'
          );
        }

      });
  }

  get totalTasks(): number {

    return (
      this.todoTasks().length +
      this.inProgressTasks().length +
      this.completedTasks().length
    );
  }

  get completionPercentage(): number {

    if (this.totalTasks === 0) {
      return 0;
    }

    return Math.round(
      (
        this.completedTasks().length /
        this.totalTasks
      ) * 100
    );
  }

  onSearchChange(
    event: Event
  ): void {

    const value =
      (event.target as HTMLInputElement)
        .value;

    this.searchText.set(value);

    this.loadTasks();
  }

  onStatusChange(
    value: string
  ): void {

    this.selectedStatus.set(value);

    this.loadTasks();
  }

  onPriorityChange(
    value: string
  ): void {

    this.selectedPriority.set(value);

    this.loadTasks();
  }

  clearFilters(): void {

    this.selectedStatus.set('');

    this.selectedPriority.set('');

    this.searchText.set('');

    this.loadTasks();
  }

  exportTasksToExcel(): void {

    this.taskService
      .downloadTasksExcel()
      .subscribe({

        next: blob => {

          const url =
            window.URL.createObjectURL(
              blob
            );

          const link =
            document.createElement('a');

          const currentDate =
            new Date()
              .toISOString()
              .slice(0, 10);

          link.href = url;

          link.download =
            `wedding-tasks-${currentDate}.xlsx`;

          document.body.appendChild(link);

          link.click();

          document.body.removeChild(link);

          window.URL.revokeObjectURL(url);

          this.notificationService.success(
            'Tasks exported successfully.'
          );
        },

        error: error => {

          console.error(
            'Task export failed:',
            error
          );

          this.notificationService.error(
            error?.error?.message
            || 'Tasks export nahi ho paya.'
          );
        }
      });
  }

  getTaskDueStatus(task: WeddingTask): string {

    if (!task.dueDate) {
      return '';
    }

    const today = new Date();

    const currentDate =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

    const due =
      new Date(task.dueDate);

    const dueDate =
      new Date(
        due.getFullYear(),
        due.getMonth(),
        due.getDate()
      );

    const diffDays =
      Math.round(
        (
          dueDate.getTime()
          - currentDate.getTime()
        ) /
        (1000 * 60 * 60 * 24)
      );

    console.log(
      task.title,
      task.dueDate,
      diffDays
    );

    if (diffDays < 0) {
      return 'OVERDUE';
    }

    if (diffDays === 0) {
      return 'DUE_TODAY';
    }

    if (diffDays === 1) {
      return 'DUE_TOMORROW';
    }

    if (diffDays <= 7) {
      return 'DUE_SOON';
    }

    return '';
  }


  getTaskDueStatusLabel(
    task: WeddingTask
  ): string {

    const status =
      this.getTaskDueStatus(task);

    switch (status) {

      case 'OVERDUE':
        return 'Overdue';

      case 'DUE_TODAY':
        return 'Today';

      case 'DUE_TOMORROW':
        return 'Tomorrow';

      case 'DUE_SOON':
        return 'Due Soon';

      default:
        return '';
    }
  }
  importTasks(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith('.xlsx')
    ) {

      this.notificationService.error(
        'Please select a valid .xlsx file.'
      );

      input.value = '';

      return;
    }

    this.importLoading.set(true);

    this.taskService
      .uploadTasksExcel(file)
      .pipe(
        finalize(() => {
          this.importLoading.set(false);

          input.value = '';
        })
      )
      .subscribe({

        next: response => {

          this.notificationService.success(
            response?.message
            || 'Tasks imported successfully.'
          );

          this.clearFilters();
        },

        error: error => {

          console.error(
            'Task import failed:',
            error
          );

          this.notificationService.error(
            error?.error?.message
            || error?.error?.detail
            || 'Tasks import nahi ho paya.'
          );
        }
      });
  }

}
