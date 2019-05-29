import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdOrderlistComponent } from './prod-orderlist.component';

describe('ProdOrderlistComponent', () => {
  let component: ProdOrderlistComponent;
  let fixture: ComponentFixture<ProdOrderlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProdOrderlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProdOrderlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
