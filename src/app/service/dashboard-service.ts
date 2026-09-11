import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:8090/dashboard';

  constructor(private http: HttpClient) { }

  getSummary(): Observable<any> {

  const currentUser = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const userId = currentUser?.id;

  const params = new HttpParams()
    .set('userId', userId.toString());

  return this.http.get<any>(
    `${this.apiUrl}/summary`,
    { params }
  );

}

getRecentGuests(): Observable<any> {

  const currentUser = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const userId = currentUser?.id;

  const params = new HttpParams()
    .set('userId', userId.toString());

  return this.http.get<any>(
    `${this.apiUrl}/recent-guests`,
    { params }
  );

}

getRecentExpenses(): Observable<any> {

  const currentUser = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const userId = currentUser?.id;

  const params = new HttpParams()
    .set('userId', userId.toString());

  return this.http.get<any>(
    `${this.apiUrl}/recent-expenses`,
    { params }
  );

}


}
