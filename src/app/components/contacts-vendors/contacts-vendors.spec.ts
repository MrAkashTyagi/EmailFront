import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsVendors } from './contacts-vendors';

describe('ContactsVendors', () => {
  let component: ContactsVendors;
  let fixture: ComponentFixture<ContactsVendors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsVendors],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactsVendors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
