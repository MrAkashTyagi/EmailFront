import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { text } from 'stream/consumers';

@Injectable({
  providedIn: 'root',
})
export class Familyservice {

  constructor(private http: HttpClient) { }


  private baseUrl: string = "http://localhost:8090"

  getData(): Observable<string> {
    return this.http.get(`${this.baseUrl}/family`, { responseType: 'text' });
  }

  saveFamily(familyData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/family`, familyData);
  }


  deleteFamily(id: number): Observable<any> {
    // Yeh URL database se us specific id ki family ko delete karega
    return this.http.delete<any>(`${this.baseUrl}/family/${id}`);
  }


  updateFamily(familyData: any):Observable<any>{
    console.log("Service se API call ja rahi hai update ke liye:", familyData);
    return this.http.put<any>(`${this.baseUrl}/family/${familyData.id}`,familyData);
  }

}
