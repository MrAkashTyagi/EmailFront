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

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeddingTaskService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/api/wedding-tasks`;

  //  getTasks(
  //   search?: string,
  //   status?: string,
  //   priority?: string
  // ): Observable<any> {

  //   let params = new HttpParams();

  //   if (search) {

  //     params =
  //       params.set(
  //         'search',
  //         search
  //       );
  //   }

  //   if (status) {

  //     params =
  //       params.set(
  //         'status',
  //         status
  //       );
  //   }

  //   if (priority) {

  //     params =
  //       params.set(
  //         'priority',
  //         priority
  //       );
  //   }

  //   return this.http.get(
  //     this.apiUrl,
  //     {
  //       params
  //     }
  //   );
  // }

  getTasks(
    search = '',
    status = '',
    priority = ''
  ): Observable<any> {

    let params =
      new HttpParams()
        .set('page', '0')
        .set('size', '1000');

    if (search.trim()) {
      params =
        params.set(
          'search',
          search.trim()
        );
    }

    if (status) {
      params =
        params.set(
          'status',
          status
        );
    }

    if (priority) {
      params =
        params.set(
          'priority',
          priority
        );
    }

    return this.http.get(
      this.apiUrl,
      {
        params
      }
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
