import { TestBed } from '@angular/core/testing';

import { WeddingTaskService } from './wedding-task-service';

describe('WeddingTask', () => {
  let service: WeddingTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeddingTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
