import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-production-receipt-master',
  templateUrl: './production-receipt-master.component.html',
  styleUrls: ['./production-receipt-master.component.scss']
})
export class ProductionReceiptMasterComponent implements OnInit {
  prodReceiptComponent: any =  1;
  constructor() { }

  ngOnInit() {
  }

}
