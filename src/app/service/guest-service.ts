import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GuestService {

  constructor(private http: HttpClient){}


  private baseUrl:string = "http://localhost:8090";

  save(data:any){

    return this.http.post(`${this.baseUrl}/guests`,data)

  }

  deleteGuest(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/guests/${id}`);
  }

  updateGuest(id: number, guestData: any): Observable<any> {
  // Yeh URL generate karega: http://localhost:8090/guests/4
  return this.http.put<any>(`${this.baseUrl}/guests/${id}`, guestData);
}

}
