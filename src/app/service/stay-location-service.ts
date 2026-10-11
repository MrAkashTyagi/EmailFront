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
  StayLocation,
  StayLocationRequest,
  StayLocationType
} from '../models/stay-location';

@Injectable({
  providedIn: 'root'
})
export class StayLocationService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8090/stay-locations';

  getLocations(
    type?: StayLocationType | '',
    activeOnly = false
  ): Observable<StayLocation[]> {

    let params =
      new HttpParams()
        .set(
          'activeOnly',
          activeOnly
        );

    if (type) {

      params =
        params.set(
          'type',
          type
        );
    }

    return this.http.get<StayLocation[]>(
      this.apiUrl,
      {
        params
      }
    );
  }

  getLocationById(
    locationId: number
  ): Observable<StayLocation> {

    return this.http.get<StayLocation>(
      `${this.apiUrl}/${locationId}`
    );
  }

  createLocation(
    request: StayLocationRequest
  ): Observable<StayLocation> {

    return this.http.post<StayLocation>(
      this.apiUrl,
      request
    );
  }

  updateLocation(
    locationId: number,
    request: StayLocationRequest
  ): Observable<StayLocation> {

    return this.http.put<StayLocation>(
      `${this.apiUrl}/${locationId}`,
      request
    );
  }

  deleteLocation(
    locationId: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${locationId}`
    );
  }
}
