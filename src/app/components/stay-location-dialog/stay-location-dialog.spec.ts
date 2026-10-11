import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StayLocationDialog } from './stay-location-dialog';

describe('StayLocationDialog', () => {
  let component: StayLocationDialog;
  let fixture: ComponentFixture<StayLocationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StayLocationDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(StayLocationDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
