import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShpLoadingComponent } from './shp-loading.component';

describe('ShpLoadingComponent', () => {
  let component: ShpLoadingComponent;
  let fixture: ComponentFixture<ShpLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShpLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShpLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
