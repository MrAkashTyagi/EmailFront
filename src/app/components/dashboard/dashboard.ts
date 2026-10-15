import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DashboardService } from '../../service/dashboard-service';
import { CommonModule } from '@angular/common';

import { BaseChartDirective } from 'ng2-charts';
import { ExpenseService } from '../../expense-service';
import { GuestService } from '../../service/guest-service';
import { RouterLink } from '@angular/router';
import { WeddingCountdown } from '../../wedding-countdown/wedding-countdown';
import { MatDialog } from '@angular/material/dialog';
import { NavbarActionService } from '../../service/navbar-action-service';
import { WeddingSettingsService } from '../../service/wedding-settings-service';
import { WeddingSettingsDialog } from '../wedding-settings-dialog/wedding-settings-dialog';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';


import {
  computed,
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  WeddingTask
} from '../../models/wedding-task';

import {
  WeddingTaskService
} from '../../service/wedding-task-service';

import {
  NotificationService
} from '../../service/notification-service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    BaseChartDirective,
    RouterLink,
    WeddingCountdown,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private dashboardService =
    inject(DashboardService);

  private expenseService =
    inject(ExpenseService);

  private guestService =
    inject(GuestService);

  private readonly dialog =
    inject(MatDialog);

  private readonly navBarService =
    inject(NavbarActionService);

  private readonly weddingSettingsService =
    inject(WeddingSettingsService);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly weddingTaskService =
    inject(WeddingTaskService);

  private readonly router =
    inject(Router);

  private readonly notificationService =
    inject(NotificationService);


  recentGuests: any[] = [];

  recentExpenses: any[] = [];

  readonly giftSummary = signal<any[]>([]);

  readonly shadiGuests = signal<number>(0);
  readonly sagaiGuests = signal<number>(0);
  readonly bothGuests = signal<number>(0);
  readonly cashSummary = signal<any>({
    items: [],
    totalEnvelopes: 0,
    grandTotal: 0
  });

  readonly dashboardTasks =
    signal<WeddingTask[]>([]);

  readonly loadingUpcomingTasks =
    signal(false);

  expenseChartLoaded = false;
  guestChartLoaded = false;

  readonly summary = signal({
    totalGuests: 0,
    totalFamilies: 0,
    totalFamilyMembers: 0,
    averageFamilySize: 0,
    totalExpense: 0,

    totalPaidExpense: 0,
    totalPendingExpense: 0,

    stayRequired: 0,
    invitationSent: 0,
    pendingInvitations: 0
  });

  readonly upcomingTasks =
    computed<WeddingTask[]>(() => {

      return this.dashboardTasks()
        .filter(
          task =>
            task.status !== 'DONE'
            && Boolean(task.dueDate)
        )
        .sort(
          (
            firstTask,
            secondTask
          ) => {

            const firstDate =
              this.toLocalDate(
                firstTask.dueDate!
              );

            const secondDate =
              this.toLocalDate(
                secondTask.dueDate!
              );

            return (
              firstDate.getTime()
              - secondDate.getTime()
            );
          }
        )
        .slice(
          0,
          2
        );
    });

  readonly pendingTaskCount =
    computed<number>(() => {

      return this.dashboardTasks()
        .filter(
          task =>
            task.status === 'TODO'
        )
        .length;
    });

  readonly activeTaskCount =
    computed<number>(() => {

      return this.dashboardTasks()
        .filter(
          task =>
            task.status === 'IN_PROGRESS'
        )
        .length;
    });

  ngOnInit(): void {

    this.loadDashboard();
    this.loadGiftSummary();
    this.loadExpenseChart();
    this.loadGuestChart();
    this.loadRecentGuests();
    this.loadRecentExpenses();
    this.loadUpcomingTasks();
    this.loadCashSummary();

    this.navBarService
      .weddingSettingsClick$
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(() => {

        this.openWeddingSettings();

      });
  }

  loadDashboard(): void {
    this.dashboardService
      .getSummary()
      .subscribe({

        next: (response) => {
          this.summary.set(response);
        },

        error: (err) => {
          console.error('Dashboard Error', err);
        }
      });
  }


  loadGiftSummary(): void {

    this.guestService
      .getGiftSummary()
      .subscribe({

        next: (response) => {

          this.giftSummary.set(
            response || []
          );

        }

      });

  }


  expensePieChartData: any = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#8b5cf6',
          '#ec4899',
          '#f59e0b',
          '#10b981',
          '#3b82f6'
        ]
      }
    ]
  };

  guestPieChartData: any = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#8b5cf6',
          '#ec4899',
          '#f59e0b',
          '#10b981'
        ]
      }
    ]
  };

  pieChartOptions: any = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };

  loadRecentGuests(): void {

    this.dashboardService
      .getRecentGuests()
      .subscribe({

        next: (response) => {
          this.recentGuests = response;
        },

        error: (error) => {
          console.error(
            'Recent Guests Error',
            error
          );

        }
      });
  }

  loadRecentExpenses(): void {

    this.dashboardService
      .getRecentExpenses()
      .subscribe({

        next: (response) => {
          this.recentExpenses = response;
        },

        error: (error) => {
          console.error(
            'Recent Expenses Error',
            error
          );

        }

      });

  }

  loadExpenseChart(): void {
    this.expenseService
      .getCategorySummary()
      .subscribe({
        next: (response) => {

          this.expensePieChartData = {
            labels: response.map((x: any) => x.category),
            datasets: [
              {
                data: response.map((x: any) => x.totalAmount),
                backgroundColor: [
                  '#8b5cf6',
                  '#ec4899',
                  '#f59e0b',
                  '#10b981',
                  '#3b82f6',
                  '#14b8a6',
                  '#d52fda',
                  '#ee0057'
                ]
              }
            ]
          };

          this.expenseChartLoaded = true;
        },
        error: (err) => {
          console.error('Expense Chart Error', err);
        }
      });
  }

  loadGuestChart(): void {

    this.guestService
      .getGuestCategorySummary()
      .subscribe({
        next: (response: any[]) => {

          const categorySummary =
            response || [];

          this.guestPieChartData = {
            labels: categorySummary.map(
              (item: any) => item.category
            ),
            datasets: [
              {
                data: categorySummary.map(
                  (item: any) => item.count
                ),
                backgroundColor: [
                  '#8b5cf6',
                  '#ec4899',
                  '#f59e0b',
                  '#10b981'
                ]
              }
            ]
          };

          const getCategoryCount = (
            categoryName: string
          ): number => {

            const category =
              categorySummary.find(
                (item: any) =>
                  item.category
                    ?.trim()
                    .toLowerCase() ===
                  categoryName.toLowerCase()
              );

            return Number(
              category?.count || 0
            );
          };

          const shadiOnlyCount =
            getCategoryCount('Shadi');

          const sagaiOnlyCount =
            getCategoryCount('Sagai');

          const bothCount =
            getCategoryCount('Both');

          this.shadiGuests.set(
            shadiOnlyCount + bothCount
          );

          this.sagaiGuests.set(
            sagaiOnlyCount + bothCount
          );

          this.bothGuests.set(
            bothCount
          );

          this.guestChartLoaded = true;
        },

        error: (err) => {

          console.error(
            'Guest Chart Error',
            err
          );

          this.shadiGuests.set(0);
          this.sagaiGuests.set(0);
          this.bothGuests.set(0);
        }
      });
  }


  openWeddingSettings(): void {

    this.weddingSettingsService
      .getSettings()
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({

        next: settings => {

          this.openWeddingSettingsDialog(
            settings
          );

        },

        error: error => {

          if (
            error?.status !== 404
          ) {

            console.error(
              'Wedding settings load failed:',
              error
            );

          }

          this.openWeddingSettingsDialog(
            null
          );

        }

      });
  }

  private openWeddingSettingsDialog(
    settings: any
  ): void {

    const dialogRef =
      this.dialog.open(
        WeddingSettingsDialog,
        {
          width: '620px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          autoFocus: false,
          data: settings
        }
      );

    dialogRef
      .afterClosed()
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(savedSettings => {

        if (!savedSettings) {
          return;
        }

        this.navBarService
          .triggerWeddingSettingsUpdated();

      });
  }
  loadUpcomingTasks(): void {

    this.loadingUpcomingTasks.set(
      true
    );

    this.weddingTaskService
      .getTasks(
        '',
        '',
        ''
      )
      .subscribe({

        next: (response: any) => {

          const tasks: WeddingTask[] =
            response?.content || [];

          this.dashboardTasks.set(
            tasks
          );

          this.loadingUpcomingTasks.set(
            false
          );
        },

        error: (error: any) => {

          console.error(
            'Upcoming tasks load failed:',
            error
          );

          this.loadingUpcomingTasks.set(
            false
          );

          this.notificationService.error(
            error?.error?.message
            || error?.error?.detail
            || 'Upcoming tasks load nahi ho paye.'
          );
        }

      });
  }

  openTasksPage(): void {

    this.router.navigate([
      '/tasks'
    ]);
  }

  openTask(
    task: WeddingTask
  ): void {

    this.router.navigate(
      [
        '/tasks'
      ],
      {
        queryParams: {
          taskId:
            task.id
        }
      }
    );
  }

  private toLocalDate(
    value: string
  ): Date {

    const datePart =
      value.split('T')[0];

    const [
      year,
      month,
      day
    ] =
      datePart
        .split('-')
        .map(Number);

    return new Date(
      year,
      month - 1,
      day
    );
  }

  formatTaskDate(
    dueDate?: string
  ): string {

    if (!dueDate) {
      return 'No due date';
    }

    const date =
      this.toLocalDate(
        dueDate
      );

    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }
  loadCashSummary(): void {

    this.guestService
      .getCashSummary()
      .subscribe({

        next: (response) => {

          this.cashSummary.set(response);

        },

        error: (error) => {

          console.error(
            'Cash summary load failed',
            error
          );

        }

      });
  }
}
