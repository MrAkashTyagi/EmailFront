import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly baseUrl =
    `${environment.apiUrl}/dashboard`;

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
