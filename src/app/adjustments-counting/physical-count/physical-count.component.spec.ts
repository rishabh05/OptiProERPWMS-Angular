import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicalCountComponent } from './physical-count.component';

describe('PhysicalCountComponent', () => {
  let component: PhysicalCountComponent;
  let fixture: ComponentFixture<PhysicalCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhysicalCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhysicalCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
