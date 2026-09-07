import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:8090/dashboard';

  constructor(private http: HttpClient) { }

  getSummary() {
    return this.http.get<any>(
      `${this.apiUrl}/summary`
    );
  }

  getRecentGuests() {

    return this.http.get<any[]>(
      `${this.apiUrl}/recent-guests`
    );

  }

  getRecentExpenses() {

    return this.http.get<any[]>(
      `${this.apiUrl}/recent-expenses`
    );

  }


}
