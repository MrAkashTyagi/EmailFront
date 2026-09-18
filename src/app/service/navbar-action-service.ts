import { Injectable, signal } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class NavbarActionService {

readonly searchQuery = signal<string>('');
readonly totalGuestCount = signal<number>(0);
readonly countLabel = signal<string>('Total Guests');


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
}
