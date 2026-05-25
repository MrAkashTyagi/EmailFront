import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EmailService {

  constructor(private http: HttpClient){}

  private baseUrl:string = "http://localhost:8008"

  sendEmail(data:any){
    return this.http.post(`${this.baseUrl}/sendemail`,data)
  }

}
