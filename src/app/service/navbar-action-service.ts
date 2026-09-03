import { Injectable, signal } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class NavbarActionService {

  searchQuery = signal<string>('');

  totalGuestCount = signal<number>(0);

  // totalGuestCount = signal<number>(0);

countLabel = signal<string>('Total Guests');


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
