import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import test from 'node:test';
import { Observable } from 'rxjs';
import { text } from 'stream/consumers';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmailService {

  constructor(private http: HttpClient) { }

  private baseUrl: string =
    environment.apiUrl;

  sendEmail(data: any) {
    return this.http.post(`${this.baseUrl}/sendemail`, data)
  }


  getData(): Observable<string> {
    return this.http.get(`${this.baseUrl}/guests/getAllGuests`, { responseType: 'text' });
  }

}
