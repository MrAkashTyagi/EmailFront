import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillPreviewDialog } from './bill-preview-dialog';

describe('BillPreviewDialog', () => {
  let component: BillPreviewDialog;
  let fixture: ComponentFixture<BillPreviewDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillPreviewDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(BillPreviewDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
