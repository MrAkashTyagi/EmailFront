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
  MatDialog
} from '@angular/material/dialog';

import {
  TaskDialog
} from '../task-dialog/task-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [MatIconModule,
    MatButtonModule,
    CommonModule
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

  ngOnInit(): void {

    this.loadTasks();
  }

  loadTasks(): void {

    this.taskService
      .getTasks()
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
          width: '700px'
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

}
