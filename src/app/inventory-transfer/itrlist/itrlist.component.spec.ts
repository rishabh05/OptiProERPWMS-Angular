import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ITRLIstComponent } from './itrlist.component';

describe('ITRLIstComponent', () => {
  let component: ITRLIstComponent;
  let fixture: ComponentFixture<ITRLIstComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ITRLIstComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ITRLIstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
