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

  readonly weddingSettingsClick =
    signal(0);
    

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

  triggerWeddingSettingsClick(): void {

    this.weddingSettingsClick.update(
      value => value + 1
    );

  }

}
