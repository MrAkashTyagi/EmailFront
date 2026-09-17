import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GuestService {

  private baseUrl = 'http://localhost:8090';

  constructor(
    private http: HttpClient
  ) { }

  save(data: any): Observable<any> {

  return this.http.post<any>(
    `${this.baseUrl}/guests`,
    data
  );

}

  deleteGuest(
    id: number
  ): Observable<any> {

    return this.http.delete<any>(
      `${this.baseUrl}/guests/${id}`
    );
  }

  updateGuest(
    id: number,
    guestData: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.baseUrl}/guests/${id}`,
      guestData
    );
  }

  getGuestsPaged(
    page: number,
    size: number,
    search: string = '',
    gender: string = '',
    type: string = '',
    category: string,
    gift: string,
    stay: string,
    cash: string,
    invitationSent: string
  ): Observable<any> {

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('search', search)
      .set('gender', gender)
      .set('adultOrchild', type)
      .set('guestCategory', category)
      .set('gift', gift)
      .set('stay', stay)
      .set('cash', cash)
      .set('invitationSent', invitationSent);

    return this.http.get<any>(
      `${this.baseUrl}/guests/guest`,
      { params }
    );
  }

  downloadGuests(
  gender: string,
  adultOrchild: string,
  gift: string,
  cash: string,
  guestCategory: string,
  stay: string,
  invitationSent: string,
  search: string = ''
): Observable<Blob> {

  let params = new HttpParams()
    .set('search', search || '')
    .set('gender', gender || '')
    .set('adultOrchild', adultOrchild || '')
    .set('gift', gift || '')
    .set('cash', cash || '')
    .set('guestCategory', guestCategory || '')
    .set('stay', stay || '');

  if (
    invitationSent !== null &&
    invitationSent !== undefined &&
    invitationSent !== ''
  ) {

    params = params.set(
      'invitationSent',
      invitationSent
    );
  }

  return this.http.get(
    `${this.baseUrl}/guests/download`,
    {
      params,
      responseType: 'blob'
    }
  );
}

  getGuestSummary(): Observable<any> {

    return this.http.get<any>(
      `${this.baseUrl}/guests/summary`
    );

  }

  getGuestCategorySummary(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.baseUrl}/guests/category-summary`
    );
  }

  // upload guest data

importGuestDump(
  file: File
): Observable<any> {

  const formData = new FormData();

  formData.append(
    'file',
    file
  );

  return this.http.post(
    `${this.baseUrl}/datadump/upload`,
    formData
  );

}

  getGiftSummary(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.baseUrl}/guests/gift-summary`
    );

  }

}
