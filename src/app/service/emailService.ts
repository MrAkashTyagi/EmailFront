import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import test from 'node:test';
import { Observable } from 'rxjs';
import { text } from 'stream/consumers';

@Injectable({
  providedIn: 'root',
})
export class EmailService {

  constructor(private http: HttpClient){}

  private baseUrl:string = "http://localhost:8090"

  sendEmail(data:any){
    return this.http.post(`${this.baseUrl}/sendemail`,data)
  }


getData(): Observable<string> {
    return this.http.get(`${this.baseUrl}/guests/getAllGuests`,{ responseType:'text' });
  }

}
