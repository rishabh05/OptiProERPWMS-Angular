import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ctrmain',
  templateUrl: './ctrmain.component.html',
  styleUrls: ['./ctrmain.component.scss']
})
export class CTRMainComponent implements OnInit {

  ctrComponent: Number;
  constructor() { }

  ngOnInit() {
    this.ctrComponent = 1;
  }

}
