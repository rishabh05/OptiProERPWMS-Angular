import { Component, OnInit } from '@angular/core';
import { OutboundService } from 'src/app/services/outbound.service';
import { CommonConstants } from 'src/app/const/common-constants';
import { Router } from '@angular/router';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { OutboundData } from 'src/app/models/outbound/outbound-data';
import { RowClassArgs } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-out-order',
  templateUrl: './out-order.component.html',
  styleUrls: ['./out-order.component.scss']
})
export class OutOrderComponent implements OnInit {
  private customerName: string = "";
  public pageSize = 20;
  public serviceData: any;
  public lookupfor: any = 'out-order';
  public showLookup: boolean = false;
  public selectedCustomer: any;
  public outbound: OutboundData = new OutboundData();
  public orderNumber: string;
  public showSOIetDetail = false;
  public soItemsDetail: any = null;
  public viewLines: boolean;
  serialTrackedItems: any;
  batchTrackedItems: any;
  noneTrackedItems: any;
  showLookupLoader: boolean = false;
  constructor(private outboundservice: OutboundService, private router: Router, private commonservice: Commonservice, private toastr: ToastrService, private translate: TranslateService) { }


  ngOnInit() {
    // lsOutbound

    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);


    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      this.selectedCustomer = this.outbound.CustomerData;

      if (this.outbound.OrderData !== undefined && this.outbound.OrderData !== null && this.outbound.OrderData.DOCNUM !== undefined && this.outbound.OrderData.DOCNUM !== null) {
        this.orderNumber = this.outbound.OrderData.DOCNUM;
        this.openSOOrderList();
      }

      this.calculatePickQty();
    }

  }

  public openOrderLookup() {
    if (this.selectedCustomer != null && this.selectedCustomer != undefined
      && this.selectedCustomer.CustomerCode != '' && this.selectedCustomer.CustomerCode != null) {

      this.outboundservice.getCustomerSOList(this.selectedCustomer.CustomerCode).subscribe(
        resp => {
          if (resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            return;
          }
          
          this.serviceData = resp;
          this.showLookupLoader = false;
          this.showLookup=true;
        },
        error => {
          this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
          this.showLookupLoader = false;
          this.showLookup=false;
        }
      );
    }
    else {
      this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
      this.showLookupLoader = false;
      this.showLookup=false;
    }
  }

  getLookupValue(lookupValue: any) {

    this.outbound.OrderData = lookupValue;
    this.orderNumber = this.outbound.OrderData.DOCNUM;
    // lsOutbound
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
  }


  public openPOByUOM(selection: any) {
    let selectdeData = selection.selectedRows[0].dataItem;
    CommonConstants.OutboundData
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);

    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      this.outbound.SelectedItem = selectdeData;
      //lsOutbound
      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      this.router.navigateByUrl('home/outbound/outprodissue', { skipLocationChange: true });
    }

  }

  public openSOOrderList() {
    if (this.outbound.OrderData != null && this.outbound != undefined
      && this.outbound.OrderData != '' && this.outbound.OrderData != null) {

      let tempOrderData: any = this.outbound.OrderData;
      this.outbound.OrderData.DOCNUM = tempOrderData.DOCNUM = this.orderNumber;
      //lsOutbound
      let whseId = localStorage.getItem("whseId");
      this.showLookupLoader=true;
      this.outboundservice.getSOItemList(tempOrderData.CARDCODE, tempOrderData.DOCNUM, whseId).subscribe(
        resp => {
          if (resp != null && resp != undefined)
          if (resp.ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            return;
          }
            this.soItemsDetail = resp.RDR1;
            
            if(this.soItemsDetail.length===0){
              this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
              this.showLookupLoader=false;
            }
            this.calculatePickQty();
            

          localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));

          this.showSOIetDetail = true;
          this.showLookupLoader=false;
        },
        error => {
          this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
          this.showLookupLoader=false;
        }
      );
    }
    else {
      this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
      this.showLookupLoader=false;
    }
  }

  public rowCallback = (context: RowClassArgs) => {
    switch (context.dataItem.TRACKING) {
      case 'S':
        return { serial: true };
      case 'B':
        return { batch: true };
      case 'N':
        return { none: false };
      default:
        return {};
    }
  }

  public openOutboundCustomer() {
    this.router.navigateByUrl("home/outbound/outcustomer", { skipLocationChange: true })
  }

  public addToDeleiver() {
    this.showLookupLoader=true;
    //lsOutbound
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);

    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);

      let tempMeterialCollection: any[] = this.outbound.TempMeterials;

      for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {

        const d = this.outbound.DeleiveryCollection[index];

        for (let j = 0; j < tempMeterialCollection.length; j++) {

          const element = tempMeterialCollection[j];

          if (d.Item.DOCENTRY == element.Item.DOCENTRY && d.Order.DOCNUM == element.Order.DOCNUM) {

            tempMeterialCollection.slice(index, 1);
          }
        }
      }


      if (tempMeterialCollection !== undefined && tempMeterialCollection !== null && tempMeterialCollection.length > 0) {
        for (let index = 0; index < tempMeterialCollection.length; index++) {
          const tm = tempMeterialCollection[index];

          let hasitem=this.outbound.DeleiveryCollection.filter(d=>
             d.Item.DOCENTRY===tm.Item.DOCENTRY &&
             d.Item.TRACKING===tm.Item.TRACKING &&
             d.Order.DOCNUM===tm.Order.DOCNUM &&
             d.Meterial.LOTNO===tm.Meterial.LOTNO &&
             d.Meterial.BINNO===tm.Meterial.BINNO 
             );

             if(hasitem.length==0){
              this.outbound.DeleiveryCollection.push(tm)
             }
          
        }
      
      }


      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      this.openOutboundCustomer();
      this.showLookupLoader=false;
    }
  }

  public deleiver() { }


  public calculatePickQty() {

    if (this.soItemsDetail != undefined && this.soItemsDetail !== null) {

      for (let i = 0; i < this.soItemsDetail.length; i++) {
        const soelement = this.soItemsDetail[i];
        let totalPickQty: number = 0;

        if (this.outbound !== null && this.outbound != undefined && this.outbound.SelectedMeterials != null && this.outbound.SelectedMeterials != undefined && this.outbound.SelectedMeterials.length > 0) {

          for (let j = 0; j < this.outbound.TempMeterials.length; j++) {

            const element = this.outbound.TempMeterials[j];

            if (soelement.ITEMCODE === element.Item.ITEMCODE && this.outbound.OrderData.DOCNUM===element.Order.DOCNUM) {
              totalPickQty = totalPickQty + element.Meterial.MeterialPickQty;
            }
          }
        }

        // Total Qty of Item
        soelement.RPTQTY = totalPickQty;
        this.soItemsDetail[i] = soelement;

      }


    }


  }
}

