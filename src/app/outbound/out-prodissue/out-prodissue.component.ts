import { Component, OnInit } from '@angular/core';
import { CommonConstants } from 'src/app/const/common-constants';
import { HttpClient } from '@angular/common/http';
import { OutboundService } from 'src/app/services/outbound.service';
import { OutboundData } from 'src/app/models/outbound/outbound-data';

@Component({
  selector: 'app-out-prodissue',
  templateUrl: './out-prodissue.component.html',
  styleUrls: ['./out-prodissue.component.scss']
})
export class OutProdissueComponent implements OnInit {
  public outbound: OutboundData;
  public selected: any = null;
  public lookupData: any;
  public lookupFor: any = 'out-items';
  public showLookup: boolean = false;
  constructor(private ourboundService: OutboundService) { }

  ngOnInit() {
    let outboundData = localStorage.getItem(CommonConstants.OutboundData);
    debugger;
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      this.selected = this.outbound.SelectedItem;
    }
  }

  public listItems: Array<{ text: string, value: number }> = [
    { text: "Small", value: 1 },
    { text: "Medium", value: 2 },
    { text: "Large", value: 3 }
  ];


  public openAvaliableMeterials() {
    let itemCode = this.selected.ITEMCODE;
    let docEntry = this.selected.DOCENTRY;
    this.ourboundService.getAvaliableMeterial(itemCode, docEntry).subscribe(
      (resp: any) => {
        console.log("AvaliableItem", resp);
        this.lookupData=resp;
        this.showLookup=true;
      }
    )
  }

  
  getLookupValue(lookupValue: any) {    
    // this.outbound.OrderData = lookupValue;
    // this.orderNumber = this.outbound.OrderData.DOCNUM;
    // localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
  }

}

