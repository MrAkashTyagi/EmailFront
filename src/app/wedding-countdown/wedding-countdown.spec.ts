import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeddingCountdown } from './wedding-countdown';

describe('WeddingCountdown', () => {
  let component: WeddingCountdown;
  let fixture: ComponentFixture<WeddingCountdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeddingCountdown],
    }).compileComponents();

    fixture = TestBed.createComponent(WeddingCountdown);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
