import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdItemIssueComponent } from './prod-item-issue.component';

describe('ProdItemIssueComponent', () => {
  let component: ProdItemIssueComponent;
  let fixture: ComponentFixture<ProdItemIssueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProdItemIssueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProdItemIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
