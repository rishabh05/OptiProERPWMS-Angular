import { Component, OnInit } from '@angular/core';
import { OutboundData } from 'src/app/models/outbound/outbound-data';
import { CommonConstants } from 'src/app/const/common-constants';

@Component({
  selector: 'app-itrlist',
  templateUrl: './itrlist.component.html',
  styleUrls: ['./itrlist.component.scss']
})
export class ITRLIstComponent implements OnInit {

  fromwhere: any = "itr";
  constructor() { }

  ngOnInit() {
    localStorage.setItem("ComingFrom","itr");
     let outbound: OutboundData = new OutboundData();
      outbound.ITRToBinNo = { ToBin: "" };
      var customerCode = "";
      var customerName = "";
      outbound.CustomerData = { CustomerCode:customerCode, CustomerName: customerName, TrackingId:"",CustRefNo:"" };
      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
  }

  backFromOutOrderScreen(event){

  }
}
