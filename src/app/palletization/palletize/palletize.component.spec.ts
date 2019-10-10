import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PalletizeComponent } from './palletize.component';

describe('PalletizeComponent', () => {
  let component: PalletizeComponent;
  let fixture: ComponentFixture<PalletizeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PalletizeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PalletizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
