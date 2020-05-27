//===============================================================================
// © 2018 Optipro.  All rights reserved.
// Original Author: Ankur Sharma
// Original Date: 13 March 2019
//==============================================================================

import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { LabelPrintReportsService } from '../../services/label-print-reports.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Commonservice } from '../../services/commonservice.service';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-item-label',
  templateUrl: './item-label.component.html',
  styleUrls: ['./item-label.component.scss']
})
export class ItemLabelComponent implements OnInit {

  //reference to the input components of html.
  @ViewChild('itemCodeIp') itemCodeIp: ElementRef;
  @ViewChild('batchSrBinIp') batchSrBinIp: ElementRef;
  @ViewChild('noOfCopiesIp') noOfCopiesIp: ElementRef;


  showLoader: boolean = false;
  showLookupLoader: boolean = true;
  serviceData: any[];
  lookupfor: string;

  itemCode: string = "";
  itemTracking: string = "";
  noOfCopies: string = "1";


  selectedLots: any;
  binNo: string = "";
  LOTNoForNone: string = "";

  showPDF = false;
  fileName: string = "";
  base64String: string = "";

  // different subscription references.
  itemLabelSubs: ISubscription;
  batchLabelSubs: ISubscription;
  isItemExistsSubs: ISubscription;
  itemTrackingSubs: ISubscription;
  lotsListSubs: ISubscription;
  checkBinForItemSubs: ISubscription;
  lotScanListWithoutWhseBinSubs: ISubscription;
  copyCountSubs: ISubscription;
  printServiceSubs: ISubscription;

  displayPDF: boolean = false;

  constructor(private renderer: Renderer, private commonservice: Commonservice, private router: Router, private labelPrintReportsService: LabelPrintReportsService,
    private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {

    this.getCopyCountForItem();
  }

  ngAfterViewInit(): void {
    this.itemCodeIp.nativeElement.focus();
  }

  /**
   * Item code lookup click.
   */
  OnItemCodeLookupClick() {
    console.log('button click');
    // this.showLookupLoader = true;
    this.getItemList();
  }

  /**
   * Batch serial lookup click.
   */
  OnBatchSerialLookupClick() {

    this.showLotsList();
  }

  /**
   * Method to get list of inquries from server.
   */
  public getItemList() {
    this.showLoader = true;
    //this.showLoader = true; this.getPIlistSubs = 
    this.itemLabelSubs = this.labelPrintReportsService.getItemCode().subscribe(
      data => {
        if (data != undefined && data.length > 0) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          this.serviceData = data;
          this.lookupfor = "ItemsList";
        }
        else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
        this.showLoader = false;
      },
      error => {
        this.showLoader = false;
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      },
    );
  }

  OnItemCodeChangeBlur(){
    if(this.isValidateCalled){
      return 
    }
    this.OnItemCodeChange();
  }

  /**
   * 
   * This method will check if entered code is valid or not on field blur event.
   */
  async OnItemCodeChange(): Promise<any>{
    if (this.itemCode == "" || this.itemCode == undefined) {
      this.itemTracking = "";
      return;
    }
    this.binNo = "";
    this.showLoader = true;
    var result = false
    await this.labelPrintReportsService.isItemExistsPromise(this.itemCode).then(
      data => {
        console.log("inside OnItemCodeChange")
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          console.log("" + data);
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data == "0" || data[0] == "0") {
            this.toastr.error('', this.translate.instant("InvalidItemCode"));
            this.itemCode = "";
            result = false
          } else {
            //do the needful for correct data.
            this.batchSrBinIp.nativeElement.focus(); //just focus on next field
            result = true
            this.getItemTracking(this.itemCode);
          }
        } else {
          this.toastr.error('', this.translate.instant("InvalidItemCode"));
          this.itemCode = "";
          result = false
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
        result = false
      }
    );
    return result
  }

  OnLotsChangeBlur(){
    if(this.isValidateCalled){
      return;
    }
    this.OnLotsChange();
  }

  /**
   * This method will check if entered code is valid or not on field blur event.
   */
  async OnLotsChange(): Promise<any>{
    if (this.binNo == undefined || this.binNo == "") {
      return;
    }
    if (this.itemCode != undefined && this.itemCode != null && this.itemCode != "") {
      if (this.itemTracking == "N") {
        //item type is empty then get tracking type
        await this.checkBinForNonTrackedItems();
      }
      else {
        await this.checkBinForOtherTrackedItems();
      }
    } else {
      await this.checkBinForOtherTrackedItems();
    }

  }

  /**
   * get  type (tracking) of item if not available.
   * @param itemCode 
   */
  getItemTracking(itemCode: string) {

    this.itemTrackingSubs = this.labelPrintReportsService.getItemTracking(itemCode).subscribe(
      data => {
        if (data != undefined && data.length > 0 && data != "0") {
          console.log("" + data);
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data == "0" || data[0] == "0") { return; }
          this.itemTracking = data;


        } else {
          //  this.toastr.error('', this.translate.instant("InvalidItemCode"));
          this.itemCode = "";
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
  /**
   * @param $event this will return the value on row click of lookup grid.
   */
  getLookupValue($event) {
    if ($event != null && $event == "close") {
      //nothing to do
      return;
    }
    else {
      if (this.lookupfor == "ItemsList") {
        this.itemCode = $event[0];
        this.binNo = "";
        this.batchSrBinIp.nativeElement.focus();
      }
      else if (this.lookupfor == "LotsList") {
        console.log("value of lots" + $event);
        console.log("value of lots" + $event.LOTNO);
        if($event[9] == 'N'){
          this.binNo = $event[3];
        }else{
          this.binNo = $event[0];
        }
        this.LOTNoForNone = $event[0];
        this.itemCode = $event[2];
        // this.batchSrBinIp.nativeElement.focus();
      }
    }
    this.lookupfor = "";
  }

  /**
   * Method to get list of inquries from server.
   */
  public showLotsList() {
    this.showLoader = true;
    this.lotsListSubs = this.labelPrintReportsService.getLotsList(this.itemCode).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;

          this.serviceData = data;
          this.lookupfor = "LotsList";
        }
        else {
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
      },
    );
  }

  async checkBinForNonTrackedItems(): Promise<any> {
    this.showLoader = true;
    if(this.LOTNoForNone == null || this.LOTNoForNone == undefined || this.LOTNoForNone == ""){
      this.LOTNoForNone = this.binNo;
    }
    this.checkBinForItemSubs = this.labelPrintReportsService.checkBinForItemLabelReport(this.itemCode, this.binNo).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          console.log("" + data);
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data == "0" || data[0] == "0") {
            this.toastr.error('', this.translate.instant("INVALIDBIN"));
            this.binNo = "";
            return;
          }
          this.binNo = data[0].BINNO; //check this code.
        } else {
          this.toastr.error('', this.translate.instant("INVALIDBIN"));
          this.binNo = "";
        }
      },
      error => {
        this.binNo = "";
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
  checkBinForOtherTrackedItems() {
    this.showLoader = true;

    if(this.LOTNoForNone == null || this.LOTNoForNone == undefined || this.LOTNoForNone == ""){
      this.LOTNoForNone = this.binNo;
    }
    this.lotScanListWithoutWhseBinSubs = this.labelPrintReportsService.getLotScanListWithoutWhseBinAndItemWise(this.itemCode, this.LOTNoForNone).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          console.log("" + data);
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data == "0" || data[0] == "0") {
            this.toastr.error('', this.translate.instant("InvalidBatch"));
            this.binNo = "";
            return;
          }
          this.binNo = data[0].LOTNO; //check this code.
        } else {
          this.toastr.error('', this.translate.instant("InvalidBatch"));
          this.binNo = "";
        }
      },
      error => {
        this.toastr.error('', error);
        this.binNo = "";
        this.showLoader = false;
      }
    );
  }

  /**
   * this method will check no. of copy count value from server.
   */
  getCopyCountForItem() {
    this.copyCountSubs = this.labelPrintReportsService.getCopyCountForItemLabelReport().subscribe(
      (data: any) => {
        if (data != undefined && data.length > 0) {
          console.log("" + data);
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data == "0" || data[0] == "0") {
            this.noOfCopies = "1";
            return;
          }
          this.noOfCopies = data;
        } else {
          this.noOfCopies = "1";
        }
      },
      error => {
        this.noOfCopies = "1";
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
   * handel print click, validate data print data api call.
   */
  async OnPrintClick() {
    var result = await this.validateBeforeSubmit();
    this.isValidateCalled = false;
    console.log("validate result: " + result);
    if (result != undefined && result == false) {
      return;
    }

    console.log('print click');

    if (!this.checkValidation()) {
      return;
    }
    this.showLoader = true;
    this.printServiceSubs = this.labelPrintReportsService.printingServiceForItemLabel(this.itemCode, this.binNo, this.noOfCopies).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          console.log("" + data);
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data.Detail != null && data.Detail != undefined && data.Detail[0] != null
            && data.Detail[0] != undefined) {
            this.fileName = data.Detail[0].FileName;
            this.base64String = data.Detail[0].Base64String;
          }

          // if(this.base64String !=null && this.base64String != ""){

          // this.showPdf();
          // }
          if (this.base64String != null && this.base64String != "") {
            // this.showPdf(); // this function is used to display pdf in new tab.
            this.base64String = 'data:application/pdf;base64,' + this.base64String;
            this.displayPDF = true;
            this.commonservice.refreshDisplyPDF(true);
 
          } else {
            if(data.Error!=undefined && data.Error!=null ){
              this.toastr.error('', data.Error[0].ERRORMSG);
            }else{
              this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
            }
          }

          console.log("filename:" + this.fileName);
          console.log("filename:" + this.base64String);
        } else {
          if(data.Error!=undefined && data.Error!=null ){
            this.toastr.error('', data.Error[0].ERRORMSG);
          }else{
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
          
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


  /**
   * show pdf 
   * @param base64 
   */
  showPdf() {
    this.base64String = 'data:application/pdf;base64,' + this.base64String; //aeded type: application/pdf for pdf file
    this.showPDF = true;
    let pdfWindow = window.open("")
    pdfWindow.document.write("<iframe width='80%' title=" + this.fileName + " height='80%' src=' " + encodeURI(this.base64String) + "'></iframe>");

  }

  /**
   * this method will validate all input fields.
   */
  checkValidation(): boolean {
    if (this.itemCode == "") {
      this.toastr.error('', this.translate.instant("ItemCannotbeBlank"));
      this.itemCodeIp.nativeElement.focus();

      return false;
    }
    if (this.binNo == "") {
      this.toastr.error('', this.translate.instant("Lotcannotbeblank"));
      this.batchSrBinIp.nativeElement.focus();
      return false;
    }
    if (this.noOfCopies == "") {
      this.toastr.error('', this.translate.instant("NoOfCopiesCannotbeBlank"));
      this.noOfCopiesIp.nativeElement.focus();
      return false;
    }
    return true;
  }

  ngOnDestroy() {
    if (this.batchLabelSubs != undefined)
      this.batchLabelSubs.unsubscribe();
    if (this.checkBinForItemSubs != undefined)
      this.checkBinForItemSubs.unsubscribe();
    if (this.copyCountSubs != undefined)
      this.copyCountSubs.unsubscribe();
    if (this.isItemExistsSubs != undefined)
      this.isItemExistsSubs.unsubscribe();
    if (this.itemLabelSubs != undefined)
      this.itemLabelSubs.unsubscribe();
    if (this.itemTrackingSubs != undefined)
      this.itemTrackingSubs.unsubscribe();
    if (this.lotScanListWithoutWhseBinSubs != undefined)
      this.lotScanListWithoutWhseBinSubs.unsubscribe();
    if (this.lotsListSubs != undefined)
      this.lotsListSubs.unsubscribe();
    if (this.printServiceSubs != undefined)
      this.printServiceSubs.unsubscribe();
  }

  closePDF() {
    console.log("PDF dialog is closed");
  }
  OnCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

  onHiddenItemLabelItemCodeScanClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('itemLabelItemCodeInput')).value;
    if (inputValue.length > 0) {
      this.itemCode = inputValue;
    }
    this.OnItemCodeChange();
  }
  onHiddenItemLabelBatchSrScanClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('itemLabelBatchSerialInput')).value;
    if (inputValue.length > 0) {
      this.binNo = inputValue;
    }
    this.OnLotsChange()
  }

  isValidateCalled: boolean = false;
  async validateBeforeSubmit():Promise<any>{
    this.isValidateCalled = true;
    var currentFocus = document.activeElement.id;
    console.log("validateBeforeSubmit current focus: "+currentFocus);
    
    if(currentFocus != undefined){
      if(currentFocus == "itemLabelItemCodeInput"){
        return this.OnItemCodeChange();
      } else if(currentFocus == "itemLabelBatchSerialInput"){
        return this.OnLotsChange();
      }
    }
  }
}

