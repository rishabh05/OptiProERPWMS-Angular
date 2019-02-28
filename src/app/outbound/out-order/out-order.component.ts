import { Component, OnInit } from '@angular/core';
import { OutboundService } from 'src/app/services/outbound.service';
import { CommonConstants } from 'src/app/const/common-constants';
import { Router } from '@angular/router';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { OutboundData } from 'src/app/models/outbound/outbound-data';
import { CodeNode } from 'source-list-map';



@Component({
  selector: 'app-out-order',
  templateUrl: './out-order.component.html',
  styleUrls: ['./out-order.component.scss']
})
export class OutOrderComponent implements OnInit {
  private customerName: string = "";

  public serviceData: any;
  public lookupfor: any = 'out-order';
  public showLookup: boolean = false;
  public selectedCustomer: any;
  public outbound: OutboundData = new OutboundData();
  public orderNumber:string;
  constructor(private outboundservice: OutboundService, private router: Router, private commonservice: Commonservice, private toastr: ToastrService, private translate: TranslateService) { }


  ngOnInit() {
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    console.log("OutboundData:", outboundData);
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      this.selectedCustomer = this.outbound.CustomerData;
    }

  }

  public openOrderLookup() {
    if (this.selectedCustomer != null && this.selectedCustomer != undefined
      && this.selectedCustomer.CustomerCode != '' && this.selectedCustomer.CustomerCode != null) {

      this.outboundservice.getCustomerSOList(this.selectedCustomer.CustomerCode).subscribe(
        resp => {
          this.showLookup = true;
          this.serviceData = resp;
        },
        error => {
          this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        }
      );
    }
    else {
      this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
    }
  }

  getLookupValue(lookupValue: any) {
    console.log('SelectedOrder', lookupValue);
    this.outbound.OrderData = lookupValue;
    this.orderNumber=this.outbound.OrderData.DOCNUM;
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
  }


  public openOrderDetails(){
    
  }

}
