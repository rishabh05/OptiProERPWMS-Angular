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
  public uomList: any = [];

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

  onCustomerCodeBlur() {


    this.outboundservice.getCustomer(this.customerCode).subscribe(
      resp => {
        if (resp.length == 0) {
          this.customerCode = null
          this.customerName = ''
        }
        else {
          let outbound: OutboundData = new OutboundData();
          this.customerCode = resp[0].CUSTCODE;
          this.customerName = resp[0].CUSTNAME;

          outbound.CustomerData = { CustomerCode: this.customerCode, CustomerName: this.customerName };
          // lsOutbound
          localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
          CurrentOutBoundData.CustomerData = outbound.CustomerData;
        }
      }
    );
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
    this.outbound=outbound;
    
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
          if(this.serviceData.length > 0){
            this.showLookup = true;
          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        }
        else {

          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          this.showLookupLoader = false;
          this.showLookup = false;
        }
      },
      error => {
        console.log("Error:", error);
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        this.showLookupLoader = false;
        this.showLookup = false;
      },
      () => {
        this.showLookupLoader = false;

      }
    )
  }

  public openCustSO(clearOrder:boolean=false) {
   
    // Clear otred data
    if(this.outbound)
    this.outbound.OrderData=null;
    if(clearOrder==true)
    localStorage.setItem(CommonConstants.OutboundData,JSON.stringify( this.outbound));
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


      //let tempDeleiveryCollection: any[] = this.outbound.DeleiveryCollection;
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
      // Loop through delivery collection 
      for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {

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
            hdr.SONumber = o.Order.DOCNUM;
            hdr.CompanyDBId = comDbId;
            hdr.LineNo = o.Item.LINENUM;           
            let metQty = lineDeleiveryCollection.map(i => i.Meterial.MeterialPickQty).reduce((sum, c) => sum + c);
            hdr.ShipQty = metQty.toString();            
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
            if (element.LotNumber === o.Meterial.LOTNO && element.Bin === o.Meterial.BINNO && element.parentLine === hdrLineVal) {
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
     
      if (arrSOHEADER.length > 0 && arrSODETAIL.length > 0) {

        deliveryToken.SOHEADER = arrSOHEADER;
        deliveryToken.SODETAIL = arrSODETAIL;
        deliveryToken.UDF = [];
      }

      this.showLookupLoader = true;
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
    }
  }

  async manageShipQty(arrSOHEADER: SOHEADER[]): Promise<SOHEADER[]> {
    let tarrSOHEADER: SOHEADER[] = [];

    for (let idx = 0; idx < arrSOHEADER.length; idx++) {
      const o = arrSOHEADER[idx];

      // Get UOM and value
      this.outboundservice.getUOMList(o.ItemCode).subscribe(
        async (data) => {
          this.uomList = data;
          let selectedUOM = this.uomList.filter(u => u.UomName == o.UOMName);
          selectedUOM = selectedUOM[0];

          o.UOM = selectedUOM.UomCode;
          o.ShipQty = (parseFloat(o.tShipQty) * parseFloat(selectedUOM.AltQty)).toString();
          await tarrSOHEADER.push(o);
        }

      );
    }
    return tarrSOHEADER;
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
    localStorage.setItem(CommonConstants.OutboundData,JSON.stringify(this.outbound));
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


