import {
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
import { NotificationService } from '../service/notification-service';

import {
  ExpenseBillsDialog
} from '../expense-bills-dialog/expense-bills-dialog';

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

  readonly displayedColumns = [
    'expenseName',
    'category',
    'totalAmount',
    'paidAmount',
    'pendingAmount',
    'paidBy',
    'expenseDate',
    'actions',
    'bill'
  ];

  readonly rawExpenses = signal<any[]>([]);
  readonly expenseSearchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('');
  readonly pageSize = signal<number>(10);
  readonly currentPage = signal<number>(0);
  readonly totalElements = signal<number>(0);
  readonly categorySummary = signal<any[]>([]);
  readonly summary = signal<any>({
    totalExpense: 0,
    totalExpenses: 0,
    highestExpense: 0,
    topCategory: '-'
  });

  private expenseService = inject(ExpenseService);
  private navBarService = inject(NavbarActionService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  private readonly notificationService =
    inject(NotificationService);

  readonly pieChartType: ChartType = 'pie';

  isImportingExpenses = false;

  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [
      {
        data: []
      }
    ]
  };


  ngOnInit(): void {
    this.loadCategoryChart();
    this.loadSummary();
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
        this.expenseService
          .exportExpenses(
            this.expenseSearchQuery(),
            this.selectedCategory()
          )
          .subscribe({
            next: (blob: Blob) => {

              const url =
                window.URL.createObjectURL(blob);

              const anchor =
                document.createElement('a');

              anchor.href = url;
              anchor.download =
                'Expenses.xlsx';

              anchor.click();

              window.URL.revokeObjectURL(url);
            },

            error: (error) => {

              console.error(
                'Expense export failed:',
                error
              );

              this.notificationService.error(
                'Expenses export nahi ho paya.'
              );
            }
          });
      });

  }

  constructor() {

    toObservable(this.navBarService.searchQuery)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(searchText => {

        const query =
          searchText?.trim() || '';

        if (
          query === this.expenseSearchQuery()
        ) {
          return;
        }

        this.expenseSearchQuery.set(query);

        this.currentPage.set(0);

        this.fetchPaginatedExpenses();

      });

  }

  onSearch(event: Event): void {
    const value =
      (event.target as HTMLInputElement)
        .value;

    this.navBarService
      .searchQuery
      .set(value);
  }

  onAddClick(): void {
    this.navBarService
      .triggerAddClick();
  }

  onExportClick(): void {
    this.navBarService
      .triggerExportClick();
  }

  loadCategoryChart(): void {

    this.expenseService
      .getCategorySummary()
      .subscribe({

        next: (response: any[]) => {

          this.categorySummary.set(response);

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
                  '#06B6D4',
                  '#f40df4'
                ]
              }
            ]
          };

        }

      });

  }

  readonly pieChartOptions = {
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

  private extractBillName(
    expense: any
  ): string {

    return expense.billOriginalName
      || 'bill';
  }

  viewBill(
    expense: any
  ): void {

    this.expenseService
      .getBill(expense.id)
      .subscribe({
        next: (blob: Blob) => {

          const objectUrl =
            URL.createObjectURL(blob);

          const dialogRef =
            this.dialog.open(
              BillPreviewDialog,
              {
                width: '90vw',
                maxWidth: '1200px',
                maxHeight: '90vh',
                data: {
                  url: objectUrl,
                  contentType:
                    expense.billContentType || blob.type,
                  fileName:
                    this.extractBillName(
                      expense
                    )
                }
              }
            );

          dialogRef
            .afterClosed()
            .subscribe(() => {

              URL.revokeObjectURL(
                objectUrl
              );

            });
        },

        error: (error) => {

          console.error(
            'Bill preview failed:',
            error
          );

          this.notificationService.error(
            'Bill preview nahi ho paya.'
          );
        }
      });
  }

  downloadBill(
    expense: any
  ): void {

    if (!expense?.billUrl) {

      this.notificationService.error(
        'Bill available nahi hai.'
      );

      return;
    }

    this.expenseService
      .downloadBill(expense.id)
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: (blob: Blob) => {

          const objectUrl =
            URL.createObjectURL(blob);

          const link =
            document.createElement('a');

          link.href = objectUrl;

          link.download =
            this.extractBillName(
              expense
            );

          document.body.appendChild(
            link
          );

          link.click();
          link.remove();

          URL.revokeObjectURL(
            objectUrl
          );
        },

        error: (error) => {

          console.error(
            'Bill download failed:',
            error
          );

          this.notificationService.error(
            'Bill download nahi ho paya.'
          );
        }
      });
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

        this.rawExpenses.set(response.content || []);
        this.totalElements.set(response.totalElements || 0);

        this.navBarService.totalGuestCount.set(
          response.totalElements || 0
        );

        this.navBarService.countLabel.set(
          'Total Expenses'
        );
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

    this.navBarService
      .searchQuery
      .set('');

    this.expenseSearchQuery.set('');
    this.currentPage.set(0);

    this.fetchPaginatedExpenses();
  }

  deleteExpense(expense: any): void {

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

        this.notificationService.success(
          'Expense deleted successfully.'
        );

      },

      error: (err: any) => {

        console.error(
          'Delete expense error:',
          err
        );

      }

    });

  }
  onExpenseDumpSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    this.isImportingExpenses = true;

    this.expenseService
      .importExpenseDump(file)
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: () => {

          this.notificationService.success(
            'Expense dump imported successfully.'
          );

          input.value = '';

          this.currentPage.set(0);

          this.fetchPaginatedExpenses();
          this.loadSummary();
          this.loadCategoryChart();

          this.isImportingExpenses = false;
        },

        error: (error) => {

          console.error(
            'Expense dump import failed:',
            error
          );

          this.notificationService.error(
            error?.error?.message
            || error?.error?.detail
            || 'Expense dump import nahi ho paya.'
          );

          input.value = '';

          this.isImportingExpenses = false;
        }
      });
  }

  viewBills(
    expense: any
  ): void {

    this.expenseService
      .getExpenseBills(
        expense.id
      )
      .subscribe({
        next: bills => {

          console.log(
            'BILLS RECEIVED',
            bills
          );

          this.dialog.open(
            ExpenseBillsDialog,
            {
              width: '850px',
              maxWidth: '95vw',
              maxHeight: '85vh',
              data: {
                bills
              }
            }
          );

        }

      });

  }

}
