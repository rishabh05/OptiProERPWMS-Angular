import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { InboundService } from '../../services/inbound.service';
import { Commonservice } from '../../services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { InboundMasterComponent } from '../inbound-master.component';
import { StatePersistingServiceService } from '../../services/state-persisting-service.service';
import { CommonConstants } from '../../const/common-constants';
import { IUIComponentTemplate } from 'src/app/common/ui-component.interface';
import { ModuleIds } from '../../enums/enums';
@Component({
  selector: 'app-inbound-details',
  templateUrl: './inbound-details.component.html',
  styleUrls: ['./inbound-details.component.scss']
})
export class InboundDetailsComponent implements OnInit, AfterViewInit {

  @ViewChild('VendScanInputField') vendInputScanField: ElementRef;
  @ViewChild('poScanInputField') poScanInputField;
  @ViewChild('scanVenderRefNo') scanVenderRefNo;
  public viewLines: boolean;
  showLookupLoader: boolean = true;
  VendRefNo: string = "";
  serviceData: any[];
  lookupfor: string;
  VendCode: string;
  VendCode1: string;
  VendName: string;
  vendRefNo: string;
  futurepo: boolean = false;
  showLoader: boolean = false;
  showGRPOGridAndBtn: boolean = false;
  public Polist: any[] = [];
  dialogFor: string = "";
  dialogMsg: string = "";
  showConfirmDialog: boolean;
  rowindexForDelete: any;
  gridDataAfterDelete: any[];
  showNext: boolean = false;
  yesButtonText: string = "";
  noButtonText: string = "";
  showPDF: boolean = false;
  base64String: string = "";
  fileName: string = "";
  displayPDF1: boolean = false;
  detailsAvailable: boolean = false;
  // caption related labels.
  PONo: any;
  addGRPODetailGridTitle: any;
  future_PO_Invoice: any;
  //UDF
  showUDF = false;
  UDFComponentData: IUIComponentTemplate[] = [];
  itUDFComponents: IUIComponentTemplate = <IUIComponentTemplate>{};
  templates = [];
  UDF = [];
  displayArea = "Header";
  IsUDFEnabled = "N";

  ngAfterViewInit(): void {
    this.vendInputScanField.nativeElement.focus();
  }
  constructor(private inboundService: InboundService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent, private persistingService: StatePersistingServiceService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if (this.inboundFromWhere == 1) {
        this.PONo = this.translate.instant("Inbound_PO#");
        this.future_PO_Invoice = this.translate.instant("Inbound_FuturePOs");
        this.addGRPODetailGridTitle = this.translate.instant("Inbound_PurchaseOrderNumber");
        // change captions and api calling according to normal inbound.
      } else if (this.inboundFromWhere == 2) {
        this.future_PO_Invoice = this.translate.instant("Inbound_FutureInvoices");
        this.PONo = this.translate.instant("Inbound_InvoiceNo");
        this.addGRPODetailGridTitle = this.translate.instant("Inbound_InvoiceNo");
        // change captions and api calling according to normal inbound.
      }
    });
  }
  inboundFromWhere: any = false;
  ngOnInit() {
    this.inboundFromWhere = sessionStorage.getItem("inboundOptionType");
    this.IsUDFEnabled = sessionStorage.getItem("ISUDFEnabled");
    if (this.inboundFromWhere == 1) {
      this.PONo = this.translate.instant("Inbound_PO#");
      this.future_PO_Invoice = this.translate.instant("Inbound_FuturePOs");
      this.addGRPODetailGridTitle = this.translate.instant("Inbound_PurchaseOrderNumber");
      if(this.IsUDFEnabled == "Y"){
        this.commonservice.GetWMSUDFBasedOnScreen("15041");
      }
      this.commonservice.getComponentVisibilityList(ModuleIds.POReceipt, "", "");
      // change captions and api calling according to normal inbound.
    } else if (this.inboundFromWhere == 2) {
      this.future_PO_Invoice = this.translate.instant("Inbound_FutureInvoices");
      this.PONo = this.translate.instant("Inbound_InvoiceNo");
      this.addGRPODetailGridTitle = this.translate.instant("Inbound_InvoiceNo");
      // change captions and api calling according to normal inbound.
      if(this.IsUDFEnabled == "Y"){
        this.commonservice.GetWMSUDFBasedOnScreen("15042");
      }      
      this.commonservice.getComponentVisibilityList(ModuleIds.AP_Invoice, "", "");
    }
    // set future po to check if already checked.
    if (sessionStorage.getItem("isFuturePOChecked") == "true") {
      this.futurepo = true;
    } else {
      this.futurepo = false;
    }

    this.VendCode = sessionStorage.getItem("VendCode");
    this.VendName = sessionStorage.getItem("VendName");
    this.VendRefNo = sessionStorage.getItem("VendRefNo");

    if (this.VendCode != "") {
      this.showNext = true;
    } else {
      this.showNext = false;
    }
    this.dateAvailableToReceieve();
    
  }


  // UDFApiResponse: any;
  // public GetUDFBasedOnScreen(moduleId) {
  //   this.showLoader = true;
  //   this.commonservice.GetUDFBasedOnScreen("WMS", moduleId).subscribe(
  //     (data: any) => {
  //       this.showLoader = false;
  //       // this.printDialog = false;
  //       if (data != undefined) {
  //         // console.log("" + data);
  //         if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
  //           this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
  //             this.translate.instant("CommonSessionExpireMsg"));
  //           return;
  //         }

  //         this.UDFApiResponse = data;
  //         this.inboundMasterComponent.setUDFData(this.UDFApiResponse)
  //       } else {
  //         this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
  //       }
  //     },
  //     error => {
  //       this.showLookupLoader = false;
  //       if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
  //         this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
  //       }
  //       else {
  //         this.toastr.error('', error);
  //       }
  //     }
  //   );
  // }


  //future po change.
  toggleVisibility(e) {
    console.log("checkuncheck:", this.futurepo);
    sessionStorage.setItem("isFuturePOChecked", JSON.stringify(this.futurepo));
  }

  dateAvailableToReceieve() {
    var dataModel = sessionStorage.getItem("addToGRPOPONumbers");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      this.showGRPOGridAndBtn = false;
    } else {
      var inboundData = JSON.parse(dataModel);
      this.Polist = inboundData.PONumbers;
      this.showGRPOGridAndBtn = true;
      this.detailsAvailable = true;
    }
  }

  receive() {
    var dataModel = sessionStorage.getItem("AddToGRPO");
    if (dataModel != null && dataModel != undefined && dataModel != "") {
      if (sessionStorage.getItem("GRPOPrintReport") == "Y") {
        this.showPrintConfirmDialog();
      } else {
        this.SubmitGoodsReceiptPO(JSON.parse(sessionStorage.getItem("AddToGRPO")));
        this.showPDF = false;
      }
    }
  }

  showPrintConfirmDialog() {
    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    this.dialogFor = "receiveSinglePDFDialog";
    this.dialogMsg = this.translate.instant("Inbound_PrintAllLabelsAfterSubmit");
    this.showConfirmDialog = true; // show dialog 
  }

  SubmitGoodsReceiptPO(oSubmitPOLotsObj: any, noOfCopy?) {
    this.showLoader = true;
    this.inboundService.SubmitGoodsReceiptPO(oSubmitPOLotsObj).subscribe(
      (data: any) => {
        this.showLoader = false;
        //console.log(data);
        if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
          // alert("Goods Receipt PO generated successfully with Doc No: " + data.DocEntry);
          this.toastr.success('', this.translate.instant("Inbound_GRPOSuccessMessage") + " " + data[0].SuccessNo);
          sessionStorage.setItem("Line", "0");
          sessionStorage.setItem("GRPOReceieveData", "");
          sessionStorage.setItem("AddToGRPO", "");
          sessionStorage.setItem("addToGRPOPONumbers", "");
          sessionStorage.setItem("GRPOHdrUDF", "");
          this.inboundMasterComponent.clearUDF();
          this.dateAvailableToReceieve();
          if (this.showPDF) {
            //show pdf
            this.displayPDF(data[0].DocEntry, this.NoOfPrintCopies);
            this.showPDF = false;
          } else {
            // no need to display pdf
            //this.inboundMasterComponent.inboundComponent = 1;
          }
        } else if (data[0].ErrorMsg == "7001") {
          this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
            this.translate.instant("CommonSessionExpireMsg"));
          return;
        }
        else {
          // alert(data[0].ErrorMsg);
          this.toastr.error('', data[0].ErrorMsg);
        }
        this.NoOfPrintCopies = 1
      },
      error => {
        console.log("Error: ", error);
        // alert("fail");
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  onVendorLookupClick() {
    this.showLoader = true;
    this.inboundService.getVendorList().subscribe(
      (data: any) => {
        this.showLoader = false;
        // console.log(data);
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          this.serviceData = data.Table;
          this.lookupfor = "VendorList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLoader = false;
        // console.log("Error: ", error);
        // this.toastr.error('', error);
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  OnVendorChangeBlur() {
    if (this.isValidateCalled) {
      return;
    }
    this.OnVendorChange();
  }

  async OnVendorChange(): Promise<any> {
    if (this.VendCode == "" || this.VendCode == undefined) {
      return;
    }


    this.showLoader = true;
    var result = false;
    await this.inboundService.IsVendorExists(this.VendCode).then(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data != undefined && data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            result = false;
          }
          if (data[0].Result == "0") {
            this.toastr.error('', this.translate.instant("Inbound_VendorExistMessge"));
            this.VendCode = "";
            this.showNext = false;
            this.poCode = "";
            this.VendCode1 = this.VendCode;
            this.vendInputScanField.nativeElement.focus()
            result = false;
          } else {
            if (this.VendCode1 != data[0].ID) {
              this.poCode = "";
            }
            this.VendCode = data[0].ID;
            this.VendName = data[0].Name;
            this.showNext = true;
            this.VendCode1 = this.VendCode;
            result = true;
          }
        } else {
          this.toastr.error('', this.translate.instant("Inbound_VendorExistMessge"));
          this.VendCode = "";
          this.showNext = false;
          this.vendInputScanField.nativeElement.focus()
          result = false;
        }
      },
      error => {
        this.showLoader = false;
        // console.log("Error: ", error);
        // this.toastr.error('', error);
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
        result = false;
      }
    );
    return result;
  }

  getLookupValue($event) {
    if ($event != null && $event == "close") {
      //nothing to do
      return;
    }
    else {

      if (this.lookupfor == "POList" || this.lookupfor == "POListForInvoice") {
        this.poCode = $event[0];
        // this.Name = $event[1];
        this.VendCode = $event[1];
        this.VendName = $event[2];
        this.showNext = true;
        this.detailsAvailable = true;
        this.VendCode1 = this.VendCode;
        this.scanVenderRefNo.nativeElement.focus();
      } else {
        if (this.VendCode1 != $event[0]) {
          this.poCode = "";
        }
        this.VendCode = $event[0];
        this.VendName = $event[1];
        this.VendCode1 = this.VendCode;
        this.showNext = true;
        this.detailsAvailable = true;
        //this.vendInputScanField.nativeElement.focus();
        this.poScanInputField.nativeElement.focus();
      }
    }
  }

  async onNextClick() {
    var result = await this.validateBeforeSubmit();
    let vrNO = sessionStorage.getItem(CommonConstants.VendRefNo);
    if (vrNO != undefined && vrNO != '') {
      if (this.VendRefNo.length <= 100) {
        sessionStorage.setItem(CommonConstants.VendRefNo, this.VendRefNo);
      } else {
        this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
      }
    } else {
      if (this.VendRefNo.length <= 100) {
        sessionStorage.setItem(CommonConstants.VendRefNo, this.VendRefNo);
      } else {
        this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
      }
    }
    this.isValidateCalled = false;
    console.log("validate result: " + result);
    if (result != undefined && result == false) {
      return;
    }

    if(this.IsUDFEnabled == "Y"){
      if (sessionStorage.getItem("GRPOHdrUDF") == undefined || sessionStorage.getItem("GRPOHdrUDF") == "") {
        if (this.ShowUDF('Header', false)) {
          return;
        }
      }
    }

    if (this.VendCode != undefined && this.VendCode != "") {
      this.inboundMasterComponent.selectedVernder = this.VendCode;
      this.inboundMasterComponent.InboundUserPreference = this.commonservice.getComponentVisibility();
      this.inboundMasterComponent.inboundComponent = 2;
      sessionStorage.setItem("VendCode", this.VendCode);
      sessionStorage.setItem("VendName", this.VendName);
      sessionStorage.setItem("selectedPO", "");
      sessionStorage.setItem("PONumber", this.poCode);
    }
    else {
      this.toastr.error('', this.translate.instant("Inbound_SelectVendorValidateMsg"));
    }
    this.persistingService.set('gridSettings', null);
  }

  OnCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

  onPOSelection($event) {
    sessionStorage.setItem("selectedPO", $event.selectedRows[0].dataItem.PONumber);
    this.inboundMasterComponent.inboundComponent = 2;
    this.inboundMasterComponent.InboundUserPreference = this.commonservice.getComponentVisibility();
    this.persistingService.set('gridSettings', null);
  }

  public openConfirmForDelete(rowindex, gridData: any) {
    this.dialogFor = "deleteRow";
    this.dialogMsg = this.translate.instant("Inbound_DoYouWantToDelete")
    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    this.rowindexForDelete = rowindex;
    this.gridDataAfterDelete = gridData;
    this.showConfirmDialog = true;
  }

  NoOfPrintCopies = 1;
  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;
    if ($event.Status == "yes") {
      switch ($event.From) {
        case ("deleteRow"):
          this.DeleteRowClick(this.rowindexForDelete, this.gridDataAfterDelete);
          break;
        case ("receiveSinglePDFDialog"):
          this.NoOfPrintCopies = $event.NoOfCopies;
          this.SubmitGoodsReceiptPO(JSON.parse(sessionStorage.getItem("AddToGRPO"), $event.NoOfCopies));
          this.showPDF = true;
          break;
      }
    } else {
      if ($event.Status == "cancel") {
        // when user click on cross button nothing to do.
      } else if ($event.From == "receiveSinglePDFDialog") {
        this.SubmitGoodsReceiptPO(JSON.parse(sessionStorage.getItem("AddToGRPO")));
        this.showPDF = false;
      }
    }
  }

  DeleteRowClick(rowindex, gridData: any) {
    var dataModel = sessionStorage.getItem("addToGRPOPONumbers");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
    } else {
      var inboundData = JSON.parse(dataModel);
      inboundData.PONumbers.splice(rowindex, 1);
      this.removePODetailData(this.Polist[rowindex].PONumber);
    }
    this.Polist.splice(rowindex, 1);
    sessionStorage.setItem("addToGRPOPONumbers", JSON.stringify(inboundData));
    gridData.data = this.Polist;
    if (this.Polist.length > 0) {
      this.showGRPOGridAndBtn = true;
    } else {
      this.showGRPOGridAndBtn = false;
    }
  }

  removePODetailData(PONumbers: any) {
    var inboundData = JSON.parse(sessionStorage.getItem("AddToGRPO"));
    if (inboundData != undefined && inboundData != null && inboundData != "") {
      for (var i = 0; i < inboundData.POReceiptLots.length; i++) {
        if (inboundData.POReceiptLots[i].PONumber == PONumbers) {

          for (var j = 0; j < inboundData.POReceiptLotDetails.length; j++) {
            if (inboundData.POReceiptLotDetails[j].ParentLineNo == inboundData.POReceiptLots[i].Line) {
              inboundData.POReceiptLotDetails.splice(j, 1);
              j = -1;
            }
          }

          while(inboundData.UDF.length > 0){
            let index = inboundData.UDF.findIndex(e => e.LineNo == inboundData.POReceiptLots[i].Line)
            if(index == -1){
              break;
            }
            inboundData.UDF.splice(index, 1);
          }

          for (var m = 0; m < inboundData.LastSerialNumber.length; m++) {
            if (inboundData.LastSerialNumber[m].ItemCode == inboundData.POReceiptLots[i].ItemCode) {
              inboundData.LastSerialNumber.splice(m, 1);
              m = -1;
            }
          }
          inboundData.POReceiptLots.splice(i, 1);
        }
      }
      sessionStorage.setItem("AddToGRPO", JSON.stringify(inboundData));
    }

    var GRPOReceieveData = JSON.parse(sessionStorage.getItem("GRPOReceieveData"));
    if (GRPOReceieveData != undefined && GRPOReceieveData != null && GRPOReceieveData != "") {
      for (var i = 0; i < GRPOReceieveData.POReceiptLots.length; i++) {
        if (GRPOReceieveData.POReceiptLots[i].PONumber == PONumbers) {

          for (var j = 0; j < GRPOReceieveData.POReceiptLotDetails.length; j++) {
            if (GRPOReceieveData.POReceiptLotDetails[j].ParentLineNo == GRPOReceieveData.POReceiptLots[i].Line) {
              GRPOReceieveData.POReceiptLotDetails.splice(j, 1);
              j = -1;
            }
          }

          while(GRPOReceieveData.UDF.length > 0){
            let index = GRPOReceieveData.UDF.findIndex(e => e.LineNo == GRPOReceieveData.POReceiptLots[i].Line)
            if(index == -1){
              break;
            }
            GRPOReceieveData.UDF.splice(index, 1);
          }

          for (var m = 0; m < GRPOReceieveData.LastSerialNumber.length; m++) {
            if (GRPOReceieveData.LastSerialNumber[m].ItemCode == GRPOReceieveData.POReceiptLots[i].ItemCode) {
              GRPOReceieveData.LastSerialNumber.splice(m, 1);
              m = -1;
            }
          }
          GRPOReceieveData.POReceiptLots.splice(i, 1);
        }
      }
      sessionStorage.setItem("GRPOReceieveData", JSON.stringify(GRPOReceieveData));
    }

  }


  public displayPDF(dNo: string, noOfCopy) {
    this.showLoader = true;
    this.inboundService.printingServiceForSubmitGRPO(dNo, 6, noOfCopy).subscribe(
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
            //this.inboundMasterComponent.inboundComponent = 1;
          }
          //  console.log("filename:" + this.fileName);
          //console.log("filename:" + this.base64String);
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

  onInboundScan() {
    // alert("scan click");
  }

  onHiddenScanClick() {
    this.onGS1ItemScan();
  }

  onGS1ItemScan() {
    var inputValue = (<HTMLInputElement>document.getElementById('inboundScanInputField')).value;
    if (inputValue.length > 0) {
      this.VendCode = inputValue;
      this.OnVendorChange();
    }
  }

  //------Add PO Scan---

  poCode: string = "";
  Name: string;

  inbound1_pohiddenScanButton() {
    var inputValue = (<HTMLInputElement>document.getElementById('inboundScanInputField')).value;
    if (inputValue.length > 0) {
      this.poCode = inputValue;
      this.OnPOChange();
    }
  }

  OnPOChangeBlur() {
    if (this.isValidateCalled) {
      return;
    }
    this.OnPOChange();
  }

  async OnPOChange(): Promise<any> {
    if (this.poCode == "" || this.poCode == undefined) {
      return;
    }
    this.showLoader = true;
    var result = false;
    await this.inboundService.IsPOExists(this.poCode, "", this.inboundFromWhere).then(
      data => {
        this.showLoader = false;
        if (data != null) {
          if (data.length > 0) {
            this.VendCode = data[0].CODE
            this.VendName = data[0].NAME
            this.showNext = true;
            this.detailsAvailable = true;
            this.VendCode1 = this.VendCode;
            result = true
          }
          else {
            this.poCode = "";
            if (this.inboundFromWhere == 2) {
              this.toastr.error('', this.translate.instant("Inbound_InvoiceExistMessage"));
            } else {
              this.toastr.error('', this.translate.instant("Inbound_POExistMessage"));
            }

            this.poScanInputField.nativeElement.focus()
            result = false;
          }
        } else {
          this.poScanInputField.nativeElement.focus()
          this.poCode = "";
          this.toastr.error('', this.translate.instant("Inbound_POExistMessage"));
          result = false;
        }
      },
      error => {
        this.showLoader = false;
        this.toastr.error('', error);
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
        result = false;
      }
    );
    return result;
  }

  onPOlookupClick() {
    this.showLoader = true;
    this.inboundService.getPOList(this.futurepo,
      this.VendCode, "", this.inboundFromWhere).subscribe(
        (data: any) => {
          this.showLoader = false;
          if (data != undefined) {
            if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
              this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                this.translate.instant("CommonSessionExpireMsg"));
              return;
            }
            if (data.Table == undefined || data.Table == null || data.Table.length == 0) {
              this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
              return;
            }
            this.showLookupLoader = false;
            this.serviceData = data.Table;
            this.lookupfor = "POList";
            var ibFromWhere: any = sessionStorage.getItem("inboundOptionType");
            if (ibFromWhere == 1) {
              this.lookupfor = "POList";
            } else {
              this.lookupfor = "POListForInvoice";
            }

          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        },
        error => {
          this.showLoader = false;
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

  OnVendRefNoChangeBlur() {
    if (this.isValidateCalled) {
      return;
    }
    this.OnVendRefNoChange();
  }

  OnVendRefNoChange() {

    // if(this.VendRefNo.length <= 100){
    //   sessionStorage.setItem("VendRefNo", this.VendRefNo);
    // }else{
    //   this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
    // }

    //   let vrNO = sessionStorage.getItem(CommonConstants.VendRefNo);
    //   if (vrNO != undefined && vrNO != '') {
    //     if(this.VendRefNo.length <= 100){
    //       sessionStorage.setItem(CommonConstants.VendRefNo, this.VendRefNo);
    //     }else{
    //       this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
    //     }
    //  }
  }

  onHiddenVendCodeScanClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('InboundDetailVendScanInputField')).value;
    if (inputValue.length > 0) {
      this.VendCode = inputValue;
    }
    this.OnVendorChange();
  }

  onHiddenSOScanClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('inboundDetailPOScanInputField')).value;
    if (inputValue.length > 0) {
      this.poCode = inputValue;

    }
    this.OnPOChange();

  }

  isValidateCalled: boolean = false;
  async validateBeforeSubmit(): Promise<any> {
    this.isValidateCalled = true;
    var currentFocus = document.activeElement.id;
    console.log("validateBeforeSubmit current focus: " + currentFocus);

    if (currentFocus != undefined) {
      if (currentFocus == "InboundDetailVendScanInputField") {
        return this.OnVendorChange();
      } else if (currentFocus == "inboundDetailPOScanInputField") {
        return this.OnPOChange();
      } else if (currentFocus == "venderRefNo") {
        return this.OnVendRefNoChangeBlur();
      }
    }
  }

  ShowUDF(displayArea, UDFButtonClicked): boolean {
    this.displayArea = displayArea;
    let UDFStatus;
    if (sessionStorage.getItem("GRPOHdrUDF") != undefined && sessionStorage.getItem("GRPOHdrUDF") != "") {
      UDFStatus = this.commonservice.loadUDF(displayArea, this.commonservice.getUDFData(), JSON.parse(sessionStorage.getItem("GRPOHdrUDF")));
    }else{
      UDFStatus = this.commonservice.loadUDF(displayArea, this.commonservice.getUDFData());
    }    
    if (!UDFButtonClicked) {
      if (UDFStatus != "MANDATORY_AVL") {
        return false;
      }
    }else{
      if (UDFStatus == "NO_DATA") {
        this.toastr.error('', this.translate.instant("No UDF available"));
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
    this.UDF = [];
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
          Key: itUDFComponentData[i].AliasID,
          DocEntry: 0
        });
      }
      sessionStorage.setItem("GRPOHdrUDF", JSON.stringify(this.UDF));
    }
    this.templates = [];
  }
}
