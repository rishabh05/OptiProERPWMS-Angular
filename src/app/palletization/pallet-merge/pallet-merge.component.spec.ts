import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PalletMergeComponent } from './pallet-merge.component';

describe('PalletMergeComponent', () => {
  let component: PalletMergeComponent;
  let fixture: ComponentFixture<PalletMergeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PalletMergeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PalletMergeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
