import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
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


import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ExpenseService } from '../expense-service';

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
    MatSelectModule
  ],
  templateUrl: './add-expense-dialog.html',
  styleUrl: './add-expense-dialog.css'
})
export class AddExpenseDialog implements OnInit {

  private formBuilder = inject(FormBuilder);
  private expenseService = inject(ExpenseService);
  private dialogRef = inject(MatDialogRef<AddExpenseDialog>);

  isSaving = false;
  saveError = '';

  selectedBill: File | null = null;


  readonly categories: string[] = [
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

  expenseForm: FormGroup = this.formBuilder.group({
    expenseName: ['', [Validators.required, Validators.maxLength(100)]],
    category: ['', Validators.required],
    description: ['', Validators.maxLength(500)],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    expenseDate: ['', Validators.required],
    paidBy: ['', [Validators.required, Validators.maxLength(100)]],
    billPath: ['']
  });

  public data = inject(MAT_DIALOG_DATA, {
    optional: true
  });

  ngOnInit(): void {

    if (this.data) {

      this.expenseForm.patchValue({
        expenseName: this.data.expenseName,
        category: this.data.category,
        description: this.data.description,
        amount: this.data.amount,
        expenseDate: this.data.expenseDate,
        paidBy: this.data.paidBy,
        billPath: this.data.billPath
      });

    }

  }

  onBillSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedBill = input.files[0];
    }

  }

  saveExpense(): void {

    if (this.expenseForm.invalid || this.isSaving) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.saveError = '';

    const payload = {
      ...this.expenseForm.getRawValue(),
      amount: Number(this.expenseForm.value.amount)
    };

    // EDIT MODE
    if (this.data?.id) {

      const formData = new FormData();

      formData.append(
        'expense',
        JSON.stringify(payload)
      );

      if (this.selectedBill) {

        formData.append(
          'bill',
          this.selectedBill
        );

      }

      this.expenseService.updateExpense(
        this.data.id,
        formData
      ).subscribe({
        next: (updatedExpense: any) => {

          setTimeout(() => {
            this.isSaving = false;
            this.dialogRef.close(updatedExpense);
          });

        },

        error: (error: any) => {
          console.error('Update expense error:', error);
          this.isSaving = false;
          this.saveError =
            'Unable to update the expense. Please try again.';
        }

      });

    }

    // ADD MODE
    else {

      this.expenseService.createExpense(
        payload,
        this.selectedBill
      ).subscribe({

        next: (createdExpense: any) => {

          setTimeout(() => {
            this.isSaving = false;
            this.dialogRef.close(createdExpense);
          });

        },


        error: (error: any) => {
          console.error('Create expense error:', error);
          this.isSaving = false;
          this.saveError =
            'Unable to save the expense. Please try again.';
        }

      });

    }

  }
}
