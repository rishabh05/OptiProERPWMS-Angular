import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-production-issue',
  templateUrl: './production-issue.component.html',
  styleUrls: ['./production-issue.component.scss']
})
export class ProductionIssueComponent implements OnInit {
  public prodissueComponent = 1;
  constructor() { }

  ngOnInit() {
  }
}
