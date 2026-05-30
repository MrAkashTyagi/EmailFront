import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavbarActionService {

  searchQuery = signal<string>('');

  private addClickSubject = new Subject<void>();
  addClick$ = this.addClickSubject.asObservable();

  triggerAddClick(){
    this.addClickSubject.next();
  }
}
