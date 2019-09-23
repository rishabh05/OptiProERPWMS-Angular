import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionReceiptItemsListComponent } from './production-receipt-items-list.component';

describe('ProductionReceiptItemsListComponent', () => {
  let component: ProductionReceiptItemsListComponent;
  let fixture: ComponentFixture<ProductionReceiptItemsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductionReceiptItemsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductionReceiptItemsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
