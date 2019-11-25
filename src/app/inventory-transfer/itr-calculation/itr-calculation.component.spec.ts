import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ITRCalculationComponent } from './itr-calculation.component';

describe('ITRCalculationComponent', () => {
  let component: ITRCalculationComponent;
  let fixture: ComponentFixture<ITRCalculationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ITRCalculationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ITRCalculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
