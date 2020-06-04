import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPackingInputDialogComponent } from './new-packing-input-dialog.component';

describe('NewPackingInputDialogComponent', () => {
  let component: NewPackingInputDialogComponent;
  let fixture: ComponentFixture<NewPackingInputDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewPackingInputDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPackingInputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
