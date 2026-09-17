import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:8090/dashboard';

  constructor(private http: HttpClient) {

  }

  getSummary(): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/summary`
    );

  }

  getRecentGuests(): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/recent-guests`
    );

  }

  getRecentExpenses(): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/recent-expenses`
    );

  }

}
