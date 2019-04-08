import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComonConfirmDialogComponent } from './comon-confirm-dialog.component';

describe('ComonConfirmDialogComponent', () => {
  let component: ComonConfirmDialogComponent;
  let fixture: ComponentFixture<ComonConfirmDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComonConfirmDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComonConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
