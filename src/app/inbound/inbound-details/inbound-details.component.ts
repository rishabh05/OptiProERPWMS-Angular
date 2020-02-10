import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { InboundService } from '../../services/inbound.service';
import { Commonservice } from '../../services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { InboundMasterComponent } from '../inbound-master.component';
import { StatePersistingServiceService } from 'src/app/services/state-persisting-service.service';

@Component({
  selector: 'app-inbound-details',
  templateUrl: './inbound-details.component.html',
  styleUrls: ['./inbound-details.component.scss']
})
export class InboundDetailsComponent implements OnInit,AfterViewInit {
  
  @ViewChild('VendScanInputField') vendInputScanField:ElementRef;
  @ViewChild('poScanInputField') poScanInputField;
  @ViewChild('scanVenderRefNo') scanVenderRefNo;
  public viewLines: boolean;
  showLookupLoader: boolean = true; 
  VendRefNo: string="";
  serviceData: any[];
  lookupfor: string;
  VendCode: string;
  VendCode1: string;
  VendName: string;
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
  ngAfterViewInit(): void {
    this.vendInputScanField.nativeElement.focus();
  }

  //commenting in 1210 GA branch
  constructor(private inboundService: InboundService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent,private persistingService:StatePersistingServiceService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    this.VendCode = localStorage.getItem("VendCode");
    this.VendName = localStorage.getItem("VendName");
    if(this.VendCode != ""){
      this.showNext = true;
    }else{
      this.showNext = false;
    }
    this.dateAvailableToReceieve();
  }

 

  dateAvailableToReceieve() {
    var dataModel = localStorage.getItem("addToGRPOPONumbers");
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
    var dataModel = localStorage.getItem("AddToGRPO");
    if (dataModel != null && dataModel != undefined && dataModel != "") {
      this.showPrintConfirmDialog();
      
    }
  }
  showPrintConfirmDialog(){
    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    this.dialogFor = "receiveSinglePDFDialog";
    this.dialogMsg = this.translate.instant("Inbound_PrintAllLabelsAfterSubmit");
    this.showConfirmDialog = true; // show dialog 
  }
  SubmitGoodsReceiptPO(oSubmitPOLotsObj: any) {
    this.showLoader = true;
    this.inboundService.SubmitGoodsReceiptPO(oSubmitPOLotsObj).subscribe(
      (data: any) => {
        this.showLoader = false;
        //console.log(data);
        if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
          // alert("Goods Receipt PO generated successfully with Doc No: " + data.DocEntry);
          this.toastr.success('', this.translate.instant("Inbound_GRPOSuccessMessage") +" "+ data[0].SuccessNo);
          localStorage.setItem("Line", "0");
          localStorage.setItem("GRPOReceieveData", "");
          localStorage.setItem("AddToGRPO", "");
          localStorage.setItem("addToGRPOPONumbers", "");
          this.dateAvailableToReceieve();
          if (this.showPDF) {
            //show pdf
            this.displayPDF(data[0].DocEntry);
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
      },
      error => {
        console.log("Error: ", error);
        // alert("fail");
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
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
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       }       
        else{
          this.toastr.error('', error);
        } 
      }
    );
  }

  
  OnVendorChange() {
    
    if (this.VendCode == "" || this.VendCode == undefined) {
      return;
    }
    this.showLoader = true;
    this.inboundService.IsVendorExists(this.VendCode).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data != undefined && data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data[0].Result == "0") {
            this.toastr.error('', this.translate.instant("Inbound_VendorExistMessge"));
            this.VendCode = "";
            this.showNext = false;
            this.poCode = "";
            this.VendCode1= this.VendCode;
            this.vendInputScanField.nativeElement.focus()
            return;
          } else {
            if(this.VendCode1 != data[0].ID){
              this.poCode = "";
            }
            this.VendCode = data[0].ID;
            this.VendName = data[0].Name;
            this.showNext = true;
            this.VendCode1= this.VendCode;
          }
        } else {
          this.toastr.error('', this.translate.instant("Inbound_VendorExistMessge"));
          this.VendCode = "";
          this.showNext = false;
          this.vendInputScanField.nativeElement.focus()
        }
      },
      error => {
        this.showLoader = false;
        // console.log("Error: ", error);
        // this.toastr.error('', error);
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      }
    );
  }

  getLookupValue($event) {
    if ($event != null && $event == "close") {
      //nothing to do
      return;
    }
    else {

      if (this.lookupfor == "POList") {
        this.poCode = $event[0];
        // this.Name = $event[1];
        this.VendCode = $event[1];
        this.VendName = $event[2];
        this.showNext = true;
        this.detailsAvailable = true;
        this.VendCode1= this.VendCode;
        this.scanVenderRefNo.nativeElement.focus();
      }else{
        if(this.VendCode1 != $event[0]){
          this.poCode = "";
        }
        this.VendCode = $event[0];
        this.VendName = $event[1];
        this.VendCode1= this.VendCode;
        this.showNext = true;
        this.detailsAvailable = true;
        //this.vendInputScanField.nativeElement.focus();
        this.poScanInputField.nativeElement.focus();
      }
    }
  }

  public onNextClick() {
    if (this.VendCode != undefined && this.VendCode != "") {
      this.inboundMasterComponent.selectedVernder = this.VendCode;
      this.inboundMasterComponent.inboundComponent = 2;
      localStorage.setItem("VendCode", this.VendCode);
      localStorage.setItem("VendName", this.VendName);
      localStorage.setItem("selectedPO", "");
      localStorage.setItem("PONumber", this.poCode);
    }
    else {
      this.toastr.error('', this.translate.instant("Inbound_SelectVendorValidateMsg"));
    }
    this.persistingService.set('gridSettings',null);
  }

  OnCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

  onPOSelection($event) {
    localStorage.setItem("selectedPO", $event.selectedRows[0].dataItem.PONumber);
    this.inboundMasterComponent.inboundComponent = 2;

    this.persistingService.set('gridSettings',null);
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

  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;
    if ($event.Status == "yes") {
      switch ($event.From) {
        case ("deleteRow"):
          this.DeleteRowClick(this.rowindexForDelete, this.gridDataAfterDelete);
          break;
        case ("receiveSinglePDFDialog"):
          this.SubmitGoodsReceiptPO(JSON.parse(localStorage.getItem("AddToGRPO")));
          this.showPDF = true;
          break;
          
      }
    } else {
      if ($event.Status == "cancel") {
        // when user click on cross button nothing to do.
      }else if($event.From == "receiveSinglePDFDialog"){
        this.SubmitGoodsReceiptPO(JSON.parse(localStorage.getItem("AddToGRPO")));
      }
    }
  }

  DeleteRowClick(rowindex, gridData: any) {
    var dataModel = localStorage.getItem("addToGRPOPONumbers");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
    } else {
      var inboundData = JSON.parse(dataModel);
      inboundData.PONumbers.splice(rowindex, 1);
      this.removePODetailData(this.Polist[rowindex].PONumber);
    }
    this.Polist.splice(rowindex, 1);
    localStorage.setItem("addToGRPOPONumbers", JSON.stringify(inboundData));
    gridData.data = this.Polist;
    if (this.Polist.length > 0) {
      this.showGRPOGridAndBtn = true;
    } else {
      this.showGRPOGridAndBtn = false;
    }
  }

  removePODetailData(PONumbers: any){
    var inboundData = JSON.parse(localStorage.getItem("AddToGRPO"));
    if (inboundData != undefined && inboundData != null && inboundData != "") {
      for (var i = 0; i < inboundData.POReceiptLots.length; i++) {
        if (inboundData.POReceiptLots[i].PONumber == PONumbers) {

          for (var j = 0; j < inboundData.POReceiptLotDetails.length; j++) {
            if (inboundData.POReceiptLotDetails[j].ParentLineNo == inboundData.POReceiptLots[i].Line) {
              inboundData.POReceiptLotDetails.splice(j, 1);
              j=-1;
            }
          }

          for (var k = 0; k < inboundData.UDF.length; k++) {
            if (inboundData.UDF[k].Key == "OPTM_TARGETWHS" &&
              inboundData.UDF[k].LineNo == inboundData.POReceiptLots[i].Line) {
              inboundData.UDF.splice(k, 1);
            }
  
            if (inboundData.UDF[k].Key == "OPTM_TARGETBIN" &&
              inboundData.UDF[k].LineNo == inboundData.POReceiptLots[i].Line) {
              inboundData.UDF.splice(k, 1);
            }
          }

          for (var m = 0; m < inboundData.LastSerialNumber.length; m++) {
            if (inboundData.LastSerialNumber[m].ItemCode == inboundData.POReceiptLots[i].ItemCode) {
              inboundData.LastSerialNumber.splice(m, 1);
              m=-1;
            }
          }

          inboundData.POReceiptLots.splice(i, 1);
        }
      }
      localStorage.setItem("AddToGRPO", JSON.stringify(inboundData));
    }



    var GRPOReceieveData = JSON.parse(localStorage.getItem("GRPOReceieveData"));
    if (GRPOReceieveData != undefined && GRPOReceieveData != null && GRPOReceieveData != "") {
      for (var i = 0; i < GRPOReceieveData.POReceiptLots.length; i++) {
        if (GRPOReceieveData.POReceiptLots[i].PONumber == PONumbers) {

          for (var j = 0; j < GRPOReceieveData.POReceiptLotDetails.length; j++) {
            if (GRPOReceieveData.POReceiptLotDetails[j].ParentLineNo == GRPOReceieveData.POReceiptLots[i].Line) {
              GRPOReceieveData.POReceiptLotDetails.splice(j, 1);
              j=-1;
            }
          }

          for (var k = 0; k < GRPOReceieveData.UDF.length; k++) {
            if (GRPOReceieveData.UDF[k].Key == "OPTM_TARGETWHS" &&
              GRPOReceieveData.UDF[k].LineNo == GRPOReceieveData.POReceiptLots[i].Line) {
              GRPOReceieveData.UDF.splice(k, 1);
            }
  
            if (GRPOReceieveData.UDF[k].Key == "OPTM_TARGETBIN" &&
              GRPOReceieveData.UDF[k].LineNo == GRPOReceieveData.POReceiptLots[i].Line) {
              GRPOReceieveData.UDF.splice(k, 1);
            }
          }

          for (var m = 0; m < GRPOReceieveData.LastSerialNumber.length; m++) {
            if (GRPOReceieveData.LastSerialNumber[m].ItemCode == GRPOReceieveData.POReceiptLots[i].ItemCode) {
              GRPOReceieveData.LastSerialNumber.splice(m, 1);
              m=-1;
            }
          }

          GRPOReceieveData.POReceiptLots.splice(i, 1);
        }
      }
      localStorage.setItem("GRPOReceieveData", JSON.stringify(GRPOReceieveData));
    }

  }


  public displayPDF(dNo: string) {
    this.showLoader = true;
    this.inboundService.printingServiceForSubmitGRPO(dNo).subscribe(
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
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
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

  OnPOChange() {
    if (this.poCode == "" || this.poCode == undefined) {
      return;
    }
    this.showLoader = true;
    this.inboundService.IsPOExists(this.poCode, "").subscribe(
      data => {
        this.showLoader = false;
        if (data != null) {
          if (data.length > 0) {
            this.VendCode = data[0].CODE
            this.VendName = data[0].NAME
            this.showNext = true;
            this.detailsAvailable = true;
            this.VendCode1= this.VendCode;
          }
          else {
            this.poCode = "";
            this.toastr.error('', this.translate.instant("Inbound_POExistMessage"));
            this.poScanInputField.nativeElement.focus()
            return;
          }
        } else {
          this.poScanInputField.nativeElement.focus()
          this.poCode = "";
          this.toastr.error('', this.translate.instant("Inbound_POExistMessage"));
        }
      },
      error => {
        this.showLoader = false;
        this.toastr.error('', error);
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      }
    );
  }

  onPOlookupClick() {
    this.showLoader = true;
    this.inboundService.getPOList(false,
      this.VendCode, "").subscribe(
        (data: any) => {
          this.showLoader = false;
          if (data != undefined) {
            if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
              this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                this.translate.instant("CommonSessionExpireMsg"));
              return;
            }
            this.showLookupLoader = false;
            this.serviceData = data.Table;
            this.lookupfor = "POList";
          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        },
        error => {
          this.showLoader = false;
          console.log("Error: ", error);
          if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
            this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
         } 
         else{
          this.toastr.error('', error);
         }
        }
      );
  }


  OnVendRefNoChange() {
    if(this.VendRefNo.length <= 100){
      localStorage.setItem("VendRefNo", this.VendRefNo);
    }else{
      this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
    }
  }

  onHiddenVendCodeScanClick(){
    var inputValue = (<HTMLInputElement>document.getElementById('InboundDetailVendScanInputField')).value;
    if (inputValue.length > 0) {
      this.VendCode = inputValue;
    }
    this.OnVendorChange();
  }

  onHiddenSOScanClick(){
    var inputValue = (<HTMLInputElement>document.getElementById('inboundDetailPOScanInputField')).value;
    if (inputValue.length > 0) {
      this.poCode = inputValue;
      
    }
    this.OnPOChange();
    
  }
  
}
