import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepalletizeComponent } from './depalletize.component';

describe('DepalletizeComponent', () => {
  let component: DepalletizeComponent;
  let fixture: ComponentFixture<DepalletizeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepalletizeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepalletizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
