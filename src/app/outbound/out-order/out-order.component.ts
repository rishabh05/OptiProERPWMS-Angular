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
      this.outboundservice.getSOItemList(tempOrderData.CARDCODE, tempOrderData.DOCNUM, whseId).subscribe(
        resp => {
          if (resp != null && resp != undefined)
            this.soItemsDetail = resp.RDR1;
            this.calculatePickQty();
          console.log("SOItem", this.soItemsDetail);
          localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));

          this.showSOIetDetail = true;
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
    //lsOutbound
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);

    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);

      // this.outbound.DeleiveryCollection = this.outbound.DeleiveryCollection.filter(t => t.Item.DOCNUM !== this.outbound.OrderData.DOCNUM);
      //this.outbound.DeleiveryCollection=this.outbound.DeleiveryCollection.
      let deleivery: any[] = this.outbound.TempMeterials;

      for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {
        const d = this.outbound.DeleiveryCollection[index];
        for (let j = 0; j < deleivery.length; j++) {
          const element = deleivery[j];
          if (d.Item.DOCENTRY == element.Item.DOCENTRY && d.Order.DOCNUM == element.Order.DOCNUM) {
            deleivery.slice(index, 1);
          }
        }
      }


      if (deleivery !== undefined && deleivery !== null && deleivery.length > 0) {
        deleivery.forEach(d => this.outbound.DeleiveryCollection.push(d));
      }


      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      this.openOutboundCustomer();
    }
  }

  public deleiver() { }


  calculatePickQty() {

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

