import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface GuestAccountRequest {

  name: string;

  email: string;

  password: string;
}

export interface GuestAccountResponse {

  id: number;

  name: string;

  email: string;

  role: string;

  ownerUserId: number;
}

@Injectable({
  providedIn: 'root'
})
export class GuestAccountService {

  private http = inject(HttpClient);

  createGuestAccount(
    request: GuestAccountRequest
  ): Observable<GuestAccountResponse> {

    return this.http.post<GuestAccountResponse>(
      'http://localhost:8090/auth/guest',
      request
    );
  }
}
