import { Component, OnInit } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ProductionService } from 'src/app/services/production.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-production-receipt-items-list',
  templateUrl: './production-receipt-items-list.component.html',
  styleUrls: ['./production-receipt-items-list.component.scss']
})
export class ProductionReceiptItemsListComponent implements OnInit {

  orderNoListSubs: ISubscription;
  binListSubs: ISubscription;
  public prodReceiptComponent: any = 1;
  orderNumber: string = "";
  item: string = "";
  showLookupLoader: boolean = true;

  serviceData: any[];
  showLoader: boolean = false;
  lookupfor: string;

  constructor(private router: Router, private commonservice: Commonservice,
    private toastr: ToastrService, private translate: TranslateService,
    private productionService: ProductionService) { }

  ngOnInit() {
  }



  getProductionDetail() {
    if (this.orderNumber == "") {
      this.toastr.error('', this.translate.instant("OrderNoBlank"));
      return;
    }

    this.gridData = [];
    this.gridDataNew = [];
    this.resetOnSerchClick();
    this.orderNoListSubs = this.productionService.GetItemsDetailForProductionReceipt(this.orderNumber).subscribe(
      data => {
        //this.displayFormAndSubmit = true; 
        //prepare data for grid.
        //if(data.Table.length>0)
     

        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data.Table != undefined && data.Table != null && data.Table != "" && data.Table.length > 0) {
            this.showLookupLoader = false;
            // prepare data if its comming proper froms server
            this.gridData = data.Table;
            this.prepareDataForGrid(this.gridData);
            //  this.itemDataResponse =  data.Table[0];
            //  this.shouldShowExpiryDate = true;

            //if("N" == this.itemDataResponse.TRACKING){
            // this.shouldShowExpiryDate = false;
            //}
            //this.setFormData(data.Table[0]);          
            return;
          } else {
            this.toastr.error('', this.translate.instant("OrderNotExistMessge"));
            this.orderNumber = "";
          }
        }
      },
      error => {
        this.toastr.error('', error);
      },
    );

    this.binListSubs = this.productionService.GetBinsList().subscribe(
      data => {
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data != undefined && data != null && data != "") {
            // this.binList = data;
            // this.binNo = this.binList[0].BINNO;
            // this.whsCode = this.binList[0].WHSCODE;
            return;
          }
        }
      },
      error => {
        this.toastr.error('', error);
      });
  }
  pagable: boolean = false;
  pageSize: any = 10;
  gridData: any[] = [];
  isRejectQtyAvailable: boolean = false;
  gridDataNew: any[] = [];
  gridDataAvailable: boolean = false;
  prepareDataForGrid(data: any[]) {
    debugger;

    if(data.length>0){
      this.gridDataAvailable = true;
      this.gridDataNew = data;
    }
   
   
    // if (data.length > 1) {
    //   this.gridDataAvailable = true;
    //   if (parseFloat(data[1].RejectQTY).toFixed(4) > parseFloat("0").toFixed(4)) {
    //     this.isRejectQtyAvailable = true;
    //   } else this.isRejectQtyAvailable = false;
    // }

     // add additional columns in data
  
    //  for (let i = 0; i < data.length; i++) {
    //   if (i == 0) {
    //     this.gridDataNew[i] = {
    //       "ACCTDEFECTQTY": data[i].ACCTDEFECTQTY, "ItemCode": data[i].ItemCode,
    //       "ItemName": data[i].ItemName, "ORIGINALACTUALQUANTITY": data[i].ORIGINALACTUALQUANTITY, "OrderNo": data[i].OrderNo
    //       , "OrderQty": data[i].OrderQty, "PASSEDQTY": data[i].PASSEDQTY, "POSTEDFGQTY": data[i].POSTEDFGQTY,
    //       "PRINTLBL": data[i].PRINTLBL, "RecRjctedQty": data[i].RecRjctedQty, "RefDocEntry": data[i].RefDocEntry,
    //       "RejectQTY": data[i].RejectQTY, "TRACKING": data[i].TRACKING, "WhsCode": data[i].WhsCode,
    //       "status": "Accepted", "AcceptedQTY": 0, "RejectedQTY": 0
    //     };
    //   } else if (i == 1 && this.isRejectQtyAvailable) {
    //     this.gridDataNew[i] = {
    //       "ACCTDEFECTQTY": data[i].ACCTDEFECTQTY, "ItemCode": data[i].ItemCode,
    //       "ItemName": data[i].ItemName, "ORIGINALACTUALQUANTITY": data[i].ORIGINALACTUALQUANTITY, "OrderNo": data[i].OrderNo
    //       , "OrderQty": data[i].OrderQty, "PASSEDQTY": data[i].PASSEDQTY, "POSTEDFGQTY": data[i].POSTEDFGQTY,
    //       "PRINTLBL": data[i].PRINTLBL, "RecRjctedQty": data[i].RecRjctedQty, "RefDocEntry": data[i].RefDocEntry,
    //       "RejectQTY": data[i].RejectQTY, "TRACKING": data[i].TRACKING, "WhsCode": data[i].WhsCode,
    //       "status": "Rejected", "AcceptedQTY": 0, "RejectedQTY": 0
    //     };
    //   }
    // }
  }

  onGridItemClick(selection) {
    // yaha data all parameter nikalne padenge or same model kark vaha bhejna padega.
    var selectedData:any =this.gridDataNew[selection.index];
    
    var selected= {
            "ACCTDEFECTQTY": selectedData.ACCTDEFECTQTY, "ITEMCODE": selectedData.ITEMCODE,
            "ITEMNAME": selectedData.ITEMNAME, "ORIGINALACTUALQUANTITY": selectedData.ORIGINALACTUALQUANTITY, "OrderNo":selectedData.OrderNo
            , "OPENQTY": selectedData.OPENQTY, "PASSEDQTY": selectedData.PASSEDQTY, "POSTEDFGQTY":selectedData.POSTEDFGQTY,
            "PRINTLBL": selectedData.PRINTLBL, "RecRjctedQty": selectedData.RecRjctedQty, "RefDocEntry":selectedData.RefDocEntry,
            "RejectQTY": selectedData.RejectQTY, "TRACKING": selectedData.TRACKING, "WhsCode": selectedData.WHSE,
            "status": selectedData.Status, "AcceptedQTY": 0, "RejectedQTY": 0,"DocNum":selectedData.RefDocEntry,"QCREQUIRED":"N"
          };
           var FromReceptProd:any = true;
          localStorage.setItem("ProdReceptItem", JSON.stringify(selected));
          localStorage.setItem("FromReceiptProd",FromReceptProd);


        //  this.inboundMasterComponent.setClickedItemDetail(this.openPOLineModel);

    localStorage.setItem("PalletizationEnabledForItem", "True");
    this.prodReceiptComponent = 2;
    console.log("recept value:"+this.prodReceiptComponent);
  }
 
  
  OnOrderLookupClick() {
    this.showOrderList();
  }


  resetOnSerchClick() {

    //reset all flags and clear data on search click
    // this.showViewAcceptButton = false;
    // this.showViewRejectButton = false;

    // this.Lots = [];
    // this.Items = [];
    // this.UDF = [];
    // this.RejectItems = [];
    // this.RejectLots = [];
    // this.submitRecProdData = {};
    // this.expDate = "";
    // this.enteredQty = "";
    // this.serialBatchNo = "";
    // this.model = { options: '1' };
    // this.acceptQty =  Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
    // this.rjQty =  Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
  }

  backFromInbound(e){
    this.prodReceiptComponent = 1;
    this.showLookupLoader = true;
    console.log("back");
  }

  /** 
  * Method to get list of inquries from server.
  */
  public showOrderList() {
    this.showLoader = true;
    this.orderNoListSubs = this.productionService.getOrderNumberList(this.orderNumber).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined)
         {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data.Table != undefined && data.Table != null && data.Table != "") {
            this.showLookupLoader = false;
            this.serviceData = data.Table;
            this.lookupfor = "OrderList";
            return;
          }
        }
      },
      error => {
        this.toastr.error('', error);
      },
    );
  }


  /**
     * @param $event this will return the value on row click of lookup grid.
     */
  getLookupValue($event) {

    if (this.lookupfor == "OrderList") {
      //this.lotNo = $event[0];
      this.orderNumber = $event[0];
      this.item = $event[1];
      // } else if (this.lookupfor == "ToBinList") { // bin list next page pr aaigi ab
      //   this.binNo = $event[0];
      //   this.whsCode = $event[1];
      // }
    }
  }
}
