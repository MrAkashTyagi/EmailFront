import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseBillsDialog } from './expense-bills-dialog';

describe('ExpenseBillsDialog', () => {
  let component: ExpenseBillsDialog;
  let fixture: ComponentFixture<ExpenseBillsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseBillsDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseBillsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
