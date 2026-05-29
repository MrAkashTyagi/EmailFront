import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGuest } from './add-guest';

describe('AddGuest', () => {
  let component: AddGuest;
  let fixture: ComponentFixture<AddGuest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGuest],
    }).compileComponents();

    fixture = TestBed.createComponent(AddGuest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
