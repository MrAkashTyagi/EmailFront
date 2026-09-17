import { Component, inject, OnInit, signal } from '@angular/core';
import { DashboardService } from '../../service/dashboard-service';
import { CommonModule } from '@angular/common';

import { BaseChartDirective } from 'ng2-charts';
import { ExpenseService } from '../../expense-service';
import { GuestService } from '../../service/guest-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    BaseChartDirective,
    RouterLink
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

  recentGuests: any[] = [];

  recentExpenses: any[] = [];


  giftSummary = signal<any[]>([]);

  expenseChartLoaded = false;
  guestChartLoaded = false;

  summary = signal({
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


  ngOnInit() {
    this.loadDashboard();
    this.loadGiftSummary();
    this.loadExpenseChart();
    this.loadGuestChart();
    this.loadRecentGuests();
    this.loadRecentExpenses();

  }


  loadDashboard(): void {

    this.dashboardService
      .getSummary()
      .subscribe({

        next: (response) => {

          console.log('Summary Done');

          console.log('Dashboard Response', response);

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

    console.log('Recent Guests Start');

    this.dashboardService
      .getRecentGuests()
      .subscribe({

        next: (response) => {

          console.log('Recent guest Done');

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

    console.log('Recent Expenses Start');

    this.dashboardService
      .getRecentExpenses()
      .subscribe({

        next: (response) => {


          console.log('Recent expenses Done');

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

}
