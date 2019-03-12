import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InboundMasterComponent } from './inbound-master.component';

describe('InboundMasterComponent', () => {
  let component: InboundMasterComponent;
  let fixture: ComponentFixture<InboundMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
