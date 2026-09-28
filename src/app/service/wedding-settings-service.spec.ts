import { TestBed } from '@angular/core/testing';

import { WeddingSettingsService } from './wedding-settings-service';

describe('WeddingSettingsService', () => {
  let service: WeddingSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeddingSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
