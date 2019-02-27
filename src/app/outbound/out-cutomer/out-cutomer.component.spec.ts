import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutCutomerComponent } from './out-cutomer.component';

describe('OutCutomerComponent', () => {
  let component: OutCutomerComponent;
  let fixture: ComponentFixture<OutCutomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutCutomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutCutomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
