import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bin-transfer',
  templateUrl: './bin-transfer.component.html',
  styleUrls: ['./bin-transfer.component.scss']
})
export class BinTransferComponent implements OnInit {

  constructor() { }
  showLookupLoader: boolean;
  ngOnInit() {
  }

  OnItemLookupClick(){
    this.showLookupLoader = true;
  }
}
