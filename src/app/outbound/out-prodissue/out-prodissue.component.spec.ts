import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutProdissueComponent } from './out-prodissue.component';

describe('OutProdissueComponent', () => {
  let component: OutProdissueComponent;
  let fixture: ComponentFixture<OutProdissueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutProdissueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutProdissueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
