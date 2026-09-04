import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';

import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ExpenseService } from '../expense-service';
import { NavbarActionService } from '../service/navbar-action-service';
import { AddExpenseDialog } from '../add-expense-dialog/add-expense-dialog';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

import {
  ChartConfiguration,
  ChartType
} from 'chart.js';

import { BaseChartDirective } from 'ng2-charts';
import { BillPreviewDialog } from '../bill-preview-dialog/bill-preview-dialog';

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatIconModule,
    BaseChartDirective,
    BillPreviewDialog
  ],
  templateUrl: './expense.html',
  styleUrl: './expense.css'
})
export class Expense implements OnInit {

  rawExpenses = signal<any[]>([]);
  expenseSearchQuery = signal<string>('');
  selectedCategory = signal<string>('');
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);
  totalElements = signal<number>(0);

  pieChartType: ChartType = 'pie';

  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [
      {
        data: []
      }
    ]
  };

  // categorySummary: any[] = [];

  summary = signal<any>({
    totalExpense: 0,
    totalExpenses: 0,
    highestExpense: 0,
    topCategory: '-'
  });

  private expenseService = inject(ExpenseService);
  private navBarService = inject(NavbarActionService);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

categorySummary: any[] = [];

  displayedColumns: string[] = [
    'expenseName',
    'category',
    'amount',
    'paidBy',
    'expenseDate',
    'actions',
    'bill'
  ];

  ngOnInit(): void {
    this.loadCategoryChart();
    this.loadSummary();
    this.navBarService.searchQuery.set('');
    this.navBarService.countLabel.set('Total Expenses');

    this.fetchPaginatedExpenses();

    this.navBarService.addClick$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.openAddExpenseDialog();
      });

    this.navBarService.exportClick$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.expenseService.exportExpenses()
          .subscribe((blob: Blob) => {
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');

            anchor.href = url;
            anchor.download = 'Expenses.xlsx';
            anchor.click();

            window.URL.revokeObjectURL(url);
          });
      });


    this.navBarService.countLabel.set('Total Expenses');

    this.navBarService.exportClick$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {

        this.expenseService.exportExpenses()
          .subscribe((blob: Blob) => {

            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');

            a.href = url;
            a.download = 'Expenses.xlsx';

            a.click();

            window.URL.revokeObjectURL(url);

          });

      });

  }

  constructor() {

    toObservable(this.navBarService.searchQuery)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(searchText => {

        console.log(
          'Expense received search => ',
          searchText
        );

        this.expenseSearchQuery.set(
          searchText?.trim() || ''
        );

        this.currentPage.set(0);

        this.fetchPaginatedExpenses();

      });

  }

  loadCategoryChart(): void {

    this.expenseService
      .getCategorySummary()
      .subscribe({

        next: (response: any[]) => {

  this.categorySummary = response;

  this.pieChartData = {
    labels: response.map(x => x.category),

    datasets: [
      {
        data: response.map(x => x.totalAmount),
        backgroundColor: [
          '#6366F1',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4'
        ]
      }
    ]
  };

}

        // next: (response: any[]) => {

        //   this.pieChartData = {
        //     labels: response.map(
        //       item => item.category
        //     ),

        //     datasets: [
        //       {
        //         data: response.map(
        //           item => item.totalAmount
        //         ),
        //         backgroundColor: [
        //           '#6366F1',
        //           '#10B981',
        //           '#F59E0B',
        //           '#EF4444',
        //           '#8B5CF6',
        //           '#06B6D4',
        //           '#84CC16',
        //           '#F97316'
        //         ]
        //       }
        //     ]
        //   };

        // }

      });

  }

public pieChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
};


  loadSummary(): void {

    this.expenseService
      .getExpenseSummary()
      .subscribe({
        next: (response) => {
          this.summary.set(response);
        },
        error: (err) => {
          console.error(
            'Summary error',
            err
          );
        }
      });

  }

  viewBill(expense: any): void {

  this.dialog.open(
    BillPreviewDialog,
    {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: {
        url: `http://localhost:8090/expenses/bill/${expense.id}`
      }
    }
  );

}


  downloadBill(expense: any): void {

    window.open(
      `http://localhost:8090/expenses/bill/download/${expense.id}`,
      '_blank'
    );

  }

  openAddExpenseDialog(): void {
    const dialogRef = this.dialog.open(AddExpenseDialog, {
      width: '680px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: false
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((createdExpense: any) => {
        if (createdExpense) {
          this.currentPage.set(0);
          this.fetchPaginatedExpenses();
          this.loadSummary();
          this.loadCategoryChart();
        }
      });
  }

  editExpense(expense: any): void {

    const dialogRef = this.dialog.open(AddExpenseDialog, {
      width: '750px',
      maxWidth: '95vw',
      maxHeight: '100vh',
      disableClose: false,
      autoFocus: false,
      data: expense
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updatedExpense: any) => {

        if (updatedExpense) {
          this.fetchPaginatedExpenses();
          this.loadSummary();
          this.loadCategoryChart();
        }

      });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.currentPage.set(0);
    this.fetchPaginatedExpenses();
  }

  fetchPaginatedExpenses(): void {

    console.log(
      'API CALLED =>',
      this.expenseSearchQuery()
    );


    const page = this.currentPage();
    const size = this.pageSize();
    const search = this.expenseSearchQuery();
    const category = this.selectedCategory();

    this.expenseService.getExpensesPaged(
      page,
      size,
      search,
      category
    ).subscribe({
      next: (response: any) => {
        console.log('Expenses Loaded:', response);

        this.rawExpenses.set(response.content || []);
        this.totalElements.set(response.totalElements || 0);

        this.navBarService.totalGuestCount.set(
          response.totalElements || 0
        );

        this.navBarService.countLabel.set(
          'Total Expenses'
        );

        this.cdr.detectChanges();
      },

      error: (err: any) => {
        console.error('Expense pagination error:', err);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.fetchPaginatedExpenses();
  }

  clearFilters(): void {
    this.selectedCategory.set('');
    this.expenseSearchQuery.set('');
    this.currentPage.set(0);
    this.fetchPaginatedExpenses();
  }

  deleteExpense(expense: any): void {

    console.log("deleting");
    const confirmed = confirm(
      `Are you sure you want to delete "${expense.expenseName}" ?`
    );

    if (!confirmed) {
      return;
    }

    this.expenseService.deleteExpense(
      expense.id
    ).subscribe({

      next: () => {

        if (
          this.rawExpenses().length === 1 &&
          this.currentPage() > 0
        ) {
          this.currentPage.set(
            this.currentPage() - 1
          );
        }

        this.fetchPaginatedExpenses();
        this.loadSummary();
        this.loadCategoryChart();

      },

      error: (err: any) => {

        console.error(
          'Delete expense error:',
          err
        );

      }

    });

  }

}
