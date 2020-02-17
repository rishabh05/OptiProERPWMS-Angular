import { Component, OnInit, ViewChild } from '@angular/core';
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
  public lookupfor: any = '';
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
  pagable: boolean = false;
  pageSize: number = 10;
  public trackingId: any = "";
  public CustRefNo: any = "";
  public shipmentId: any = "";
  public deliveryOptionType: any = '1';
  @ViewChild('scanSO') scanSO;
  @ViewChild('scanShipmentId') scanShipmentId;
  @ViewChild('scanCustomerCode') scanCustomerCode;
  @ViewChild('scanTracking') scanTracking;

  showShipmentInfo: boolean = false;
  constructor(private outboundservice: OutboundService, private router: Router, private commonservice: Commonservice, private toastr: ToastrService, private translate: TranslateService) { }

  ngOnInit() {
    this.customerName = '';
    this.customerCode = '';
    this.showLookup = false;

    let option = localStorage.getItem("deliveryOptionType");
    this.deliveryOptionType = option;
    if(this.deliveryOptionType == '1'){
      this.setOutboundPageInfo()
      // set page ui for outbound.
    }else if(this.deliveryOptionType =='2'){
      // set page ui for shipment.
      this.setShipmentPageInfo();
    }
    // lsOutbound
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
      this.outbound = JSON.parse(outboundData);
      if (this.outbound != undefined && this.outbound != null) {
        if (this.outbound
          && this.outbound.CustomerData !== undefined && this.outbound.CustomerData !== null) {
          this.customerCode = this.outbound.CustomerData.CustomerCode;
          this.customerName = this.outbound.CustomerData.CustomerName;
          this.CustRefNo = this.outbound.CustomerData.CustRefNo;
          this.trackingId = this.outbound.CustomerData.TrackingId;
          this.shipmentId = this.outbound.CustomerData.ShipmentId;
        }
        if (this.outbound.DeleiveryCollection !== undefined && this.outbound.DeleiveryCollection !== null && this.outbound.DeleiveryCollection.length > 0) {
          this.orderCollection = this.getUniqueValuesByProperty(this.outbound.DeleiveryCollection);
          if (this.orderCollection.length > this.pageSize) {
            this.pagable = true;
          }
        }
      }
    }
  }

  public setShipmentPageInfo(){

  }
  public setOutboundPageInfo(){

  }

  /**
   * This method creates delivery collection
   * Data from temp stored data in case of Shipment.
   * @param outbound 
   */
  prepareDeleiveryCollectionFromTempCollection(outbound: OutboundData) {
    if (outbound) {
      let tempMeterialCollection: any[] = outbound.TempMeterials;
      //check if the item is already present in delivery collection then remove from temp collection.
      for (let index = 0; index < outbound.DeleiveryCollection.length; index++) {
        const d = outbound.DeleiveryCollection[index];
        for (let j = 0; j < tempMeterialCollection.length; j++) {
          const element = tempMeterialCollection[j];
          if (d.Item.DOCENTRY == element.Item.DOCENTRY && d.Order.DOCNUM == element.Order.DOCNUM) {
            tempMeterialCollection.slice(index, 1);
          }
        }
      }
      //check that temp collection item if not present in deliver then push to delivery collection.
      if (tempMeterialCollection !== undefined &&
        tempMeterialCollection !== null && tempMeterialCollection.length > 0) {
        for (let index = 0; index < tempMeterialCollection.length; index++) {
          const tm = tempMeterialCollection[index];
          let hasitem = outbound.DeleiveryCollection.filter(d =>
            d.Item.DOCENTRY === tm.Item.DOCENTRY &&
            d.Item.TRACKING === tm.Item.TRACKING &&
            d.Order.DOCNUM === tm.Order.DOCNUM &&
            d.Meterial.LOTNO === tm.Meterial.LOTNO &&
            d.Meterial.BINNO === tm.Meterial.BINNO
          );
          if (hasitem.length == 0) {
            outbound.DeleiveryCollection.push(tm)
          }
        }
      }
    }
    // after we create delivery collection clear temp collection.
    outbound.TempMeterials = [];
  }

  ngAfterViewInit(): void {
    this.scanCustomerCode.nativeElement.focus()
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
    if (this.customerCode == undefined || this.customerCode == null || this.customerCode == '') {
      return
    }
    if (this.orderCollection != undefined && this.orderCollection != null &&
      this.orderCollection.length > 0) {
      return;
    }
 

    this.outboundservice.getCustomer(this.customerCode).subscribe(
      resp => {
        if (resp.length == 0) {
          this.customerCode = null
          this.customerName = ''
          this.orderNumber = "";
          this.scanCustomerCode.nativeElement.focus()
        }
        else {
          if (this.customerCode != resp[0].CUSTCODE) {
            this.orderNumber = "";
          }
          let outbound: OutboundData = new OutboundData();
          this.customerCode = resp[0].CUSTCODE;
          this.customerName = resp[0].CUSTNAME;
          outbound.CustomerData = {
            CustomerCode: this.customerCode, CustomerName: this.customerName, TrackingId: this.trackingId,
            CustRefNo: this.CustRefNo, ShipmentId:''
          };

          // lsOutbound
          localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
          CurrentOutBoundData.CustomerData = outbound.CustomerData;
          this.outbound = outbound;
        }
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  getLookupValue(lookupValue: any) {

    if (lookupValue != null && lookupValue == "close") {
      //nothing to do
      return;
    }
    else {

      if (this.lookupfor == "out-order") {
        this.selectedCustomerElement = lookupValue;
        let outbound: OutboundData = new OutboundData();
        this.orderNumber = this.selectedCustomerElement[0];
        this.customerCode = this.selectedCustomerElement[2];
        this.customerName = this.selectedCustomerElement[1];
        // old code =======================
        // outbound.CustomerData = { CustomerCode: this.customerCode, CustomerName: this.customerName, TrackingId:this.trackingId,
        //  CustRefNo:this.CustRefNo};
        // CurrentOutBoundData.CustomerData = outbound.CustomerData;
        // this.outbound = outbound;
        // outbound.OrderData = { CustomerCode: this.customerCode, CustomerName: this.customerName };
        // outbound.OrderData.DOCNUM = this.orderNumber;
        // localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
        // old code =======================


        //===================================
        let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
        if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
          this.outbound = JSON.parse(outboundData);
          if (this.outbound != undefined && this.outbound != null && this.outbound.OrderData != null
            && this.outbound.OrderData != undefined && this.outbound.CustomerData !== undefined &&
            this.outbound.CustomerData !== null) {
            // console.log("outbound","Outbound not null if...")
            this.outbound.OrderData = { CustomerCode: this.customerCode, CustomerName: this.customerName };
            this.outbound.OrderData.DOCNUM = this.orderNumber;
            localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
          } else {
            //console.log("outbound","Outbound ka else...")
            //if order is not present first time case.
            let outbound: OutboundData = new OutboundData();
            outbound.CustomerData = { CustomerCode: this.customerCode, CustomerName: this.customerName,ShipmentId:'' };
            outbound.OrderData = { CustomerCode: this.customerCode, CustomerName: this.customerName };
            outbound.OrderData.DOCNUM = this.orderNumber;
            localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
          }
        } else {
          // if first time.
          let outbound: OutboundData = new OutboundData();
          outbound.CustomerData = { CustomerCode: this.customerCode, CustomerName: this.customerName,ShipmentId:'' };
          outbound.OrderData = { CustomerCode: this.customerCode, CustomerName: this.customerName };
          outbound.OrderData.DOCNUM = this.orderNumber;
          localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
          //console.log("outbound","OutboundData null case....")
        }
        //===================================

        this.scanTracking.nativeElement.focus()

      } else if (this.lookupfor == "ShipmentList") {
        this.shipmentId = lookupValue[0];
        this.getShipmentDetail();
      } else {
        this.selectedCustomerElement = lookupValue;
        if (this.customerCode != this.selectedCustomerElement[0]) {
          this.orderNumber = "";
        }
        let outbound: OutboundData = new OutboundData();
        this.customerCode = this.selectedCustomerElement[0];
        this.customerName = this.selectedCustomerElement[1];

        //outbound.CustomerData = { CustomerCode: this.customerCode, CustomerName: this.customerName };
        outbound.CustomerData = {
          CustomerCode: this.customerCode, CustomerName: this.customerName,
          TrackingId: this.trackingId, CustRefNo: this.CustRefNo,ShipmentId:''
        };
        // lsOutbound
        localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
        CurrentOutBoundData.CustomerData = outbound.CustomerData;
        this.outbound = outbound;
        this.scanSO.nativeElement.focus()
      }
    }
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
          if (this.serviceData.length > 0) {
            this.lookupfor = 'out-customer';
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
        //this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        }
        this.showLookupLoader = false;
        this.showLookup = false;
      },
      () => {
        this.showLookupLoader = false;

      }
    )
  }

  /**
   * Open delivery detail screens after click on add to delivery item list.
   * @param $event 
   */
  openSelectedDeleveryItem($event) {
    //console.log("selected delivery item");
    localStorage.setItem("selectedSOAfterAddToDelivery", $event.selectedRows[0].dataItem.DOCNUM);
    this.prepareTempCollectionForSelectedDelivery($event.selectedRows[0].dataItem.DOCNUM, $event.selectedRows[0].dataItem.DOCENTRY)

  }

  public openCustSO(clearOrder: boolean = false) {

    // Clear otred data
    // if (this.outbound)
    //   this.outbound.OrderData = null;
    if (this.orderNumber != null) {
      localStorage.setItem("IsSOAvailable", "True");
    }
    localStorage.setItem("selectedSOAfterAddToDelivery",null);
    if (clearOrder == true) {
      let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
      if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
        this.outbound = JSON.parse(outboundData);
        if (this.outbound != undefined && this.outbound != null) {
          localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
        }
      }
    }

    // It means user click on next button check if the customer code issue occure due to focus issue.
    // then it will check customer ref no. ones more then try to get it ones more if available
    // temporary fix to avoid that blur issue.
    if (clearOrder == true) {
      let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
      if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
        var outboundRecord = JSON.parse(outboundData);
        if (outboundRecord != null && outboundRecord != undefined && outboundRecord != "" &&
          outboundRecord.CustomerData != null && outboundRecord.CustomerData != undefined && outboundRecord.CustomerData != "") {
          if (outboundRecord.CustomerData.CustRefNo == null || outboundRecord.CustomerData.CustRefNo == undefined || outboundRecord.CustomerData.CustRefNo == "") {
            this.customerRefNoBlur();
          }
        }
      }
    }
    this.router.navigateByUrl('home/outbound/outorder', { skipLocationChange: true });
  }


  customerRefNoBlur() {
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
      this.outbound = JSON.parse(outboundData);
      if (this.outbound != undefined && this.outbound != null && this.outbound
        && this.outbound.CustomerData !== undefined && this.outbound.CustomerData !== null) {
        var customerCode = this.outbound.CustomerData.CustomerCode;
        var customerName = this.outbound.CustomerData.CustomerName;
        var CustRefNo = this.CustRefNo;
        var trackingId = this.outbound.CustomerData.TrackingId;
        this.outbound.CustomerData = {
          CustomerCode: customerCode, CustomerName: customerName,
          TrackingId: trackingId, CustRefNo: CustRefNo, ShipmentId:this.shipmentId
        };
        localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      }
    }

  }
  trackingIdBlur() {
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
      this.outbound = JSON.parse(outboundData);
      if (this.outbound != undefined && this.outbound != null && this.outbound
        && this.outbound.CustomerData !== undefined && this.outbound.CustomerData !== null) {
        var customerCode = this.outbound.CustomerData.CustomerCode;
        var customerName = this.outbound.CustomerData.CustomerName;
        var CustRefNo = this.outbound.CustomerData.CustRefNo;
        var trackingId = this.trackingId;
        this.outbound.CustomerData = {
          CustomerCode: customerCode, CustomerName: customerName,
          TrackingId: trackingId, CustRefNo: CustRefNo, ShipmentId:this.shipmentId
        };
        localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      }
    }

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
    this.shipmentId = '';
  }



  prepareDeleiveryCollection() {
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
      this.outbound = JSON.parse(outboundData);
    }
    if (this.outbound != null && this.outbound != undefined
      && this.outbound.DeleiveryCollection != null && this.outbound.DeleiveryCollection != undefined
      && this.outbound.DeleiveryCollection.length > 0 ) 
      {
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
      let headerLineArray: any = [];
      // Loop through delivery collection
      for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {
        //get first item from collection
        const element = this.outbound.DeleiveryCollection[index];
        // let coll=Get all Item for Item.Lineno===i
        let lineDeleiveryCollection = this.outbound.DeleiveryCollection.filter(d =>
          element.Order.DOCNUM === d.Order.DOCNUM &&
          element.Item.DOCENTRY === d.Item.DOCENTRY &&
          element.Item.TRACKING === d.Item.TRACKING &&
          d.Item.LINENUM === element.Item.LINENUM
        );
        //=========filter  collection docnum, docentry, tracking, linenum wise.
        //=============== Adding header and Detail Objects logic==================
        for (let hIdx = 0; hIdx < lineDeleiveryCollection.length; hIdx++) {
          const o = lineDeleiveryCollection[hIdx];
          // check hdr exists
          let existHdr = false;
          for (let index = 0; index < arrSOHEADER.length; index++) {
            const h = arrSOHEADER[index];
            if (h.SONumber.toString() === "" + o.Order.DOCNUM
              && h.ItemCode === o.Item.ITEMCODE
              && h.Tracking === o.Item.TRACKING) {
              existHdr = true;
              break;
            }
          }
          if (existHdr == false) { // Add Header here if not added.
            hdrLineVal = hdrLineVal + 1; // add line for header.
            headerLineArray.push(hdrLineVal);
            let hdr: SOHEADER = new SOHEADER();
            hdr.DiServerToken = token;
            hdr.SONumber = o.Item.DOCNUM;
            hdr.DOCENTRY = o.Item.DOCENTRY;
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
            hdr.Line = hdrLineVal; //0
            if (this.outbound.CustomerData.CustRefNo != null && this.outbound.CustomerData.CustRefNo != undefined) {
              hdr.NumAtCard = this.outbound.CustomerData.CustRefNo;
            } else {
              hdr.NumAtCard = "";
            }
            if (this.outbound.CustomerData.TrackingId != null && this.outbound.CustomerData.TrackingId != undefined) {
              hdr.TrackingNumber = this.outbound.CustomerData.TrackingId;
            } else {
              hdr.TrackingNumber = "";
            }
            arrSOHEADER.push(hdr);
          }
          //================logic to add delivery line.
          var parentLineNum = hdrLineVal;
          let hasDetail = false;
          both:
          for (let index = 0; index < arrSODETAIL.length; index++) {
            const e1 = arrSODETAIL[index];
            if (o.Item.TRACKING == "S") {
              if (e1.LotNumber === o.Meterial.LOTNO && e1.Bin === o.Meterial.BINNO) {
                hasDetail = true; //need to show error
              }
            } else {
              for (let idx = 0; idx < arrSOHEADER.length; idx++) {
                const headerElement = arrSOHEADER[idx]
                if (headerElement.LineNo === o.Item.LINENUM && headerElement.DOCENTRY === o.Item.DOCENTRY) {
                 
                 for(let innerIdx = 0; innerIdx<arrSODETAIL.length; innerIdx++){
                  if (arrSODETAIL[innerIdx].LotNumber === o.Meterial.LOTNO && headerElement.LineNo === o.Item.LINENUM && 
                    headerElement.DOCENTRY === o.Item.DOCENTRY && arrSODETAIL[innerIdx].DOCENTRY === o.Item.DOCENTRY){
                    // it means already taken.
                    hasDetail = true;
                    break both;
                  }
                 }
                  parentLineNum = headerElement.Line; 
                  break both;
                }
              }
            }
          }
          if (hasDetail == false) {
            // Add Detail here
            let dtl: SODETAIL = new SODETAIL();
            dtl.Bin = o.Meterial.BINNO;
            dtl.LotNumber = o.Meterial.LOTNO;
            dtl.LotQty = o.Meterial.MeterialPickQty;
            dtl.SysSerial = o.Meterial.SYSNUMBER;
            dtl.parentLine = parentLineNum;
            dtl.GUID = guid;
            dtl.UsernameForLic = uid;
            dtl.DOCENTRY = o.Item.DOCENTRY
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
            this.trackingId = "";
            this.CustRefNo = "";
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
          if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
            this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
          }
          else {
            this.toastr.error('', error);
            this.showLookupLoader = false;
          }
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
    if (this.orderCollection.length > this.pageSize) {
      this.pagable = true;
    }
  }


  filterData(idx: any) {
    let order = this.orderCollection[idx];
    this.outbound.DeleiveryCollection = this.outbound.DeleiveryCollection.filter(d => d.Order.DOCNUM !== order.DOCNUM);
    this.outbound.TempMeterials = this.outbound.TempMeterials.filter(d => d.Order.DOCNUM !== order.DOCNUM);
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
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

  //--------------------add So field--

  public orderNumber: string;
  public soItemsDetail: any = null;
  public showSOIetDetail = false;
  public selectedCustomer: any;

  public onOrderNoBlur() {
    this.showLookup = false;
    if (this.orderNumber == "" || this.orderNumber == undefined) {
      return;
    }
    let whseId = localStorage.getItem("whseId");
    this.showLookupLoader = true;
    this.outboundservice.GetCustomerDetailFromSO("", this.orderNumber, whseId).subscribe(
      resp => {
        this.showLookupLoader = false;
        if (resp != null && resp != undefined && resp.length > 0) {
          if (resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            this.showLookupLoader = false;
            return;
          }

          this.customerCode = resp[0].CARDCODE
          this.customerName = resp[0].CARDNAME

          // let outbound: OutboundData = new OutboundData();
          // outbound.CustomerData = { CustomerCode: this.customerCode, CustomerName: this.customerName };
          // outbound.OrderData = { CustomerCode: this.customerCode, CustomerName: this.customerName };
          // outbound.OrderData.DOCNUM = this.orderNumber;
          // localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));

          //===================================
          let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
          if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
            this.outbound = JSON.parse(outboundData);
            if (this.outbound != undefined && this.outbound != null && this.outbound.OrderData != null
              && this.outbound.OrderData != undefined && this.outbound.CustomerData !== undefined &&
              this.outbound.CustomerData !== null) {
              //console.log("outbound","Outbound not null if...")
              this.outbound.OrderData = { CustomerCode: this.customerCode, CustomerName: this.customerName };
              this.outbound.OrderData.DOCNUM = this.orderNumber;
              localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
            } else {
              //console.log("outbound","Outbound ka else...")
              //if order is not present first time case.
              let outbound: OutboundData = new OutboundData();
              outbound.CustomerData = { CustomerCode: this.customerCode, CustomerName: this.customerName, ShipmentId:this.shipmentId };
              outbound.OrderData = { CustomerCode: this.customerCode, CustomerName: this.customerName };
              outbound.OrderData.DOCNUM = this.orderNumber;
              localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
            }
          } else {
            // if first time.
            let outbound: OutboundData = new OutboundData();
            outbound.CustomerData = { CustomerCode: this.customerCode, CustomerName: this.customerName , ShipmentId:this.shipmentId};
            outbound.OrderData = { CustomerCode: this.customerCode, CustomerName: this.customerName };
            outbound.OrderData.DOCNUM = this.orderNumber;
            localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
            //console.log("outbound","OutboundData null case....")
          }
          //===================================




        } else {
          this.toastr.error('', this.translate.instant("Outbound_InvalidSO"));
          this.orderNumber = "";
          this.scanSO.nativeElement.focus()
        }

      },
      error => {
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        this.showLookupLoader = false;
      }
    );
  }

  public openOrderLookup() {
    let whseId = localStorage.getItem("whseId");
    this.outboundservice.getCustomerSOList("", "", whseId).subscribe(
      resp => {
        if (resp != null && resp.length > 0) {
          if (resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));
            return;
          }

          this.lookupfor = "out-order";
          this.showLookupLoader = false;
          this.serviceData = resp;
          if (this.serviceData.length > 0) {
            this.showLookup = true;
          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
            this.showLookupLoader = false;
            this.showLookup = false;
          }
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


  hiddenScanSoBtn() {
    var inputValue = (<HTMLInputElement>document.getElementById('outCustomerSOInput')).value;
    if (inputValue.length > 0) {
      this.orderNumber = inputValue;
    }
    this.onOrderNoBlur();
  }

  hiddenScanCustCodeBtn() {
    var inputValue = (<HTMLInputElement>document.getElementById('outCustomerCustomerCodeInput')).value;
    if (inputValue.length > 0) {
      this.customerCode = inputValue;
    }
    this.onCustomerCodeBlur();
  }


  /**
   * New This method create temp array for selected SO for furthre updation in that SO.
   * @param selectedDocNum 
   * @param selectedDocEntry 
   */
  prepareTempCollectionForSelectedDelivery(selectedDocNum: any, selectedDocEntry: any) {
    let deliveryDataForSelectedSO: any = [];
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);

    if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
      this.outbound = JSON.parse(outboundData);
      if (this.outbound != undefined && this.outbound != null) {
        if (this.outbound && this.outbound.DeleiveryCollection !== undefined &&
          this.outbound.DeleiveryCollection !== null) {
          // create Order data object from selected Order.
          var orderData: any = {
            CARDCODE: this.outbound.CustomerData.CustomerCode,
            CARDNAME: this.outbound.CustomerData.customerName, DOCDUEDATE: "04/24/2019",
            DOCNUM: selectedDocNum.toString(), SHIPPINGTYPE: "", SHIPTOCODE: ""
          }
          // after we create delivery collection clear temp collection.
          this.outbound.OrderData = orderData;
          //create temp collection for selected delivery item..
          for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {
            const d = this.outbound.DeleiveryCollection[index];
            if (d.Item.DOCENTRY == selectedDocEntry && d.Order.DOCNUM == selectedDocNum) {
              deliveryDataForSelectedSO.push(d);
            }
          }
        }
      }
    }
    // after we create delivery collection clear temp collection.
    this.outbound.TempMeterials = deliveryDataForSelectedSO;
    // //lsOutbound
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
    this.router.navigateByUrl('home/outbound/outorder', { skipLocationChange: true });
  }



  //--------------------add So field--

  public getShipmentList() {
    this.showLookup = false;
    this.showLookupLoader = true;
    this.outboundservice.getShipmentIdList().subscribe(
      resp => {
        this.showLookupLoader = false;
        if (resp != null && resp != undefined && resp.length > 0) {
          if (resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            this.showLookupLoader = false;
            return;
          }

          this.serviceData = resp;
          this.lookupfor = "ShipmentList";
          this.showLookup = true;

        } else {
          this.toastr.error('', this.translate.instant("ShipmentNotAvailable"));
          this.orderNumber = "";
          this.scanShipmentId.nativeElement.focus()
        }

      },
      error => {
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        this.showLookupLoader = false;
      }
    );
  }


  //-------------------validate shipment detail.

  public onShipmentBlur() {
    this.getShipmentDetail();
  }


  //-------------------get shipment detail.

  public getShipmentDetail() {
    this.showLookup = false;
    if (this.shipmentId == "" || this.shipmentId == undefined || this.shipmentId == null) {
      return;
    }
    let whseId = localStorage.getItem("whseId");
    this.showLookupLoader = true;
    this.outboundservice.getShipmentDetail(this.shipmentId).subscribe(
      resp => {
        this.showLookupLoader = false;
        if (resp != null && resp != undefined) {
          this.resetOldShipmentData();
          if (resp.ItemHeader.length > 0) {
            if(resp.ItemDetail.length>0){
              this.parseAndGenerateDeliveryDataFromShipment(resp);
            }else{
              this.toastr.error('', this.translate.instant("ShipmentHasNoData"));
            }
            
          } else {
            if(resp.ItemHeader.length==0 ||resp.ItemDetail.length==0 ){
              this.resetOldShipmentData();

              this.toastr.error('', this.translate.instant("ShipmentHasNoData"));
            }else{
            if (resp[0].ErrorMsg == "7001") {
              this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
              this.showLookupLoader = false;
              return;
            }
          }
          }
        } else {
          this.toastr.error('', this.translate.instant("ShipmentNoInfo"));
          this.orderNumber = "";
          this.scanShipmentId.nativeElement.focus();
          this.shipmentId = "";
        }

      },
      error => {
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        this.showLookupLoader = false;
      }
    );
  }

  resetOldShipmentData(){
    this.orderCollection = [];
    let outbound: OutboundData = new OutboundData();
    outbound.CustomerData = {
      CustomerCode: "", CustomerName:"", TrackingId: "",
      CustRefNo: "", ShipmentId:""
    };
    outbound.TempMeterials = [];
      
  }
  parseAndGenerateDeliveryDataFromShipment(shipmentResponse: any) {
    let outbound: OutboundData = new OutboundData();
    if (shipmentResponse != null && shipmentResponse != undefined && shipmentResponse != "" &&
      shipmentResponse != "null" && shipmentResponse.ItemHeader != undefined && shipmentResponse.ItemHeader != null &&
      shipmentResponse.ItemHeader != "" && shipmentResponse.ItemHeader.length > 0) {
      this.customerCode = shipmentResponse.ItemHeader[0].CARDCODE;
      this.customerName = shipmentResponse.ItemHeader[0].CARDNAME;
      outbound.CustomerData = {
        CustomerCode: this.customerCode, CustomerName: this.customerName, TrackingId: this.trackingId,
        CustRefNo: this.CustRefNo, ShipmentId:this.shipmentId
      };
    }
    var arrItemHeader: any[] = shipmentResponse.ItemHeader;
    var arrItemDetail: any[] = shipmentResponse.ItemDetail;
    for (let i = 0; i < arrItemHeader.length; i++) {

      for (let j = 0; j < arrItemDetail.length; j++) {

        if (arrItemHeader[i].ITEMCODE === arrItemDetail[j].ITEMCODE) {
          //  check if all the batch serial allocated for this lot or not.
          if (parseFloat(arrItemDetail[j].MeterialPickQty) == parseFloat(arrItemDetail[j].TOTALQTY)) {
                // nothing to do for current object.
          } else {
            var pickedQty =0;
            // crate a temp record and take the respective calculated qty from the current detail object.
            var diff = parseFloat(arrItemDetail[j].TOTALQTY) - parseFloat(arrItemDetail[j].MeterialPickQty);
            if(diff >= parseFloat(arrItemHeader[i].OPENQTY)) {
              arrItemDetail[j].MeterialPickQty  = parseFloat(arrItemDetail[j].MeterialPickQty) + parseFloat(arrItemHeader[i].OPENQTY)
              pickedQty = parseFloat(arrItemHeader[i].OPENQTY);
            }else{
              arrItemDetail[j].MeterialPickQty  = parseFloat(arrItemDetail[j].MeterialPickQty) + diff;
              pickedQty = diff ;
            }    
            //--------------------create temp object row start.-----------------------------
            var orderData: any = {
              CARDCODE: arrItemHeader[i].CARDCODE, DOCDUEDATE: arrItemHeader[i].DOCDUEDATE,
              DOCNUM: arrItemHeader[i].DOCNUM, SHIPPINGTYPE: "", SHIPTOCODE: ""
            } 
            // prepare item data.
            var itemData: any = { 
              ROWNUM: arrItemHeader[i].ROWNUM, ITEMCODE: arrItemHeader[i].ITEMCODE,
              LINENUM: arrItemHeader[i].LINENUM, ITEMNAME: arrItemHeader[i].ITEMNAME, OPENQTY: arrItemHeader[i].OPENQTY,
              RPTQTY: arrItemHeader[i].RPTQTY, UOM: arrItemHeader[i].UOM, DOCDUEDATE: arrItemHeader[i].DOCDUEDATE,
              WHSCODE: arrItemHeader[i].WHSCODE, TREETYPE: arrItemHeader[i].TREETYPE, TRACKING: arrItemHeader[i].TRACKING,
              ENABLECONTAINER: arrItemHeader[i].ENABLECONTAINER, FACTOR: arrItemHeader[i].FACTOR, DOCENTRY: arrItemHeader[i].DOCENTRY,
              DOCNUM: arrItemHeader[i].DOCNUM, GTINNO: arrItemHeader[i].GTINNO, U_LOTISSUEMETHOD: arrItemHeader[i].U_LOTISSUEMETHOD,
              CONTAINERSIZE: arrItemHeader[i].CONTAINERSIZE, ACTUALOPENQTY: arrItemHeader[i].ACTUALOPENQTY, INVENTORYUOM: arrItemHeader[i].INVENTORYUOM,
              QUANTITY: arrItemHeader[i].QUANTITY, LINESTATUS: arrItemHeader[i].LINESTATUS, COUNT: arrItemHeader[i].COUNT,
              ITEMCOUNT: arrItemHeader[i].ITEMCOUNT, REMQTY: arrItemHeader[i].REMQTY, CARDCODE: arrItemHeader[i].CARDCODE
            }
            // prepare material data.
            var materialData: any = {
              LOTNO: arrItemDetail[j].LOTNO, ITEMCODE: arrItemDetail[j].ITEMCODE,
              WHSCODE: arrItemDetail[j].WHSCODE, BINNO: arrItemDetail[j].BINNO, TOTALQTY: arrItemDetail[j].TOTALQTY,
              EXPDATE: arrItemDetail[j].EXPDATE, SYSNUMBER: arrItemDetail[j].SYSNUMBER,
              PALLETNO: arrItemDetail[j].PALLETNO, ACTLOTNO: arrItemDetail[j].ACTLOTNO,
              MeterialPickQty: pickedQty
            }
            //--------------------create temp object row end.-----------------------------
            let tempItemRecord = { Order: orderData, Item: itemData, Meterial: materialData };
            outbound.TempMeterials.push(tempItemRecord);
          }
        }else{ 
          //nothing to do.
        }
      }
    }

    //set temp collection data to local storage.
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
    // prepare deliery collection from shipment response.
    this.prepareDeleiveryCollectionFromTempCollection(outbound);
    //set delivery data to local storage.
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));

    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
        if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
          this.outbound = JSON.parse(outboundData);
        }
        if (this.outbound.DeleiveryCollection !== undefined && this.outbound.DeleiveryCollection !== null && this.outbound.DeleiveryCollection.length > 0) {
          this.orderCollection = this.getUniqueValuesByProperty(this.outbound.DeleiveryCollection);
          if (this.orderCollection.length > this.pageSize) {
            this.pagable = true;
            this.toastr.success('', this.translate.instant("ShipmentreadyToDeliver"));
          }
        }

  }




  /**
   * This method create a temp data collection from shipment response.
   * @param items 
   * @param outbound 
   */
  prepareTempCollectionForShipment(items: any, outbound: OutboundData) {
    for (var i = 0; i < items.length; i++) {
      // prepare order model.
      var orderData: any = {
        CARDCODE: items[i].ItemHeader.CARDCODE, DOCDUEDATE: items[i].ItemHeader.DOCDUEDATE,
        DOCNUM: items[i].ItemHeader.DOCNUM, SHIPPINGTYPE: "", SHIPTOCODE: ""
      }
      // prepare item data.
      var itemData: any = {
        ROWNUM: items[i].ItemHeader.ROWNUM, ITEMCODE: items[i].ItemHeader.ITEMCODE,
        LINENUM: items[i].ItemHeader.LINENUM, ITEMNAME: items[i].ItemHeader.ITEMNAME, OPENQTY: items[i].ItemHeader.OPENQTY,
        RPTQTY: items[i].ItemHeader.RPTQTY, UOM: items[i].ItemHeader.UOM, DOCDUEDATE: items[i].ItemHeader.DOCDUEDATE,
        WHSCODE: items[i].ItemHeader.WHSCODE, TREETYPE: items[i].ItemHeader.TREETYPE, TRACKING: items[i].ItemHeader.TRACKING,
        ENABLECONTAINER: items[i].ItemHeader.ENABLECONTAINER, FACTOR: items[i].ItemHeader.FACTOR, DOCENTRY: items[i].ItemHeader.DOCENTRY,
        DOCNUM: items[i].ItemHeader.DOCNUM, GTINNO: items[i].ItemHeader.GTINNO, U_LOTISSUEMETHOD: items[i].ItemHeader.U_LOTISSUEMETHOD,
        CONTAINERSIZE: items[i].ItemHeader.CONTAINERSIZE, ACTUALOPENQTY: items[i].ItemHeader.ACTUALOPENQTY, INVENTORYUOM: items[i].ItemHeader.INVENTORYUOM,
        QUANTITY: items[i].ItemHeader.QUANTITY, LINESTATUS: items[i].ItemHeader.LINESTATUS, COUNT: items[i].ItemHeader.COUNT,
        ITEMCOUNT: items[i].ItemHeader.ITEMCOUNT, REMQTY: items[i].ItemHeader.REMQTY, CARDCODE: items[i].ItemHeader.CARDCODE
      }
      // prepare material data.
      var materialData: any = {
        LOTNO: items[i].ItemDetail.LOTNO, ITEMCODE: items[i].ItemDetail.ITEMCODE,
        WHSCODE: items[i].ItemDetail.WHSCODE, BINNO: items[i].ItemDetail.BINNO, TOTALQTY: items[i].ItemDetail.TOTALQTY,
        EXPDATE: items[i].ItemDetail.EXPDATE, SYSNUMBER: items[i].ItemDetail.SYSNUMBER,
        PALLETNO: items[i].ItemDetail.PALLETNO, ACTLOTNO: items[i].ItemDetail.ACTLOTNO,
        MeterialPickQty: items[i].ItemDetail.MeterialPickQty
      }
      let tempItemRecord = { Order: orderData, Item: itemData, Meterial: materialData };
      outbound.TempMeterials.push(tempItemRecord);
    }

  }

  /**
   * Create shipment detail data.
   */
  showShipmenInformation() {
    
     this.showShipmentInfo = true;
  }
   serviceData1:any = [{
    "ContainerId": 1,
    "ContainerName": "C1",
    "Items": [ 
      {
        "ItemCode": 1,
        "ItemName": "Child_Batch",
        "ItemLines": [
          {
            "ItemCode": "Child_Batch",
            "BatchSerial": "b1",
            "Qty": 2,
          },
          {
            "ItemCode": "Child_Batch",
            "BatchSerial": "b1",
            "Qty": 1,
          },
          {
            "ItemCode": "Child_Batch",
            "BatchSerial": "b1",
            "Qty": 2,
          }
        ]
      }
    ]
  },
  {
    "ContainerId": 2,
    "ContainerName": "C2",
    "Items": [
      {
        "ItemCode": 1,
        "ItemName": "Child_Serial",
        "ItemLines": [
          {
            "ItemCode": "Child_Serial",
            "BatchSerial": "s1",
            "Qty": 1,
          },
          {
            "ItemCode": "Child_Serial",
            "BatchSerial": "s2",
            "Qty": 1,
          },
          {
            "ItemCode": "Child_Serial",
            "BatchSerial": "s3",
            "Qty": 1,
          }
        ]
      }
    ]
  }];

   ShipmentItems:any =[];
   ShipmentBtchSer:any =[];
   ContainerHeader:any =[];
   ContainerItems:any =[];
  public getShipmentDataItemDetails() {
    if(this.shipmentId == undefined || this.shipmentId == null ||
      this.shipmentId== ""){
         return;
      }
   
   var ContainerBtchSer:any =[];
    this.showLookup = false;
    this.showLookupLoader = true;
    this.outboundservice.getShipmentDetail(42+"").subscribe(
      resp => {
        this.showLookupLoader = false;
        if (resp != null && resp != undefined) {
          if (resp[0]!=null && resp[0].ErrorMsg != null && resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            this.showLookupLoader = false;
            return;
          }
          this.showShipmentInfo = true;
           this.ShipmentItems = resp.ShipmentItems;
           this.ShipmentBtchSer= resp.ShipmentBtchSer;
           this.ContainerItems= resp.ContainerItems;
           this.ContainerHeader= resp.ContainerHeader;
           ContainerBtchSer= resp.ContainerBtchSer;
          // this.lookupfor = "ShipmentList";
          // this.showLookup = true;
          for(let i=0;i<this.ShipmentItems.length; i++){
            this.ShipmentItems[i]["ShipmentItemBatchSerial"] = []
          }
          for(let i=0;i<this.ShipmentItems.length; i++){
            this.ShipmentItems[i]["ShipmentItemBatchSerial"] = []
          }
          
          for(let j=0;j<this.ShipmentItems.length; j++){
            for(let k=0;k<this.ShipmentItems[j].ShipmentItemBatchSerial.length; k++){
            this.ShipmentItems[k].ShipmentItemBatchSerial[k]["innerItems"] = []
          }
          }
 
          // for(let i=0;i<this.ContainerItems.length; i++){
          //   this.ContainerItems[i]["ContainerItemsData"] = []
          // }
          this.ShipmentItems = this.setShipmentItemsBatchSerials(this.ShipmentItems,this.ShipmentBtchSer);
          this.ShipmentItems = this.setShipmentInnerItemsBatchSerials(this.ShipmentItems,this.ShipmentBtchSer);
        } else {
          this.toastr.error('', this.translate.instant("ShipmentNotAvailable"));
          this.orderNumber = "";
          this.scanShipmentId.nativeElement.focus()
        }
  
      },
      error => {
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        this.showLookupLoader = false;
      }
    );
  }
  setShipmentInnerItemsBatchSerials(ShipmentItems:any,ShipmentBtchSer:any):any{
    for(let i =0; i<ShipmentItems.length;i++){
      for(let k=0;k<this.ShipmentItems[i].ShipmentItemBatchSerial.length; k++){
      
      let itemLines = ShipmentBtchSer.filter(data =>
        ShipmentItems[i].OPTM_ITEMCODE === data.OPTM_ITEMCODE 
      );
      this.ShipmentItems[i].ShipmentItemBatchSerial[k].innerItems=ShipmentBtchSer;
      }
    }
    return  ShipmentItems;
  }
  setShipmentItemsBatchSerials(ShipmentItems:any,ShipmentBtchSer:any):any{
    for(let i =0; i<ShipmentItems.length;i++){
      var item =  ShipmentItems[i];
      let itemLines = ShipmentBtchSer.filter(data =>
        item.OPTM_ITEMCODE === data.OPTM_ITEMCODE 
      );
      item["ShipmentItemBatchSerial"] = itemLines;
    }
    return  ShipmentItems;
  }

  getShipmentLookupEvent(eventValue){
    if (eventValue != null && eventValue == "close") {
      //nothing to do
      this.showShipmentInfo = false;
      return;
    }
  
  }
}






