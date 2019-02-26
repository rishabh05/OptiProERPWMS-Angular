import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InboundDetailsComponent } from './inbound-details.component';

describe('InboundDetailsComponent', () => {
  let component: InboundDetailsComponent;
  let fixture: ComponentFixture<InboundDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
