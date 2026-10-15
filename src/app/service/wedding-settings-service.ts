import {
  HttpClient
} from '@angular/common/http';

import {
  inject,
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import { environment } from '../../environments/environment';

export interface WeddingSettings {

  id: number;

  partnerName:
  string | null;

  weddingDateTime:
  string;
}

export interface WeddingSettingsRequest {

  partnerName:
  string | null;

  weddingDateTime:
  string;
}

@Injectable({
  providedIn: 'root'
})
export class WeddingSettingsService {

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    environment.apiUrl;

  getSettings():
    Observable<WeddingSettings> {

    return this.http.get<
      WeddingSettings
    >(
      `${this.baseUrl}/wedding-settings`
    );
  }

  saveSettings(
    request:
      WeddingSettingsRequest
  ): Observable<WeddingSettings> {

    return this.http.put<
      WeddingSettings
    >(
      `${this.baseUrl}/wedding-settings`,
      request
    );
  }

  deleteSettings():
    Observable<void> {

    return this.http.delete<void>(
      `${this.baseUrl}/wedding-settings`
    );
  }
}
