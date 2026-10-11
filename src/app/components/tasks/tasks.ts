import * as XLSX from 'xlsx';

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

  const tasks: WeddingTask[] = [
    ...this.todoTasks(),
    ...this.inProgressTasks(),
    ...this.completedTasks()
  ];

  if (tasks.length === 0) {

    this.notificationService.warning(
      'Export ke liye koi task available nahi hai.'
    );

    return;
  }

  const exportData =
    tasks.map(
      (
        task: WeddingTask,
        index: number
      ) => ({
        'S.No.': index + 1,

        'Task Title':
          task.title,

        'Description':
          task.description || '',

        'Status':
          this.formatTaskStatus(
            task.status
          ),

        'Priority':
          task.priority,

        'Due Date':
          task.dueDate
            ? this.formatExportDate(
                task.dueDate
              )
            : '',

        'Assigned To':
          task.assignedTo || '',

        'Created At':
          task.createdAt
            ? this.formatExportDateTime(
                task.createdAt
              )
            : '',

        'Updated At':
          task.updatedAt
            ? this.formatExportDateTime(
                task.updatedAt
              )
            : ''
      })
    );

  const worksheet =
    XLSX.utils.json_to_sheet(
      exportData
    );

  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 30 },
    { wch: 45 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 }
  ];

  worksheet['!autofilter'] = {
    ref:
      worksheet['!ref']
      || 'A1:I1'
  };

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Wedding Tasks'
  );

  const currentDate =
    new Date()
      .toISOString()
      .slice(0, 10);

  XLSX.writeFile(
    workbook,
    `wedding-tasks-${currentDate}.xlsx`
  );

  this.notificationService.success(
    'Tasks exported successfully.'
  );
}

private formatTaskStatus(
  status: WeddingTask['status']
): string {

  switch (status) {

    case 'TODO':
      return 'To Do';

    case 'IN_PROGRESS':
      return 'In Progress';

    case 'DONE':
      return 'Done';

    default:
      return status;
  }
}

private formatExportDate(
  value: string
): string {

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    'en-IN'
  );
}

private formatExportDateTime(
  value: string
): string {

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    'en-IN'
  );
}

}
