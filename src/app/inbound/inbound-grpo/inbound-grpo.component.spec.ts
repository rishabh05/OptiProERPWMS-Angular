import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InboundGRPOComponent } from './inbound-grpo.component';

describe('InboundGRPOComponent', () => {
  let component: InboundGRPOComponent;
  let fixture: ComponentFixture<InboundGRPOComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundGRPOComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundGRPOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
