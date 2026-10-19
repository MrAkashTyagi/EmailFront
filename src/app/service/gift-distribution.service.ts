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
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GiftDistributionService {

  private readonly baseUrl =
    environment.apiUrl;

  private http =
    inject(HttpClient);

  getGiftDistributionsPaged(
    page: number,
    size: number,
    search: string,
    giftType: string,
    minAmount: string,
    maxAmount: string
  ): Observable<any> {

    const params =
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
          search || ''
        )
        .set(
          'giftType',
          giftType || ''
        )
        .set(
          'minAmount',
          minAmount || ''
        )
        .set(
          'maxAmount',
          maxAmount || ''
        );

    return this.http.get<any>(
      `${this.baseUrl}/api/gift-distributions`,
      {
        params
      }
    );
  }

  createGiftDistribution(
    payload: any
  ): Observable<any> {

    return this.http.post(
      `${this.baseUrl}/api/gift-distributions`,
      payload
    );
  }

  updateGiftDistribution(
    id: number,
    payload: any
  ): Observable<any> {

    return this.http.put(
      `${this.baseUrl}/api/gift-distributions/${id}`,
      payload
    );
  }

  deleteGiftDistribution(
    id: number
  ): Observable<any> {

    return this.http.delete(
      `${this.baseUrl}/api/gift-distributions/${id}`
    );
  }

  getGiftDistributionById(
    id: number
  ): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/api/gift-distributions/${id}`
    );
  }

  getGiftDistributionSummary(): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/api/gift-distributions/summary`
    );
  }

  exportGiftDistributions(
    search: string,
    giftType: string,
    minAmount: string,
    maxAmount: string
  ): Observable<Blob> {

    let params =
      new HttpParams()
        .set(
          'search',
          search.trim()
        );

    if (giftType) {

      params =
        params.set(
          'giftType',
          giftType
        );
    }

    if (minAmount) {

      params =
        params.set(
          'minAmount',
          minAmount
        );
    }

    if (maxAmount) {

      params =
        params.set(
          'maxAmount',
          maxAmount
        );
    }

    return this.http.get(
      `${this.baseUrl}/api/gift-distributions/export`,
      {
        params,
        responseType: 'blob'
      }
    );
  }

}
