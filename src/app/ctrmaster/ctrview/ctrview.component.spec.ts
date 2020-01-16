import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CTRViewComponent } from './ctrview.component';

describe('CTRViewComponent', () => {
  let component: CTRViewComponent;
  let fixture: ComponentFixture<CTRViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CTRViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CTRViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
