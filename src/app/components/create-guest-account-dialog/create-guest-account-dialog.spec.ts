import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGuestAccountDialog } from './create-guest-account-dialog';

describe('CreateGuestAccountDialog', () => {
  let component: CreateGuestAccountDialog;
  let fixture: ComponentFixture<CreateGuestAccountDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateGuestAccountDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGuestAccountDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
