import { Component, OnInit, ViewChild } from '@angular/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { Router } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { LabelPrintReportsService } from 'src/app/services/label-print-reports.service';
import { ISubscription } from 'rxjs/Subscription';
import { debug } from 'util';

@Component({
  selector: 'app-bin-label',
  templateUrl: './bin-label.component.html',
  styleUrls: ['./bin-label.component.scss']
})
export class BinLabelComponent implements OnInit {


  //reference to the input components of html.
  @ViewChild('fromBinIp') fromBinInput;
  @ViewChild('toBinIp') toBinInput;
  @ViewChild('numberOfCopiesIp') noOfCopiesInput;
  showLoader: boolean = false;
  showLookupLoader: boolean = true;
  fromBin: string = "";
  toBin: string = "";
  whsCode: string = "";
  serviceData: any[];
  lookupfor: string;

  noOfCopies: string = "1"; 

  showPDF = false;
  fileName: string = "";
  base64String: string = "";

  // reference variables for all subscribers.
  fromBinListSubs: ISubscription;
  toBinListSubs: ISubscription;
  copyCountSubs: ISubscription;
  printServiceSubs: ISubscription;

  isBinExistsSubs: ISubscription;

  displayPDF:boolean = false;
  constructor(private commonservice: Commonservice, private router: Router, private labelPrintReportsService: LabelPrintReportsService,
    private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    this.getCopyCountForBin();
  }

  /**
   * Item code lookup click.
   */
  OnFromBinLookupClick() {
    console.log('from bin click');
    this.getFromBinsList();
  }
  /**
   * Batch serial lookup click.
   */
  OnToBinLookupClick() {
    console.log('from bin click');
    this.getToBinsList();
  }


  /**
   * Method to get list of inquries from server.
   */
  public getFromBinsList() {

    this.showLoader = true; //this.getPIlistSubs = 
    this.fromBinListSubs = this.labelPrintReportsService.getFromBinsList().subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            return;
          }
          this.showLookupLoader = false;
          this.serviceData = data;
          this.lookupfor = "FromBinList";
        }
        else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLoader = false;
        this.toastr.error('', error);
      },
    );
  }


  /**
   * Method to get list of inquries from server.
   */
  public getToBinsList() {

    this.showLoader = true; //this.getPIlistSubs = 
    this.toBinListSubs = this.labelPrintReportsService.getToBinsList().subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            return;
          }
          this.serviceData = data;
          this.lookupfor = "ToBinList";
        }
        else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLoader = false;
        this.toastr.error('', error);
      },
    );
  }

  ngOnDestroy() {

    if (this.fromBinListSubs != undefined)
      this.fromBinListSubs.unsubscribe();
    if (this.toBinListSubs != undefined)
      this.toBinListSubs.unsubscribe();
    if (this.copyCountSubs != undefined)
      this.copyCountSubs.unsubscribe();
    if (this.printServiceSubs != undefined)
      this.printServiceSubs.unsubscribe();
  }

  /**
  * @param $event this will return the value on row click of lookup grid.
  */
  getLookupValue($event) {

    if (this.lookupfor == "FromBinList") {
      this.fromBin = $event[0];
      //this.whsCode = $event;
      console.log("selected item:" + this.fromBin);

    }
    if (this.lookupfor == "ToBinList") {
      this.toBin = $event[0];
      //this.whsCode = $event;
      console.log("selected item:" + this.toBin);

    }
  }

  /**
  * this method will validate all input fields.
  */
  checkValidation(): boolean {
    if (this.fromBin == "") {
      this.toastr.error('', this.translate.instant("FromBinMsg"));
      this.fromBinInput.nativeElement.focus();
      return false;
    }
    if (this.toBin == "") {
      this.toastr.error('', this.translate.instant("ToBinMsg"));
      this.toBinInput.nativeElement.focus();
      return false;
    }
    if (this.noOfCopies == "") {
      this.toastr.error('', this.translate.instant("NoOfCopiesCannotbeBlank"));
      this.noOfCopiesInput.nativeElement.focus();
      return false;
    }
    return true;
  }


  /**
   * this method will check no. of copy count value from server.
   */
  getCopyCountForBin() {
    this.copyCountSubs = this.labelPrintReportsService.getCopyCountForBinLabelReport().subscribe(
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
        this.toastr.error('', error);
        this.noOfCopies = "1";
      }
    );
  } 

  /**
   * handel print click, validate data print data api call.
   */
  OnPrintClick() {
    
    if (!this.checkValidation()) {
      return;
    }
    this.showLoader = true;
    this.printServiceSubs = this.labelPrintReportsService.printingServiceForBinLabel(this.fromBin, this.toBin, this.noOfCopies).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          console.log("" + data);
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }

          if(data.Detail != null && data.Detail != undefined &&  data.Detail[0]!=null &&  data.Detail[0] != undefined){
            this.fileName = data.Detail[0].FileName;
            this.base64String = data.Detail[0].Base64String;
          }
         
          if(this.fileName == "1"){
            this.toastr.error('', this.base64String);
            return;
          }
          if (this.base64String != null && this.base64String != "") {
           // this.showPdf(); // this function is used to display pdf in new tab.
           this.base64String = 'data:application/pdf;base64,' + this.base64String;
           this.displayPDF = true;
           this.commonservice.refreshDisplyPDF(true);

          }else{
            this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
           }
          console.log("filename:" + this.fileName);
          console.log("filename:" + this.base64String);  
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLoader = false;
        this.toastr.error('', error);
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
   * 
   * This method will check if entered bin is valid or not on field blur event.
   */
  OnFromBinChange() {
  
    if (this.fromBin == "" || this.fromBin == undefined) {
      return;
    }
    this.showLoader = true;
    this.isBinExistsSubs = this.labelPrintReportsService.isBinExists(this.fromBin).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data != null) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data[0].Result == "0" ) {
            this.toastr.error('', this.translate.instant("INVALIDBIN"));
            this.fromBin = "";
            return; 
          }
          this.fromBin = data[0].ID; //check this code.
        } else {
          this.toastr.error('', this.translate.instant("INVALIDBIN"));
          this.fromBin = "";
        }
      },
      error => {
        this.showLoader = false;
        this.toastr.error('', error);
      }
    );
  }

  /**
   * 
   * This method will check if entered bin is valid or not on field blur event.
   */
  OnToBinChange() {
   
    if (this.toBin == "" || this.toBin == undefined) {
      return;
    }
    this.showLoader = true;
    this.isBinExistsSubs = this.labelPrintReportsService.isBinExists(this.toBin).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data != null) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data[0].Result == "0" ) {
            this.toastr.error('', this.translate.instant("INVALIDBIN"));
            this.toBin = "";
            return; 
          }
          this.toBin = data[0].ID; //check this code.
        } else {
          this.toastr.error('', this.translate.instant("INVALIDBIN"));
          this.toBin = "";
        }
      },
      error => {
        this.showLoader = false;
        this.toastr.error('', error);
      }
    );
  }

  getValueOfRedirect($event) {

  }
  OnCancelClick(){
    this.router.navigate(['home/dashboard']);
  }
}
