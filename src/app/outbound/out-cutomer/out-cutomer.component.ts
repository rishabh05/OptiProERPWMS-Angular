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


  constructor(private outboundservice: OutboundService, private router: Router, private commonservice: Commonservice, private toastr: ToastrService, private translate: TranslateService) { }

  ngOnInit() {
    this.customerName = '';

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

    this.outboundservice.getCustomerList().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          if (resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            return;
          }
          this.showLookup = true;
          this.serviceData = resp;
        }
        else {

          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        console.log("Error:", error);
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
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

  public prepareDeleiveryCollection() {
    let comDbId = localStorage.getItem('CompID');
    let token = localStorage.getItem('Token');
    let arrSOHEADER: SOHEADER[] = [];
    let arrSODETAIL: SODETAIL[] = [];
    let deliveryToken: DeliveryToken = new DeliveryToken();

    arrSOHEADER = this.prepareItemCollectionForHdr();
    arrSODETAIL = this.prepareDetailCollection();

    for (let index = 0; index < arrSOHEADER.length; index++) {
      const element = arrSOHEADER[index];

      let meterialList = this.outbound.TempMeterials.filter((t) => element.SONumber === t.Order.DOCNUM
        && element.Tracking === t.Item.TRACKING && element.DocNum === t.Item.DOCNUM);

      element.ShipQty = meterialList.map(i => i.Meterial.MeterialPickQty).reduce((sum, c) => sum + c);
      arrSOHEADER[index] = element;
    }
    console.log("dtl", arrSODETAIL)
    console.log("hdr", arrSOHEADER);

    if (arrSOHEADER.length > 0 && arrSODETAIL.length > 0) {

      deliveryToken.SOHEADER = arrSOHEADER;
      deliveryToken.SODETAIL = arrSODETAIL;
      deliveryToken.UDF = [];
    }

    this.outboundservice.addDeleivery(deliveryToken).subscribe(
      data => {
        if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
          this.toastr.success('', this.translate.instant("DeleiverySuccess"));
          this.clearOutbound();
        } else if (data[0].ErrorMsg == "7001") {
          this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
            this.translate.instant("CommonSessionExpireMsg"));
          return;
        }
        else {
          // alert(data[0].ErrorMsg);
          this.toastr.error('', data[0].ErrorMsg);
        }


      },
      error => {
        console.log(error);
      }

    )



  }
  clearOutbound() {
    localStorage.setItem(CommonConstants.OutboundData, null);
    this.orderCollection = [];
  }

  public prepareDetailCollection() {
    let arrSODETAIL: SODETAIL[] = [];

    let guid: string = localStorage.getItem('GUID');
    let uid: string = localStorage.getItem('UserId');

    for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {
      const d = this.outbound.DeleiveryCollection[index];
      if (arrSODETAIL.length > 0) {

        let data = arrSODETAIL.filter(
          (h: any) =>
            h.Bin === d.Meterial.BINNO &&
            h.LotNumber === d.Meterial.LOTNO
        )
        if (data.length > 0) {

          continue;
        }
      }
      let dtl: SODETAIL = new SODETAIL();

      dtl.Bin = d.Meterial.BINNO;
      dtl.GUID = guid;
      dtl.LotNumber = d.Meterial.LOTNO;
      dtl.LotQty = d.Meterial.TOTALQTY;
      dtl.SysSerial = d.Meterial.SYSNUMBER;
      dtl.UsernameForLic = uid;
      dtl.parentLine = d.Item.LINENUM;

      arrSODETAIL.push(dtl);
    }

    return arrSODETAIL;

  }

  public prepareItemCollectionForHdr() {

    let comDbId = localStorage.getItem('CompID');
    let token = localStorage.getItem('Token');

    let arrSOHEADER: SOHEADER[] = [];

    for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {


      let o = this.outbound.DeleiveryCollection[index];

      if (arrSOHEADER.length > 0) {

        let data = arrSOHEADER.filter(
          (h: any) =>
            h.DocNum === o.Item.DOCNUM &&
            h.Tracking === o.Item.TRACKING &&
            h.SONumber === o.Order.DOCNUM
        )
        if (data.length > 0) {

          //   data[0].ShipQty=data[0].ShipQty+ o.Meterial.MeterialPickQty;
          continue;
        }
      }

      let hdr: SOHEADER = new SOHEADER();

      hdr.CompanyDBId = comDbId;
      hdr.DiServerToken = token;
      hdr.DocNum = o.Order.DOCNUM;
      hdr.ItemCode = o.Item.ITEMCODE;
      hdr.Line = o.Item.LINENUM;
      hdr.LineNo = hdr.Line;
      hdr.OpenQty = o.Item.OPENQTY;
      hdr.SONumber = hdr.DocNum;
      //Need to be check
      hdr.ShipQty = 0;

      hdr.Tracking = o.Item.TRACKING;
      hdr.UOM = -1;// o.Item.UOM;
      hdr.WhsCode = o.Item.WHSCODE;

      arrSOHEADER.push(hdr);
    }

    return arrSOHEADER;
  }

}

