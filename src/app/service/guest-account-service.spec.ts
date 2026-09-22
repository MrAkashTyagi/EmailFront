import { TestBed } from '@angular/core/testing';

import { GuestAccountService } from './guest-account-service';

describe('GuestAccountService', () => {
  let service: GuestAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuestAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
