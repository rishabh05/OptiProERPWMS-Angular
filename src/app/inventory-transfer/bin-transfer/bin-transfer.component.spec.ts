import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BinTransferComponent } from './bin-transfer.component';

describe('BinTransferComponent', () => {
  let component: BinTransferComponent;
  let fixture: ComponentFixture<BinTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BinTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BinTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
