import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class ExpenseService {

  private baseUrl = 'http://localhost:8090';

  constructor(private http: HttpClient) { }

  getExpensesPaged(
    page: number,
    size: number,
    search: string,
    category: string
  ): Observable<any> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('search', search)
      .set('category', category);

    return this.http.get<any>(
      `${this.baseUrl}/expenses`,
      { params }
    );
  }

  createExpense(
    expense: any,
    bill: File | null
  ): Observable<any> {

    const formData = new FormData();

    formData.append(
      'expense',
      JSON.stringify(expense)
    );

    if (bill) {
      formData.append(
        'bill',
        bill
      );
    }

    return this.http.post<any>(
      `${this.baseUrl}/expenses`,
      formData
    );

  }

  getExpenseById(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/expenses/${id}`
    );
  }

  updateExpense(
    id: number,
    expense: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.baseUrl}/expenses/${id}`,
      expense
    );

  }

  deleteExpense(id: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/expenses/${id}`
    );
  }

  exportExpenses(): Observable<Blob> {

    return this.http.get(
      `${this.baseUrl}/expenses/export`,
      {
        responseType: 'blob'
      }
    );

  }

  getExpenseSummary(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/expenses/summary`
    );
  }

  getCategorySummary(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.baseUrl}/expenses/category-summary`
    );

  }

}
