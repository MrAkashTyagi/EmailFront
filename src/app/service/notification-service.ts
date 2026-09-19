import {
  Injectable,
  inject
} from '@angular/core';

import {
  MatSnackBar
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly snackBar =
    inject(MatSnackBar);

  success(
    message: string
  ): void {

    this.snackBar.open(
      message,
      undefined,
      {
        duration: 2000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      }
    );

  }

  error(
    message: string
  ): void {

    this.snackBar.open(
      message,
      'Close',
      {
        duration: 4000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      }
    );

  }

  warning(
    message: string
  ): void {

    this.snackBar.open(
      message,
      'Close',
      {
        duration: 3500,
        panelClass: ['warning-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      }
    );

  }

  info(
    message: string
  ): void {

    this.snackBar.open(
      message,
      'Close',
      {
        duration: 3000,
        panelClass: ['info-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      }
    );

  }

}
