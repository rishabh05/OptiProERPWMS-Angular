import { Component, OnInit, ViewChild } from '@angular/core';
import { OutboundService } from 'src/app/services/outbound.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { Router } from '@angular/router';
import { OutboundData, CurrentOutBoundData } from 'src/app/models/outbound/outbound-data';
import { CommonConstants } from 'src/app/const/common-constants';
import { SOHEADER, SODETAIL, DeliveryToken } from 'src/app/models/outbound/out-del-req';
import { InboundService } from 'src/app/services/inbound.service';

// This file called from Outbound -> SO delivery and Shipment delivery

@Component({
  selector: 'app-out-cutomer',
  templateUrl: './out-cutomer.component.html',
  styleUrls: ['./out-cutomer.component.scss']
})
export class OutCutomerComponent implements OnInit {
  useContainer: boolean = false;
  dialogMsg: string = "Do you want to delete?"
  yesButtonText: string = "Yes";
  noButtonText: string = "No";
  public serviceData: any;
  DiliveryShipmentList: any[] = [];
  public lookupfor: any = '';
  public showLookup: boolean = false;
  public selectedCustomerElement: any;
  public customerName: string = '';
  public customerCode: string = '';
  shipToCode: string = "";
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
  public dockDoorCode: any = "";
  delNo: any = "";
  invoiceStatus: any = ""
  responseDocEntry: any = "";
  public dockDoorFromShipment: any = "";
  public deliveryOptionType: any = '1';
  @ViewChild('scanSO') scanSO;
  @ViewChild('scanShipmentId') scanShipmentId;
  @ViewChild('scanCustomerCode') scanCustomerCode;
  @ViewChild('scanTracking') scanTracking;
  public pageTitle: String = "";
  showShipmentInfo: boolean = false;
  ShowPickListReport: boolean = true;
  ShowPackListReport: boolean = true;
  ShowBOLReport: boolean = true;
  showPDFLoading: boolean = false;
  shipmentLinesArray = [];

  constructor(private inboundService: InboundService, private outboundservice: OutboundService, private router: Router, private commonservice: Commonservice, private toastr: ToastrService, private translate: TranslateService) {

    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      let option = localStorage.getItem("deliveryOptionType");
      this.deliveryOptionType = option;
      if (this.deliveryOptionType == '1') {
        this.pageTitle = this.translate.instant("Outbound_Delivery")
      } else if (this.deliveryOptionType == '2') {
        this.pageTitle = this.translate.instant("Outbound_Delivery_through_Shipment")
      }
      this.initializeShipmentLines();
    });
  }

  ngOnInit() {
    this.customerName = '';
    this.customerCode = '';
    this.showLookup = false;
    this.ShipmentHDR = [];

    let option = localStorage.getItem("deliveryOptionType");
    this.deliveryOptionType = option;
    if (this.deliveryOptionType == '1') {
      this.pageTitle = this.translate.instant("Outbound_Delivery")
      this.setOutboundPageInfo()
      // set page ui for outbound.
    } else if (this.deliveryOptionType == '2') {
      // set page ui for shipment.
      this.pageTitle = this.translate.instant("Outbound_Delivery_through_Shipment")
      this.setShipmentPageInfo();
    }
    this.updateSalesOrderList();
    this.ShowPickListReport = (JSON.parse(sessionStorage.getItem('ConfigData'))).ShowPickListReport;
    this.ShowPackListReport = (JSON.parse(sessionStorage.getItem('ConfigData'))).ShowPackListReport;
    this.ShowBOLReport = (JSON.parse(sessionStorage.getItem('ConfigData'))).ShowBOLReport;
    this.initializeShipmentLines();
  }

  initializeShipmentLines() {
    this.shipmentLinesArray = [
      { "Value": 1, "Name": this.translate.instant("CStatusNew") },
      { "Value": 2, "Name": this.translate.instant("Part_Allocated") },
      { "Value": 3, "Name": this.translate.instant("Allocated") },
      { "Value": 4, "Name": this.translate.instant("Pick_Generated") },
      { "Value": 5, "Name": this.translate.instant("Pick_Released") },
      { "Value": 6, "Name": this.translate.instant("Part_Picked") },
      { "Value": 7, "Name": this.translate.instant("Picked") },
      { "Value": 8, "Name": this.translate.instant("CShippedNew") },
      { "Value": 9, "Name": this.translate.instant("CCancelledNew") }
    ];
  }

  updateSalesOrderList() {
    // lsOutbound
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
      this.outbound = JSON.parse(outboundData);
      if (this.outbound != undefined && this.outbound != null) {
        if (this.outbound.CustomerData !== null) {
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

  public setShipmentPageInfo() {

  }
  public setOutboundPageInfo() {

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
    //this.scanCustomerCode.nativeElement.focus()
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

  onCustomerCodeBlur() {
    if (this.isValidateCalled) {
      return;
    }
    this.onCustomerCode();
  }

  async onCustomerCode(): Promise<any> {
    if (this.customerCode == undefined || this.customerCode == null || this.customerCode == '') {
      return
    }
    if (this.orderCollection != undefined && this.orderCollection != null &&
      this.orderCollection.length > 0) {
      return;
    }
    var result = false;
    await this.outboundservice.getCustomer(this.customerCode).then(
      resp => {
        console.log("inside onCustomerCode outboundservice.getCustomer");
        if (resp.length == 0) {
          this.customerCode = null
          this.customerName = ''
          this.orderNumber = "";
          this.scanCustomerCode.nativeElement.focus()
          this.toastr.error('', this.translate.instant("Outbound_CustomerExistMessge"));
          result = false;
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
            CustRefNo: this.CustRefNo, ShipmentId: ''
          };

          // lsOutbound
          localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
          CurrentOutBoundData.CustomerData = outbound.CustomerData;
          this.outbound = outbound;
          result = true;
        }
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
        result = false
      }
    );
    return result
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
            outbound.CustomerData = { CustomerCode: this.customerCode, CustomerName: this.customerName, ShipmentId: '' };
            outbound.OrderData = { CustomerCode: this.customerCode, CustomerName: this.customerName };
            outbound.OrderData.DOCNUM = this.orderNumber;
            localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
          }
        } else {
          // if first time.
          let outbound: OutboundData = new OutboundData();
          outbound.CustomerData = { CustomerCode: this.customerCode, CustomerName: this.customerName, ShipmentId: '' };
          outbound.OrderData = { CustomerCode: this.customerCode, CustomerName: this.customerName };
          outbound.OrderData.DOCNUM = this.orderNumber;
          localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
          //console.log("outbound","OutboundData null case....")
        }
        //===================================

        this.scanTracking.nativeElement.focus()

      } else if (this.lookupfor == "ShipmentList") {
        this.shipmentId = lookupValue[0];
        this.dockDoorCode = lookupValue[4];
        var useContainer = lookupValue[5];
        if (useContainer == "Y" || useContainer == "y") {
          this.useContainer = true;
        } else {
          this.useContainer = false;
        }
        this.isShipmentValid(this.shipmentId);
      } else if (this.lookupfor == "DockDoorList") {
        this.dockDoorCode = lookupValue[0];
        ;
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
          TrackingId: this.trackingId, CustRefNo: this.CustRefNo, ShipmentId: ''
        };
        // lsOutbound
        localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
        CurrentOutBoundData.CustomerData = outbound.CustomerData;
        this.outbound = outbound;
        this.scanSO.nativeElement.focus()
      }
    }
  }

  public getDockDoorList() {
    this.showLookup = false;
    this.showLookupLoader = true;
    this.outboundservice.getDockDoorList().subscribe(
      resp => {
        this.showLookupLoader = false;
        if (resp != null && resp != undefined && resp.length > 0) {
          if (resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            this.showLookupLoader = false;
            return;
          }
          this.serviceData = resp;
          this.lookupfor = "DockDoorList";
          this.showLookup = true;
        } else {
          this.toastr.error('', this.translate.instant("ShipmentNotAvailable"));
          this.orderNumber = "";
          // this.scanShipmentId.nativeElement.focus()
        }
      },
      error => {
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        this.showLookupLoader = false;
      }
    );
  }

  public isValidDockDoor(ddId: any) {
    if (this.dockDoorCode == undefined || this.dockDoorCode == null || this.dockDoorCode == "") {
      return;
    }
    this.showLookup = false;
    this.showLookupLoader = true;
    this.outboundservice.isValidDockDoorId(this.dockDoorCode).subscribe(
      resp => {
        this.showLookupLoader = false;
        if (resp != null && resp != undefined) {
          if (resp[0] != null && resp[0] != undefined && resp[0].ErrorMsg != null &&
            resp[0].ErrorMsg != undefined && resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            this.showLookupLoader = false;
            return;
          }
          if (resp != null && resp.length == 0) {
            this.toastr.error('', this.translate.instant("DockDoorNotAvailable"));
            this.dockDoorCode = "";
            return;
          }

          if (resp[0] != null && resp[0].OPTM_DOCKDOORID != null && resp[0].OPTM_DOCKDOORID != undefined) {
            this.dockDoorCode = resp[0].OPTM_DOCKDOORID;

          }
        } else {
          this.toastr.error('', this.translate.instant("DockDoorNotAvailable"));
          this.dockDoorCode = "";
          // this.scanShipmentId.nativeElement.focus()
        }
      },
      error => {
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        this.showLookupLoader = false;
      }
    );
  }

  onDockDoorBlur() {
    this.isValidDockDoor(this.dockDoorCode);
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

  async openCustSO(clearOrder: boolean = false) {
    var result = await this.validateBeforeSubmit();
    this.isValidateCalled = false;
    console.log("validate result: " + result);
    if (result != undefined && result == false) {
      return;
    }
    if (this.customerCode == undefined || this.customerCode == '') {
      return;
    }

    if (this.orderNumber != null) {
      localStorage.setItem("IsSOAvailable", "True");
    }
    localStorage.setItem("selectedSOAfterAddToDelivery", null);
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
          TrackingId: trackingId, CustRefNo: CustRefNo, ShipmentId: this.shipmentId
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
          TrackingId: trackingId, CustRefNo: CustRefNo, ShipmentId: this.shipmentId
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
      if ($event.From == "receiveSinglePDFDialog") {
        this.printDialog = true
      } else {
        this.removeOrderMain(this.delIdx, this.delGrd);
      }
    }
    // No
    else if ($event.Status === 'no') {
      if ($event.From == "receiveSinglePDFDialog") {

      }
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
    this.dockDoorCode = ""
  }

  isDeliveryContainerPacking: boolean = false;
  prepareDeleiveryCollection() {
    // dock door confirmation when delivery through shipment.
    if (this.deliveryOptionType == 2) {
      if (this.dockDoorCode != this.dockDoorFromShipment) {
        this.toastr.error('', this.translate.instant("DockDoorConfirmMessage"));
        return;
      }
    }

    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
      this.outbound = JSON.parse(outboundData);
    }
    if (this.outbound != null && this.outbound != undefined
      && this.outbound.DeleiveryCollection != null && this.outbound.DeleiveryCollection != undefined
      && this.outbound.DeleiveryCollection.length > 0) {
      //let tempDeleiveryCollection: any[] = this.outbound.DeleiveryCollection;
      let arrSOHEADER: SOHEADER[] = [];
      let arrSODETAIL: SODETAIL[] = [];
      let deliveryToken: DeliveryToken = new DeliveryToken();
      // Hdr
      let comDbId = sessionStorage.getItem("CompID");
      let token = sessionStorage.getItem("Token");
      let guid: string = sessionStorage.getItem("GUID");
      let uid: string = sessionStorage.getItem("UserId");
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
            if (this.deliveryOptionType == 2) {
              hdr.SelectedShipmentID = element.Order.ShipmentCode;
            }
            arrSOHEADER.push(hdr);
          }
          //================logic to add delivery line.
          var parentLineNum = hdrLineVal;
          let hasDetail = false;
          both:
          for (let index = 0; index < arrSODETAIL.length; index++) {
            const e1 = arrSODETAIL[index];
            if (o.Item.TRACKING == "S" || o.Item.TRACKING == "N") {
              //=====when its serial tracked then check already added start===
              if (o.Item.TRACKING == "S") {
                if (e1.LotNumber === o.Meterial.LOTNO && e1.Bin === o.Meterial.BINNO) {
                  hasDetail = true; //need to show error
                }
              }
              //=====when its serial tracked then check already added end===

              //=====when its non tracked then check already added start===
              if (o.Item.TRACKING == "N") {
                if (e1.Bin === o.Meterial.BINNO && e1.DOCENTRY == o.Item.DOCENTRY && e1.TRACKING == o.Item.TRACKING) { // added docEntry condition on 21072020
                  hasDetail = true; //need to show error
                }
              }
              //=====when its non tracked then check already added end===
            } else {
              for (let idx = 0; idx < arrSOHEADER.length; idx++) {
                const headerElement = arrSOHEADER[idx]
                if (headerElement.LineNo === o.Item.LINENUM && headerElement.DOCENTRY === o.Item.DOCENTRY) {

                  for (let innerIdx = 0; innerIdx < arrSODETAIL.length; innerIdx++) {
                    if (arrSODETAIL[innerIdx].LotNumber === o.Meterial.LOTNO && headerElement.LineNo === o.Item.LINENUM &&
                      headerElement.DOCENTRY === o.Item.DOCENTRY && arrSODETAIL[innerIdx].DOCENTRY === o.Item.DOCENTRY) {
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
            dtl.LotQty = o.Meterial.MeterialPickQty.toString();
            dtl.SysSerial = o.Meterial.SYSNUMBER;
            dtl.parentLine = parentLineNum;
            dtl.GUID = guid;
            dtl.UsernameForLic = uid;
            dtl.DOCENTRY = o.Item.DOCENTRY;
            dtl.TRACKING = o.Item.TRACKING
            arrSODETAIL.push(dtl);
          }
          limit = limit + lineDeleiveryCollection.length;
        }
      }
      if (arrSOHEADER.length > 0 && arrSODETAIL.length > 0) {
        deliveryToken.SOHEADER = arrSOHEADER;
        deliveryToken.SODETAIL = arrSODETAIL;
        deliveryToken.UDF = [];
        deliveryToken.PackingData = this.getPackingDataFromLocalStorage()
      }
      if (deliveryToken.PackingData.length > 0) {
        this.isDeliveryContainerPacking = true;
      }
      this.showLookupLoader = true;
      this.outboundservice.addDeleivery(deliveryToken).subscribe(
        data => {
          if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
            this.delNo = data[0].SuccessNo
            this.responseDocEntry = data[0].DocEntry
            this.invoiceStatus = data[0].InvoiceStatus;
            this.showLookupLoader = false;
            this.trackingId = "";
            this.CustRefNo = "";
            this.toastr.success('', this.translate.instant("DeleiverySuccess") + " : " + data[0].SuccessNo);
            this.clearOutbound();


            if (this.invoiceStatus == "N" || this.invoiceStatus == "n") {
              // this.toastr.error('', this.translate.instant("ARINvoiceNotCreated") + " : " + data[0].SuccessNo);
            } else {
              if (this.invoiceStatus == "Y" || this.invoiceStatus == "y") {
                //  this.toastr.success('', this.translate.instant("ARINvoiceSucess") + " : " + data[0].SuccessNo);
              }
            }
            //this code will be in 186 machine.
            if (this.isDeliveryContainerPacking) {
              this.showPrintConfirmDialog();
            }
            // for mormal deployment we will show report dialog with otions need to uncomment in html.
            //this.showPrintConfirmDialog();

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

  getPackingDataFromLocalStorage() {
    let selectedPackingItems = []
    let outboundData = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      var outbound = JSON.parse(outboundData);
      var packingCollection: any = outbound.packingCollection;
      selectedPackingItems = packingCollection.filter(pi => pi.ItemCode != null && pi.ItemCode != undefined);
    }
    var serialNo: number = 0;
    for (let i = 0; i < selectedPackingItems.length; i++) {
      serialNo = serialNo + 1;
      selectedPackingItems[i].PkgId = serialNo
    }
    return selectedPackingItems;
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

  onOrderNoBlur() {
    if (this.isValidateCalled) {
      return;
    }
    this.onOrderNo();
  }
  async onOrderNo(): Promise<any> {
    this.showLookup = false;
    if (this.orderNumber == "" || this.orderNumber == undefined) {
      return;
    }
    let whseId = sessionStorage.getItem("whseId");
    this.showLookupLoader = true;
    var result = false
    await this.outboundservice.GetCustomerDetailFromSO("", this.orderNumber, whseId).then(
      resp => {
        console.log("inside onOrderNo outboundservice.GetCustomerDetailFromSO");

        this.showLookupLoader = false;
        if (resp != null && resp != undefined && resp.length > 0) {
          if (resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            this.showLookupLoader = false;
            return;
          }
          result = true
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
              outbound.CustomerData = { CustomerCode: this.customerCode, CustomerName: this.customerName, ShipmentId: this.shipmentId };
              outbound.OrderData = { CustomerCode: this.customerCode, CustomerName: this.customerName };
              outbound.OrderData.DOCNUM = this.orderNumber;
              localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
            }
          } else {
            // if first time.
            let outbound: OutboundData = new OutboundData();
            outbound.CustomerData = { CustomerCode: this.customerCode, CustomerName: this.customerName, ShipmentId: this.shipmentId };
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
          result = false
        }

      },
      error => {
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        this.showLookupLoader = false;
        result = false
      }
    );
    return result
  }

  public openOrderLookup() {
    let whseId = sessionStorage.getItem("whseId");
    this.outboundservice.getCustomerSOList(this.customerCode, "", whseId).subscribe(
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
    this.onCustomerCode();
  }

  isValidateCalled: boolean = false;
  async validateBeforeSubmit(): Promise<any> {
    this.isValidateCalled = true;
    var currentFocus = document.activeElement.id;
    console.log("validateBeforeSubmit current focus: " + currentFocus);

    if (currentFocus != undefined) {
      if (currentFocus == "outCustomerCustomerCodeInput") {
        return this.onCustomerCode();
      }
      else if (currentFocus == "outCustomerSOInput") {
        return this.onOrderNo();
      }
    }
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
    this.outboundservice.getShipmentList(this.customerCode, this.dockDoorCode, this.shipToCode).subscribe(
      resp => {
        this.showLookupLoader = false;
        if (resp != null && resp != undefined && resp.length > 0) {
          if (resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            this.showLookupLoader = false;
            return;
          }
          this.DiliveryShipmentList = resp;
        } else {
          this.toastr.error('', this.translate.instant("ShipmentNotAvailable"));
          this.orderNumber = "";
        }
      },
      error => {
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        this.showLookupLoader = false;
      }
    );
  }


  public isShipmentValid(shipmentId: any) {
    if (shipmentId == undefined || shipmentId == null || shipmentId == "") {
      return;
    }
    this.showLookup = false;
    this.showLookupLoader = true;
    this.outboundservice.isValidShipmentId(shipmentId).subscribe(
      resp => {
        this.showLookupLoader = false;
        if (resp != null && resp != undefined) {
          if (resp[0] != null && resp[0] != undefined && resp[0].ErrorMsg != null &&
            resp[0].ErrorMsg != undefined && resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));
            this.showLookupLoader = false;
            return;
          }
          let index = this.ShipmentHDR.findIndex(e => e.ShipmentCode == this.shipmentId);
          if (index > -1) {
            this.toastr.error('', 'Shipment already selected');
            return;
          }
          // reset for this shipment id.
          this.resetOldShipmentData();

          if (resp.ItemHeader != null && resp.ItemHeader != undefined && resp.ItemHeader.length > 0 &&
            resp.ItemDetail != null && resp.ItemDetail != undefined && resp.ItemDetail.length > 0) {

            this.dockDoorCode = resp.ItemHeader[0].OPTM_DOCKDOORID;
            this.dockDoorFromShipment = resp.ItemHeader[0].OPTM_DOCKDOORID;
            var useContainer = resp.ItemHeader[0].OPTM_USE_CONTAINER;
            if (useContainer == "Y" || useContainer == "y") {
              this.useContainer = true;
            } else {
              this.useContainer = false;
            }
            this.parseAndGenerateDeliveryDataFromShipment(resp);
            this.getShipmentDataItemDetails();
          } else {
            this.shipmentId = "";
            this.toastr.error('', this.translate.instant("InvalidShipmentCode"));
          }


        } else {
          this.toastr.error('', this.translate.instant("InvalidShipmentCode"));
          this.shipmentId = "";
          // this.scanShipmentId.nativeElement.focus()
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
    this.isShipmentValid(this.shipmentId);
    //this.getShipmentDetail();
  }


  //-------------------get shipment detail.

  resetOldShipmentData() {
    this.orderCollection = [];
    let outbound: OutboundData = new OutboundData();
    outbound.CustomerData = {
      CustomerCode: "", CustomerName: "", TrackingId: "",
      CustRefNo: "", ShipmentId: ""
    };
    outbound.TempMeterials = [];
    this.dockDoorCode = ""
  }

  parseAndGenerateDeliveryDataFromShipment(shipmentResponse: any) {
    let outbound: OutboundData = new OutboundData();
    if (JSON.parse(localStorage.getItem(CommonConstants.OutboundData)) != undefined) {
      outbound = JSON.parse(localStorage.getItem(CommonConstants.OutboundData));
    }
    if (shipmentResponse != null && shipmentResponse != undefined && shipmentResponse != "" &&
      shipmentResponse != "null" && shipmentResponse.ItemHeader != undefined && shipmentResponse.ItemHeader != null &&
      shipmentResponse.ItemHeader != "" && shipmentResponse.ItemHeader.length > 0) {
      this.customerCode = shipmentResponse.ItemHeader[0].CARDCODE;
      this.customerName = shipmentResponse.ItemHeader[0].CARDNAME;
      outbound.CustomerData = {
        CustomerCode: this.customerCode, CustomerName: this.customerName, TrackingId: this.trackingId,
        CustRefNo: this.CustRefNo, ShipmentId: this.shipmentId
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
            var pickedQty = 0;
            // crate a temp record and take the respective calculated qty from the current detail object.
            var diff = parseFloat(arrItemDetail[j].TOTALQTY) - parseFloat(arrItemDetail[j].MeterialPickQty);
            if (diff >= parseFloat(arrItemHeader[i].OPENQTY)) {
              arrItemDetail[j].MeterialPickQty = parseFloat(arrItemDetail[j].MeterialPickQty) + parseFloat(arrItemHeader[i].OPENQTY)
              pickedQty = parseFloat(arrItemHeader[i].OPENQTY);
            } else {
              arrItemDetail[j].MeterialPickQty = parseFloat(arrItemDetail[j].MeterialPickQty) + diff;
              pickedQty = diff;
            }
            //--------------------create temp object row start.-----------------------------
            var orderData: any = {
              CARDCODE: arrItemHeader[i].CARDCODE, DOCDUEDATE: arrItemHeader[i].DOCDUEDATE,
              DOCNUM: arrItemHeader[i].DOCNUM, SHIPPINGTYPE: "", SHIPTOCODE: "", ShipmentCode: this.shipmentId
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
              ITEMCOUNT: arrItemHeader[i].ITEMCOUNT, REMQTY: arrItemHeader[i].REMQTY, CARDCODE: arrItemHeader[i].CARDCODE, ShipmentCode: this.shipmentId
            }
            // prepare material data.
            var materialData: any = {
              LOTNO: arrItemDetail[j].LOTNO, ITEMCODE: arrItemDetail[j].ITEMCODE,
              WHSCODE: arrItemDetail[j].WHSCODE, BINNO: arrItemDetail[j].BINNO, TOTALQTY: arrItemDetail[j].TOTALQTY,
              EXPDATE: arrItemDetail[j].EXPDATE, SYSNUMBER: arrItemDetail[j].SYSNUMBER,
              PALLETNO: arrItemDetail[j].PALLETNO, ACTLOTNO: arrItemDetail[j].ACTLOTNO,
              MeterialPickQty: pickedQty, ShipmentCode: this.shipmentId
            }
            //--------------------create temp object row end.-----------------------------
            let tempItemRecord = { Order: orderData, Item: itemData, Meterial: materialData };
            outbound.TempMeterials.push(tempItemRecord);
          }
        } else {
          //nothing to do.
        }
      }
    }

    //set temp collection data to local storage.
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
    // prepare deliery collection from shipment response.
    this.prepareDeleiveryCollectionFromTempCollection(outbound);

    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
    //set delivery data to local storage.
    localStorage.setItem(CommonConstants.FROM_DTS, JSON.stringify(true));

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

  ShipmentHDR = [];
  ShipmentItems: any = [];
  ShipmentBtchSer: any = [];
  ContainerHeader: any = [];
  ContainerItems: any = [];
  ContainerBatchSerial: any = [];
  ShipmentInfoData: any;

  public getShipmentDataItemDetails(showLookup: any = true) {
    if (this.shipmentId == undefined || this.shipmentId == null ||
      this.shipmentId == "") {
      return;
    }
    var ContainerBtchSer: any = [];
    this.showLookup = false;
    this.showLookupLoader = true;
    this.outboundservice.getShipmentDetail(this.shipmentId + "").subscribe(
      resp => {
        this.showLookupLoader = false;
        console.log("shipment Resp:", resp);
        if (resp != null && resp != undefined) {
          if (resp[0] != null && resp[0].ErrorMsg != null && resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            this.showLookupLoader = false;
            return;
          }

          this.ShipmentHDR.push({
            ShipmentCode: this.shipmentId,
            ShipmentId: this.shipmentId,
            UseContainer: this.useContainer,
            UseContainerVal: this.useContainer == true ? "Y" : "N"
          })
          this.ShipmentItems = resp.ShipmentItems;
          for (var i = 0; i < resp.ShipmentItems.length; i++) {
            this.ShipmentItems[i].OPTM_STATUS_VAL = this.shipmentLinesArray[Number(this.ShipmentItems[i].OPTM_STATUS) - 1].Name
          }
          this.ShipmentBtchSer = resp.ShipmentBtchSer;
          this.ContainerItems = resp.ContainerItems;
          this.ContainerHeader = resp.ContainerHeader;
          this.ContainerBatchSerial = resp.ContainerBtchSer;
          for (let i = 0; i < this.ShipmentItems.length; i++) {
            this.ShipmentItems[i]["ShipmentItemBatchSerial"] = []
          }
          //abhi container ki array use nahi kari hai..
          this.ShipmentItems = this.setShipmentItemsBatchSerials(this.ShipmentItems, this.ShipmentBtchSer);
          // set Container Data
          for (let i = 0; i < this.ContainerItems.length; i++) {
            this.ContainerItems[i]["ContainerItemsBatchSerial"] = []
          }
          for (let i = 0; i < this.ContainerHeader.length; i++) {
            this.ContainerHeader[i]["ContainerItems"] = []
          }

          this.ContainerHeader = this.setContainerItemsToHeader(this.ContainerHeader, this.ContainerItems);
          this.ContainerHeader = this.setContainerItemBatchSerials(this.ContainerHeader, this.ContainerBatchSerial);
          this.ShipmentHDR[this.ShipmentHDR.length - 1]["ContainerHeader"] = this.ContainerHeader;
          this.ShipmentHDR[this.ShipmentHDR.length - 1]["ShipmentItems"] = this.ShipmentItems;

          let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
          if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
            this.outbound = JSON.parse(outboundData);
          }
          this.outbound.ShipmentHDR = this.ShipmentHDR;
          localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
        } else {
          this.toastr.error('', this.translate.instant("ShipmentNotAvailable"));
        }
        this.prepareContainerPackingData(this.ContainerHeader, this.ContainerItems);
      },
      error => {
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        this.showLookupLoader = false;
      }
    );
  }

  showShipments() {
    this.showShipmentInfo = true;
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
      this.outbound = JSON.parse(outboundData);
    }
    this.ShipmentHDR = this.outbound.ShipmentHDR;
    this.ShipmentInfoData = this.ShipmentHDR;
  }

  //packing data for container.
  prepareContainerPackingData(containerHeader: any, containerItems: any) {
    var packingCollectionItems = this.outbound.packingCollection;
    var tempPackingArray = [];
    var num = 0;
    for (let i = 0; i < containerHeader.length; i++) {

      for (let j = 0; j < containerItems.length; j++) {
        if (containerHeader[i].OPTM_CONTCODE == containerItems[j].OPTM_CONTCODE) {
          tempPackingArray.push({
            CARDCODE: this.customerCode,
            DocEntry: '',
            ItemCode: '',
            ItemTracking: '',
            LineNum: '',
            PkgNo: num + 1,
            PkgType: containerItems[j].OPTM_CONTTYPE,
            Quantity: containerItems[j].OPTM_QUANTITY
          })
        }
      }
    }
    //lsOutbound
    let outboundData = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      this.outbound.packingCollection = tempPackingArray
    }
  }

  setShipmentInnerItemsBatchSerials(ShipmentItems: any, ShipmentBtchSer: any): any {
    for (let i = 0; i < ShipmentItems.length; i++) {
      for (let k = 0; k < this.ShipmentItems[i].ShipmentItemBatchSerial.length; k++) {

        let itemLines = ShipmentBtchSer.filter(data =>
          ShipmentItems[i].OPTM_ITEMCODE === data.OPTM_ITEMCODE
        );
        this.ShipmentItems[i].ShipmentItemBatchSerial[k].batchSerialLines = ShipmentBtchSer;
      }
    }
    return ShipmentItems;
  }
  setShipmentItemsBatchSerials(ShipmentItems: any, ShipmentBtchSer: any): any {
    for (let i = 0; i < ShipmentItems.length; i++) {
      var item = ShipmentItems[i];
      let itemLines = ShipmentBtchSer.filter(data =>
        item.OPTM_ITEMCODE === data.OPTM_ITEMCODE
      );
      item["ShipmentItemBatchSerial"] = itemLines;
    }
    return ShipmentItems;
  }

  setContainerItemBatchSerials(ContainerHeader: any, ContainerBtchSer: any): any {
    for (let p = 0; p < ContainerHeader.length; p++) {
      for (let q = 0; q < ContainerHeader[p].ContainerItems.length; q++) {

        var hdrContainerId = ContainerHeader[p].ContainerItems[q].OPTM_CONTAINERID;
        var hdrItemCode = ContainerHeader[p].ContainerItems[q].OPTM_ITEMCODE;
        let containerItemBatchSerialLines = ContainerBtchSer.filter(data =>
          hdrContainerId == data.OPTM_CONTAINERID &&
          hdrItemCode == data.OPTM_ITEMCODE
        );
        ContainerHeader[p].ContainerItems[q].ContainerItemsBatchSerial = containerItemBatchSerialLines;
      }
    }
    return ContainerHeader;
  }

  setContainerItemsToHeader(ContainerHeaders: any, ContainerItems: any): any {
    for (let i = 0; i < ContainerHeaders.length; i++) {
      var headerItem = ContainerHeaders[i];
      let containerItemLines = ContainerItems.filter(data =>
        headerItem.OPTM_CONTCODE === data.OPTM_CONTAINERID
      );
      headerItem.ContainerItems = containerItemLines;
    }
    return ContainerHeaders;
  }

  getShipmentLookupEvent(eventValue) {
    if (eventValue != null && eventValue == "close") {
      //nothing to do
      this.showShipmentInfo = false;
      return;
    }
  }

  shipmentRowDeleteEvent(shipmentCode) {
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData !== undefined && outboundData !== '' && outboundData !== null) {
      this.outbound = JSON.parse(outboundData);
    }
    if (this.outbound.ShipmentHDR != undefined) {
      let removeIndex = this.outbound.ShipmentHDR.findIndex(e => e.Item.ShipmentCode == shipmentCode)
      this.outbound.ShipmentHDR.splice(removeIndex, 1);
    }
    let result = this.outbound.DeleiveryCollection.filter(e => e.Item.ShipmentCode == shipmentCode)
    let index = this.outbound.DeleiveryCollection.findIndex(e => e.Item.ShipmentCode == shipmentCode)
    this.outbound.DeleiveryCollection.splice(index, result.length);
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
    if (this.outbound.DeleiveryCollection !== undefined && this.outbound.DeleiveryCollection !== null && this.outbound.DeleiveryCollection.length > 0) {
      this.orderCollection = this.getUniqueValuesByProperty(this.outbound.DeleiveryCollection);
      if (this.orderCollection.length > this.pageSize) {
        this.pagable = true;
        this.toastr.success('', this.translate.instant("ShipmentreadyToDeliver"));
      }
    }
  }

  printDialog: boolean = false
  showPDF: boolean = false;
  base64String: string = "";
  fileName: string = "";
  displayPDF1: boolean = false;
  dialogFor: string = "";
  public displayPDF(dNo: string, value: any) {
    this.showPDFLoading = true;
    this.inboundService.printingServiceForSubmitGRPO(dNo, value).subscribe(
      (data: any) => {
        this.showPDFLoading = false;
        // this.printDialog = false;
        if (data != undefined) {
          // console.log("" + data);
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }

          if (data.Detail != null && data.Detail != undefined && data.Detail[0] != null && data.Detail[0] != undefined) {
            this.fileName = data.Detail[0].FileName;
            this.base64String = data.Detail[0].Base64String;
          }

          if (this.base64String != null && this.base64String != "") {
            this.base64String = 'data:application/pdf;base64,' + this.base64String;
            this.displayPDF1 = true;
          } else {
          }
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLookupLoader = false;
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  showPrintConfirmDialog() {
    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    this.dialogFor = "receiveSinglePDFDialog";
    this.dialogMsg = "Do you want to print report?";//this.translate.instant("Inbound_PrintAllLabelsAfterSubmit");
    this.showConfirmDialog = true; // show dialog 
  }

  printOptionsClick(event) {
    this.displayPDF("" + this.responseDocEntry, event)
  }

  closePDF() {
    this.displayPDF1 = false;
    console.log("PDF dialog is closed");
  }
  closePrintDialog() {
    this.printDialog = false;
  }

  onQueryClick() {
    this.getShipmentList();
  }

  dialogOpened: boolean = false;
  ShipmentDetail: any[] = [];

  onShipmentSelection(event) {
    this.dialogOpened = true;
    this.SelectedRowsforShipmentArr = [];
    this.SelectedRowsforShipmentArr.push({
      ShipmentID: event.selectedRows[0].dataItem.OPTM_SHIPMENTID
    })
    this.prepareShipmentModel("getDetail");
  }

  updateDeliverySeq(lotTemplateVar, value, rowindex) {
    for (let i = 0; i < this.DiliveryShipmentList.length; ++i) {
      if (i === rowindex) {
        this.DiliveryShipmentList[i].DeliverySeq = lotTemplateVar;
      }
    }
  }

  public getShipmentDetail(shipmentCode: any) {
    if (shipmentCode == undefined || shipmentCode == null || shipmentCode == "") {
      return;
    }
    this.showLookup = false;
    this.showLookupLoader = true;
    this.outboundservice.isValidShipmentId(shipmentCode).subscribe(
      resp => {
        this.showLookupLoader = false;
        if (resp != null && resp != undefined) {
          if (resp[0] != null && resp[0] != undefined && resp[0].ErrorMsg != null &&
            resp[0].ErrorMsg != undefined && resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));
            this.showLookupLoader = false;
            return;
          }

          // reset for this shipment id.
          this.resetOldShipmentData();

          if (resp.ItemHeader != null && resp.ItemHeader != undefined && resp.ItemHeader.length > 0 &&
            resp.ItemDetail != null && resp.ItemDetail != undefined && resp.ItemDetail.length > 0) {
            this.ShipmentDetail = resp.ItemHeader;
          } else {
            this.shipmentId = "";
            this.toastr.error('', this.translate.instant("InvalidShipmentCode"));
          }


        } else {
          this.toastr.error('', this.translate.instant("InvalidShipmentCode"));
          this.shipmentId = "";
          // this.scanShipmentId.nativeElement.focus()
        }

      },
      error => {
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        this.showLookupLoader = false;
      }
    );
  }

  closeDialog() {
    this.dialogOpened = false;
  }

  SelectedRowsforShipmentArr = [];
  selectall: boolean = false;

  selectShipmentRow(isCheck, dataitem, idx) {
    if (isCheck) {
      this.DiliveryShipmentList[idx].Selected = true;
      // for (let i = 0; i < this.DiliveryShipmentList.length; i++) {
      //   if (this.DiliveryShipmentList[i].OPTM_CONTCODE == dataitem.OPTM_CONTCODE) {
      //     this.DiliveryShipmentList[i].Selected = true;
      //   }
      // }
      var index = this.SelectedRowsforShipmentArr.findIndex(r => r.ShipmentID == dataitem.OPTM_SHIPMENTID);
      if (index == -1) {
        // this.SelectedRowsforShipmentArr.push(dataitem);

        this.SelectedRowsforShipmentArr.push({
          ShipmentID: dataitem.OPTM_SHIPMENTID
        })
      }
    }
    else {
      for (let i = 0; i < this.DiliveryShipmentList.length; i++) {
        if (this.DiliveryShipmentList[i].OPTM_SHIPMENTID == dataitem.OPTM_SHIPMENTID) {
          this.DiliveryShipmentList[i].Selected = false;
        }
      }
      var index = this.SelectedRowsforShipmentArr.findIndex(r => r.ShipmentID == dataitem.OPTM_SHIPMENTID);
      if (index > -1)
        this.SelectedRowsforShipmentArr.splice(index, 1);
    }
  }

  on_Selectall_checkbox_checked(checkedvalue) {
    var isExist = 0;
    this.selectall = false
    if (checkedvalue == true) {
      if (this.DiliveryShipmentList.length > 0) {
        this.selectall = true
        this.SelectedRowsforShipmentArr = [];
        for (let i = 0; i < this.DiliveryShipmentList.length; ++i) {
          this.DiliveryShipmentList[i].Selected = true;
          this.SelectedRowsforShipmentArr.push(this.DiliveryShipmentList[i]);
        }
      }
    }
    else {
      this.selectall = false
      if (this.DiliveryShipmentList.length > 0) {
        for (let i = 0; i < this.DiliveryShipmentList.length; ++i) {
          this.DiliveryShipmentList[i].Selected = false;
          this.SelectedRowsforShipmentArr.splice(this.DiliveryShipmentList[i])
        }
      }
    }
  }

  public isValidShipTo() {
    if (this.shipToCode == undefined || this.shipToCode == null || this.shipToCode == "") {
      return;
    }
    this.showLookup = false;
    this.showLookupLoader = true;
    this.outboundservice.isValidShipTo(this.shipToCode).subscribe(
      resp => {
        this.showLookupLoader = false;
        if (resp != null && resp != undefined) {
          if (resp[0] != null && resp[0] != undefined && resp[0].ErrorMsg != null &&
            resp[0].ErrorMsg != undefined && resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            this.showLookupLoader = false;
            return;
          }
          if (resp != null && resp.length == 0) {
            this.toastr.error('', this.translate.instant("InvalidShipTo"));
            this.shipToCode = "";
            return;
          }
          if (resp[0] != null && resp[0].Address != null && resp[0].Address != undefined) {
            this.shipToCode = resp[0].Address;
          }
        } else {
          this.toastr.error('', this.translate.instant("InvalidShipTo"));
          this.shipToCode = "";
        }
      },
      error => {
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        this.showLookupLoader = false;
      }
    );
  }

  prepareShipmentModel(event) {
    var deliveryPayload: any = {};
    deliveryPayload.LoginParams = [];
    deliveryPayload.Shipments = [];

    deliveryPayload.LoginParams.push({
      CompanyDBId: sessionStorage.getItem("CompID"),
      UsernameForLic: sessionStorage.getItem("UserId"),
      GUID: sessionStorage.getItem("GUID"),
      DiServerToken: sessionStorage.getItem("Token"),
      WhsCode: sessionStorage.getItem("whseId")
    })

    deliveryPayload.Shipments = this.SelectedRowsforShipmentArr;
    // deliveryPayload.Shipments.push({
    //   Shipment: this.shipmentId
    // })

    if(event == "delivery"){
      this.CreateDeliveryBasedonShipments(deliveryPayload);
    }else{
      this.GetShipmentSODetails(deliveryPayload);
    }
  }

  public GetShipmentSODetails(deliveryPayload) {
    this.showLookup = false;
    this.showLookupLoader = true;
    this.outboundservice.GetShipmentSODetails(deliveryPayload).subscribe(
      resp => {
        this.showLookupLoader = false;
        if (resp != null && resp != undefined) {
          if (resp[0] != null && resp[0] != undefined && resp[0].ErrorMsg != null &&
            resp[0].ErrorMsg != undefined && resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            this.showLookupLoader = false;
            return;
          }
          this.ShipmentDetail =  resp[0].ShipmentDtls;
          this.SelectedRowsforShipmentArr = [];
        } else {
          this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
          this.shipToCode = "";
        }
      },
      error => {
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        this.showLookupLoader = false;
      }
    );
  }


  public CreateDeliveryBasedonShipments(deliveryPayload) {
    this.showLookup = false;
    this.showLookupLoader = true;
    this.outboundservice.CreateDeliveryBasedonShipments(deliveryPayload).subscribe(
      resp => {
        this.showLookupLoader = false;
        if (resp != null && resp != undefined) {
          if (resp[0] != null && resp[0] != undefined && resp[0].ErrorMsg != null &&
            resp[0].ErrorMsg != undefined && resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));
            this.showLookupLoader = false;
            return;
          }
          this.SelectedRowsforShipmentArr = [];
        } else {
          this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
          this.shipToCode = "";
        }
      },
      error => {
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
        this.showLookupLoader = false;
      }
    );
  }
}






