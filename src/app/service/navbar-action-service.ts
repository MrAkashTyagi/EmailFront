import { Injectable, signal } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class NavbarActionService {

  readonly searchQuery = signal<string>('');
  readonly totalGuestCount = signal<number>(0);
  readonly countLabel = signal<string>('Total Guests');
  // readonly weddingSettingsClick =
  //   new Subject<void>();

  private readonly weddingSettingsClickSubject =
    new Subject<void>();

  readonly weddingSettingsClick$ =
    this.weddingSettingsClickSubject
      .asObservable();

  private readonly weddingSettingsUpdatedSubject =
    new Subject<void>();

  readonly weddingSettingsUpdated$ =
    this.weddingSettingsUpdatedSubject
      .asObservable();

  triggerWeddingSettingsClick(): void {

    this.weddingSettingsClickSubject
      .next();

  }

  triggerWeddingSettingsUpdated(): void {

    this.weddingSettingsUpdatedSubject
      .next();

  }



  private addClickSubject = new Subject<void>();
  addClick$ = this.addClickSubject.asObservable();

  private exportClickSubject = new Subject<void>();
  exportClick$ = this.exportClickSubject.asObservable();

  triggerAddClick() {
    this.addClickSubject.next();
  }

  triggerExportClick() {
    this.exportClickSubject.next();
  }

  // triggerWeddingSettingsClick(): void {

  //   this.weddingSettingsClick.next();

  // }


}
