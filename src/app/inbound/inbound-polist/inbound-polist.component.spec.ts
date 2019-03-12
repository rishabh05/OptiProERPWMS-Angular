import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InboundPolistComponent } from './inbound-polist.component';

describe('InboundPolistComponent', () => {
  let component: InboundPolistComponent;
  let fixture: ComponentFixture<InboundPolistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundPolistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundPolistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
