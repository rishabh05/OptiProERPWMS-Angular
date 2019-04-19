import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-physical-count',
  templateUrl: './physical-count.component.html',
  styleUrls: ['./physical-count.component.scss']
})
export class PhysicalCountComponent implements OnInit {

  constructor( private router: Router) { }

  ngOnInit() {
  }
  onCancelClick() {
    this.router.navigate(['home/dashboard']);
  }
}
