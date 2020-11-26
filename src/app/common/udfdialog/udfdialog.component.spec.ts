import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UDFdialogComponent } from './udfdialog.component';

describe('UDFdialogComponent', () => {
  let component: UDFdialogComponent;
  let fixture: ComponentFixture<UDFdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UDFdialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UDFdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
