import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeddingSettingsDialog } from './wedding-settings-dialog';

describe('WeddingSettingsDialog', () => {
  let component: WeddingSettingsDialog;
  let fixture: ComponentFixture<WeddingSettingsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeddingSettingsDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(WeddingSettingsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
