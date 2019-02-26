import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutboundDetailsComponent } from './outbound-details.component';

describe('OutboundDetailsComponent', () => {
  let component: OutboundDetailsComponent;
  let fixture: ComponentFixture<OutboundDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
