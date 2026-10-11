import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  inject,
  Injectable
} from '@angular/core';

import {
  forkJoin,
  map,
  Observable,
  of,
  switchMap
} from 'rxjs';

import {
  StayRoom,
  StayRoomCapacity,
  StayRoomRequest
} from '../models/stay-room';

@Injectable({
  providedIn: 'root'
})
export class StayRoomService {

  private readonly http =
    inject(HttpClient);

  private readonly roomApiUrl =
    'http://localhost:8090/stay-rooms';

  private readonly allocationApiUrl =
    'http://localhost:8090/stay-allocations';

  getRooms(
    locationId?: number,
    activeOnly = false
  ): Observable<StayRoom[]> {

    let params =
      new HttpParams()
        .set(
          'activeOnly',
          activeOnly
        );

    if (locationId !== undefined) {

      params =
        params.set(
          'locationId',
          locationId
        );
    }

    return this.http.get<StayRoom[]>(
      this.roomApiUrl,
      {
        params
      }
    );
  }

  getRoomsWithCapacity(
    locationId: number
  ): Observable<StayRoom[]> {

    return this.getRooms(
      locationId,
      false
    ).pipe(
      switchMap(
        rooms => {

          if (rooms.length === 0) {
            return of([]);
          }

          const requests =
            rooms.map(
              room =>
                this.getRoomCapacity(
                  room.id!
                ).pipe(
                  map(
                    capacity => ({
                      ...room,
                      occupiedBeds:
                        capacity.occupiedBeds,
                      availableBeds:
                        capacity.availableBeds,
                      full:
                        capacity.full
                    })
                  )
                )
            );

          return forkJoin(
            requests
          );
        }
      )
    );
  }

  getRoomById(
    roomId: number
  ): Observable<StayRoom> {

    return this.http.get<StayRoom>(
      `${this.roomApiUrl}/${roomId}`
    );
  }

  createRoom(
    request: StayRoomRequest
  ): Observable<StayRoom> {

    return this.http.post<StayRoom>(
      this.roomApiUrl,
      request
    );
  }

  updateRoom(
    roomId: number,
    request: StayRoomRequest
  ): Observable<StayRoom> {

    return this.http.put<StayRoom>(
      `${this.roomApiUrl}/${roomId}`,
      request
    );
  }

  deleteRoom(
    roomId: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.roomApiUrl}/${roomId}`
    );
  }

  getRoomCapacity(
    roomId: number
  ): Observable<StayRoomCapacity> {

    return this.http.get<StayRoomCapacity>(
      `${this.allocationApiUrl}/rooms/${roomId}/capacity`
    );
  }
}
