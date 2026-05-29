import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFamily } from './add-family';

describe('AddFamily', () => {
  let component: AddFamily;
  let fixture: ComponentFixture<AddFamily>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFamily],
    }).compileComponents();

    fixture = TestBed.createComponent(AddFamily);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
