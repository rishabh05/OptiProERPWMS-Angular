import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-production-issue',
  templateUrl: './production-issue.component.html',
  styleUrls: ['./production-issue.component.scss']
})
export class ProductionIssueComponent implements OnInit {

  constructor( private router: Router) { }

  ngOnInit() {
  }
  onCancelClick() {
    this.router.navigate(['home/dashboard']);
  }
}
