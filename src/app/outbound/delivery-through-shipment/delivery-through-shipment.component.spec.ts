import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryThroughShipmentComponent } from './delivery-through-shipment.component';

describe('DeliveryThroughShipmentComponent', () => {
  let component: DeliveryThroughShipmentComponent;
  let fixture: ComponentFixture<DeliveryThroughShipmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryThroughShipmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryThroughShipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
