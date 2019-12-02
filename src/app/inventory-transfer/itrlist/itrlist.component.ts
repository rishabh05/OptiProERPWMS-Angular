import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-itrlist',
  templateUrl: './itrlist.component.html',
  styleUrls: ['./itrlist.component.scss']
})
export class ITRLIstComponent implements OnInit {

  fromwhere: any = "itr";
  constructor() { }

  ngOnInit() {
  }

  backFromOutOrderScreen(event){

  }
}
