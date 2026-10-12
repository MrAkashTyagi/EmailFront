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
  BulkStayAllocationRequest,
  StayAllocation,
  StayAllocationRequest,
  StayAllocationStatus,
  StayRoomCapacity
} from '../models/stay-allocation';

@Injectable({
  providedIn: 'root'
})
export class StayAllocationService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8090/stay-allocations';

  allocateGuest(
    request: StayAllocationRequest
  ): Observable<StayAllocation> {

    return this.http.post<StayAllocation>(
      this.apiUrl,
      request
    );
  }

  allocateGuests(
    request: BulkStayAllocationRequest
  ): Observable<StayAllocation[]> {

    return this.http.post<StayAllocation[]>(
      `${this.apiUrl}/bulk`,
      request
    );
  }

  getAllocations(
    locationId?: number,
    roomId?: number,
    status?: StayAllocationStatus | ''
  ): Observable<StayAllocation[]> {

    let params =
      new HttpParams();

    if (locationId !== undefined) {
      params =
        params.set(
          'locationId',
          locationId
        );
    }

    if (roomId !== undefined) {
      params =
        params.set(
          'roomId',
          roomId
        );
    }

    if (status) {
      params =
        params.set(
          'status',
          status
        );
    }

    return this.http.get<StayAllocation[]>(
      this.apiUrl,
      {
        params
      }
    );
  }

  getAllocationById(
    allocationId: number
  ): Observable<StayAllocation> {

    return this.http.get<StayAllocation>(
      `${this.apiUrl}/${allocationId}`
    );
  }

  updateAllocation(
    allocationId: number,
    request: StayAllocationRequest
  ): Observable<StayAllocation> {

    return this.http.put<StayAllocation>(
      `${this.apiUrl}/${allocationId}`,
      request
    );
  }

  updateStatus(
    allocationId: number,
    status: StayAllocationStatus
  ): Observable<StayAllocation> {

    const params =
      new HttpParams()
        .set(
          'status',
          status
        );

    return this.http.patch<StayAllocation>(
      `${this.apiUrl}/${allocationId}/status`,
      {},
      {
        params
      }
    );
  }

  cancelAllocation(
    allocationId: number
  ): Observable<StayAllocation> {

    return this.http.patch<StayAllocation>(
      `${this.apiUrl}/${allocationId}/cancel`,
      {}
    );
  }

  deleteAllocation(
    allocationId: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${allocationId}`
    );
  }

  getRoomCapacity(
    roomId: number
  ): Observable<StayRoomCapacity> {

    return this.http.get<StayRoomCapacity>(
      `${this.apiUrl}/rooms/${roomId}/capacity`
    );
  }

  exportStayAllocations(): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/export`,
      {
        responseType: 'blob'
      }
    );
  }
}
