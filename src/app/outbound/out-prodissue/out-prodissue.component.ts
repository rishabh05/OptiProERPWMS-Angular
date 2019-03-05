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
  public selectedItems: any;
  public pickQty: number;
  public uomList: any=[];

  constructor(private ourboundService: OutboundService) { }

  ngOnInit() {
    let outboundData = localStorage.getItem(CommonConstants.OutboundData);

    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      this.selected = this.outbound.SelectedItem;
      this.selectedItems = [this.selected];
    }

    this.ourboundService.getUOMList(this.selected.ITEMCODE).subscribe(
      data => {
      console.log("UOM",data);
        this.uomList=data;
      }
    )
  }



  valueChange(e: any) {

  }

  public openAvaliableMeterials() {
    let itemCode = this.selected.ITEMCODE;
    let docEntry = this.selected.DOCENTRY;
    this.ourboundService.getAvaliableMeterial(itemCode, docEntry).subscribe(
      (resp: any) => {

        this.lookupData = resp;
        this.showLookup = true;
      }
    )
  }


  getLookupValue(lookupValue: any) {
    console.log(lookupValue);
    // this.outbound.OrderData = lookupValue;
    // this.orderNumber = this.outbound.OrderData.DOCNUM;
    // localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
  }

}

