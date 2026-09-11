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

  const currentUser = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const userId = currentUser?.id;

  const params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString())
    .set('search', search)
    .set('category', category)
    .set('userId', userId.toString());

  return this.http.get<any>(
    `${this.baseUrl}/expenses`,
    { params }
  );
}

  // createExpense(
  //   expense: any,
  //   bill: File | null
  // ): Observable<any> {

  //   const formData = new FormData();

  //   formData.append(
  //     'expense',
  //     JSON.stringify(expense)
  //   );

  //   if (bill) {
  //     formData.append(
  //       'bill',
  //       bill
  //     );
  //   }

  //   return this.http.post<any>(
  //     `${this.baseUrl}/expenses`,
  //     formData
  //   );

  // }

createExpense(
  expense: any,
  bill: File | null
): Observable<any> {

  const currentUser = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const userId = currentUser?.id;

  if (!userId) {
    throw new Error(
      'Logged-in user not found'
    );
  }

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

  const params = new HttpParams()
    .set(
      'userId',
      userId.toString()
    );

  return this.http.post<any>(
    `${this.baseUrl}/expenses`,
    formData,
    { params }
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

  const currentUser = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const userId = currentUser?.id;

  const params = new HttpParams()
    .set('userId', userId.toString());

  return this.http.get(
    `${this.baseUrl}/expenses/summary`,
    { params }
  );

}

  getCategorySummary(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.baseUrl}/expenses/category-summary`
    );

  }

}
