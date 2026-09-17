import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './service/auth-service';


@Injectable({
  providedIn: 'root',
})
export class ExpenseService {

  private baseUrl = 'http://localhost:8090';

  private authService =
    inject(AuthService);


  constructor(private http: HttpClient) { }

  getExpensesPaged(
    page: number,
    size: number,
    search: string,
    category: string
  ): Observable<any> {


    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
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
    formData: FormData
  ): Observable<any> {

    return this.http.put<any>(
      `${this.baseUrl}/expenses/${id}`,
      formData
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
    return this.http.get(
      `${this.baseUrl}/expenses/summary`
    );

  }

  getCategorySummary(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.baseUrl}/expenses/category-summary`
    );

  }

  // import expense from excel

  importExpenseDump(
    file: File
  ): Observable<any> {

    const userId =
      this.authService
        .currentUser()
        ?.id
        ?.toString()
      ?? '';

    const formData =
      new FormData();

    formData.append(
      'file',
      file
    );

    const params =
      new HttpParams()
        .set(
          'userId',
          userId
        );

    return this.http.post(
      `${this.baseUrl}/expense-dump/upload`,
      formData,
      { params }
    );

  }

}
