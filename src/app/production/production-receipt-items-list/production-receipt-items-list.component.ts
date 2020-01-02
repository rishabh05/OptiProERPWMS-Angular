import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ProductionService } from 'src/app/services/production.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { Router } from '@angular/router';
import { AutoLot } from 'src/app/models/Inbound/AutoLot';

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
  @ViewChild('OrderNoField') OrderNoField: ElementRef;
  serviceData: any[];
  showLoader: boolean = false;
  lookupfor: string;
  displaySubmit:boolean = false;
  availableRejQty:number = 0;
  constructor(private router: Router, private commonservice: Commonservice,
    private toastr: ToastrService, private translate: TranslateService,
    private productionService: ProductionService) { }
  ngOnInit() {
    this.enableSubmitButton(false);
  }

  ngAfterViewInit(): void {
    setTimeout(() => { 
      this.OrderNoField.nativeElement.focus();
    }, 100);
  }

  getProductionDetail(fromOrderChange:boolean = false) {
    
    if (this.orderNumber == "") {
      this.toastr.error('', this.translate.instant("OrderNoBlank"));
      return;
    } 
    this.resetOnSerchClick();
    this.orderNoListSubs = this.productionService.GetItemsDetailForProductionReceipt(this.orderNumber).subscribe(
      data => {
     
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data.Table != undefined && data.Table != null && data.Table != "" && data.Table.length > 0) {
           if(!fromOrderChange)
           this.showLookupLoader = false;
            // prepare data if its comming proper froms server
            // data.Table;
            this.prepareDataForGrid(data.Table);
            return;
          } else {
            this.toastr.error('', this.translate.instant("OrderNotExistMessge"));
            this.orderNumber = "";
          }
        }
      },
      error => {
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      },
    );

    // this.binListSubs = this.productionService.GetBinsList().subscribe(
    //   data => {
    //     if (data != undefined) {
    //       if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
    //         this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
    //           this.translate.instant("CommonSessionExpireMsg"));
    //         return;
    //       }
    //       if (data != undefined && data != null && data != "") {
    //         // this.binList = data;
    //         // this.binNo = this.binList[0].BINNO;
    //         // this.whsCode = this.binList[0].WHSCODE;
    //         return;
    //       }
    //     }
    //   },
    //   error => {
    //     if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
    //       this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
    //    } 
    //    else{
    //     this.toastr.error('', error);
    //    }
    //   });
  }
  pagable: boolean = false;
  pageSize: any = 10;
  //gridData: any[] = [];
  isRejectQtyAvailable: boolean = false;
  gridDataNew: any[] = [];
  gridDataAvailable: boolean = false;
  gridDataNew1: any[] = [];
  acceptQty:any =0;  rejQty: any=0;
  prepareDataForGrid(data: any[],fromSave:boolean=false) { 

    if (data.length > 0) {
      this.gridDataAvailable = true;
      this.gridDataNew = data;
    }
    if(fromSave)this.calculateAcceptRejectQty(fromSave)

    if (this.gridDataNew != null && this.gridDataNew != undefined && this.gridDataNew.length > 0 && this.gridDataNew.length == 1) {
      
      var qty =0;
      if(this.gridDataNew[0].Status =="Accept")
      {
        qty = this.acceptQty;
      }else if(this.gridDataNew[0].Status =="Reject"){
        qty = this.rejQty;
        this.availableRejQty = this.gridDataNew[0].OPENQTY;
      }else qty = 0;

      this.gridDataNew1[0] = {
        "ITEMCODE": this.gridDataNew[0].ITEMCODE, "ITEMNAME": this.gridDataNew[0].ITEMNAME,
        "OPENQTY": this.gridDataNew[0].OPENQTY, "ORIGINALACTUALQUANTITY": this.gridDataNew[0].ORIGINALACTUALQUANTITY,
        "OrderNo": this.gridDataNew[0].OrderNo, "PRINTLBL": this.gridDataNew[0].PRINTLBL,
        "RefDocEntry": this.gridDataNew[0].RefDocEntry, "Status": this.gridDataNew[0].Status,
        "WHSE": this.gridDataNew[0].WHSE, "ReceiveQty": qty, "TRACKING": this.gridDataNew[0].TRACKING
      };
    }
    if (this.gridDataNew != null && this.gridDataNew != undefined && this.gridDataNew.length > 0 &&
      this.gridDataNew.length == 2) {
      
      for (let i = 0; i < this.gridDataNew.length; i++) {
        var qty =0;
        if(this.gridDataNew[i].Status =="Accept")
        {
          qty = this.acceptQty;
        }else if(this.gridDataNew[i].Status =="Reject"){
          qty = this.rejQty;
          this.availableRejQty = this.gridDataNew[0].OPENQTY;
        }else qty = 0;

        this.gridDataNew1[i] = {
          "ITEMCODE": this.gridDataNew[i].ITEMCODE, "ITEMNAME": this.gridDataNew[i].ITEMNAME,
          "OPENQTY": this.gridDataNew[i].OPENQTY, "ORIGINALACTUALQUANTITY": this.gridDataNew[i].ORIGINALACTUALQUANTITY,
          "OrderNo": this.gridDataNew[i].OrderNo, "PRINTLBL": this.gridDataNew[i].PRINTLBL,
          "RefDocEntry": this.gridDataNew[i].RefDocEntry, "Status": this.gridDataNew[i].Status,
          "WHSE": this.gridDataNew[i].WHSE, "ReceiveQty": qty,"TRACKING": this.gridDataNew[i].TRACKING
        };
      }
    }
  }
   
  calculateAcceptRejectQty(fromSave){
     
    if (fromSave) {
      var savedRecProdData: any = {};
      var dataModel = localStorage.getItem("GoodsReceiptModel");
      if (dataModel == null || dataModel == undefined || dataModel == "") {
        //this.oSubmitPOLotsArray = [];
        savedRecProdData = {};
        this.acceptQty = 0;this.rejQty = 0;
      } else {
        savedRecProdData = JSON.parse(dataModel);
      }
      if (savedRecProdData != null && savedRecProdData != undefined && savedRecProdData != "") {
        //accept item qty
        if (savedRecProdData.Items != null && savedRecProdData.Items != undefined && savedRecProdData.Items != ""
          && savedRecProdData.Items.length > 0) {
            this.acceptQty = savedRecProdData.Items[0].Quantity;
        } else {
          this.acceptQty = 0;
        }
        //reject item qty
        if (savedRecProdData.RejectItems != null && savedRecProdData.RejectItems != undefined &&
          savedRecProdData.RejectItems != "" && savedRecProdData.RejectItems.length > 0) {
            this.rejQty = savedRecProdData.RejectItems[0].Quantity;
        } else {
          this.rejQty = 0;
        }
      }
    }
  }

  enableSubmitButton(fromSave:any){
      var savedRecProdData: any = {};
      var dataModel = localStorage.getItem("GoodsReceiptModel");
      if (dataModel == null || dataModel == undefined || dataModel == "") {
        savedRecProdData = {};
      } else {
        savedRecProdData = JSON.parse(dataModel);
      }
      if (savedRecProdData != null && savedRecProdData != undefined && savedRecProdData != "") {
        if ((savedRecProdData.Items != null && savedRecProdData.Items != undefined && savedRecProdData.Items != ""
          && savedRecProdData.Items.length > 0)|| (savedRecProdData.RejectItems != null && savedRecProdData.RejectItems != undefined
             && savedRecProdData.RejectItems != "" && savedRecProdData.RejectItems.length > 0)) {
            this.displaySubmit = true;
        } else {
          this.displaySubmit = false;
        }
      
    }
  }
  onGridItemClick(selectedData) {
    // yaha data all parameter nikalne padenge or same model kark vaha bhejna padega.
    //var selectedData:any =this.gridDataNew[selection.index];
    let autoLot: any[] =[];
    
    autoLot.push(new AutoLot("N", selectedData.ITEMCODE, "", "", "", ""));
    localStorage.setItem("primaryAutoLots", JSON.stringify(autoLot));
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
          localStorage.setItem("AvailableRejectQty",this.availableRejQty.toString());
          localStorage.setItem("PalletizationEnabledForItem", "True");
          this.prodReceiptComponent = 2;
         // console.log("recept value:"+this.prodReceiptComponent);
  }
 
  
  OnOrderLookupClick() {
    this.showOrderList();
  }


  resetOnSerchClick() {
     this.gridDataNew = [];
     localStorage.setItem("GoodsReceiptModel",'');
     this.acceptQty = 0;
     this.rejQty = 0;
     this.displaySubmit = false;
     this.gridDataNew1 = [];
     this.availableRejQty = 0;
   
  }

  backFromGRPOScreen(e){
    switch(e) {
      case "back":
        // code block
        this.enableSubmitButton(false);
        break;
      case "save":
        // code block
        this.prepareDataForGrid(this.gridDataNew,true);
        this.enableSubmitButton(true);
        break;
     }
     this.prodReceiptComponent = 1;
        this.showLookupLoader = true;
  
   // console.log("back");
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
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      },
    );
  }


  submitProductionReport(){
     
    //get data from local storage
    var submitRecProdData: any = {};
    var dataModel = localStorage.getItem("GoodsReceiptModel");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      submitRecProdData = {};
    } else {
      submitRecProdData = JSON.parse(dataModel);
    }
    this.showLoader = true;
    this.productionService.submitProductionRecepit(submitRecProdData).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          } 
          //check and update response for entered serial no.
          if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
           // this.toastr.success( this.translate.instant("FGRSuccessMessage") +data[0].SuccessNo);
            this.toastr.success('', this.translate.instant("ProdReceipt_FGRSuccessMessage")+" "+ data[0].SuccessNo);
            this.resetOnSerchClick(); 
          }else{
            if (data[0].ErrorMsg != ""){
                   // show errro.
                   this.toastr.error('', data[0].ErrorMsg);
            }
          }
        }
      },
      error => {
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      },
    );
  }


  OnOrderValueChange(){ 
    if (this.orderNumber == "" || this.orderNumber == undefined) {
      return;
    }
    this.getProductionDetail(true);
  }
  /**
     * @param $event this will return the value on row click of lookup grid.
     */
  getLookupValue($event) {
    if ($event != null && $event == "close") {
      //nothing to do
      return;
    }
    else {
    if (this.lookupfor == "OrderList") {
      //this.lotNo = $event[0];
      this.orderNumber = $event[0];
      this.item = $event[1];
      this.getProductionDetail();
      setTimeout(() => { 
        this.OrderNoField.nativeElement.focus();
      }, 100);
    
    }
  }
}
onCancelClk() {
  this.router.navigate(['home/dashboard']);
}

onHiddenReceiptItemOrderScanClick(){
  var inputValue = (<HTMLInputElement>document.getElementById('receiptItemOrderNoInput')).value;
    if (inputValue.length > 0) {
      this.orderNumber= inputValue;
    }
  this.OnOrderValueChange();
}
}
