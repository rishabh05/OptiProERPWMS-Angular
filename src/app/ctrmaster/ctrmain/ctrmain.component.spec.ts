import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CTRMainComponent } from './ctrmain.component';

describe('CTRMainComponent', () => {
  let component: CTRMainComponent;
  let fixture: ComponentFixture<CTRMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CTRMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CTRMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
