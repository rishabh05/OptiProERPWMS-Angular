import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionReceiptComponent } from './production-receipt.component';

describe('ProductionReceiptComponent', () => {
  let component: ProductionReceiptComponent;
  let fixture: ComponentFixture<ProductionReceiptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductionReceiptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductionReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
