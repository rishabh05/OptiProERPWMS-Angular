import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ProductionService } from 'src/app/services/production.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { Router } from '@angular/router';
import { AutoLot } from 'src/app/models/Inbound/AutoLot';
import { RowClassArgs } from '@progress/kendo-angular-grid';
import { InboundService } from '../../services/inbound.service';
import { IUIComponentTemplate } from 'src/app/common/ui-component.interface';
import { ModuleIds, ScreenIds, ControlIds } from '../../enums/enums';

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
  displaySubmit: boolean = false;
  availableRejQty: number = 0;
  //UDF
  showUDF = false;
  UDFComponentData: IUIComponentTemplate[] = [];
  itUDFComponents: IUIComponentTemplate = <IUIComponentTemplate>{};
  templates = [];
  UDF = [];
  displayArea = "Header";
  IsUDFEnabled = 'N'

  constructor(private router: Router, private commonservice: Commonservice,
    private toastr: ToastrService, private translate: TranslateService,
    private productionService: ProductionService, private inboundService: InboundService) { }
  
  async ngOnInit() {
    this.enableSubmitButton(false);
    this.IsUDFEnabled = sessionStorage.getItem("ISUDFEnabled");
    if(this.IsUDFEnabled == 'Y'){
      this.commonservice.GetWMSUDFBasedOnScreen("15116");
    }
    await this.commonservice.getComponentVisibilityList(ModuleIds.ProdReceipt, ScreenIds.ProdRec_Orderlist, ControlIds.PRODREC_GRID1);
    let ItemDetailArr = this.commonservice.getComponentVisibility();
    this.setAddedGridItemVisibility(ItemDetailArr);
  }

  gridColumnVisibilityArry: any = {};
  setAddedGridItemVisibility(ColumnArry){
    this.gridColumnVisibilityArry.ITEMCODE = ColumnArry.find(e=> e.OPTM_FIELDID == "ITEMCODE") != undefined? ColumnArry.find(e=> e.OPTM_FIELDID == "ITEMCODE").OPTM_VISIBILITYSTATUS:""
    this.gridColumnVisibilityArry.Status = ColumnArry.find(e=> e.OPTM_FIELDID == "Status") != undefined? ColumnArry.find(e=> e.OPTM_FIELDID == "Status").OPTM_VISIBILITYSTATUS:""
    this.gridColumnVisibilityArry.UDF = ColumnArry.find(e=> e.OPTM_FIELDID == "UDF")!= undefined? ColumnArry.find(e=> e.OPTM_FIELDID == "UDF").OPTM_VISIBILITYSTATUS:""
    this.gridColumnVisibilityArry.OPENQTY = ColumnArry.find(e=> e.OPTM_FIELDID == "OPENQTY")!= undefined? ColumnArry.find(e=> e.OPTM_FIELDID == "OPENQTY").OPTM_VISIBILITYSTATUS:""
    this.gridColumnVisibilityArry.ReceiveQty = ColumnArry.find(e=> e.OPTM_FIELDID == "ReceiveQty")!= undefined? ColumnArry.find(e=> e.OPTM_FIELDID == "ReceiveQty").OPTM_VISIBILITYSTATUS:""
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.OrderNoField.nativeElement.focus();
    }, 100);
  }

  getProductionDetail(fromOrderChange: boolean = false) {

    if (this.orderNumber == "") {
      this.toastr.error('', this.translate.instant("OrderNoBlank"));
      return;
    }
    this.resetOnSerchClick();
    this.showLoader = true;
    this.orderNoListSubs = this.productionService.GetItemsDetailForProductionReceipt(this.orderNumber).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data.Table != undefined && data.Table != null && data.Table != "" && data.Table.length > 0) {
            if (!fromOrderChange)
              this.showLookupLoader = false;
            // prepare data if its comming proper froms server
            // data.Table;
            this.prepareDataForGrid(data.Table);
            if (sessionStorage.getItem("GRPOHdrUDF") == undefined || sessionStorage.getItem("GRPOHdrUDF") == "") {
              this.UDF = []
            }else{
              this.UDF = JSON.parse(sessionStorage.getItem("GRPOHdrUDF"));
            }
            while (this.UDF.length > 0) {
              let index = -1
              if (this.ItemStatus == "Accept") {
                index = this.UDF.findIndex(e => e.LineNo == 0)
              } else {
                index = this.UDF.findIndex(e => e.LineNo == 1)
              }
              if (index == -1) {
                break;
              }
              this.UDF.splice(index, 1);
            }
            sessionStorage.setItem("GRPOHdrUDF", JSON.stringify(this.UDF));
            return;
          } else {
            this.toastr.error('', this.translate.instant("OrderNotExistMessge"));
            this.orderNumber = "";
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
      },
    );
  }
  pagable: boolean = false;
  pageSize: any = 10;
  //gridData: any[] = [];
  isRejectQtyAvailable: boolean = false;
  gridDataNew: any[] = [];
  gridDataAvailable: boolean = false;
  gridDataNew1: any[] = [];
  acceptQty: any = 0; rejQty: any = 0;
  prepareDataForGrid(data: any[], fromSave: boolean = false) {

    if (data.length > 0) {
      this.gridDataAvailable = true;
      this.gridDataNew = data;
    }
    if (fromSave) this.calculateAcceptRejectQty(fromSave)

    if (this.gridDataNew != null && this.gridDataNew != undefined && this.gridDataNew.length > 0 && this.gridDataNew.length == 1) {

      var qty = 0;
      if (this.gridDataNew[0].Status == "Accept") {
        qty = this.acceptQty;
      } else if (this.gridDataNew[0].Status == "Reject") {
        qty = this.rejQty;
        this.availableRejQty = this.gridDataNew[0].OPENQTY;
      } else qty = 0;

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
        var qty = 0;
        if (this.gridDataNew[i].Status == "Accept") {
          qty = this.acceptQty;
        } else if (this.gridDataNew[i].Status == "Reject") {
          qty = this.rejQty;
          this.availableRejQty = this.gridDataNew[0].OPENQTY;
        } else qty = 0;

        this.gridDataNew1[i] = {
          "ITEMCODE": this.gridDataNew[i].ITEMCODE, "ITEMNAME": this.gridDataNew[i].ITEMNAME,
          "OPENQTY": this.gridDataNew[i].OPENQTY, "ORIGINALACTUALQUANTITY": this.gridDataNew[i].ORIGINALACTUALQUANTITY,
          "OrderNo": this.gridDataNew[i].OrderNo, "PRINTLBL": this.gridDataNew[i].PRINTLBL,
          "RefDocEntry": this.gridDataNew[i].RefDocEntry, "Status": this.gridDataNew[i].Status,
          "WHSE": this.gridDataNew[i].WHSE, "ReceiveQty": qty, "TRACKING": this.gridDataNew[i].TRACKING
        };
      }
    }
  }

  calculateAcceptRejectQty(fromSave) {

    if (fromSave) {
      var savedRecProdData: any = {};
      var dataModel = sessionStorage.getItem("GoodsReceiptModel");
      if (dataModel == null || dataModel == undefined || dataModel == "") {
        //this.oSubmitPOLotsArray = [];
        savedRecProdData = {};
        this.acceptQty = 0; this.rejQty = 0;
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

  enableSubmitButton(fromSave: any) {
    var savedRecProdData: any = {};
    var dataModel = sessionStorage.getItem("GoodsReceiptModel");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      savedRecProdData = {};
    } else {
      savedRecProdData = JSON.parse(dataModel);
    }
    if (savedRecProdData != null && savedRecProdData != undefined && savedRecProdData != "") {
      if ((savedRecProdData.Items != null && savedRecProdData.Items != undefined && savedRecProdData.Items != ""
        && savedRecProdData.Items.length > 0) || (savedRecProdData.RejectItems != null && savedRecProdData.RejectItems != undefined
          && savedRecProdData.RejectItems != "" && savedRecProdData.RejectItems.length > 0)) {
        this.displaySubmit = true;
      } else {
        this.displaySubmit = false;
      }

    }
  }
  async onGridItemClick(selectedData) {
    // yaha data all parameter nikalne padenge or same model kark vaha bhejna padega.
    //var selectedData:any =this.gridDataNew[selection.index];
    let autoLot: any[] = [];
    autoLot.push(new AutoLot("N", selectedData.ITEMCODE, "", "", "", ""));
    sessionStorage.setItem("primaryAutoLots", JSON.stringify(autoLot));
    var selected = {
      "ACCTDEFECTQTY": selectedData.ACCTDEFECTQTY, "ITEMCODE": selectedData.ITEMCODE,
      "ITEMNAME": selectedData.ITEMNAME, "ORIGINALACTUALQUANTITY": selectedData.ORIGINALACTUALQUANTITY, "OrderNo": selectedData.OrderNo
      , "OPENQTY": selectedData.OPENQTY, "PASSEDQTY": selectedData.PASSEDQTY, "POSTEDFGQTY": selectedData.POSTEDFGQTY,
      "PRINTLBL": selectedData.PRINTLBL, "RecRjctedQty": selectedData.RecRjctedQty, "RefDocEntry": selectedData.RefDocEntry,
      "RejectQTY": selectedData.RejectQTY, "TRACKING": selectedData.TRACKING, "WhsCode": selectedData.WHSE,
      "status": selectedData.Status, "AcceptedQTY": 0, "RejectedQTY": 0, "DocNum": selectedData.RefDocEntry, "QCREQUIRED": "N"
    };
    this.ItemStatus = selectedData.Status;
    if(!this.checkIfMandatoryUDFFilled(selectedData)){
      return;
    }
    var FromReceptProd: any = true;
    sessionStorage.setItem("ProdReceptItem", JSON.stringify(selected));
    sessionStorage.setItem("FromReceiptProd", FromReceptProd);
    sessionStorage.setItem("AvailableRejectQty", this.availableRejQty.toString());
    sessionStorage.setItem("PalletizationEnabledForItem", "True");
    this.prodReceiptComponent = 2;
    await this.commonservice.getComponentVisibilityList2(ModuleIds.ProdReceipt, ScreenIds.ProdRecScreen, ControlIds.PRODREC_GRID1);
    // console.log("recept value:"+this.prodReceiptComponent);
  }


  OnOrderLookupClick() {
    this.showOrderList();
  }

  // public rowCallback = (context: RowClassArgs) => {
  //   switch (context.dataItem.TRACKING) {
  //     case 'S':
  //       return { serial: true };
  //     case 'B':
  //       return { batch: true };
  //     case 'N':
  //       return { none: false };
  //     default:
  //       return {};
  //   }
  //}

  resetOnSerchClick() {
    this.gridDataNew = [];
    sessionStorage.setItem("GoodsReceiptModel", '');
    this.acceptQty = 0;
    this.rejQty = 0;
    this.displaySubmit = false;
    this.gridDataNew1 = [];
    this.availableRejQty = 0;

  }

  backFromGRPOScreen(e) {
    switch (e) {
      case "back":
        // code block
        this.enableSubmitButton(false);
        break;
      case "save":
        // code block
        this.prepareDataForGrid(this.gridDataNew, true);
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
        if (data != undefined) {
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
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      },
    );
  }

  dialogMsg: string = ""
  yesButtonText: string = "";
  noButtonText: string = "";
  dialogFor: string = "";
  showConfirmDialog: boolean = false;
  showPrintDialog() {
    // show print dialog here and onclick its handling.
    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    this.dialogFor = "prodReceiptReport";
    this.dialogMsg = this.translate.instant("ProReceiptReport");
    this.showConfirmDialog = true; // show dialog
  }

  responseDocEntry: string = "";
  base64String: string = "";
  fileName: string = "";
  displayPDF1: boolean = false;
  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;
    if ($event.Status == "yes") {
      switch ($event.From) {
        case ("prodReceiptReport"):
          this.displayPDF(this.responseDocEntry, 1);
          break;
      }
    } else {
      if ($event.Status == "cancel") {
        // when user click on cross button nothing to do.
      } else {
        //means user click on negative button
        if ($event.From == "prodReceiptReport") {
        }
      }
    }
  }

  public displayPDF(dNo: string, noOfCopy) {
    this.showLoader = true;
    this.inboundService.printingServiceForSubmitGRPO(dNo, 5, 1).subscribe(
      (data: any) => {
        this.showLoader = false;
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
            // this.showPdf(); // this function is used to display pdf in new tab.
            this.base64String = 'data:application/pdf;base64,' + this.base64String;
            this.displayPDF1 = true;
            //this.commonservice.refreshDisplyPDF(true);

          } else {
            // no data available then redirect to first screen.
            // this.inboundMasterComponent.inboundComponent = 1;
          }
          //  console.log("filename:" + this.fileName);
          // console.log("filename:" + this.base64String);
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLoader = false;
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  closePDF() {
    //close current screen and redirect to first screen.
    // this.inboundMasterComponent.inboundComponent = 1;
    //console.log("PDF dialog is closed");
    this.displayPDF1 = false;
    console.log("PDF dialog is closed");
  }

  submitProductionReport() {
    //get data from local storage
    var submitRecProdData: any = {};
    var dataModel = sessionStorage.getItem("GoodsReceiptModel");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      submitRecProdData = {};
    } else {
      submitRecProdData = JSON.parse(dataModel);
    }

    if(this.IsUDFEnabled == 'Y'){
      let hdrarr = JSON.parse(sessionStorage.getItem("GRPOHdrUDF"))
      if (sessionStorage.getItem("GRPOHdrUDF") != undefined && sessionStorage.getItem("GRPOHdrUDF") != "") {
        hdrarr.forEach(element => {
          submitRecProdData.UDF.push(element);
        });
      }  
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
            this.responseDocEntry = data[0].DocEntry
            this.toastr.success('', this.translate.instant("ProdReceipt_FGRSuccessMessage") + " " + data[0].SuccessNo);
            this.resetOnSerchClick();

            if (sessionStorage.getItem("IsPrintingEnabledForProdReceipt") == "Y") {
              this.showPrintDialog();
            }
            sessionStorage.setItem("GRPOHdrUDF", ""); 
          } else {
            if (data[0].ErrorMsg != undefined && data[0].ErrorMsg == "OrderQtyError") {
              this.toastr.error('', this.translate.instant("OrderQtyError"));
              return;
            }
            if (data[0].ErrorMsg != "") {
              if (data[0].ErrorNo != undefined && data[0].ErrorNo == "-1") {
                // Receipt not successful. Do not refresh the screen.
              } else if (data[0].ErrorNo != undefined && data[0].ErrorNo == "0") {

                //Error in updating optipro tables. SAP succefully updated.
                this.toastr.error('', "Error in updating optipro tables. SAP succefully updated");
                this.resetOnSerchClick();
              }
              // show errro.
              this.toastr.error('', data[0].ErrorMsg);
            }
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
      },
    );
  }

  addHeaderUDF(){

  }

  OnOrderValueChange() {
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

  onHiddenReceiptItemOrderScanClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('receiptItemOrderNoInput')).value;
    if (inputValue.length > 0) {
      this.orderNumber = inputValue;
    }
    this.OnOrderValueChange();
  }

  ItemStatus = "Accept";
  ShowUDF(displayArea, UDFButtonClicked, dataItem?):boolean {
    if(dataItem != undefined){
      this.ItemStatus = dataItem.Status;
    }
    let line = this.ItemStatus == "Accept"?0:1;
    this.displayArea = displayArea;
    let UDFStatus;
    if (sessionStorage.getItem("GRPOHdrUDF") != undefined && sessionStorage.getItem("GRPOHdrUDF") != "") {
      this.UDF = JSON.parse(sessionStorage.getItem("GRPOHdrUDF"));
    }
    if(displayArea == "Detail"){
      let subarray = [];
      this.UDF.forEach(element => {
        if (element.LineNo == line) {
          subarray.push(element);
        }
      });
      UDFStatus = this.commonservice.loadUDF(displayArea, this.commonservice.getUDFData(), subarray);
    }else{
      if (sessionStorage.getItem("GRPOHdrUDF") != undefined && sessionStorage.getItem("GRPOHdrUDF") != "") {
        let subarray = [];
        this.UDF.forEach(element => {
          if (element.Flag == "H") {
            subarray.push(element);
          }
        });
        UDFStatus = this.commonservice.loadUDF(displayArea, this.commonservice.getUDFData(), subarray);
      } else {
        UDFStatus = this.commonservice.loadUDF(displayArea, this.commonservice.getUDFData());
      }
    }
    if (!UDFButtonClicked) {
      if (UDFStatus != "MANDATORY_AVL") {
        return false;
      }
    }
    this.templates = this.commonservice.getTemplateArray();
    this.UDFComponentData = this.commonservice.getUDFComponentDataArray();
    this.showUDF = true;
    return true;
  }

  onUDFDialogClose() {
    this.showUDF = false;
    this.UDFComponentData = [];
    this.templates = [];
  }

  getUDFSelectedItem(itUDFComponentData) {
    this.onUDFDialogClose();
    if (itUDFComponentData == null) {
      return;
    }
    if (sessionStorage.getItem("GRPOHdrUDF") == undefined || sessionStorage.getItem("GRPOHdrUDF") == "") {
      this.UDF = []
    }else{
      this.UDF = JSON.parse(sessionStorage.getItem("GRPOHdrUDF"));
    }
    if (this.displayArea == "Detail") {
      while (this.UDF.length > 0) {
        let index = -1
        if (this.ItemStatus == "Accept") {
          index = this.UDF.findIndex(e => e.LineNo == 0)
        } else {
          index = this.UDF.findIndex(e => e.LineNo == 1)
        }
        if (index == -1) {
          break;
        }
        this.UDF.splice(index, 1);
      }
      if (itUDFComponentData.length > 0) {
        for (var i = 0; i < itUDFComponentData.length; i++) {
          let value = "";
          if (itUDFComponentData[i].istextbox) {
            value = itUDFComponentData[i].textBox;
          } else {
            value = itUDFComponentData[i].dropDown.FldValue;
          }
          let lineno = 1;
          if (this.ItemStatus == "Accept") {
            lineno = 0
          }
          this.UDF.push({
            Flag: "D",
            LineNo: lineno,
            Value: value,
            Key: itUDFComponentData[i].AliasID
          });
        }
      }
    } else {
      while (this.UDF.length > 0) {
        let index = this.UDF.findIndex(e => e.Flag == "H")
        if (index == -1) {
          break;
        }
        this.UDF.splice(index, 1);
      }
      if (itUDFComponentData.length > 0) {
        for (var i = 0; i < itUDFComponentData.length; i++) {
          let value = "";
          if (itUDFComponentData[i].istextbox) {
            value = itUDFComponentData[i].textBox;
          } else {
            value = itUDFComponentData[i].dropDown.FldValue;
          }
          this.UDF.push({
            Flag: "H",
            LineNo: -1,
            Value: value,
            Key: itUDFComponentData[i].AliasID
          });
        }
        
      }
    }
    sessionStorage.setItem("GRPOHdrUDF", JSON.stringify(this.UDF));
    this.templates = [];
  }

  checkIfMandatoryUDFFilled(selectedData): boolean{
    if (this.IsUDFEnabled == 'Y') {
      if (sessionStorage.getItem("GRPOHdrUDF") == undefined || sessionStorage.getItem("GRPOHdrUDF") == "") {
        if(this.ShowUDF('Header', false)){
          return false;
        }
      }
      if (sessionStorage.getItem("GRPOHdrUDF") != undefined && sessionStorage.getItem("GRPOHdrUDF") != "") {
        this.UDF = JSON.parse(sessionStorage.getItem("GRPOHdrUDF"));
      }
      let indx = this.UDF.findIndex(e => e.Flag == "H")
      if (indx == -1) {
        if(this.ShowUDF('Header', false)){
          return false;
        }
      }
      if (selectedData.Status == "Accept") {
        indx = this.UDF.findIndex(e => e.LineNo == 0)
      } else {
        indx = this.UDF.findIndex(e => e.LineNo == 1)
      }
      if (indx == -1) {
        if(this.ShowUDF('Detail', false)){
          return false;
        }
      }      
    }
    return true;
  }
}
