import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitTransferComponent } from './split-transfer.component';

describe('SplitTransferComponent', () => {
  let component: SplitTransferComponent;
  let fixture: ComponentFixture<SplitTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
