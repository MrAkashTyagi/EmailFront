import {
  HttpClient
} from '@angular/common/http';

import {
  Injectable,
  inject
} from '@angular/core';

import {
  Observable
} from 'rxjs';

export interface WallMedia {

  id: number;

  originalFileName: string;

  mediaUrl: string;

  contentType: string;

  mediaType: 'IMAGE' | 'VIDEO';

  fileSize: number;

  caption: string;

  uploadedAt: string;

  uploadedByName: string;
}

@Injectable({
  providedIn: 'root'
})
export class WallService {

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    'http://localhost:8090';

  uploadMedia(
    file: File,
    caption: string
  ): Observable<WallMedia> {

    const formData =
      new FormData();

    formData.append(
      'file',
      file
    );

    formData.append(
      'caption',
      caption.trim()
    );

    return this.http.post<WallMedia>(
      `${this.baseUrl}/wall/upload`,
      formData
    );
  }

  getAllMedia():
    Observable<WallMedia[]> {

    return this.http.get<WallMedia[]>(
      `${this.baseUrl}/wall`
    );
  }

  getMediaContent(
    mediaId: number
  ): Observable<Blob> {

    return this.http.get(
      `${this.baseUrl}/wall/${mediaId}/content`,
      {
        responseType: 'blob'
      }
    );
  }

  deleteMedia(
    mediaId: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.baseUrl}/wall/${mediaId}`
    );
  }
  downloadAllMedia() {

    return this.http.get(
      `${this.baseUrl}/wall/download-all`,
      {
        responseType: 'blob'
      }
    );
  }
}
