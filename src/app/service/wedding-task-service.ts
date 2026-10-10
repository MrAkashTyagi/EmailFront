import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  WeddingTask
} from '../models/wedding-task';

@Injectable({
  providedIn: 'root'
})
export class WeddingTaskService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8090/api/wedding-tasks';

  getTasks(): Observable<any> {

    return this.http.get(
      this.apiUrl
    );
  }

  createTask(
    task: any
  ): Observable<any> {

    return this.http.post(
      this.apiUrl,
      task
    );
  }

  updateTask(
    id: number,
    task: any
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/${id}`,
      task
    );
  }

  updateStatus(
    id: number,
    status: string
  ): Observable<any> {

    return this.http.patch(
      `${this.apiUrl}/${id}/status?status=${status}`,
      {}
    );
  }

  deleteTask(
    id: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}
