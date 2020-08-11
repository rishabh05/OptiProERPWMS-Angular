import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ProductionService } from 'src/app/services/production.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { RowClassArgs } from '@progress/kendo-angular-grid';
import { TranslateService } from '../../../../../node_modules/@ngx-translate/core';
import { ToastrService } from '../../../../../node_modules/ngx-toastr';
import { ProductionIssueComponent } from 'src/app/production/production-issue/production-issue.component';
import { OutboundData } from 'src/app/models/outbound/outbound-data';
import { CommonConstants } from 'src/app/const/common-constants';
import { Lot, Item, ProductionIssueModel } from 'src/app/models/Production/IFP';


@Component({
  selector: 'app-prod-orderlist',
  templateUrl: './prod-orderlist.component.html',
  styleUrls: ['./prod-orderlist.component.scss']
})
export class ProdOrderlistComponent implements OnInit {
  showLookupLoader: boolean = true;
  serviceData: any[];
  lookupfor: string;
  orderNo: string;
  showSOIetDetail: boolean = false;
  soItemsDetail: any;
  showLoader: boolean = false;
  public orderNumber: string;
  prodOrderlist: boolean = true;
  public outbound: OutboundData = new OutboundData();

  pagable: boolean = false;
  pageSize: number = Commonservice.pageSize;
  @ViewChild('scanOrderNo') scanOrderNo;

  showConfirmDialog: boolean = false;
  constructor(private router: Router, private productionService: ProductionService, public productionIssueComponent: ProductionIssueComponent,
    private toastr: ToastrService, private translate: TranslateService, private commonservice: Commonservice) { }

  ngOnInit() {


    let outboundData: string = localStorage.getItem("OutboundData");
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);

      if (this.outbound != null && this.outbound.OrderData !== undefined && this.outbound.OrderData !== null && this.outbound.OrderData["Order No"] !== undefined && this.outbound.OrderData["Order No"] !== null) {
        this.orderNumber = this.outbound.OrderData["Order No"];
        this.orderNo = this.outbound.OrderData["Order No"];
        this.getItemListForOrder();

      }
      this.calculatePickQty();
    }
  }

  ngAfterViewInit(): void{
    this.scanOrderNo.nativeElement.focus()
  }

  onCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

  getOrderList() {
    this.showLoader = true;
    this.productionService.GetBatchesForProductionIssueWithProcessCell().subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != null) {
          if (data.length > 0) {
            // -------------------Check For Licence---------------
            if (data[0].ErrorMsg != undefined) {
              if (data[0].ErrorMsg.length > 0) {
                this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                  this.translate.instant("CommonSessionExpireMsg"));
                return;
              }
            }
            this.showLookupLoader = false;
            this.serviceData = data;
            this.lookupfor = "PIOrderList";
          }
          else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        }
      },
      error => {
        this.showLoader = false;
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      }
    );
  }

  showAddToMeterialAndDelevery() {
    let dBit: boolean = false;

    if (this.outbound && this.outbound.TempMeterials) {
      let data = this.outbound.TempMeterials.filter(tm => tm.Order["Order No"] === this.orderNo);
      dBit = data.length > 0
    }
    else {
      dBit = false;
    }
    return dBit;
  }


  getItemListForOrder(fromIssueProduction: boolean = false, fromsearchButtonClick: boolean = false) {
    if (fromsearchButtonClick && this.outbound != null) {
      
      let outboundTempData: OutboundData = new OutboundData()
      outboundTempData.OrderData = this.outbound.OrderData;
      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outboundTempData));
    } 
    this.soItemsDetail = []; 

    if(this.orderNumber == null || this.orderNumber == undefined || this.orderNumber == ""){
      return ;
    }
    this.showLoader = true;
    this.productionService.GetBOMItemForProductionIssue(this.orderNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != null) {
          if (data.length > 0) {
            // -------------------Check For Licence---------------
            if (data[0].ErrorMsg != undefined) {
              if (data[0].ErrorMsg.length > 0) {
                this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                  this.translate.instant("CommonSessionExpireMsg"));
                return;
              }
            }
            this.showSOIetDetail = true;
            this.soItemsDetail = data;
            for (var i = 0; i < data.length; i++) {
              this.soItemsDetail[i].ITEMCODE = data[i].ItemCode;
              this.soItemsDetail[i].RPTQTY = data[i].IssuedQty;
              this.soItemsDetail[i].OPENQTY = data[i].BalQty;
              this.soItemsDetail[i].DOCENTRY = data[i].DocEntry;
            }
            if (this.soItemsDetail.length > this.pageSize) {
              this.pagable = true;
            } else {
              this.pagable = false;
            }
            //this.getLookupKey()
            this.calculatePickQty()
          }
          else {
            if (fromIssueProduction) {
              this.orderNo = this.orderNumber = ""
              this.soItemsDetail = [];
            }
            else {
              this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
              this.soItemsDetail = [];
              this.orderNo = ''
              //this.scanOrderNo.nativeElement.focus();
            }
          }
        }
      },
      error => {
        this.showLoader = false;
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      }
    );
  }

  public openPOByUOM(selectdeData: any) {

    // let selectdeData = selection.selectedRows[0].dataItem;
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);

    if (outboundData != undefined && outboundData != '' && outboundData != null && outboundData != 'null') {
      this.outbound = JSON.parse(outboundData);
      this.outbound.SelectedItem = selectdeData;
      //lsOutbound
      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      this.prodOrderlist = false;
    }
  }

  getLookupKey(lookupValue: any) {
    this.orderNo = lookupValue["Order No"];

    if (this.outbound == null) {
      this.outbound = new OutboundData();
    }
    this.outbound.OrderData = lookupValue;
    this.orderNumber = this.outbound.OrderData.RefDocEntry;
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
    localStorage.setItem("ComingFrom", "ProductionIssue");
    // this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();

    this.getItemListForOrder(false, true);
    this.scanOrderNo.nativeElement.focus()
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

  onBackToScreen(event: any) {

    // Issue
    if (event.fromwhere == 1) {
      let outboundData: string = localStorage.getItem("OutboundData");
      debugger;
      if (outboundData != undefined && outboundData != '') {
        this.outbound = JSON.parse(outboundData);

        if (this.outbound != null && this.outbound.OrderData !== undefined && this.outbound.OrderData !== null && this.outbound.OrderData["Order No"] !== undefined && this.outbound.OrderData["Order No"] !== null) {
          this.orderNumber = this.outbound.OrderData["Order No"];
          this.orderNo = this.outbound.OrderData["Order No"];
          this.getItemListForOrder(true);

        }
        this.calculatePickQty();
      }
      this.prodOrderlist = !this.prodOrderlist;
    }

    // Save
    else if (event.fromwhere == 2) {
      this.ngOnInit()
      this.prodOrderlist = !this.prodOrderlist;
    }
    // cancel
    else {
      this.prodOrderlist = !this.prodOrderlist;
    }


  }

  public calculatePickQty() {

    if (this.soItemsDetail) {

      for (let i = 0; i < this.soItemsDetail.length; i++) {
        const soelement = this.soItemsDetail[i];
        var totalPickQty: number = 0;

        if (this.outbound && this.outbound.TempMeterials && 
          this.outbound.TempMeterials.length > 0) {

          for (let j = 0; j < this.outbound.TempMeterials.length; j++) {

            const element = this.outbound.TempMeterials[j];
            //console.log("My Element", element);
            if (soelement.ITEMCODE === element.Item.ITEMCODE && soelement.DOCENTRY === element.Item.DOCENTRY) {
              var no: any= Number(element.Meterial.MeterialPickQty);
              totalPickQty = totalPickQty + no; 
            }
          }
        } 

        // Total Qty of Item
        soelement.RPTQTY = totalPickQty;
        this.soItemsDetail[i] = soelement;

      }

    }


  }

  // Issue For Production
  public submitProduction(orderId: any = null) {
    this.addToDeleiver(false);
    this.prepareDeleiveryCollectionAndDeliver(orderId);
  }

  public addToDeleiver(goToCustomer: boolean = true) {
    this.showLoader = true;

    //lsOutbound
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);

    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);

      this.prepareDeleiveryTempCollection();

      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));

      this.showLoader = false;
    }
  }

  prepareDeleiveryTempCollection() {
    if (this.outbound) {
      let tempMeterialCollection: any[] = this.outbound.TempMeterials;

      for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {

        const d = this.outbound.DeleiveryCollection[index];

        for (let j = 0; j < tempMeterialCollection.length; j++) {

          const element = tempMeterialCollection[j];

          if (d.Item.DOCENTRY == element.Item.DOCENTRY) {

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
            d.Item.ItemCode === tm.Item.ItemCode &&
            d.Item.TRACKING === tm.Item.TRACKING &&
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

  prepareDeleiveryCollectionAndDeliver(orderId: any) {

    if (this.outbound != null && this.outbound != undefined
      && this.outbound.DeleiveryCollection != null && this.outbound.DeleiveryCollection != undefined
      && this.outbound.DeleiveryCollection.length > 0
    ) {

      if (orderId !== undefined && orderId !== null) {
        this.outbound.DeleiveryCollection = this.outbound.DeleiveryCollection.filter(d => d.Order.DOCNUM === orderId);
      }

      let arrIssues: Item[] = [];
      let arrLots: Lot[] = [];
      let prodIssueModel: ProductionIssueModel = new ProductionIssueModel();

      // Hdr
      let comDbId = localStorage.getItem('CompID');
      let token = localStorage.getItem('Token');
      let guid: string = localStorage.getItem('GUID');
      let uid: string = localStorage.getItem('UserId');
      let hdrLine: number = 0;
      let limit = -1;
      let hdrLineVal = -1;
      let refLineNo = 0;

      this.showLoader = true;
      // Loop through delivery collection 
      for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {

        //get first item from collection        
        const element = this.outbound.DeleiveryCollection[index];

        // let coll=Get all Item for Item.Lineno===i
        let lineDeleiveryCollection = this.outbound.DeleiveryCollection.filter(d =>
          element.Order.DOCNUM === d.Order.DOCNUM &&
          element.Item.DOCENTRY === d.Item.DOCENTRY &&
          element.Item.TRACKING === d.Item.TRACKING &&
          element.Item.LineId === d.Item.LineId 
        );

        // Process Order Item and Tracking collection
        for (let hIdx = 0; hIdx < lineDeleiveryCollection.length; hIdx++) {
          const o = lineDeleiveryCollection[hIdx];

          // check hdr exists
          let existHdr = false;
          for (let index = 0; index < arrIssues.length; index++) {
            const h = arrIssues[index];
            if (h.DOCENTRY === o.Item.DOCENTRY
              && h.ItemCode === o.Item.ITEMCODE
              && h.Tracking === o.Item.TRACKING) {
              existHdr = true;
              break;
            }
          }

          if (existHdr == false) {

            // Add Header here and then add 
            hdrLineVal = hdrLineVal + 1;

            let item: Item = new Item();

            item.DiServerToken = token;
            item.CompanyDBId = comDbId;
            item.Transaction = "ProductionIssue"
            item.RECUSERID = item.LoginId = item.UsernameForLic = uid
            item.DOCENTRY = o.Item.DOCENTRY;
            item.ItemCode = o.Item.ITEMCODE;
            item.Tracking = o.Item.TRACKING;
            item.RefLineNo = o.Item.RefLineNo;
            item.BATCHNO = o.Order["Order No"]
            refLineNo = item.RefLineNo;
            item.ONLINEPOSTING = null
            let metQty = lineDeleiveryCollection.map(i => i.Meterial.MeterialPickQty).reduce((sum, c) => sum + c);
            item.DBIssuedQty = o.Item.IssuedQty
            item.U_O_ACTISSQTY = metQty
            item.U_O_PLNISSQTY = o.Item.ActualQty
            item.U_O_BALQTY = o.Item.BalQty
            item.FGWAREHOUSE = item.U_O_ISSWH = o.Item.WhsCode;
            item.RefDocEntry = o.Order.RefDocEntry.toString();
            item.GUID = guid;
            item.LineId = o.Item.LineId;
            item.LineNo = hdrLineVal;
            item.IssuedQty = "0.000"

            arrIssues.push(item);
          }

          // check weather item existe or not 
          let hasDetail = false;
          for (let index = 0; index < arrLots.length; index++) {
            const element = arrLots[index];
            if (element.LotNumber === o.Meterial.LOTNO && element.Bin === o.Meterial.BINNO && element.LineNo === refLineNo) {
              hasDetail = true;
              break;
            }
          }

          if (hasDetail == false) {
            // Add Detail here 
            let dtl: Lot = new Lot();

            dtl.Bin = o.Meterial.BINNO;
            dtl.LotNumber = o.Meterial.LOTNO;
            dtl.LotQty = o.Meterial.MeterialPickQty + "";
            dtl.LOTSIGMASTATUS = 'N'
            dtl.LineNo = refLineNo;
            dtl.SYSNUMBER = o.Meterial.SYSNUMBER

            arrLots.push(dtl);
          }

          limit = limit + lineDeleiveryCollection.length;


        }
      }

     // console.log("Dtl", arrLots);
     // console.log("hdr", arrIssues);

      if (arrIssues.length > 0 && arrLots.length > 0) {
        prodIssueModel.Items = arrIssues;
        prodIssueModel.Lots = arrLots;
      }

      this.productionService.submitProduction(prodIssueModel).subscribe(
        data => {
          if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
            this.showLoader = false;
            this.toastr.success('', this.translate.instant("ProdIssue_ProductionIssueSuccess") + " : " + data[0].SuccessNo);

            this.resetIssueProduction();

          } else if (data[0].ErrorMsg == "7001") {
            this.showLoader = false;
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          else {
            this.showLoader = false;
            this.toastr.error('', data[0].ErrorMsg);

            // Reset All meterial on error.
            this.outbound.DeleiveryCollection = []
            this.outbound.SelectedMeterials = []
            this.outbound.TempMeterials = []
            localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));

            this.getItemListForOrder();


          }
        },
        error => {
          this.showLoader = false;
          if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
            this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
         } 
         else{
          this.toastr.error('', error);
         }
        }

      );
      //console.log("shdr", arrIssues);
    }
  }

  resetIssueProduction() {
    let data: OutboundData = this.outbound
    this.outbound = new OutboundData();
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
    this.orderNo = ""
    this.soItemsDetail = []
  }

  onHiddenProdOrderScanClick(){
    var inputValue = (<HTMLInputElement>document.getElementById('prodOrder_OrderNoScanInput')).value;
    if (inputValue.length > 0) {
      this.orderNo = inputValue;
    }
    this.getItemListForOrder();
  }

}
