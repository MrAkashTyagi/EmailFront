import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StayAllocationDialog } from './stay-allocation-dialog';

describe('StayAllocationDialog', () => {
  let component: StayAllocationDialog;
  let fixture: ComponentFixture<StayAllocationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StayAllocationDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(StayAllocationDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
