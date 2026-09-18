import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly baseUrl = 'http://localhost:8090/dashboard';

  private http =
    inject(HttpClient);

  getSummary(): Observable<any> {

    return this.http.get<any>(
      `${this.baseUrl}/summary`
    );

  }

  getRecentGuests(): Observable<any> {

    return this.http.get<any>(
      `${this.baseUrl}/recent-guests`
    );

  }

  getRecentExpenses(): Observable<any> {

    return this.http.get<any>(
      `${this.baseUrl}/recent-expenses`
    );

  }

}
