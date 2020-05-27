import { Component, OnInit, ViewChild } from '@angular/core';
import { Commonservice } from '../../services/commonservice.service';
import { Router } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { LabelPrintReportsService } from '../../services/label-print-reports.service';
import { ISubscription } from 'rxjs/Subscription';
import { debug } from 'util';

@Component({
  selector: 'app-bin-label',
  templateUrl: './bin-label.component.html',
  styleUrls: ['./bin-label.component.scss']
})
export class BinLabelComponent implements OnInit {


  //reference to the input components of html.
  @ViewChild('fromBinIp') fromBinIp;
  @ViewChild('scanToBin') scanToBin;
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

  ngAfterViewInit(): void {
    this.fromBinIp.nativeElement.focus();
  }
  /**
   * Item code lookup click.
   */
  OnFromBinLookupClick() {
   // console.log('from bin click');
    this.getFromBinsList();
  }
  /**
   * Batch serial lookup click.
   */
  OnToBinLookupClick() {
   // console.log('to bin click');
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
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
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
          var serviceDataTemp: any[] =[];  
          var shouldAdd: boolean = false;
          for (let index = 0; index < this.serviceData.length; index++) {
            if(this.fromBin == this.serviceData[index].BINNO){
              shouldAdd = true;
              continue;
            } 
            if(shouldAdd){ 
              serviceDataTemp.push(this.serviceData[index]);
            }
          }
          this.serviceData = serviceDataTemp;
          this.lookupfor = "ToBinList"; 
        }
        else {
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
    if ($event != null && $event == "close") {
      //nothing to do
      return;
    }
    else {
    if (this.lookupfor == "FromBinList") {
      this.fromBin = $event[0];
      //this.whsCode = $event;
      //console.log("selected item:" + this.fromBin);
      this.scanToBin.nativeElement.focus()
    }
    if (this.lookupfor == "ToBinList") {
      this.toBin = $event[0];
      //this.whsCode = $event;
      //console.log("selected item:" + this.toBin);
      // this.scanToBin.nativeElement.focus()
    }
  }
  }

  /**
  * this method will validate all input fields.
  */
  checkValidation(): boolean {
    if (this.fromBin == "") {
      this.toastr.error('', this.translate.instant("InvTransfer_FromBinMsg"));
      this.fromBinIp.nativeElement.focus();
      return false;
    }
    if (this.toBin == "") {
      this.toastr.error('', this.translate.instant("InvTransfer_ToBinMsg"));
      this.scanToBin.nativeElement.focus();
      return false;
    }
    if (this.noOfCopies == "" || this.noOfCopies == "0") {
      this.toastr.error('', this.translate.instant("NoOfCopiesCannotbeBlank"));
      this.noOfCopiesInput.nativeElement.focus();
      return false;
    }
    if (!this.check_if_is_integer(this.noOfCopies)) {
      this.toastr.error('', this.translate.instant("NoOfCopiesShouldBeNumeric"));
      this.noOfCopiesInput.nativeElement.focus();
      return false;
    }
    
    return true;
  }

  check_if_is_integer(value){
    // I can have spacespacespace1 - which is 1 and validators pases but
    // spacespacespace doesn't - which is what i wanted.
    // 1space2 doesn't pass - good
    // of course, when saving data you do another parseInt.
 
    return ((parseFloat(value) == parseInt(value)) && !isNaN(value));
 
 }

  /**
   * this method will check no. of copy count value from server.
   */
  getCopyCountForBin() {
    this.copyCountSubs = this.labelPrintReportsService.getCopyCountForBinLabelReport().subscribe(
      (data: any) => {
        if (data != undefined && data.length > 0) {
         // console.log("" + data);
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
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
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

    if (!this.checkValidation()) {
      return;
    }
    this.showLoader = true;
    this.printServiceSubs = this.labelPrintReportsService.printingServiceForBinLabel(this.fromBin, this.toBin, this.noOfCopies).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          //console.log("" + data);
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
            if(data.Error!=undefined && data.Error!=null ){
              this.toastr.error('', data.Error[0].ERRORMSG);
            }else{
              this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
            }
           }
         // console.log("filename:" + this.fileName);
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


  OnFromBinChangeBlur(){
    if(this.isValidateCalled){
      return;
    }
    this.OnFromBinChange();
  }

 /**
   * 
   * This method will check if entered bin is valid or not on field blur event.
   */
  async OnFromBinChange(): Promise<any>{
    if (this.fromBin == "" || this.fromBin == undefined) {
      return;
    }
    this.showLoader = true;
    var result = false;
    await this.labelPrintReportsService.isBinExists(this.fromBin).then(
      data => {
        console.log("inside OnFromBinChange isBinExists")
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
            result = false;
            return result; 
          }
          result = true;
          this.fromBin = data[0].ID; //check this code.
        } else {
          this.toastr.error('', this.translate.instant("INVALIDBIN"));
          this.fromBin = "";
          result = false;
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
       result = false;
      }
    );
    return result;
  }

  OnToBinChangeBlur(){
    if(this.isValidateCalled){
      return
    }
    this.OnToBinChange();
  }

  /**
   * 
   * This method will check if entered bin is valid or not on field blur event.
   */
  async OnToBinChange(): Promise<any>{
    if (this.toBin == "" || this.toBin == undefined) {
      return;
    }
    this.showLoader = true;
    var result = false;
    await this.labelPrintReportsService.isBinExists(this.toBin).then(
      data => {
        console.log("inside OnFromBinChange isBinExists")
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
            result = false;
            return result; 
          }
          result = true;
          this.toBin = data[0].ID; //check this code.
        } else {
          this.toastr.error('', this.translate.instant("INVALIDBIN"));
          this.toBin = "";
          result = false;
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
       result = false;
      }
    );
    return result
  }

  getValueOfRedirect($event) {

  }
  OnCancelClick(){
    this.router.navigate(['home/dashboard']);
  }

  onHiddenBinLabelFromBinScanClick(){
    var inputValue = (<HTMLInputElement>document.getElementById('BinLabelFromBinInput')).value;
    if (inputValue.length > 0) {
      this.fromBin= inputValue;
    }
    this.OnFromBinChange();
  }
  onHiddenBinLabelToBinScanClick(){
    var inputValue = (<HTMLInputElement>document.getElementById('BinLabelToBinInput')).value;
    if (inputValue.length > 0) {
      this.toBin= inputValue;
    }
    this.OnToBinChange();
  }

  isValidateCalled: boolean = false;
  async validateBeforeSubmit():Promise<any>{
    this.isValidateCalled = true;
    var currentFocus = document.activeElement.id;
    console.log("validateBeforeSubmit current focus: "+currentFocus);
    
    if(currentFocus != undefined){
      if(currentFocus == "BinLabelFromBinInput"){
        return this.OnFromBinChange();
      } else if(currentFocus == "BinLabelToBinInput"){
        return this.OnToBinChange();
      }
    }
  }
}
