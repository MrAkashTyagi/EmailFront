import { Component, signal } from '@angular/core';
import { WeddingTask } from '../../models/wedding-task';
import { inject } from '@angular/core';
import { WeddingTaskService } from '../../service/wedding-task-service';

@Component({
  selector: 'app-tasks',
  imports: [],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks {


  // readonly todoTasks =
  //   signal<any[]>([]);

  // readonly inProgressTasks =
  //   signal<any[]>([]);

  // readonly completedTasks =
  //   signal<any[]>([]);

  readonly todoTasks =
    signal<WeddingTask[]>([]);

  readonly inProgressTasks =
    signal<WeddingTask[]>([]);

  readonly completedTasks =
    signal<WeddingTask[]>([]);

  private readonly taskService =
    inject(WeddingTaskService);


  ngOnInit(): void {

    this.loadTasks();
  }

  loadTasks(): void {

    this.taskService
      .getTasks()
      .subscribe({

        next: (response: any) => {

          const tasks =
            response?.content || [];

          this.todoTasks.set(
            tasks.filter(
              (task: WeddingTask) =>
                task.status === 'TODO'
            )

          );

          this.inProgressTasks.set(

            tasks.filter(
              (task: WeddingTask) =>
                task.status === 'IN_PROGRESS'
            )


          );

          this.completedTasks.set(

            tasks.filter(
              (task: WeddingTask) =>
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

}
