import { Component, OnInit } from '@angular/core';
import { OutboundService } from 'src/app/services/outbound.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { Router } from '@angular/router';
import { OutboundData, CurrentOutBoundData } from 'src/app/models/outbound/outbound-data';
import { CommonConstants } from 'src/app/const/common-constants';
import { SOHEADER, SODETAIL } from 'src/app/models/outbound/out-del-req';

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

      if (this.outbound!=undefined && this.outbound!=null && this.outbound 
        && this.outbound.CustomerData !== undefined && this.outbound.CustomerData !== null) {
        this.customerCode = this.outbound.CustomerData.CustomerCode;
        this.customerName = this.outbound.CustomerData.CustomerName;
      }

      if (this.outbound.DeleiveryCollection !== undefined && this.outbound.DeleiveryCollection !== null && this.outbound.DeleiveryCollection.length > 0) {

        this.orderCollection = this.getUniqueValuesByProperty(this.outbound.DeleiveryCollection);        
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

    
    arrSOHEADER=this.prepareItemCollectionFor();
    arrSODETAIL = this.prepareDetailCollection();

    arrSODETAIL.forEach(element => {

    });
  }

  public prepareDetailCollection() {
    let arrSODETAIL: SODETAIL[] = [];

    let guid: string = localStorage.getItem('GUID');
    let uid: string = localStorage.getItem('UserId');

    this.outbound.DeleiveryCollection.forEach(
      (d => {

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
      )
    );
    return arrSODETAIL;

  }

  public prepareItemCollectionFor() {

    let comDbId = localStorage.getItem('CompID');
    let token = localStorage.getItem('Token');

    let arrSOHEADER: SOHEADER[] = [];

    for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {
      let o = this.outbound.DeleiveryCollection[index];


      let hdr: SOHEADER = new SOHEADER();

      hdr.CompanyDBId = comDbId;
      hdr.DiServerToken = token;
      hdr.DocNum = o.DOCNUM;
      hdr.ItemCode = o.ITEMCODE;
      hdr.Line = o.LINENUM;
      hdr.LineNo = o.LINENUM;
      hdr.OpenQty = o.OPENQTY;
      hdr.SONumber = o.DOCNUM;
      //Need to be check
      hdr.ShipQty = 0;

      hdr.Tracking = o.TRACKING;
      hdr.UOM = o.UOM;
      hdr.WhsCode = o.WHSCODE;

      arrSOHEADER.push(hdr);
    }

    return arrSOHEADER;
  }

}

