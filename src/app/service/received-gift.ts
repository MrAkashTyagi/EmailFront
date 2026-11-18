import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  inject,
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReceivedGiftService {

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    environment.apiUrl;

  getReceivedGiftsPaged(
    page: number,
    size: number,
    search: string,
    giftType: string,
    minCashAmount: string,
    maxCashAmount: string
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
        )
        .set(
          'search',
          search?.trim() || ''
        );

    if (giftType) {

      params =
        params.set(
          'giftType',
          giftType
        );
    }

    if (minCashAmount) {

      params =
        params.set(
          'minCashAmount',
          minCashAmount
        );
    }

    if (maxCashAmount) {

      params =
        params.set(
          'maxCashAmount',
          maxCashAmount
        );
    }

    return this.http.get<any>(
      `${this.baseUrl}/api/received-gifts`,
      {
        params
      }
    );
  }

  getReceivedGiftById(
    id: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.baseUrl}/api/received-gifts/${id}`
    );
  }

  createReceivedGift(
    payload: any
  ): Observable<any> {

    return this.http.post<any>(
      `${this.baseUrl}/api/received-gifts`,
      payload
    );
  }

  updateReceivedGift(
    id: number,
    payload: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.baseUrl}/api/received-gifts/${id}`,
      payload
    );
  }

  deleteReceivedGift(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.baseUrl}/api/received-gifts/${id}`
    );
  }

  getReceivedGiftSummary():
    Observable<any> {

    return this.http.get<any>(
      `${this.baseUrl}/api/received-gifts/summary`
    );
  }
}
