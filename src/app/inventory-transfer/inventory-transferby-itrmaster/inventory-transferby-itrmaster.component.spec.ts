import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryTransferbyITRMasterComponent } from './inventory-transferby-itrmaster.component';

describe('InventoryTransferbyITRMasterComponent', () => {
  let component: InventoryTransferbyITRMasterComponent;
  let fixture: ComponentFixture<InventoryTransferbyITRMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryTransferbyITRMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryTransferbyITRMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
