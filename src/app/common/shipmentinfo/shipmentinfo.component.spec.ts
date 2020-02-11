import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentinfoComponent } from './shipmentinfo.component';

describe('ShipmentinfoComponent', () => {
  let component: ShipmentinfoComponent;
  let fixture: ComponentFixture<ShipmentinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentinfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
