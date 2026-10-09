import { TestBed } from '@angular/core/testing';

import { WeddingContactService } from './wedding-contact-service';

describe('WeddingContact', () => {
  let service: WeddingContactService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeddingContactService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
