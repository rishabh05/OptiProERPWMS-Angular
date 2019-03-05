import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inbound-details',
  templateUrl: './inbound-details.component.html',
  styleUrls: ['./inbound-details.component.scss']
})
export class InboundDetailsComponent implements OnInit {
  public viewLines :boolean;
  constructor() { }

  ngOnInit() {
  }

}
