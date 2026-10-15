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


import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeddingContactService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/api/wedding-contacts`;


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

  uploadContactsExcel(
    file: File
  ): Observable<any> {

    const formData =
      new FormData();

    formData.append(
      'file',
      file
    );

    return this.http.post(
      `${this.apiUrl}/dump/upload`,
      formData
    );
  }

  downloadContactsExcel(): Observable<Blob> {

    return this.http.get(
      `${this.apiUrl}/dump/download`,
      {
        responseType: 'blob'
      }
    );
  }
}
