import { Component, OnInit } from '@angular/core';
import { OutboundService } from 'src/app/services/outbound.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { Router } from '@angular/router';
import { OutboundData, CurrentOutBoundData } from 'src/app/models/outbound/outbound-data';
import { CommonConstants } from 'src/app/const/common-constants';
import { SOHEADER, SODETAIL, DeliveryToken } from 'src/app/models/outbound/out-del-req';



@Component({
  selector: 'app-out-cutomer',
  templateUrl: './out-cutomer.component.html',
  styleUrls: ['./out-cutomer.component.scss']
})
export class OutCutomerComponent implements OnInit {

  dialogMsg: string = "Do you want to delete?"
  yesButtonText: string = "Yes";
  noButtonText: string = "No";
  public serviceData: any;
  public lookupfor: any = 'out-customer';
  public showLookup: boolean = false;
  public selectedCustomerElement: any;
  public customerName: string = '';
  public customerCode: string = '';
  public viewLines: boolean;
  public outbound: OutboundData;
  public orderCollection: any[];
  public unqueOrders: any[];
  showConfirmDialog: boolean;
  rowindexForDelete: any;
  delIdx: any;
  delGrd: any;
  showLookupLoader: boolean = false;

  constructor(private outboundservice: OutboundService, private router: Router, private commonservice: Commonservice, private toastr: ToastrService, private translate: TranslateService) { }

  ngOnInit() {
    this.customerName = '';
    this.customerCode = '';
    this.showLookup = false;
    // lsOutbound
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);

    if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
      this.outbound = JSON.parse(outboundData);
      if (this.outbound != undefined && this.outbound != null) {
        if (this.outbound
          && this.outbound.CustomerData !== undefined && this.outbound.CustomerData !== null) {
          this.customerCode = this.outbound.CustomerData.CustomerCode;
          this.customerName = this.outbound.CustomerData.CustomerName;
        }

        if (this.outbound.DeleiveryCollection !== undefined && this.outbound.DeleiveryCollection !== null && this.outbound.DeleiveryCollection.length > 0) {

          this.orderCollection = this.getUniqueValuesByProperty(this.outbound.DeleiveryCollection);
        }
      }

    }
  }

  getUniqueValuesByProperty(data: any[]): any[] {
    let items: any[] = [];

    for (let index = 0; index < data.length; index++) {
      const element = data[index];

      if (items.length > 0) {
        let sameItem = items.filter(i => element.Item.DOCNUM === i.DOCNUM);

        if (sameItem.length <= 0) {
          items.push(element.Item);
        }
      }
      else {
        items.push(element.Item);
      }
    }
    return items;
  }

  getUniqueValuesByProperty1(data: any[]): any[] {

    let items: any[] = [];

    for (let index = 0; index < data.length; index++) {
      const element = data[index];

      if (items.length > 0) {
        let sameItem = items.filter(i => element.Item.DOCNUM === i.DOCNUM
          && element.Item.Tracking === i.Tracking);

        if (sameItem.length <= 0) {
          items.push(element.Item);
        }
      }
      else {
        items.push(element.Item);
      }
    }
    return items;
  }

  getLookupValue(lookupValue: any) {
    this.selectedCustomerElement = lookupValue;
    let outbound: OutboundData = new OutboundData();
    this.customerCode = this.selectedCustomerElement[0];
    this.customerName = this.selectedCustomerElement[1];

    outbound.CustomerData = { CustomerCode: this.customerCode, CustomerName: this.customerName };
    // lsOutbound
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
    CurrentOutBoundData.CustomerData = outbound.CustomerData;
  }

  public openCustomerLookup() {
    this.showLookupLoader = true;
    this.outboundservice.getCustomerList().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          if (resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            return;
          }

          //this.showLookup = true;
          this.serviceData = resp;
          this.showLookupLoader = false;
          this.showLookup=true;
        }
        else {

          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          this.showLookupLoader = false;
          this.showLookup=false;
        }
      },
      error => {
        console.log("Error:", error);
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        this.showLookupLoader = false;
        this.showLookup=false;
      },
      ()=> {
        this.showLookupLoader = false;
     
      }
    )
  }

  public openCustSO() {
    this.router.navigateByUrl('home/outbound/outorder', { skipLocationChange: true });
  }

  public cancel() {
    // lsOutbound   
    localStorage.setItem(CommonConstants.OutboundData, null)
    CurrentOutBoundData.CustomerData = null;
    this.router.navigateByUrl('home/dashboard');
  }

  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;

    // Yes
    if ($event.Status === 'yes') {
      this.removeOrderMain(this.delIdx, this.delGrd);
    }
    // No
    else if ($event.Status === 'no') {

    }
    // Cross
    else {

    }
  }

  clearOutbound() {
    localStorage.setItem(CommonConstants.OutboundData, null);
    this.orderCollection = [];
    this.customerName = '';
    this.customerCode = '';
    this.showLookup = false;
  }



  prepareDeleiveryCollection() {

    if (this.outbound != null && this.outbound != undefined
      && this.outbound.DeleiveryCollection != null && this.outbound.DeleiveryCollection != undefined
      && this.outbound.DeleiveryCollection.length > 0
    ) {

      let arrSOHEADER: SOHEADER[] = [];
      let arrSODETAIL: SODETAIL[] = [];
      let deliveryToken: DeliveryToken = new DeliveryToken();

      // Hdr
      let comDbId = localStorage.getItem('CompID');
      let token = localStorage.getItem('Token');
      let guid: string = localStorage.getItem('GUID');
      let uid: string = localStorage.getItem('UserId');

      let limit = 0;
      // Loop through delivery collection 
      for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {
        const element = this.outbound.DeleiveryCollection[index];

        // let coll=Get all Item for Item.Lineno===i
        let lineDeleiveryCollection = this.outbound.DeleiveryCollection.filter(d => d.Item.LINENUM === element.Item.LINENUM);

        limit = limit + lineDeleiveryCollection.length;


        for (let j = 0; j < lineDeleiveryCollection.length; j++) {

          const o = lineDeleiveryCollection[j];

          let hasItem = arrSOHEADER.filter(list => list.LineNo === o.Item.LINENUM);

          if (hasItem.length == 0) {
            // add header
            let hdr: SOHEADER = new SOHEADER();

            // "DiServerToken":"66F7E7A4-D2AE-4E37-91E8-8BE390F2D32F",
            // "SONumber":165,
            // "CompanyDBId":"BUILD128SRC12X",
            // "LineNo":0,
            // "ShipQty":"2",
            // "DocNum":165,
            // "OpenQty":" 12.000",
            // "WhsCode":"01",
            // "Tracking":"S",
            // "ItemCode":"Serial",
            // "UOM":-1,
            // "Line":0
            hdr.DiServerToken = token;
            hdr.SONumber = o.Order.DOCNUM;
            hdr.CompanyDBId = comDbId;
            hdr.Line = o.Item.LINENUM;
            hdr.ShipQty = lineDeleiveryCollection.map(i => i.Meterial.MeterialPickQty).reduce((sum, c) => sum + c);
            hdr.ShipQty = hdr.ShipQty.toString();
            hdr.DocNum = o.Order.DOCNUM;
            hdr.OpenQty = o.Item.OPENQTY;
            hdr.WhsCode = o.Item.WHSCODE;
            hdr.Tracking = o.Item.TRACKING;
            hdr.ItemCode = o.Item.ITEMCODE;
            hdr.UOM = -1;// o.Item.UOM;
            hdr.LineNo = hdr.Line;

            arrSOHEADER.push(hdr);
          }

          let hasDtl = arrSODETAIL.filter(dtl => dtl.Bin === o.Meterial.BINNO && o.LotNumber === o.Meterial.LOTNO);
          if (hasDtl.length == 0) {
            //  
            let dtl: SODETAIL = new SODETAIL();

            // "Bin":"01-SYSTEM-BIN-LOCATION",
            // "LotNumber":"08JANS000011",
            // "LotQty":"1",
            // "SysSerial":231,
            // "parentLine":0,
            // "GUID":"6d92d887-23bb-4390-85df-75e4caa7e328",
            // "UsernameForLic":"Rishabh"

            dtl.Bin = o.Meterial.BINNO;
            dtl.LotNumber = o.Meterial.LOTNO;
            dtl.LotQty = o.Meterial.MeterialPickQty;
            dtl.SysSerial = o.Meterial.SYSNUMBER;
            dtl.parentLine = index;
            dtl.GUID = guid;
            dtl.UsernameForLic = uid;

            arrSODETAIL.push(dtl);
          }
        }


        // get sum of all coll and loop 

      }
      console.log("Dtl", arrSODETAIL);
      console.log("hdr", arrSOHEADER);
      this.manageLineNo(arrSOHEADER, arrSODETAIL);

      if (arrSOHEADER.length > 0 && arrSODETAIL.length > 0) {

        deliveryToken.SOHEADER = arrSOHEADER;
        deliveryToken.SODETAIL = arrSODETAIL;
        deliveryToken.UDF = [];
      }

      this.outboundservice.addDeleivery(deliveryToken).subscribe(
        data => {
          if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
            this.toastr.success('', this.translate.instant("DeleiverySuccess") + " : " + data[0].SuccessNo);
            this.clearOutbound();
          } else if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          else {
            this.toastr.error('', data[0].ErrorMsg);
          }


        },
        error => {
          console.log(error);
        }

      )
    }

  }

  manageLineNo(hdrList: SOHEADER[], dtlList: SODETAIL[]) {
    let tmpHdr: SOHEADER[] = [];
    let tmpDtlList: SODETAIL[] = [];
    // Hdr
    for (let index = 0; index < hdrList.length; index++) {

      let hdr = hdrList[index];

      let lineDetailList = dtlList.filter(d => d.parentLine === hdr.LineNo);

      // Detail
      for (let j = 0; j < lineDetailList.length; j++) {
        let linedtl = lineDetailList[j];
        linedtl.parentLine = index;
        tmpDtlList.push(linedtl);
      }

      hdr.Line = index;
      tmpHdr.push(hdr);

    }
  }


  removeOrder(idx: any, grd: any) {
    this.delGrd = grd;
    this.delIdx = idx;

    this.showConfirmDialog = true;
  }

  removeOrderMain(idx: any, grd: any) {
    this.filterData(idx);
    this.orderCollection.splice(idx, 1);
    grd.data = this.orderCollection;
  }

  filterData(idx: any) {
    let order = this.orderCollection[idx];
    this.outbound.DeleiveryCollection = this.outbound.DeleiveryCollection.filter(d => d.Order.DOCNUM !== order.DOCNUM);
    this.outbound.TempMeterials = this.outbound.TempMeterials.filter(d => d.Order.DOCNUM !== order.DOCNUM);
  }

  openOrderScreen(selection: any) {
    let selectedIinquiry = selection.selectedRows[0].dataItem;
    let orderList = this.outbound.DeleiveryCollection.filter(d => d.Order.DOCNUM === selectedIinquiry.DOCNUM);
    if (orderList.length > 0) {
      this.outbound.OrderData = orderList[0].Order;
      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      this.openCustSO();
    }
  }

}


