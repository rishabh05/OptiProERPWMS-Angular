import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryEnquiryComponent } from './inventory-enquiry.component';

describe('InventoryEnquiryComponent', () => {
  let component: InventoryEnquiryComponent;
  let fixture: ComponentFixture<InventoryEnquiryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryEnquiryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryEnquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
