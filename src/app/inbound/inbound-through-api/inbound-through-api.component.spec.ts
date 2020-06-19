import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InboundThroughAPIComponent } from './inbound-through-api.component';

describe('InboundThroughAPIComponent', () => {
  let component: InboundThroughAPIComponent;
  let fixture: ComponentFixture<InboundThroughAPIComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundThroughAPIComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundThroughAPIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
