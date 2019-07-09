import { Component, OnInit } from '@angular/core';
import { OutboundService } from 'src/app/services/outbound.service';
import { CommonConstants } from 'src/app/const/common-constants';
import { Router } from '@angular/router';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { OutboundData } from 'src/app/models/outbound/outbound-data';
import { RowClassArgs } from '@progress/kendo-angular-grid';
import { SODETAIL, SOHEADER, DeliveryToken } from 'src/app/models/outbound/out-del-req';

@Component({
  selector: 'app-out-order',
  templateUrl: './out-order.component.html',
  styleUrls: ['./out-order.component.scss']
})
export class OutOrderComponent implements OnInit {
  dialogMsg: string = "Which order you want to deliver?"
  yesButtonText: string = "All";
  noButtonText: string = "Current";
  private customerName: string = "";
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
  showConfirmDialog: boolean;
  showDeleiveryAndAdd: boolean;


  public pagable: boolean = false;
  public pageSize:number = Commonservice.pageSize;
  constructor(private outboundservice: OutboundService, private router: Router, private commonservice: Commonservice, private toastr: ToastrService, private translate: TranslateService) { }


  ngOnInit() {
    // lsOutbound

    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);

    console.log("Order:data",outboundData);
    if (outboundData!=null  && outboundData!=undefined && outboundData!='' && outboundData!='null') {
      this.outbound = JSON.parse(outboundData);
      this.selectedCustomer = this.outbound.CustomerData;

      if (this.outbound.OrderData !== undefined && this.outbound.OrderData !== null && this.outbound.OrderData.DOCNUM !== undefined && this.outbound.OrderData.DOCNUM !== null) {
        this.orderNumber = this.outbound.OrderData.DOCNUM;
        this.openSOOrderList();
        this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();
      }

      this.calculatePickQty();
    }

  }

  showAddToMeterialAndDelevery() {
    let dBit: boolean = false;

    if (this.outbound && this.outbound.TempMeterials) {
      let data = this.outbound.TempMeterials.filter(tm => tm.Order.DOCNUM === this.orderNumber);
      dBit = data.length > 0
    }
    else {
      dBit = false;
    }
    return dBit;
  }


  onOrderNoBlur() {
    if (this.orderNumber)
      this.openSOOrderList(this.orderNumber);
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
          if(this.serviceData.length > 0){
            this.showLookup = true;
          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        },
        error => {
          this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
          this.showLookupLoader = false;
          this.showLookup = false;
        }
      );
    }
    else {
      this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
      this.showLookupLoader = false;
      this.showLookup = false;
    }
  }


  getLookupValue(lookupValue: any) {

    this.outbound.OrderData = lookupValue;
    this.orderNumber = this.outbound.OrderData.DOCNUM;
    // lsOutbound
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
    this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();
  }

  public openPOByUOM(selection: any) {
    let selectdeData = selection.selectedRows[0].dataItem;
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);

    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      this.outbound.SelectedItem = selectdeData;
      //lsOutbound
      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      this.router.navigateByUrl('home/outbound/outprodissue', { skipLocationChange: true });
    }

  }
  
  public openSOOrderList(orderNumber: any = null) {

    if (!this.orderNumber) {
      this.toastr.error('', this.translate.instant("OValidation"));
      return;
    }
   if ((this.outbound.OrderData && this.outbound.OrderData != '' && this.outbound.OrderData != null) || orderNumber) {
      let tempOrderData: any = this.outbound.OrderData;
      if (orderNumber) {
        //         CARDCODE: "SP Contact"
        // CARDNAME: "Test SP"
        // CUSTREFNO: ""
        // DOCDUEDATE: "04/24/2019"
        // DOCNUM: 203
        // SHIPPINGTYPE: ""
        // SHIPTOCODE: ""
        tempOrderData = {
          CARDCODE: this.outbound.CustomerData.CustomerCode,
          CARDNAME: this.outbound.CustomerData.customerName,
          CUSTREFNO: "",
          DOCDUEDATE: "04/24/2019",
          DOCNUM: orderNumber.toString(),
          SHIPPINGTYPE: "",
          SHIPTOCODE: ""
        };
        //this.outbound.OrderData = tempOrderData;
      }
      else {
        this.outbound.OrderData.DOCNUM = tempOrderData.DOCNUM = this.orderNumber;
      }
      this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();

      //lsOutbound
      let whseId = localStorage.getItem("whseId");
      this.showLookup = false;
      this.showLookupLoader = true;
      this.outboundservice.getSOItemList(tempOrderData.CARDCODE, tempOrderData.DOCNUM, whseId).subscribe(
        resp => {
          if (resp != null && resp != undefined)
            if (resp.ErrorMsg == "7001") {
              this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
              this.showLookupLoader=false;
              return;
            }

          // When order num from text box.
          this.outbound.OrderData = tempOrderData;
          this.soItemsDetail = resp.RDR1;
          if(this.soItemsDetail.length>this.pageSize){
            this.pagable = true;
          }
          this.showLookupLoader=false;
          if (this.soItemsDetail.length === 0) {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
            this.showLookupLoader = false;
          }
          this.calculatePickQty();


          localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
 
          this.showSOIetDetail = true;
          this.showLookupLoader = false;
        },
        error => {
          this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
          this.showLookupLoader = false;
        }
      );
    }
    else {
      this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
      this.showLookupLoader = false;
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

  public addToDeleiver(goToCustomer: boolean = true) {
    this.showLookupLoader = true;
    //lsOutbound
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);

    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);

      this.prepareDeleiveryTempCollection();


      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      if (goToCustomer == true)
        this.openOutboundCustomer();

      this.showLookupLoader = false;
    }
  }

  prepareDeleiveryTempCollection() {
    if (this.outbound) {
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


      if (tempMeterialCollection !== undefined &&
        tempMeterialCollection !== null && tempMeterialCollection.length > 0) {
        for (let index = 0; index < tempMeterialCollection.length; index++) {
          const tm = tempMeterialCollection[index];

          let hasitem = this.outbound.DeleiveryCollection.filter(d =>
            d.Item.DOCENTRY === tm.Item.DOCENTRY &&
            d.Item.TRACKING === tm.Item.TRACKING &&
            d.Order.DOCNUM === tm.Order.DOCNUM &&
            d.Meterial.LOTNO === tm.Meterial.LOTNO &&
            d.Meterial.BINNO === tm.Meterial.BINNO
          );

          if (hasitem.length == 0) {
            this.outbound.DeleiveryCollection.push(tm)
          }

        }

      }
    }
  }

  public deleiver(orderId: any = null) {
    //this.showLookupLoader = true;
    this.addToDeleiver(false);
    this.prepareDeleiveryCollectionAndDeliver(orderId);
    //this.showLookupLoader = false;
  }


  public calculatePickQty() {

    if (this.soItemsDetail) {

      for (let i = 0; i < this.soItemsDetail.length; i++) {
        const soelement = this.soItemsDetail[i];
        let totalPickQty: number = 0;

        if (this.outbound  && this.outbound.TempMeterials && this.outbound.TempMeterials.length > 0) {

          for (let j = 0; j < this.outbound.TempMeterials.length; j++) {

            const element = this.outbound.TempMeterials[j];
            console.log("My Element",element);
            if (soelement.ROWNUM=== element.Item.ROWNUM && soelement.ITEMCODE === element.Item.ITEMCODE && this.outbound.OrderData.DOCNUM === element.Order.DOCNUM) {
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



  prepareDeleiveryCollectionAndDeliver(orderId: any) {

    if (this.outbound != null && this.outbound != undefined
      && this.outbound.DeleiveryCollection != null && this.outbound.DeleiveryCollection != undefined
      && this.outbound.DeleiveryCollection.length > 0
    ) {

      if (orderId !== undefined && orderId !== null) {
        this.outbound.DeleiveryCollection = this.outbound.DeleiveryCollection.filter(d => d.Order.DOCNUM === orderId);
      }
      
      let arrSOHEADER: SOHEADER[] = [];
      let arrSODETAIL: SODETAIL[] = [];
      let deliveryToken: DeliveryToken = new DeliveryToken();

      // Hdr
      let comDbId = localStorage.getItem('CompID');
      let token = localStorage.getItem('Token');
      let guid: string = localStorage.getItem('GUID');
      let uid: string = localStorage.getItem('UserId');
      let hdrLine: number = 0;
      let limit = -1;
      let hdrLineVal = 0;

      this.showLookupLoader = true;
      // Loop through delivery collection 
      for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {

        // // break when item processed.
        // if (limit >= this.outbound.DeleiveryCollection.length) {
        //   break;
        // }

        //get first item from collection        
        const element = this.outbound.DeleiveryCollection[index];


        // let coll=Get all Item for Item.Lineno===i
        let lineDeleiveryCollection = this.outbound.DeleiveryCollection.filter(d =>
          //d.Item.LINENUM === element.Item.LINENUM
          element.Order.DOCNUM === d.Order.DOCNUM &&
          element.Item.DOCENTRY === d.Item.DOCENTRY &&
          element.Item.TRACKING === d.Item.TRACKING
        );

        // Process Order Item and Tracking collection
        for (let hIdx = 0; hIdx < lineDeleiveryCollection.length; hIdx++) {
          const o = lineDeleiveryCollection[hIdx];
          
       // check hdr exists
          let existHdr = false;
          for (let index = 0; index < arrSOHEADER.length; index++) {
            const h = arrSOHEADER[index];
            if (h.SONumber === o.Order.DOCNUM
              && h.ItemCode === o.Item.ITEMCODE
              && h.Tracking === o.Item.TRACKING) {
              existHdr = true;
              break;
            }
          }

          if (existHdr == false) {
            // Add Header here and then add 
            hdrLineVal = hdrLineVal + 1;



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
            hdr.SONumber = o.Item.DOCENTRY;
            hdr.CompanyDBId = comDbId;
            hdr.LineNo = o.Item.LINENUM;
            //hdr.tShipQty = lineDeleiveryCollection.map(i => i.Meterial.MeterialPickQty).reduce((sum, c) => sum + c);
            //hdr.ShipQty = 
            //let metQty = 
            let metQty = lineDeleiveryCollection.map(i => i.Meterial.MeterialPickQty).reduce((sum, c) => sum + c);
            hdr.ShipQty = metQty.toString();
            // hdr.ShipQty = hdr.ShipQty.toString();
            hdr.DocNum = o.Order.DOCNUM;
            hdr.OpenQty = o.Item.OPENQTY;
            hdr.WhsCode = o.Item.WHSCODE;
            hdr.Tracking = o.Item.TRACKING;
            hdr.ItemCode = o.Item.ITEMCODE;
            hdr.UOM = -1;
            hdr.UOMName = o.Item.UOM;

            hdr.Line = hdrLineVal;


            arrSOHEADER.push(hdr);
          }

          // check weather item existe or not 
          let hasDetail = false;
          for (let index = 0; index < arrSODETAIL.length; index++) {
            const element = arrSODETAIL[index];
            if (element.LotNumber === o.Meterial.LOTNO && element.Bin === o.Meterial.BINNO && element.parentLine===hdrLineVal) {
              hasDetail = true;
              break;
            }
          }


          if (hasDetail == false) { 
            // Add Detail here 
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
            dtl.parentLine = hdrLineVal;
            dtl.GUID = guid;
            dtl.UsernameForLic = uid;

            arrSODETAIL.push(dtl);


          }

          limit = limit + lineDeleiveryCollection.length;


        }
      }

      console.log("Dtl", arrSODETAIL);
      console.log("hdr", arrSOHEADER);

      // this.manageLineNo(arrSOHEADER, arrSODETAIL);
      // arrSOHEADER=await this.manageShipQty(arrSOHEADER);


      if (arrSOHEADER.length > 0 && arrSODETAIL.length > 0) {

        deliveryToken.SOHEADER = arrSOHEADER;
        deliveryToken.SODETAIL = arrSODETAIL;
        deliveryToken.UDF = [];
      }

      
      this.outboundservice.addDeleivery(deliveryToken).subscribe(
        data => {
          if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
            this.showLookupLoader = false;
            this.toastr.success('', this.translate.instant("DeleiverySuccess") + " : " + data[0].SuccessNo);
            this.clearOutbound();
          } else if (data[0].ErrorMsg == "7001") {
            this.showLookupLoader = false;
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));

            return;
          }
          else {
            this.showLookupLoader = false;
            this.toastr.error('', data[0].ErrorMsg);
          }


        },
        error => {
          this.showLookupLoader = false;
          console.log(
            error);
        }

      );



      console.log("shdr", arrSOHEADER);


    }


  }

  clearOutbound() {    
    localStorage.setItem(CommonConstants.OutboundData, null);
    this.router.navigateByUrl("home/outbound/outcustomer", { skipLocationChange: true })
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

  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;

    // Yes
    if ($event.Status === 'yes') {
      this.deleiver();
    }
    // No
    else if ($event.Status === 'no') {

      this.deleiver(this.outbound.OrderData.DOCNUM);
    }
    // Cross
    else {

    }
  }

  deliveryConfirmation() {
    this.showConfirmDialog = true;
  }
}

