import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ExpenseService } from '../expense-service';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../service/notification-service';

@Component({
  selector: 'app-add-expense-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule
  ],
  templateUrl: './add-expense-dialog.html',
  styleUrl: './add-expense-dialog.css'
})
export class AddExpenseDialog implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly expenseService = inject(ExpenseService);
  private readonly dialogRef = inject(MatDialogRef<AddExpenseDialog>);

  private readonly notificationService =
    inject(NotificationService);


  isSaving = false;
  saveError = '';
  existingBillName = '';
  selectedBills: File[] = [];

  readonly today = new Date();

  readonly categories = [
    'Food',
    'Decoration',
    'Venue',
    'Photography',
    'Entertainment',
    'Transportation',
    'Accommodation',
    'Invitation',
    'Clothing',
    'Gift',
    'Jewellery',
    'Miscellaneous'
  ];

  get isPaidAmountInvalid(): boolean {

    const paid =
      Number(
        this.expenseForm.get(
          'paidAmount'
        )?.value ?? 0
      );

    const total =
      Number(
        this.expenseForm.get(
          'totalAmount'
        )?.value ?? 0
      );

    return paid > total;

  }

  get pendingAmount(): number {

    const total =
      Number(
        this.expenseForm.get(
          'totalAmount'
        )?.value || 0
      );

    const paid =
      Number(
        this.expenseForm.get(
          'paidAmount'
        )?.value || 0
      );

    return total - paid;
  }

  readonly expenseForm = this.formBuilder.group({
    expenseName: ['', [Validators.required, Validators.maxLength(100)]],
    category: ['', Validators.required],
    description: ['', Validators.maxLength(500)],

    totalAmount: [
      null,
      [Validators.required, Validators.min(0.01)]
    ],

    paidAmount: [
      0,
      [Validators.required, Validators.min(0)]
    ],

    expenseDate: ['', Validators.required],
    paidBy: ['', [Validators.required, Validators.maxLength(100)]],
    billPath: ['']
  });

  readonly data = inject(MAT_DIALOG_DATA, {
    optional: true
  });

  ngOnInit(): void {

    if (!this.data) {
      return;
    }

    this.existingBillName =
      this.extractFileName(
        this.data.billPath
      );

    this.expenseForm.patchValue({
      expenseName:
        this.data.expenseName,
      category:
        this.data.category,
      description:
        this.data.description,
      totalAmount:
        this.data.totalAmount,
      paidAmount:
        this.data.paidAmount,
      expenseDate:
        this.data.expenseDate,
      paidBy:
        this.data.paidBy,
      billPath:
        this.data.billPath
    });
  }

  private extractFileName(
    billPath?: string
  ): string {

    return billPath
      ?.split(/[\\/]/)
      .pop()
      || '';
  }

onBillsSelected(event: Event): void {

  const input =
    event.target as HTMLInputElement;

  if (!input.files) {
    return;
  }

  const newFiles =
    Array.from(input.files);

  newFiles.forEach(
    file => {

      const alreadyExists =
        this.selectedBills.some(
          existing =>
            existing.name === file.name
            &&
            existing.size === file.size
        );

      if (!alreadyExists) {

        this.selectedBills.push(
          file
        );

      }

    }
  );

  input.value = '';
}

removeBill(index: number): void {

  this.selectedBills.splice(
    index,
    1
  );

}

  saveExpense(): void {

    if (
      this.expenseForm.invalid ||
      this.isSaving
    ) {

      this.expenseForm
        .markAllAsTouched();

      return;
    }

    const formValue =
      this.expenseForm.getRawValue();

    const totalAmount =
      Number(
        formValue.totalAmount
      );

    const paidAmount =
      Number(
        formValue.paidAmount
      );

    if (paidAmount > totalAmount) {

      this.saveError =
        '⚠️ Paid Amount cannot be greater than Total Amount';

      return;
    }

    this.isSaving = true;
    this.saveError = '';

    const payload = {
      ...formValue,
      totalAmount,
      paidAmount
    };


    // EDIT MODE

    if (this.data?.id) {

      const formData = new FormData();

      formData.append(
        'expense',
        JSON.stringify(payload)
      );

  if (
    this.selectedBills.length > 0
) {

  this.selectedBills.forEach(
    bill => {

      formData.append(
        'bills',
        bill
      );

    }
  );
}

      this.expenseService.updateExpense(
        this.data.id,
        formData
      ).subscribe({
        next: (updatedExpense: any) => {

          this.isSaving = false;

          this.notificationService.success(
            'Expense updated successfully.'
          );

          this.dialogRef.close(
            updatedExpense
          );

        },

        error: (error: any) => {

          console.error(
            'Update expense error:',
            error
          );

          this.isSaving = false;

          this.notificationService.error(
            'Unable to update the expense.'
          );

        }

      });

    }

    // ADD MODE
    else {

      this.expenseService.createExpense(
        payload,
        this.selectedBills
      ).subscribe({
        next: (createdExpense: any) => {

          this.isSaving = false;

          this.notificationService.success(
            'Expense saved successfully.'
          );

          this.dialogRef.close(
            createdExpense
          );

        },


        error: (error: any) => {
          console.error('Create expense error:', error);
          this.isSaving = false;
          this.notificationService.error(
            'Unable to save the expense.'
          );
        }

      });

    }

  }
}
