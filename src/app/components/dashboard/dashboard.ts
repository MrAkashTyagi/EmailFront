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

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    BaseChartDirective,
    RouterLink,
    WeddingCountdown
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

  recentGuests: any[] = [];

  recentExpenses: any[] = [];

  readonly giftSummary = signal<any[]>([]);

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




  ngOnInit(): void {

    this.loadDashboard();
    this.loadGiftSummary();
    this.loadExpenseChart();
    this.loadGuestChart();
    this.loadRecentGuests();
    this.loadRecentExpenses();

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
                  '#e2e2e2',
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
        next: (response) => {

          this.guestPieChartData = {
            labels: response.map((x: any) => x.category),
            datasets: [
              {
                data: response.map((x: any) => x.count),
                backgroundColor: [
                  '#8b5cf6',
                  '#ec4899',
                  '#f59e0b',
                  '#10b981'
                ]
              }
            ]
          };

          this.guestChartLoaded = true;
        },
        error: (err) => {
          console.error('Guest Chart Error', err);
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

}
