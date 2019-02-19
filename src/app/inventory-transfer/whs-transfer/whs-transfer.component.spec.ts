import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhsTransferComponent } from './whs-transfer.component';

describe('WhsTransferComponent', () => {
  let component: WhsTransferComponent;
  let fixture: ComponentFixture<WhsTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhsTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhsTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
