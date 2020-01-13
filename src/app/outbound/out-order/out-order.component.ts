import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { OutboundService } from 'src/app/services/outbound.service';
import { CommonConstants } from 'src/app/const/common-constants';
import { Router } from '@angular/router';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { OutboundData } from 'src/app/models/outbound/outbound-data';
import { RowClassArgs } from '@progress/kendo-angular-grid';
import { SODETAIL, SOHEADER, DeliveryToken } from 'src/app/models/outbound/out-del-req';
import { MeterialModel } from 'src/app/models/outbound/meterial-model';
import { InventoryTransferService } from 'src/app/services/inventory-transfer.service';


@Component({
  selector: 'app-out-order',
  templateUrl: './out-order.component.html',
  styleUrls: ['./out-order.component.scss']
})
export class OutOrderComponent implements OnInit {
  dialogFor: string;
  dialogMsg: string = "";
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
  itrCode: string = "";
  docNum: string = "";
  toBinNo: string = "";
  toWhse: string = "";
  @Input() fromWhere;
  @Output() screenBackEvent = new EventEmitter();

  selectedItem: any;
  sumOfPickQty: number = 0;
  openQty: number = 0;
  palletNo: string = "";
  itemsByPallet: any;
  dialogOpened: boolean = false;
  showPalletGrid: boolean = false;
  rowindex: any;
  gridData: any;
  public pagable: boolean = false;
  public pageSize: number = Commonservice.pageSize;
  currentSelectedMaterialsByPallets: any = [];
  tempSOCalculationDataSet: any = [];
  palletList: any = [];
  itrItemsList: any = [];
  selectedPallets: any = [];
  savedPalletItems: any;
  showTemporaryViews: boolean = false;
  temoraryHideItemLookupRow: boolean = false;
  pagetitle: any ="";
  isPalletizationEnable: boolean = false

  docEntry:any;   // this variable is used only for single itr submit request for multiple we have to change implementation.
  @ViewChild('scanSO') scanSO;
  @ViewChild('DocNum') DocNum;
  @ViewChild('PalletNo') PalletNo;
  @ViewChild('scanItemCode') scanItemCode;


  constructor(private outboundservice: OutboundService, private router: Router, private commonservice: Commonservice, private toastr: ToastrService, private translate: TranslateService,
    private inventoryTransferService: InventoryTransferService) { }

  ngOnInit() {
    if (localStorage.getItem("PalletizationEnabled") == "True") {
      this.isPalletizationEnable = true;
    } else {
      this.isPalletizationEnable = false;
    }

    // lsOutbound
   // console.log("from where",this.fromWhere);  
    if(localStorage.getItem("ComingFrom")=="itr"){
      this.fromWhere = "itr";
      this.pagetitle= this.translate.instant("InvTransfer_ByITR");
     
    } else {
      let companyName = '';
      let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
      if (outboundData != null && outboundData != undefined && outboundData != '' 
      && outboundData != 'null'){
        this.outbound = JSON.parse(outboundData);
        this.selectedCustomer = this.outbound.CustomerData;
        companyName =this.selectedCustomer.CustomerCode;
      }
      this.pagetitle= this.translate.instant("Outbound_DeleiveryToCustomer")+": "+ companyName;
       // means from outbound
    }
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
   // console.log("Order:data", outboundData);
    if (outboundData != null && outboundData != undefined && outboundData != '' && outboundData != 'null') {
      this.outbound = JSON.parse(outboundData);
      this.selectedCustomer = this.outbound.CustomerData;
      if (this.outbound.OrderData !== undefined && this.outbound.OrderData !== null
        && this.outbound.OrderData.DOCNUM !== undefined && this.outbound.OrderData.DOCNUM !== null) {
        this.orderNumber = this.outbound.OrderData.DOCNUM;
        this.docEntry = this.outbound.OrderData.DOCENTRY;
        
        // this.openSOOrderList(); 
        
        if(localStorage.getItem("ComingFrom")=="itr"){
          this.itrCode = this.orderNumber;
          //this.toBinNo = this.outbound.ITRToBinNo.ToBin
          this.toWhse = this.outbound.ITRToBinNo.ToWhse;
          this.getITRItemList();
        } else {
          if (localStorage.getItem("IsSOAvailable") == "True") {
            this.openSOOrderList(this.orderNumber);
            localStorage.setItem("IsSOAvailable", "False");
            this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();
          } else {
            this.openSOOrderList();
          } 
        }
        this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();
      }
      this.calculatePickQty();
    }

    this.setSavedPelletDataToGrid();
   // document.getElementById("itemcodeid").focus();
  }

  ngAfterViewInit(): void{
    if(localStorage.getItem("ComingFrom")=="itr"){
      this.DocNum.nativeElement.focus()
    } else {
      this.scanSO.nativeElement.focus()
    }
  }

  /* this method set the update data to array to display in grid.
  */
  setSavedPelletDataToGrid() {
    this.savedPalletItems = [];
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
  // console.log("Order:data", outboundData);
    if (outboundData != null && outboundData != undefined && outboundData != '' && outboundData != 'null') {
      this.outbound = JSON.parse(outboundData);
      this.savedPalletItems = this.outbound.PalletItems;
    }
    // if(this.savedPalletItems != null && this.savedPalletItems != undefined && this.savedPalletItems.length>0) this.showPalletGrid = true;
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

  fromEvent: any = ""
  onOrderNoBlur() {
   setTimeout(()=>{
    console.log("onOrderNoBlur method run>>");
    if (this.orderNumber){
      this.openSOOrderList(this.orderNumber);
    }
   }, 200)
  }
  
  public openOrderLookup() {
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
    
    if(this.outbound!=null && this.outbound.TempMeterials!=null && this.outbound.TempMeterials!=undefined && this.outbound.TempMeterials.length>0){
      this.showDialog("ClearTempArray", this.translate.instant("yes"), this.translate.instant("no"),
      this.translate.instant("Plt_DataDeleteMsg"));
      this.fromEvent = "lookup";
      return;
    }
  }
    

    if (this.selectedCustomer != null && this.selectedCustomer != undefined
      && this.selectedCustomer.CustomerCode != '' && this.selectedCustomer.CustomerCode != null) {

      let whseId = localStorage.getItem("whseId");
      this.outboundservice.getCustomerSOList(this.selectedCustomer.CustomerCode, "", whseId).subscribe(
        resp => {
          if (resp != null && resp.length > 0) {
            if (resp[0].ErrorMsg == "7001") {
              this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
              return;
            }
            var tempData = resp;
            for (var i = 0; i < this.outbound.DeleiveryCollection.length; i++) {
              for (var j = 0; j < resp.length; j++) {
                if (this.outbound.DeleiveryCollection[i].Order.DOCNUM == resp[j].DOCNUM) {
                  tempData.splice(j, 1);
                }
              }
            }
            this.lookupfor = "out-order";
            this.showLookupLoader = false;
            this.serviceData = tempData;
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
    else {
      this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
      this.showLookupLoader = false;
      this.showLookup = false;
    }
  }

  
  getLookupValue(lookupValue: any) {
    this.showLookup = false;
    this.selectedPallets = [];
    this.ItemCode ="";
    if (lookupValue != null && lookupValue == "close") {
      //nothing to do
      return;
    } else {
      if (this.lookupfor == "PalletList") {
        this.showLookupLoader = false;
        this.palletNo = lookupValue.Code;
        this.getPalletData();
        // this.PalletNo.nativeElement.focus()
      } else { 
        if (this.lookupfor == "out-order") {
          this.outbound.OrderData = lookupValue;
          this.orderNumber = this.outbound.OrderData.DOCNUM;
          // lsOutbound
          localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
          this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();
          this.openSOOrderList();
          this.scanSO.nativeElement.focus()
        } else if (this.lookupfor == "ITRList") {
          this.resetITRFields();
          //
          this.toWhse = lookupValue.ToWhsCode;
          this.itrCode = lookupValue.DocEntry;
          this.docNum =  lookupValue.DocNum;
          this.orderNumber = this.itrCode;
          this.outbound.ITRToBinNo = { 
            ToBin: this.toBinNo,
            ToWhse: this.toWhse
          };
          localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
          this.getITRItemList();
          this.DocNum.nativeElement.focus()
        } else if (this.lookupfor == "toBinsList") {
          this.toBinNo = lookupValue.BINNO;
          this.outbound.ITRToBinNo = { 
            ToBin: this.toBinNo,
            ToWhse: this.toWhse
          };
          localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
          // this.scanToBin.nativeElement.focus()
        } else {
          if (this.lookupfor == "ItemsList") {
            this.selectedItem = lookupValue.ITEMCODE;
            this.scanItemCode.nativeElement.focus()
          }
        }
      }
    }
  }

  public openPOByUOM(selectdeData: any, ) {
    console.log("openPOByUOM method run........");
  //  let selectdeData = selection.selectedRows[0].dataItem;
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      this.outbound.SelectedItem = selectdeData;
      // if (this.soItemsDetail.length > 0) {
      //   this.outbound.SelectedItem = this.soItemsDetail[selection.index];
      // }
      // this.outbound.TempMeterials = [];
      //this.addMetToTempCollection(this.outbound);
      // this.addMetToTempCollectionRe(this.outbound);
      //lsOutbound
      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      this.router.navigate(['home/outbound/outprodissue', { skipLocationChange: true }]);
    }
  }

  public openNextScreen(index: any) {
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      if (this.soItemsDetail.length > 0) {
        this.outbound.SelectedItem = this.soItemsDetail[index];
      }
      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      this.router.navigate(['home/outbound/outprodissue', { skipLocationChange: true }]);
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
        tempOrderData = {
          CARDCODE: this.outbound.CustomerData.CustomerCode,
          CARDNAME: this.outbound.CustomerData.customerName, 
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
              this.showLookupLoader = false;
              return;
            }

          // When order num from text box.
          this.outbound.OrderData = tempOrderData;
          this.soItemsDetail = resp.RDR1;
        
          this.showLookupLoader = false;
          if (this.soItemsDetail.length === 0) { 
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
            this.showLookupLoader = false;
          }
          if (this.soItemsDetail!=null && this.soItemsDetail.length > this.pageSize) {
            this.pagable = true;
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
    
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
    }
    if(this.outbound.TempMeterials!=null && this.outbound.TempMeterials!=undefined && 
      this.outbound.TempMeterials.length>0){
      this.showDialog("ClearTempArray", this.translate.instant("yes"), this.translate.instant("no"),
      this.translate.instant("Plt_DataDeleteMsg"));
      this.fromEvent = "backArrow"
    }else{
      this.router.navigate(["home/outbound/outcustomer", { skipLocationChange: true }])
    }
   }
  public addToDeleiver(goToCustomer: boolean = true) {

    this.callPrepareDeleiveryTempCollectionMethod()
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      if (goToCustomer == true)
        this.openOutboundCustomer();
    }
  }

  public callPrepareDeleiveryTempCollectionMethod() {
    this.showLookupLoader = true;
    //lsOutbound
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      this.prepareDeleiveryTempCollection();
      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      this.showLookupLoader = false;
    }
  }
  prepareDeleiveryTempCollection() {
    if (this.outbound) {
      let tempMeterialCollection: any[] = this.outbound.TempMeterials;

      //check if the item is already present in delivery collection then remove from temp collection.
      for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {
        const d = this.outbound.DeleiveryCollection[index];
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
     // after we create delivery collection clear temp collection.
     this.outbound.TempMeterials =[];
  }

  public deleiver(orderId: any = null) {
    //this.showLookupLoader = true;
    this.callPrepareDeleiveryTempCollectionMethod();
    //this.addToDeleiver(false);
    if(localStorage.getItem("ComingFrom")=="itr"){
      this.submitITR();
    } else {
    this.prepareDeleiveryCollectionAndDeliver(orderId);
    }
    //this.showLookupLoader = false;
  }


  public calculatePickQty() {

    if (this.soItemsDetail) {

      for (let i = 0; i < this.soItemsDetail.length; i++) {
        const soelement = this.soItemsDetail[i];
        let totalPickQty: number = 0;

        if (this.outbound && this.outbound.TempMeterials && this.outbound.TempMeterials.length > 0) {

          for (let j = 0; j < this.outbound.TempMeterials.length; j++) {

            const element = this.outbound.TempMeterials[j];
        //    console.log("My Element", element);
            if (soelement.ROWNUM === element.Item.ROWNUM && soelement.ITEMCODE === element.Item.ITEMCODE && this.outbound.OrderData.DOCNUM === element.Order.DOCNUM) {
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
      && this.outbound.DeleiveryCollection != null
      && this.outbound.DeleiveryCollection != undefined
      && this.outbound.DeleiveryCollection.length > 0) {

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
      let headerLineArray: any = [];

    this.showLookupLoader = true;
      // Loop through delivery collection 
      for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {

        var selectedDelivery = this.outbound.DeleiveryCollection[index];
        //=========filter  collection docnum, docentry, tracking wise.
        let lineDeleiveryCollection = this.outbound.DeleiveryCollection.filter(d =>
          selectedDelivery.Order.DOCNUM === d.Order.DOCNUM &&
          selectedDelivery.Item.DOCENTRY === d.Item.DOCENTRY &&
          selectedDelivery.Item.TRACKING === d.Item.TRACKING
        );
        //=========filter  collection docnum, docentry, tracking wise.
        //=============== Adding header and Detail Objects logic==================
        for (let hIdx = 0; hIdx < lineDeleiveryCollection.length; hIdx++) {
          let o = lineDeleiveryCollection[hIdx];

          //============================start check header exist or not then add ========
          let existHdr = false;
          for (let index = 0; index < arrSOHEADER.length; index++) {
            let h = arrSOHEADER[index]; 
            if (h.SONumber.toString() === o.Order.DOCNUM && h.ItemCode === o.Item.ITEMCODE &&
              h.Tracking === o.Item.TRACKING) {
              existHdr = true;
              break;
            }
          }

          if (existHdr == false) {   // Add Header here and then add 
            hdrLineVal = hdrLineVal + 1;
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
            hdr.Line = hdrLineVal;
            if(this.outbound.CustomerData.CustRefNo!=null && this.outbound.CustomerData.CustRefNo!=undefined){
              hdr.NumAtCard = this.outbound.CustomerData.CustRefNo;
            }else{
              hdr.NumAtCard = "";
            }
            if(this.outbound.CustomerData.TrackingId!=null && this.outbound.CustomerData.TrackingId!=undefined){
              hdr.TrackingNumber = this.outbound.CustomerData.TrackingId;
            }else{
              hdr.TrackingNumber= "";
            }
            arrSOHEADER.push(hdr);
          }
          //============================start check header exist or not then add ========
          //============================start check detail exist or not then add ========
          let hasDetail = false;
          both:
          for (let dIdx = 0; dIdx < arrSODETAIL.length; dIdx++) {
            let selectedDetl = arrSODETAIL[dIdx];
            if (selectedDetl.LotNumber === o.Meterial.LOTNO && selectedDetl.Bin === o.Meterial.BINNO) {

              for (let headerIndex = 0; headerIndex < headerLineArray.length; headerIndex++) {
                if (selectedDetl.parentLine === headerLineArray[headerIndex]) {
                  hasDetail = true;
                  break both;
                }
              }
            }
          }

          if (hasDetail == false) {
            let dtl: SODETAIL = new SODETAIL();
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
     
      //==delivery submit final code===
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
          this.showLookupLoader = false;
        },
        error => {
          this.showLookupLoader = false;
          console.log(
            error);
        }
      );
    //==delivery submit final code===
    //  console.log("shdr", arrSOHEADER);
    }
  }

  clearOutbound() {
    localStorage.setItem(CommonConstants.OutboundData, null);
    this.router.navigate(["home/outbound/outcustomer", { skipLocationChange: true }])
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

  deliveryConfirmation() {
    this.showConfirmDialog = true;
  }


  getPalletData() {
    if (this.containPallet()) {
      this.toastr.error('', this.translate.instant("Plt_AlreadySelected"));
      return;
    }
    this.showLookupLoader = true;
    this.commonservice.GetPalletDataForOutBound(this.palletNo).subscribe(
      (data: any) => {
        this.showLookupLoader = false;
        if (data != null) {
          this.itemsByPallet = data;
          this.addPalletData()
          // this.managePickQuantity();
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          return;
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
  addPalletData() {
    for (let i = 0; i < this.itemsByPallet.length; i++) {
      if(localStorage.getItem("ComingFrom")=="itr"){
        this.selectedPallets.push({
          BINNO: this.itemsByPallet[i].BINNO,
          ACTLOTNO: this.itemsByPallet[i].ACTLOTNO,
          EXPDATE: this.itemsByPallet[i].EXPDATE,
          ITEMCODE: this.itemsByPallet[i].ITEMCODE,
          ITEMNAME: this.itemsByPallet[i].ITEMNAME,
          LOTNO: this.itemsByPallet[i].LOTNO,
          Pallet: this.itemsByPallet[i].PALLETNO,
          SYSNUMBER: this.itemsByPallet[i].SYSNUMBER,
          QTY: this.itemsByPallet[i].TOTALQTY,
          WHSCODE: this.itemsByPallet[i].WHSCODE,
          SRLBATCH: this.itemsByPallet[i].SRLBATCH,
          ToBin: this.toBinNo
        })
      } else {
        this.selectedPallets.push({
          BINNO: this.itemsByPallet[i].BINNO,
          ACTLOTNO: this.itemsByPallet[i].ACTLOTNO,
          EXPDATE: this.itemsByPallet[i].EXPDATE,
          ITEMCODE: this.itemsByPallet[i].ITEMCODE,
          ITEMNAME: this.itemsByPallet[i].ITEMNAME,
          LOTNO: this.itemsByPallet[i].LOTNO,
          Pallet: this.itemsByPallet[i].PALLETNO,
          SYSNUMBER: this.itemsByPallet[i].SYSNUMBER,
          QTY: this.itemsByPallet[i].TOTALQTY,
          WHSCODE: this.itemsByPallet[i].WHSCODE,
          SRLBATCH: this.itemsByPallet[i].SRLBATCH
        })
      }
      
    }
    this.managePickQuantity()
  }
  fromProduction: boolean = false;
  addMetToTempCollection(outboundData: any, fromIFPSave: boolean = false) {
    //lsOutbound
    // let outboundData = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      this.outbound = outboundData;//JSON.parse(outboundData);
      let count = 0;
      if (this.outbound.TempMeterials !== undefined
        && this.outbound.TempMeterials !== null && this.outbound.TempMeterials.length > 0) {
        // if (this.fromProduction) {
        //   this.outbound.TempMeterials = this.outbound.TempMeterials.filter((t: any) =>
        //     t.Item.RefLineNo !== this.outbound.SelectedItem.RefLineNo && t.Item.ITEMCODE !== this.outbound.SelectedItem.ITEMCODE || t.Order["Order No"] !== this.outbound.OrderData["Order No"]);
        // }
        // else {
        //   this.outbound.TempMeterials = this.outbound.TempMeterials.filter((t: any) =>
        //     t.Item.ROWNUM !== this.outbound.SelectedItem.ROWNUM && t.Item.ITEMCODE !== this.outbound.SelectedItem.ITEMCODE || t.Item.DOCNUM !== this.outbound.OrderData.DOCNUM);
        // }
        // loop selected Items
        // for (let index = 0; index < this.outbound.SelectedMeterials.length; index++) {
        //   const m = this.outbound.SelectedMeterials[index];
        //   count = count + m.MeterialPickQty;
        //   // if (count > this._requiredMeterialQty) {
        //   //   this.toastr.error('', this.translate.instant("ProdIssue_QtyGTTotal"));
        //   //   return;
        //   // }
        //   if (m.MeterialPickQty > 0) {
        //     let item = { Order: this.outbound.OrderData, Item: this.outbound.SelectedItem, Meterial: m }
        //     this.outbound.TempMeterials.push(item)
        //   }
        // }
      }
      else {
        this.outbound.TempMeterials = [];
        // loop selected Items
        for (let index = 0; index < this.outbound.SelectedMeterials.length; index++) {
          const m = this.outbound.SelectedMeterials[index];
          count = count + m.MeterialPickQty;
          // if (count > this._requiredMeterialQty) {
          //   this.toastr.error('', this.translate.instant("ProdIssue_QtyGTTotal"));
          //   return;
          // }
          if (m.MeterialPickQty > 0) {
            let item = { Order: this.outbound.OrderData, Item: this.outbound.SelectedItem, Meterial: m }
            this.outbound.TempMeterials.push(item)
          }
        }
      }
    }
    // //lsOutbound
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));

  }

  addMetToTempCollectionRe() {
    this.outbound = JSON.parse(localStorage.getItem(CommonConstants.OutboundData));
    if (this.outbound != null && this.outbound != undefined && this.outbound.TempMeterials !== undefined
      && this.outbound.TempMeterials !== null && this.outbound.TempMeterials.length > 0) {
      for (let i = 0; i < this.soItemsDetail.length; i++) {
        for (let j = 0; j < this.currentSelectedMaterialsByPallets.length; j++) {
          if (this.soItemsDetail[i].ITEMCODE == this.currentSelectedMaterialsByPallets[j].ITEMCODE) {
            //   var material = { this.currentSelectedMaterialsByPallets[j]}
            let item = { Order: this.outbound.OrderData, Item: this.soItemsDetail[i], Meterial: this.currentSelectedMaterialsByPallets[j] }
            this.outbound.TempMeterials.push(item)
          }
        }
      }

    } else {
      this.outbound.TempMeterials = [];
      for (let i = 0; i < this.soItemsDetail.length; i++) {
        for (let j = 0; j < this.currentSelectedMaterialsByPallets.length; j++) {
          if (this.soItemsDetail[i].ITEMCODE == this.currentSelectedMaterialsByPallets[j].ITEMCODE) {
            let item = { Order: this.outbound.OrderData, Item: this.soItemsDetail[i], Meterial: this.currentSelectedMaterialsByPallets[j] }
            this.outbound.TempMeterials.push(item)
          }
        }
      }
    }
    // //lsOutbound
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
  }


  containPallet() {
    this.setSavedPelletDataToGrid();
    if (this.savedPalletItems != null)
      for (let i = 0; i < this.savedPalletItems.length; i++) {
        if (this.savedPalletItems[i].Pallet == this.palletNo) {
          return true;
        }
      }
    return false;
  }

  managePickQuantity() {
    var rollbackPallet;
    var isRollbackPalletSelected = false;
    // existing pallet items se qty update kark check karna hai..
    for (let i = 0; i < this.soItemsDetail.length; i++) {
      this.sumOfPickQty = Number.parseInt("" + this.soItemsDetail[i].RPTQTY);
      //  if(this.sumOfPickQty==undefined || this.)
      this.openQty = Number.parseInt(this.soItemsDetail[i].OPENQTY);
      for (let j = 0; j < this.selectedPallets.length; j++) {
        if (this.selectedPallets[j].Pallet == this.palletNo
          && this.soItemsDetail[i].ITEMCODE == this.selectedPallets[j].ITEMCODE) {
          this.sumOfPickQty = this.sumOfPickQty + Number.parseInt(this.selectedPallets[j].QTY);
          this.soItemsDetail[i].RPTQTY = "" + this.sumOfPickQty;
          if (this.sumOfPickQty > this.openQty) {
            rollbackPallet = this.selectedPallets[j];
          }
          // else {
          //   this.soItemsDetail[i].RPTQTY = "" + this.sumOfPickQty;
          // }
          //let availableRptQty = this.soItemsDetail[i].RPTQTY
          // this.sumOfPickQty = this.sumOfPickQty + Number.parseInt(this.selectedPallets[j].QTY);
          // this.soItemsDetail[i].RPTQTY = "" + this.sumOfPickQty;
        }
        else { console.log("else:", "palletName in else:" + this.selectedPallets[j].Pallet) }
      }
    }

    if (rollbackPallet != undefined && rollbackPallet != "" && rollbackPallet != null) {
      this.palletNo = '';
      this.toastr.error('', this.translate.instant("Plt_PalletNotValid"));
      let sameItemList = this.selectedPallets.filter(i => rollbackPallet.Pallet == i.Pallet);
      for (let i = 0; i < this.soItemsDetail.length; i++) {
        for (let j = 0; j < sameItemList.length; j++) {
          if (this.soItemsDetail[i].ITEMCODE == sameItemList[j].ITEMCODE) {
            var pickQty = Number.parseInt(this.soItemsDetail[i].RPTQTY) - Number.parseInt(sameItemList[j].QTY);
            this.soItemsDetail[i].RPTQTY = pickQty;
          }
        }
      }// remove pallet which is not compitable.
      isRollbackPalletSelected = true;
      this.removePallet(rollbackPallet.Pallet);
    }

    this.createOrderData();// I thing this method is not needed but we can see in the end.
    this.outbound = JSON.parse(localStorage.getItem(CommonConstants.OutboundData));
    this.outbound.SelectedMeterials = this.manageSelectedMaterialDataFromPalletAndSOList();
    this.currentSelectedMaterialsByPallets = this.outbound.SelectedMeterials;
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));

    if (!isRollbackPalletSelected) { //agar rollback pallet nahi hai to hi add karvana hai.
      this.addMetToTempCollectionRe();
    }

    this.outbound = JSON.parse(localStorage.getItem(CommonConstants.OutboundData));
    // this.showPalletGrid = true;
    if (!isRollbackPalletSelected) {
      this.saveSelectedPallet();
    }
    this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();
    isRollbackPalletSelected = false;
    // if items of pallet added then show addToDelivery and Submit button. issue fixed.
   // this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();

    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    // console.log("Order:data", outboundData);
      if (outboundData != null && outboundData != undefined && outboundData != '' && outboundData != 'null') 
      {
        this.outbound = JSON.parse(outboundData);
        if(this.outbound!=null && this.outbound!=undefined && this.outbound.TempMeterials!=null && this.outbound.TempMeterials!= undefined)
        {
          let data = this.outbound.TempMeterials.filter(tm => ""+tm.Order.DOCNUM === ""+this.orderNumber);
         if(data.length > 0){
          this.showDeleiveryAndAdd = true;
         }
        }
      }

  }

  saveSelectedPallet() { // this method will save the final selected pallet data to local storage.

    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '' && this.selectedPallets != null
      && this.selectedPallets != undefined && this.selectedPallets.length > 0) {
      this.outbound = JSON.parse(outboundData);
      for (let i = 0; i < this.selectedPallets.length; i++) {
        this.outbound.PalletItems.push(this.selectedPallets[i]);
      }
      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
    }
    this.setSavedPelletDataToGrid();
  }
  btnText: string = 'Show Pallet Grid';
  showPalletsList() {
    this.showPalletGrid = !this.showPalletGrid;

    if (this.showPalletGrid) { this.btnText = 'Hide Pallet Grid'; }
    else { this.btnText = 'Show Pallet Grid'; }

  }
  //selectedPallets me bhi I hope current vale hona chaiyea or jab naya aai to vo apn last me add kar de usme.
  manageSelectedMaterialDataFromPalletAndSOList(): any {
    var selectedMeterialItems: any = [];
    for (let i = 0; i < this.soItemsDetail.length; i++) {
      for (let j = 0; j < this.selectedPallets.length; j++) {
        if (this.soItemsDetail[i].ITEMCODE == this.selectedPallets[j].ITEMCODE) {
          if(localStorage.getItem("ComingFrom")=="itr"){
            var obj1 = {
              BINNO: this.selectedPallets[j].BINNO,
              EXPDATE: this.selectedPallets[j].EXPDATE,
              ITEMCODE: this.selectedPallets[j].ITEMCODE,
              LOTNO: this.selectedPallets[j].LOTNO,
              MeterialPickQty: this.selectedPallets[j].QTY,
              PALLETNO: this.selectedPallets[j].Pallet,
              SYSNUMBER: this.selectedPallets[j].SYSNUMBER,
              TOTALQTY: this.selectedPallets[j].QTY,
              WHSCODE: this.selectedPallets[j].WHSCODE,
              isFromPallet: true,
              ToBin: this.selectedPallets[j].ToBin
            }
            selectedMeterialItems.push(obj1);
          } else {
            var obj = {
              BINNO: this.selectedPallets[j].BINNO,
              EXPDATE: this.selectedPallets[j].EXPDATE,
              ITEMCODE: this.selectedPallets[j].ITEMCODE,
              LOTNO: this.selectedPallets[j].LOTNO,
              MeterialPickQty: this.selectedPallets[j].QTY,
              PALLETNO: this.selectedPallets[j].Pallet,
              SYSNUMBER: this.selectedPallets[j].SYSNUMBER,
              TOTALQTY: this.selectedPallets[j].QTY,
              WHSCODE: this.selectedPallets[j].WHSCODE,
              isFromPallet: true
            }
            selectedMeterialItems.push(obj);
          }
        }
      }
    }
    return selectedMeterialItems;
  }

  createOrderData() {
    //let selectdeData = this.soItemsDetail.get[j];
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      this.outbound.SelectedItem = this.soItemsDetail;
      //lsOutbound
      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
    }
  }

  public selectedMeterials: any = Array<MeterialModel>();
  _requiredMeterialQty: any = 0;
  _pickedMeterialQty: any = 0;
  _remainingMeterial: any = 0;
  public oldSelectedMeterials: any = Array<MeterialModel>();
  manageMeterial(scan: boolean = false, comingSelectedMeterials: any) {
    let requiredMeterialQty: number = this._requiredMeterialQty;
    let pickedMeterialQty: number = this._pickedMeterialQty;
    let remailingMeterialQty: number = requiredMeterialQty - pickedMeterialQty;
    if (pickedMeterialQty < requiredMeterialQty) {
      // if scan
      if (scan) {
        let meterial = comingSelectedMeterials[0];
        if (meterial.PickQty > requiredMeterialQty) {
          if (meterial.totalPickQty > remailingMeterialQty) {
            meterial.MeterialPickQty = remailingMeterialQty
          } else {
            meterial.MeterialPickQty = meterial.totalPickQty
          }
        }
        else {
          if (meterial.totalPickQty > remailingMeterialQty) {
            meterial.MeterialPickQty = remailingMeterialQty
          }
          else {
            meterial.MeterialPickQty = meterial.totalPickQty
          }
          meterial.MeterialPickQty = meterial.TOTALQTY - meterial.PickQty
        }
        this.selectedMeterials.push(meterial);
        //apply paging..
        this.pagable = this.selectedMeterials.length > this.pageSize;
        pickedMeterialQty = pickedMeterialQty + meterial.MeterialPickQty;
        remailingMeterialQty = requiredMeterialQty - pickedMeterialQty;
      }
      else {

        for (let i = 0; i < comingSelectedMeterials.length; i++) {

          let meterial = comingSelectedMeterials[i];
          let avaliableMeterialQty = parseFloat(meterial.TOTALQTY);

          if (avaliableMeterialQty >= remailingMeterialQty) {
            meterial.MeterialPickQty = remailingMeterialQty;
          }
          else {
            meterial.MeterialPickQty = avaliableMeterialQty;
          }
          this.selectedMeterials.push(meterial);
          //apply paging..
          this.pagable = this.selectedMeterials.length > this.pageSize;
          pickedMeterialQty = pickedMeterialQty + meterial.MeterialPickQty;
          remailingMeterialQty = requiredMeterialQty - pickedMeterialQty;
        }
        //code only for non tracked item
        //fixed issue: save&remaing items showing 
        //===============================non track case==========================================
        //   if (this.OrderType == 'N') {
        //     let itemMeterials
        //     if (this.outbound.TempMeterials !== undefined
        //       && this.outbound.TempMeterials !== null
        //       && this.outbound.TempMeterials.length > 0) {

        //       itemMeterials = this.outbound.TempMeterials.filter(
        //         (m: any) => m.Item.ITEMCODE
        //           === this.outbound.SelectedItem.ITEMCODE && m.Item.ROWNUM
        //           === this.outbound.SelectedItem.ROWNUM && this.outbound.OrderData.DOCNUM === m.Item.DOCNUM);
        //     }
        //     if (itemMeterials !== undefined && itemMeterials !== null
        //       && itemMeterials.length > 0) {
        //       // this.selectedMeterials = [];
        //       itemMeterials.forEach(element => {
        //         for (var i = 0; i < this.selectedMeterials.length; i++) {
        //           if (this.selectedMeterials[i].BINNO == element.Meterial.BINNO) {
        //             this.selectedMeterials[i] = (element.Meterial)
        //           }
        //         }
        //       });
        //     }
        //   }
        //=========================================================================
        // }
        // Selected meterial
        if (this.selectedMeterials && this.selectedMeterials.length > 0) {
          this._pickedMeterialQty = this.selectedMeterials.map(i => i.MeterialPickQty).reduce((sum, c) => sum + c);
          this._remainingMeterial = this._requiredMeterialQty - this._pickedMeterialQty;
        }
        else {
          this._pickedMeterialQty = pickedMeterialQty;
          this._requiredMeterialQty = remailingMeterialQty;
        }
      }
      this.oldSelectedMeterials = JSON.parse(JSON.stringify(this.selectedMeterials));
      this.pagable = this.selectedMeterials.length > this.pageSize;
    }
  }

  removePallet(palletNo) {
    var selectedPallet = this.selectedPallets.filter(item => palletNo != item.Pallet);
    this.selectedPallets = selectedPallet;
  }
  containItemCode(list: any, targetItemCode: string) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].ITEMCODE == targetItemCode) {
        return true;
      }
    }
    return false;
  }

  public getPalletList() {
    if(this.soItemsDetail==undefined || this.soItemsDetail==null || this.soItemsDetail.length==0){
      this.toastr.error('', this.translate.instant("InvTransfer_ITRRequired"));
      return;
    }
    this.showLookupLoader = true;
    var itemCodeArray = Array.prototype.map.call(this.soItemsDetail, function (item) { return "'" + item.ITEMCODE + "'"; }).join(",");
    this.commonservice.GetPalletListForOutBound(itemCodeArray).subscribe(
      (data: any) => {
       // console.log(data);
        if (data != null) {
          if (data.length > 0) {
            this.showLookupLoader = false;
          //  console.log(data);
            this.serviceData = data;
            this.lookupfor = "PalletList";
            this.showLookup = true;
            return;
          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        }
        this.showLookupLoader = false;
      },
      error => {
        this.showLookupLoader = false;
        console.log("Error: ", error);
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  onPalletChange() {
    if (this.palletNo == undefined || this.palletNo == "") {
      return;
    }
    this.showLookup = false;
    var itemCodeArray = Array.prototype.map.call(this.soItemsDetail, function (item) { return "'" + item.ITEMCODE + "'"; }).join(",");
    this.commonservice.IsPalletValidForOutBound(this.palletNo, itemCodeArray).subscribe(
      (data: any) => {
     //   console.log(data);
        if (data != null) {
          if (data.length > 0) {
            this.palletNo = data[0].Code;
            this.getPalletData();
          } else {
            this.toastr.error('', this.translate.instant("InValidPalletNo"));
            this.palletNo = "";
            //this.PalletNo.nativeElement.focus();
            return;
          }
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          this.palletNo = "";
          //this.PalletNo.nativeElement.focus();
          return;
        }
      },
      error => {
        this.showLookupLoader = false;
        console.log("Error: ", error);
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  /**
   * this method used to show selected pallet in selected pallet list on ui on lookup click.
   */
  showSelectedPallets() {
    this.dialogOpened = true;
    this.palletList = [];

    for (let i = 0; i < this.savedPalletItems.length; i++) {
      if (!this.isPalletExistInPalletList(this.savedPalletItems[i].Pallet)) {
        this.palletList.push({
          Pallet: this.savedPalletItems[i].Pallet
        });
      }
    }
   // console.log("pallet list: " + JSON.stringify(this.palletList));

    if(this.palletList.length == 0){
      this.palletNo = "";
    }
  }

  DeliveryClick(rowindex, gridData: any) {
    this.gridData = gridData;
    this.rowindex = rowindex;
    // this.dialogMsg = "Which order you want to deliver?"
    // this.yesButtonText = "All";
    // this.noButtonText = "Current";
    this.showDialog("Delivery", this.translate.instant("All"), this.translate.instant("Current"),
      this.translate.instant("Outbond_DeliveryMsg"));
  }

  PalletDeleteClick(rowindex, gridData: any) {
    this.gridData = gridData;
    this.rowindex = rowindex;
    this.showDialog("DeletePallet", this.translate.instant("yes"), this.translate.instant("no"),
      this.translate.instant("DeleteRecordsMsg"));
  }

  deleteAll() {
    this.showDialog("deleteAll", this.translate.instant("yes"), this.translate.instant("no"),
      this.translate.instant("DeleteAllLines"));
  }

  showDialog(dialogFor: string, yesbtn: string, nobtn: string, msg: string) {
    this.dialogFor = dialogFor;
    this.yesButtonText = yesbtn;
    this.noButtonText = nobtn;
    this.showConfirmDialog = true;
    this.dialogMsg = msg;
  }

  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;
    if ($event.Status == "yes") {
      switch ($event.From) {
        case ("delete"):
          this.palletList.splice(this.rowindex, 1);
          break;
        case ("DeletePallet"):
          var removedPallet = this.palletList[this.rowindex].Pallet;
          let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
          if (outboundData != undefined && outboundData != '') {
            this.outbound = JSON.parse(outboundData);
            var ObjectFromTempCollection: any;
            var deletedTempObjectsList: any = [];
            // filtered items of deleted pallet.
            let deletedPalletItems = this.outbound.PalletItems.filter(d => removedPallet === d.Pallet);

            //=======collection of deleted temp items from pallet start==========
            for (let i = 0; i < deletedPalletItems.length; i++) {
              var deletedItem = deletedPalletItems[i];
              ObjectFromTempCollection = this.outbound.TempMeterials.filter(d =>
                d.Item.ITEMCODE == deletedItem.ITEMCODE &&
                d.Meterial.LOTNO == deletedItem.LOTNO &&
                d.Meterial.BINNO == deletedItem.BINNO && d.Order.DOCNUM == this.orderNumber
              );
              if (ObjectFromTempCollection != undefined && ObjectFromTempCollection != null && ObjectFromTempCollection.length > 0)
                deletedTempObjectsList.push(ObjectFromTempCollection[0])
            }
            //=======collection of deleted temp items from pallet end==========


            //======update the quantity of items on rows after delete pallet start.=======
            for (let i = 0; i < this.soItemsDetail.length; i++) {
              var qty = 0;
              for (let j = 0; j < deletedTempObjectsList.length; j++) {
                if (deletedTempObjectsList[j].Meterial.ITEMCODE == this.soItemsDetail[i].ITEMCODE &&
                  deletedTempObjectsList[j].Order.DOCNUM == this.orderNumber) {
                  var qty = Number.parseInt(this.soItemsDetail[i].RPTQTY) - deletedTempObjectsList[j].Meterial.MeterialPickQty;
                  this.soItemsDetail[i].RPTQTY = qty;
                }
              }
            }
            //======update the quantity of items on rows after delete pallet end.=======



            //=================code to remove pallet items from saved pallet items list.
            var dbPalletItems = this.outbound.PalletItems;
            for (let a = 0; a < dbPalletItems.length; a++) {
              if (dbPalletItems[a].Pallet == removedPallet) {
                dbPalletItems.splice(a, 1);
                a--;
              }
            }
            this.outbound.PalletItems = dbPalletItems;
            this.savedPalletItems = this.outbound.PalletItems;

            localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
            //this.palletList.splice(this.rowindex, 1);
            // this.palletList = this.savedPalletItems;
            this.showSelectedPallets();
            //==========remove the deleted items from tempArray start============
            var SavedTempItemsList = this.outbound.TempMeterials;

            for (let index = 0; index < deletedTempObjectsList.length; index++) {
              for (let index1 = 0; index1 < SavedTempItemsList.length; index1++) {
                if (SavedTempItemsList[index1].Meterial.ITEMCODE == deletedTempObjectsList[index].Meterial.ITEMCODE &&
                  SavedTempItemsList[index1].Meterial.LOTNO == deletedTempObjectsList[index].Meterial.LOTNO &&
                  SavedTempItemsList[index1].Meterial.BINNO == deletedTempObjectsList[index].Meterial.BINNO &&
                  SavedTempItemsList[index1].Order.DOCNUM == this.orderNumber) {
                  SavedTempItemsList.splice(index1, 1);
                  index1--;//if(index1>0)

                }
              }
            }
            //==========remove the deleted items from tempArray end ============
            this.outbound.TempMeterials = SavedTempItemsList;
            localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
          }

          // remove pallet which is not compitable.
          //this.removePallet(removedPallet);
          // this.palletNo = "";
          break;
        case ("deleteAll"):
          this.deleteAllOkClick();
          break;
        case ("Delivery"):
          this.deleiver();
          break;
        case ("Transfer ITR"):
          this.deleiver();
          break;
        case ("ClearTempArray"):

             let obd = localStorage.getItem(CommonConstants.OutboundData);
            if (obd != undefined && obd != '') {
              this.outbound = JSON.parse(obd);
              // clear temp data if user do not want to save it or add to deliver it.
              this.outbound.TempMeterials =[];
              localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
            }
            if(this.fromEvent =="backArrow"){
              this.router.navigate(["home/outbound/outcustomer", { skipLocationChange: true }])  
            }else if(this.fromEvent =="backArrow"){

            }
            
            this.fromEvent =  "";
            break;
      }
    } else {
      if ($event.Status == "no") {
        switch ($event.From) {
          case ("delete"):
            break;
          case ("deleteAll"):
            break;
          case ("Delivery"):
            this.deleiver(this.outbound.OrderData.DOCNUM);
            break;
          case ("ClearTempArray"):
                this.fromEvent =  "";
                break;
        }
      }
    }
  }
  getItemListForDeletedPallet(deletedPallet) {

  }

  isPalletExistInPalletList(pallet: String) {
    for (let i = 0; i < this.palletList.length; i++) {
      if (this.palletList[i].Pallet == pallet) {
        return true;
      }
    }
    return false;
  }

  deleteAllOkClick() {
    // this.palletList = [];
    document.getElementById("modalCloseBtn").click();
  }

  public close(component) {
    this[component + 'Opened'] = false;
  }

  //--------------------------item scanning-----

  ItemCode: string;
  public onItemChange() {
    if (this.selectedCustomer != null && this.selectedCustomer != undefined
      && this.selectedCustomer.CustomerCode != '' && this.selectedCustomer.CustomerCode != null) {

      if (this.orderNumber != null && this.ItemCode != null) {
        this.outboundservice.GetItemCode(this.ItemCode).subscribe(
          resp => {
            if (resp != null && resp.length > 0) {
              this.ItemCode = resp[0].ItemCode;

              var index = -1;
              for(var i=0; i<this.soItemsDetail.length; i++){
                if(this.ItemCode == this.soItemsDetail[i].ITEMCODE){
                  index = i;
                }
              }
              if(index == -1){
                this.toastr.error('', this.translate.instant("Outbound_NoDataFound"));
              }else{
                document.getElementById("itemcodeid").focus();
                this.openNextScreen(index);
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
    }
    else {
      this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
      this.showLookupLoader = false;
      this.showLookup = false;
    }
  }

  onITRlookupClick() {
  //  console.log("item docEntry click :");
    this.showLookupLoader = true;
    this.inventoryTransferService.GetITRList().subscribe(
      (data: any) => {
        this.showLookupLoader = false;
      //  console.log("get ITR response:");
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.serviceData = data.Table;
        //  console.log("get polist response serviceData:", this.serviceData);
          this.lookupfor = "ITRList";
          this.showLookup = true;
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLookupLoader = false;
        console.log("Error: ", error);
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  onITRChange() {
   if(this.docNum == null || this.docNum == undefined || this.docNum == ""){
      return;
   }

   // console.log("onITRChange :");
    this.showLookup = false;
    this.showLookupLoader = true;
    this.inventoryTransferService.IsValidITR(this.docNum).subscribe(
      (data: any) => {
        this.showLookupLoader = false;
     //   console.log("get ITR response:");
        if (data != undefined && data != null) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.resetITRFields();
          //
          if(data.Table!=undefined && data.Table.length > 0){
            this.toWhse = data.Table[0].ToWhsCode;
            this.itrCode = data.Table[0].DocEntry;
            this.docNum = data.Table[0].DocNum;
            this.orderNumber = this.itrCode;
            this.outbound.ITRToBinNo = {
            ToBin: this.toBinNo,
            ToWhse: this.toWhse
          };
          localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
          this.getITRItemList();
          } else {
            this.docNum = ''
            this.itrCode = "";
            this.toastr.error('', this.translate.instant("InvTransfer_InvalidITR"));
            this.DocNum.nativeElement.focus();
          }
        } else {
          this.docNum = ''
          this.itrCode = ""; 
          this.toastr.error('', this.translate.instant("InvTransfer_InvalidITR"));
          this.DocNum.nativeElement.focus();
        }
      },
      error => {
        this.showLookupLoader = false;
        console.log("Error: ", error);
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
    }

    getITRItemList() {
      if (this.itrCode) {
        
        let tempOrderData: any = this.outbound.OrderData;
        if (this.itrCode) {
          tempOrderData = {
            CARDCODE: this.outbound.CustomerData.CustomerCode,
            CARDNAME: this.outbound.CustomerData.customerName,
            CUSTREFNO: "",
            DOCDUEDATE: "04/24/2019",
            DOCNUM: this.itrCode,
            SHIPPINGTYPE: "",
            SHIPTOCODE: ""
          };
        }

      this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();
      this.showLookupLoader = true;
      this.inventoryTransferService.GetITRItemList(this.itrCode).subscribe(
        data => {
          this.showLookupLoader = false;
          if (data != null && data != undefined) {
            data = data["Table"];
            if (data.length > 0) {
              // When order num from text box.
              this.outbound.OrderData = tempOrderData;
              this.orderNumber = this.itrCode;
              this.soItemsDetail = data;
              if (this.soItemsDetail.length > this.pageSize) {
                this.pagable = true;
              }
              this.showLookupLoader = false;
              if (this.soItemsDetail.length === 0) {
                this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
                this.showLookupLoader = false;
              }
              this.calculatePickQty();


              localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));

              this.showSOIetDetail = true;
              this.showLookupLoader = false;
            }
            else {
              this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
            }
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
    }

    OnBinLookupClick() {
      this.showLookupLoader = true;
      this.showLookup = false;
      this.inventoryTransferService.getToBin("", this.toWhse).subscribe(
        data => {
          this.showLookupLoader = false;
          if (data != null) {
            if (data.length > 0) {
              this.showLookup = true;
              this.serviceData = data;
              this.lookupfor = "toBinsList";
            }
            else {
              this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
            }
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
  
    OnBinChange() {
      if (this.toBinNo == "" || this.toBinNo == undefined) {
        return;
      }
      this.showLookupLoader = true;
      this.inventoryTransferService.isToBinExist(this.toBinNo, this.toWhse).subscribe(
        data => {
          this.showLookupLoader = false;
          if (data != null) {
            if (data.length > 0) {
              if (data[0].Result == "0") {
                this.toastr.error('', this.translate.instant("INVALIDBIN"));
                return;
              }
              else {
                this.toBinNo = data[0].ID;
                this.outbound.ITRToBinNo = { 
                  ToBin: this.toBinNo,
                  ToWhse: this.toWhse
                };
                localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
              }
            }
            else {
              this.toBinNo = "";
              this.toastr.error('', this.translate.instant("INVALIDBIN"));
              return;
            }
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
    
  submitITR(){
    if (this.outbound != null && this.outbound != undefined
      && this.outbound.DeleiveryCollection != null
      && this.outbound.DeleiveryCollection != undefined
      && this.outbound.DeleiveryCollection.length > 0) {

      if (this.itrCode !== undefined && this.itrCode !== null) {
        this.outbound.DeleiveryCollection = this.outbound.DeleiveryCollection.filter(d => d.Order.DOCNUM === this.itrCode);
      }
    var oWhsTransAddLot: any = {};
    oWhsTransAddLot.Header = [];
    oWhsTransAddLot.Detail = [];
      oWhsTransAddLot.UDF = [];

      let limit = -1;

      this.showLookupLoader = true;
      // Loop through delivery collection 
      for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {

        var selectedDelivery = this.outbound.DeleiveryCollection[index];
        //=========filter  collection docnum, docentry, tracking wise.
        let lineDeleiveryCollection = this.outbound.DeleiveryCollection.filter(d =>
          selectedDelivery.Order.DOCNUM === d.Order.DOCNUM &&
          selectedDelivery.Item.DOCENTRY === d.Item.DOCENTRY &&
          selectedDelivery.Item.TRACKING === d.Item.TRACKING
        );
        //=========filter  collection docnum, docentry, tracking wise.
        //=============== Adding Detail Objects logic==================
        for (let hIdx = 0; hIdx < lineDeleiveryCollection.length; hIdx++) {
          let o = lineDeleiveryCollection[hIdx];
          let hasDetail = false;
          for (let dIdx = 0; dIdx < oWhsTransAddLot.Detail.length; dIdx++) {
            let selectedDetl = oWhsTransAddLot.Detail[dIdx];
            if (selectedDetl.LotNo === o.Meterial.LOTNO && selectedDetl.BinNo === o.Meterial.BINNO) {
              hasDetail = true;
            }
          }
          
          if (hasDetail == false) {
            var ind = 0;
            if(o.Meterial.PALLETNO == null || o.Meterial.PALLETNO == undefined || o.Meterial.PALLETNO == ""){

            } else {
              ind = o.Meterial.LOTNO.lastIndexOf(o.Meterial.PALLETNO)
              console.log("pallet index "+o.Meterial.PALLETNO+" ind="+ind);
            }
            
            var toBinNo = "";
            if(o.Meterial.ToBin == undefined || o.Meterial.ToBin == null || o.Meterial.ToBin == ""){
              toBinNo = o.Item.ToBin;
            } else {
              toBinNo = o.Meterial.ToBin;
            }
            var mfrno="";
            if(ind != 0){
              mfrno = o.Meterial.LOTNO.substring(0, ind);
            } else {
              mfrno = o.Meterial.LOTNO;
            }
            
            var dtl = {
            UsernameForLic: localStorage.getItem("UserId"),
            LineNo: o.Item.LINENUM,
            LotNo: o.Meterial.LOTNO,
            ItemCode: o.Item.ITEMCODE,
            ItemName: o.Item.ITEMNAME,
            Qty: o.Meterial.MeterialPickQty,
            SysNumber: o.Meterial.SYSNUMBER,
            BinNo: o.Meterial.BINNO,
            ToBin: toBinNo,
            Tracking: o.Item.TRACKING,
            WhsCode: o.Item.WHSCODE,
            OnHandQty: o.Item.QUANTITY,
            Remarks: "",
            PalletCode: o.Meterial.PALLETNO,
            MfrNo: mfrno,
            BaseLine: o.Item.LINENUM
            };
            // dtl.parentLine = o.Item.LineNo;
            oWhsTransAddLot.Detail.push(dtl);
          }
          limit = limit + lineDeleiveryCollection.length;
        }
    }

      let hdr = {
        //whseId changed by hari for send logged in whse
        WhseCode: localStorage.getItem("whseId"),
        ToWhsCode: this.toWhse,
        Type: "",
        DiServerToken: localStorage.getItem("Token"),
        CompanyDBId: localStorage.getItem("CompID"),
        TransType: "WHS",
        GUID: localStorage.getItem("GUID"),
        UsernameForLic: localStorage.getItem("UserId"),
        BaseEntry: this.itrCode,
        BaseType: "1250000001"
      };
      oWhsTransAddLot.Header.push(hdr);

      console.log("itrTransferToken: "+JSON.stringify(oWhsTransAddLot));


      // Transfer ITR
    this.inventoryTransferService.submitITByITR(oWhsTransAddLot).subscribe(
      data => {
        this.showLookupLoader = false;
          if (data!=null && data.length > 0) {
            if (data[0].ErrorMsg != undefined) {
              if (data[0].ErrorMsg == "7001") {
                this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                  this.translate.instant("CommonSessionExpireMsg"));
                return;
              }
            }

            if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
              this.toastr.success('', this.translate.instant("InvTransfer_ITRTransferSuccess") + " : " + data[0].SuccessNo);
              localStorage.setItem(CommonConstants.OutboundData, null);
              this.resetITRFields();
              this.itrCode = ''
              this.orderNumber = ''
              //reset global object for itr success.====
              this.outbound = new OutboundData();
              this.outbound.ITRToBinNo = { ToBin: "" };
              var customerCode = "";
              var customerName = "";
              this.outbound.CustomerData = { CustomerCode: customerCode, CustomerName: customerName, TrackingId: "", CustRefNo: "" };
            } else {
              this.toastr.error('', data[0].ErrorMsg);
            }
          }
      },
      error => {
        this.showLookupLoader = false;
          console.log(error);
        }
      );
  }
}
  

  resetITRFields(){
    //Due to single ITR, we reset ITR related local storage collection
    this.itemsByPallet = [];
    this.selectedPallets = [];
    this.palletList = [];
    this.soItemsDetail = [];
    this.savedPalletItems = [];
    this.palletNo = '';
    // this.toBinNo = '';
    this.ItemCode = '';
        
    let outbound: OutboundData = new OutboundData();
    outbound.ITRToBinNo = { ToBin: "" };
    var customerCode = "";
    var customerName = "";
    outbound.CustomerData = { CustomerCode: customerCode, CustomerName: customerName, TrackingId: "", CustRefNo: "" };
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
  }

  itrClick(rowindex, gridData: any) {
    this.gridData = gridData;
    this.rowindex = rowindex;
    this.showDialog("Transfer ITR", this.translate.instant("yes"), this.translate.instant("no"),
      this.translate.instant("InvTransfer_SubmitITRMsg"));
  }

  cancel(){
    localStorage.setItem(CommonConstants.OutboundData, null)
    this.router.navigate(['home/dashboard']);
  }


  onHiddenOutOrderItemCodeScanClick(){
    var inputValue = (<HTMLInputElement>document.getElementById('outOrderItemcodeinput')).value;
    if (inputValue.length > 0) {
      this.ItemCode = inputValue;
    }
    this.onItemChange();
  }

  onHiddenOutOrderPalletScanClick(){
    var inputValue = (<HTMLInputElement>document.getElementById('outOrderPalletNoInput')).value;
    if (inputValue.length > 0) {
      this.palletNo = inputValue;
    }
    this.onPalletChange();
  }
  
  onHiddenOutOrderSOScanClick(){
    var inputValue = (<HTMLInputElement>document.getElementById('OutOrderOrderNoInput')).value;
    if (inputValue.length > 0) {
      this.orderNumber = inputValue;
    }
    this.onOrderNoBlur();
  }

  onHiddenITRScanClick(){
    var inputValue = (<HTMLInputElement>document.getElementById('outOrderItrCodeInput')).value;
    if (inputValue.length > 0) {
      this.itrCode = inputValue;
    }
    this.onITRChange();
  }
}