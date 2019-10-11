import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PalTransferComponent } from './pal-transfer.component';

describe('PalTransferComponent', () => {
  let component: PalTransferComponent;
  let fixture: ComponentFixture<PalTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PalTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PalTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
