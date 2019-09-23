import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionReceiptMasterComponent } from './production-receipt-master.component';

describe('ProductionReceiptMasterComponent', () => {
  let component: ProductionReceiptMasterComponent;
  let fixture: ComponentFixture<ProductionReceiptMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductionReceiptMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductionReceiptMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
