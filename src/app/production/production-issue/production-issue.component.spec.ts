import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionIssueComponent } from './production-issue.component';

describe('ProductionIssueComponent', () => {
  let component: ProductionIssueComponent;
  let fixture: ComponentFixture<ProductionIssueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductionIssueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductionIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
