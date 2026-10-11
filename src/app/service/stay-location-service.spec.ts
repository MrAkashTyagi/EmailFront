import { TestBed } from '@angular/core/testing';

import { StayLocationService } from './stay-location-service';

describe('StayLocationService', () => {
  let service: StayLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StayLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
