import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StayManagement } from './stay-management';

describe('StayManagement', () => {
  let component: StayManagement;
  let fixture: ComponentFixture<StayManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StayManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(StayManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
