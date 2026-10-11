import { TestBed } from '@angular/core/testing';

import { StayAllocationService } from './stay-allocation-service';

describe('StayAllocationService', () => {
  let service: StayAllocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StayAllocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
