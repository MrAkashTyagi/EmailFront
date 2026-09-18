import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Familyservice {

  private http =
    inject(HttpClient);

  private readonly baseUrl = "http://localhost:8090"


  getFamilies(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/family`
    );
  }

  saveFamily(
    familyData: any
  ): Observable<any> {

    return this.http.post<any>(
      `${this.baseUrl}/family`,
      familyData
    );

  }


  deleteFamily(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/family/${id}`);
  }


  updateFamily(familyData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/family/${familyData.id}`, familyData);
  }

  getFamilyPaginated(
    page: number,
    size: number,
    search: string = ''
  ): Observable<any> {

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('search', search)

    return this.http.get<any>(
      `${this.baseUrl}/family`,
      { params }
    );

  }

  getAllFamiliesForDropdown(): Observable<any> {

    return this.http.get<any>(
      `${this.baseUrl}/family/getAll`
    );
  }

  importFamilyDump(
    file: File
  ): Observable<any> {


    const formData = new FormData();

    formData.append(
      'file',
      file
    );

    return this.http.post<any>(
      `${this.baseUrl}/dataDump/upload`,
      formData
    );
  }

  downloadFamilies(): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/dataDump/download`,
      {
        responseType: 'blob'
      }
    );
  }

}
