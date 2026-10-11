import { TestBed } from '@angular/core/testing';

import { StayRoomService } from './stay-room-service';

describe('StayRoomService', () => {
  let service: StayRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StayRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
