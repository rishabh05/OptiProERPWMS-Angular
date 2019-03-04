import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BinLabelComponent } from './bin-label.component';

describe('BinLabelComponent', () => {
  let component: BinLabelComponent;
  let fixture: ComponentFixture<BinLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BinLabelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BinLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
