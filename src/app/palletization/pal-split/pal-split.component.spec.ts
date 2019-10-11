import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PalSplitComponent } from './pal-split.component';

describe('PalSplitComponent', () => {
  let component: PalSplitComponent;
  let fixture: ComponentFixture<PalSplitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PalSplitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PalSplitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
