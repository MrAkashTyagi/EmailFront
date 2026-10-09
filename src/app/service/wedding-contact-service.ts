import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeddingContactService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8090/api/wedding-contacts';

  getContacts(
    page: number,
    size: number,
    search: string
  ): Observable<any> {

    let params =
      new HttpParams()
        .set(
          'page',
          page.toString()
        )
        .set(
          'size',
          size.toString()
        );

    if (search?.trim()) {

      params = params.set(
        'search',
        search.trim()
      );
    }

    return this.http.get<any>(
      this.apiUrl,
      {
        params
      }
    );
  }

  getContactById(
    id: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/${id}`
    );
  }

  createContact(
    contact: any
  ): Observable<any> {

    return this.http.post<any>(
      this.apiUrl,
      contact
    );
  }

  updateContact(
    id: number,
    contact: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      contact
    );
  }

  deleteContact(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
