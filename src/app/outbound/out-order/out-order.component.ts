import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
  constructor(private outboundservice: OutboundService, private router: Router, private commonservice: Commonservice, private toastr: ToastrService, private translate: TranslateService) { }

  savedPalletItems: any;

  showTemporaryViews: boolean = false;
  temoraryHideItemLookupRow: boolean = false;
  ngOnInit() {
    // lsOutbound
    console.log("from where",this.fromWhere);   
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    console.log("Order:data", outboundData);
    if (outboundData != null && outboundData != undefined && outboundData != '' && outboundData != 'null') {
      this.outbound = JSON.parse(outboundData);
      this.selectedCustomer = this.outbound.CustomerData;
      if (this.outbound.OrderData !== undefined && this.outbound.OrderData !== null
        && this.outbound.OrderData.DOCNUM !== undefined && this.outbound.OrderData.DOCNUM !== null) {
        this.orderNumber = this.outbound.OrderData.DOCNUM;
        this.openSOOrderList(); 
        // if(localStorage.getItem("IsSOAvailable") == "True"){
        //   this.openSOOrderList(this.orderNumber);
        //   localStorage.setItem("IsSOAvailable", "False");
        //   this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();
        // }else{ 
        //   this.openSOOrderList(); 
        // }
         
        this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();
      }
      this.calculatePickQty();
    }

    this.setSavedPelletDataToGrid();
   // document.getElementById("itemcodeid").focus();
  }

  /* this method set the update data to array to display in grid.
  */
  setSavedPelletDataToGrid() {
    this.savedPalletItems = [];
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    console.log("Order:data", outboundData);
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


  onOrderNoBlur() {
    if (this.orderNumber)
      this.openSOOrderList(this.orderNumber);
  }

  public openOrderLookup() {
    if (this.selectedCustomer != null && this.selectedCustomer != undefined
      && this.selectedCustomer.CustomerCode != '' && this.selectedCustomer.CustomerCode != null) {

      let whseId = localStorage.getItem("whseId");
      this.outboundservice.getCustomerSOList(this.selectedCustomer.CustomerCode, "", whseId).subscribe(
        resp => {
          if (resp != null) {
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
            this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
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


  // getLookupValue(lookupValue: any) {
  //   this.outbound.OrderData = lookupValue;
  //   this.orderNumber = this.outbound.OrderData.DOCNUM;
  //   // lsOutbound
  //   localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
  //   this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();
  // }
  selectedPallets: any = [];
  getLookupValue(lookupValue: any) {
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
      } else {
        if (this.lookupfor == "out-order") {
          this.outbound.OrderData = lookupValue;
          this.orderNumber = this.outbound.OrderData.DOCNUM;
          // lsOutbound
          localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
          this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();
          this.openSOOrderList();
        } else {
          if (this.lookupfor == "ItemsList") {
            this.selectedItem = lookupValue.ITEMCODE;
          }
        }
      }
    }
  }

  public openPOByUOM(selection: any) {
    let selectdeData = selection.selectedRows[0].dataItem;
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      this.outbound.SelectedItem = selectdeData;
      if (this.soItemsDetail.length > 0) {
        this.outbound.SelectedItem = this.soItemsDetail[selection.index];
      }
      // this.outbound.TempMeterials = [];
      //this.addMetToTempCollection(this.outbound);
      // this.addMetToTempCollectionRe(this.outbound);
      //lsOutbound
      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      this.router.navigateByUrl('home/outbound/outprodissue', { skipLocationChange: true });
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
              this.showLookupLoader = false;
              return;
            }

          // When order num from text box.
          this.outbound.OrderData = tempOrderData;
          this.soItemsDetail = resp.RDR1;
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
  }

  public deleiver(orderId: any = null) {
    //this.showLookupLoader = true;
    this.callPrepareDeleiveryTempCollectionMethod();
    //this.addToDeleiver(false);
    this.prepareDeleiveryCollectionAndDeliver(orderId);
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
            console.log("My Element", element);
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
            if (h.SONumber === o.Order.DOCNUM && h.ItemCode === o.Item.ITEMCODE &&
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
            hdr.SONumber = o.Item.DOCENTRY;
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
      // this.showLookupLoader = false;
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

  deliveryConfirmation() {
    this.showConfirmDialog = true;
  }


  getPalletData() {
    if (this.containPallet()) {
      this.toastr.error('', this.translate.instant("Plt_AlreadySelected"));
      return;
    }
    this.commonservice.GetPalletDataForOutBound(this.palletNo).subscribe(
      (data: any) => {
        console.log(data);
        if (data != null) {
          this.itemsByPallet = data;
          this.addPalletData()
          // this.managePickQuantity();
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          return;
        }
        this.showLookupLoader = false;
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
    this.showLookupLoader = true;
    var itemCodeArray = Array.prototype.map.call(this.soItemsDetail, function (item) { return "'" + item.ITEMCODE + "'"; }).join(",");
    this.commonservice.GetPalletListForOutBound(itemCodeArray).subscribe(
      (data: any) => {
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            this.showLookupLoader = false;
            console.log(data);
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
    var itemCodeArray = Array.prototype.map.call(this.soItemsDetail, function (item) { return "'" + item.ITEMCODE + "'"; }).join(",");
    this.commonservice.IsPalletValidForOutBound(this.palletNo, itemCodeArray).subscribe(
      (data: any) => {
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            this.palletNo = data[0].Code;
            this.getPalletData();
          } else {
            this.toastr.error('', this.translate.instant("InValidPalletNo"));
            this.palletNo = "";
            return;
          }
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          this.palletNo = "";
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
    console.log("pallet list: " + JSON.stringify(this.palletList));
  }

  DeliveryClick(rowindex, gridData: any) {
    this.gridData = gridData;
    this.rowindex = rowindex;
    this.showDialog("Delivery", this.translate.instant("yes"), this.translate.instant("no"),
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

}