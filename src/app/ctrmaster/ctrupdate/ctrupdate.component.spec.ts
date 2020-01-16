import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CTRUpdateComponent } from './ctrupdate.component';

describe('CTRUpdateComponent', () => {
  let component: CTRUpdateComponent;
  let fixture: ComponentFixture<CTRUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CTRUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CTRUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
