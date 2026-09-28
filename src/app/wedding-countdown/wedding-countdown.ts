import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  MatTooltipModule
} from '@angular/material/tooltip';
import { WeddingSettingsDialog } from '../components/wedding-settings-dialog/wedding-settings-dialog';
import { WeddingSettingsService, WeddingSettings } from '../service/wedding-settings-service';

@Component({
  selector:
    'app-wedding-countdown',

  standalone: true,

  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule
  ],

  templateUrl:
    './wedding-countdown.html',

  styleUrl:
    './wedding-countdown.css'
})
export class WeddingCountdown
  implements OnInit {

  private readonly settingsService =
    inject(WeddingSettingsService);

  private readonly dialog =
    inject(MatDialog);

  private readonly destroyRef =
    inject(DestroyRef);

  settings:
    WeddingSettings | null =
      null;

  isLoading =
    true;

readonly days =
  signal(0);

readonly hours =
  signal(0);

readonly minutes =
  signal(0);

readonly seconds =
  signal(0);

  isWeddingComplete =
    false;

  isWeddingToday =
    false;

  private countdownTimer:
    ReturnType<typeof setInterval>
    | null =
      null;

  ngOnInit(): void {

    this.loadSettings();

    this.destroyRef
      .onDestroy(() => {

        this.stopTimer();

      });
  }

loadSettings(): void {

  console.log('STEP 1');

  this.settingsService
    .getSettings()
    .subscribe({

      next: settings => {

        console.log('STEP 2', settings);

        this.settings = settings;

        this.isLoading = false;

        this.startTimer();

      },

      error: error => {

        console.log('STEP 3', error);

        this.isLoading = false;

      }

    });

}

  openSettings(): void {

    const dialogRef =
      this.dialog.open(
        WeddingSettingsDialog,
        {
          width: '620px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          autoFocus: false,
          data: this.settings
        }
      );

    dialogRef
      .afterClosed()
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(
        (
          savedSettings:
            WeddingSettings | undefined
        ) => {

          if (!savedSettings) {
            return;
          }

          this.settings =
            savedSettings;

          this.startTimer();

        }
      );
  }

  private startTimer(): void {

  console.log('TIMER START');

  this.stopTimer();

  if (
    !this.settings
    || !this.settings.weddingDateTime
  ) {
    return;
  }

  this.updateCountdown();

  this.countdownTimer =
    setInterval(() => {

      console.log('TICK');

      this.updateCountdown();

    }, 1000);
}

  private stopTimer(): void {

    if (
      this.countdownTimer
      === null
    ) {
      return;
    }

    clearInterval(
      this.countdownTimer
    );

    this.countdownTimer =
      null;
  }

  private updateCountdown(): void {

    if (
      !this.settings
      || !this.settings
          .weddingDateTime
    ) {
      return;
    }

    const weddingDate =
      new Date(
        this.settings
          .weddingDateTime
      );

    const targetTime =
      weddingDate.getTime();

    const currentDate =
      new Date();

    const currentTime =
      currentDate.getTime();

    const difference =
      targetTime
      - currentTime;

    this.isWeddingComplete =
      difference <= 0;

    this.isWeddingToday =
      this.isSameCalendarDay(
        currentDate,
        weddingDate
      );

    const duration =
      this.isWeddingComplete
        ? Math.abs(difference)
        : difference;

    this.days.set(
      Math.floor(
        duration
        / (
          1000
          * 60
          * 60
          * 24
        )
      ));

    this.hours.set(
      Math.floor(
        (
          duration
          / (
            1000
            * 60
            * 60
          )
        )
        % 24
      ));

    this.minutes.set(
      Math.floor(
        (
          duration
          / (
            1000
            * 60
          )
        )
        % 60
      ));

    this.seconds.set(
      Math.floor(
        (
          duration
          / 1000
        )
        % 60
      ));
  }

  private isSameCalendarDay(
    firstDate: Date,
    secondDate: Date
  ): boolean {

    return (
      firstDate.getFullYear()
        ===
      secondDate.getFullYear()
      &&
      firstDate.getMonth()
        ===
      secondDate.getMonth()
      &&
      firstDate.getDate()
        ===
      secondDate.getDate()
    );
  }

  get heading(): string {

    if (
      this.isWeddingToday
      && !this.isWeddingComplete
    ) {

      return 'Today Is The Big Day!';
    }

    if (
      this.isWeddingComplete
    ) {

      return 'Happily Married';
    }

    return 'The Countdown Is On';
  }

  get subtitle(): string {

    if (
      this.settings?.partnerName
    ) {

      return (
        `Until the celebration with `
        + this.settings.partnerName
      );
    }

    return 'Until the big day';
  }

  hasWeddingDate(): boolean {

  return !!(
    this.settings &&
    this.settings.weddingDateTime
  );

}

}
