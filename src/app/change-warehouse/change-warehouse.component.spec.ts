import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeWarehouseComponent } from './change-warehouse.component';

describe('ChangeWarehouseComponent', () => {
  let component: ChangeWarehouseComponent;
  let fixture: ComponentFixture<ChangeWarehouseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeWarehouseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
