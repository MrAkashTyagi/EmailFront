import { TestBed } from '@angular/core/testing';

import { Familyservice } from './familyservice';

describe('Familyservice', () => {
  let service: Familyservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Familyservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
