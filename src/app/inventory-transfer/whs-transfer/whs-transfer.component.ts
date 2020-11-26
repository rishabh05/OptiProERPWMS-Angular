import { Component, OnInit, ViewChild } from '@angular/core';
import { InventoryTransferService } from '../../services/inventory-transfer.service';
import { ToastrService } from 'ngx-toastr';
import { ToWhs } from '../../models/InventoryTransfer/ToWhs';
import { CurrentSidebarInfo } from '../../models/sidebar/current-sidebar-info';
import { Router } from '@angular/router';
import { Commonservice } from '../../services/commonservice.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-whs-transfer',
  templateUrl: './whs-transfer.component.html',
  styleUrls: ['./whs-transfer.component.scss']
})

export class WhsTransferComponent implements OnInit {
  selectedItem: any;
  toWhse: any;
  fromWhse: string;
  toWhs: ToWhs[];
  serviceData: any[];
  lookupfor: string;
  showLookupLoader=true;
  public whsView:boolean = true;
  showNext: boolean = false;
  fromScreen: any = "";
  showLoader: boolean = false;
  pageHeading: string; 
  isfromWhsDisabled: boolean;
  fromWhere:Number = 1;
  @ViewChild("scanToWhse") scanToWhse;
  @ViewChild("scanFromWhse") scanFromWhse;

  constructor(private commonservice: Commonservice, private router: Router, private inventoryTransferService: InventoryTransferService, private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    if(sessionStorage.getItem("fromscreen") == "WhsTransfer"){
      this.fromWhse = sessionStorage.getItem("whseId");
      this.pageHeading = this.translate.instant("WarehouseTransfer");
      this.isfromWhsDisabled = true;
      this.fromWhere = 1; 
    }else{
      this.toWhse = sessionStorage.getItem("whseId");
      this.pageHeading = this.translate.instant("InventoryTransferRequest");
      this.isfromWhsDisabled = false;
      this.fromWhere = 2;
    }
  }

  ngAfterViewInit(): void {
    if(sessionStorage.getItem("fromscreen") == "WhsTransfer"){
      this.scanToWhse.nativeElement.focus();
    }else{
      this.scanFromWhse.nativeElement.focus();
    }
  }

  getFromWhse(){
    this.showLoader = true;
    this.inventoryTransferService.getToWHS().subscribe(
      data => {
        this.showLoader = false;
        if(data != undefined && data.length > 0){
          if (data[0].ErrorMsg == "7001") {
              this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
              return;
          } 
         // console.log(data);
          this.showLookupLoader = false;
          this.serviceData = data;
          this.lookupfor = "fromWhsList";
        }else{
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

  getToWhse(){
    this.showLoader = true;
    this.inventoryTransferService.getToWHS().subscribe(
      data => {
        this.showLoader = false;
        if(data != undefined && data.length > 0){
          if (data[0].ErrorMsg == "7001") {
              this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
              return;
          } 
        //  console.log(data);
          this.showLookupLoader = false;
          this.serviceData = data;
          this.lookupfor = "toWhsList";
        }else{
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
   * 
   * @param event 
   * @param module 
   */
  listClick(event, module) { 
    if (this.toWhse == "" || this.toWhse == undefined) {
      this.toastr.error('', this.translate.instant("InvTransfer_ToWhsBlankErrMsg"));
      return;
    }
    sessionStorage.setItem("towhseId", this.toWhse);
    this.selectedItem = module;
    this.closeRightSidebar();
    this.router.navigate(['home/' + module, { skipLocationChange: true }]);
  }

  closeRightSidebar() {
    let currentSidebarInfo: CurrentSidebarInfo = new CurrentSidebarInfo();
    currentSidebarInfo.SideBarStatus = false;
    this.commonservice.setCurrentSideBar(currentSidebarInfo);
  }

  getLookupValue($event) {
    if ($event != null && $event == "close") {
      //nothing to do
      return;
    }
    else {
      if(this.lookupfor == "fromWhsList"){
        this.fromWhse = $event[0];
        this.showNext = true;
      }else{
        this.toWhse = $event[0];
        this.showNext = true;
      }
    }
  }

  OnToWarehouseChange () {
    if (this.toWhse == "" || this.toWhse == undefined) {
      return;
    }
    this.showLoader = true;
    this.inventoryTransferService.isWHsExists(this.toWhse).subscribe(
      data => {
        this.showLoader = false;
        if(data != undefined && data.length > 0){
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, 
              this.translate.instant("CommonSessionExpireMsg"));
              return;
          } 
          //console.log(data);
          if (data[0].Result == "0") {
            this.toastr.error('', this.translate.instant("InvalidWhsErrorMsg"));
            this.toWhse = "";
            this.showNext = false;
            this.scanToWhse.nativeElement.focus()
          }
          else {
            this.toWhse = data[0].ID;
            this.showNext = true;
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
    if (this.fromWhse == this.toWhse && this.fromWhse != "" && this.toWhse != "") {
      this.toastr.error('', this.translate.instant("InvTransfer_FrmnToNotSame"));
    }
  }  

  viewSwitch(){
    if (this.toWhse == "" || this.toWhse == undefined) {
      this.toastr.error('', this.translate.instant("InvTransfer_ToWhsBlankErrMsg"));
      return;
    }

    this.whsView = !this.whsView;
    this.fromScreen = sessionStorage.getItem("fromscreen");//"WhsTransfer";
    if(sessionStorage.getItem("fromscreen") == "WhsTransfer"){
      sessionStorage.setItem("towhseId", this.toWhse);
      sessionStorage.setItem("fromwhseId", sessionStorage.getItem("whseId"));
    }else{
      sessionStorage.setItem("fromwhseId", this.fromWhse);
      sessionStorage.setItem("towhseId", sessionStorage.getItem("whseId"));
    }
  }

  onCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

  binCancelEvent(){
    this.whsView = !this.whsView;
  }

  onHiddenToWhsScanClick(){
    var inputValue = (<HTMLInputElement>document.getElementById('whsTransferToWhsInputField')).value;
    if (inputValue.length > 0) {
      this.toWhse = inputValue;
    }
    this.OnToWarehouseChange();
  }

  onHiddenFromWhsScanClick(){
    var inputValue = (<HTMLInputElement>document.getElementById('whsTransferFromWhsInputField')).value;
    if (inputValue.length > 0) {
      this.toWhse = inputValue;
    }
   // this.OnToWarehouseChange(); call the method for that
  }
}
 