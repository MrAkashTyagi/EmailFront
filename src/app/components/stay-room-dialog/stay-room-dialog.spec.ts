import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StayRoomDialog } from './stay-room-dialog';

describe('StayRoomDialog', () => {
  let component: StayRoomDialog;
  let fixture: ComponentFixture<StayRoomDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StayRoomDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(StayRoomDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
