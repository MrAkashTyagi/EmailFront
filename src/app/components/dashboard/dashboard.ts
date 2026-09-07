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

  expenseChartLoaded = false;
  guestChartLoaded = false;

  summary = signal({
    totalGuests: 0,
    totalFamilies: 0,
    totalFamilyMembers: 0,
    averageFamilySize: 0,
    totalExpense: 0,
    stayRequired: 0,
    invitationSent: 0,
    pendingInvitations: 0
  });


  ngOnInit() {


    console.log('Dashboard Init');

    this.loadDashboard();

    this.loadExpenseChart();

    this.loadGuestChart();

    this.loadRecentGuests();

    this.loadRecentExpenses();

  }

  loadDashboard(): void {

    console.log('Load Dashboard Called');


    this.dashboardService
      .getSummary()
      .subscribe({

        // next: (response) => {

        //   console.log('Dashboard Response', response);

        //   this.summary = response;

        // },

        next: (response) => {

          console.log('Dashboard Response', response);

          this.summary.set(response);


        },

        error: (err) => {

          console.error('Dashboard Error', err);

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
                  '#3b82f6'
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
