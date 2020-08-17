import { Component, OnInit, TemplateRef } from '@angular/core';
import { UIHelper } from '../../helpers/ui.helpers';
import { Commonservice } from '../../services/commonservice.service';
import { Router } from '@angular/router';
import { opticonstants } from '../../constants';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ISubscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-portal-top',
  templateUrl: './portal-top.component.html',
  styleUrls: ['./portal-top.component.scss']
})
export class PortalTopComponent implements OnInit {
  [x: string]: any;

  openThemeSetting: boolean = false;
  selectedItem: any;
  defaultWHS: { OPTM_WHSE: any; BPLid: number; };
  selectedThemeColor: string = opticonstants.DEFAULTTHEMECOLOR;
  public DBName: string;
  loggedInUserName: string;
  loggedinWarehouse: string;
  updatetopBarSubs: ISubscription;
  showConfirmDialog:boolean = false;
  appVersion: string="Version : 1.2.10";
  
  constructor(
    private modalService: NgbModal, private commonService: Commonservice, private toastr: ToastrService, private router: Router, private translate: TranslateService) {
      let userLang = navigator.language.split('-')[0];
      userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
      translate.use(userLang);
      translate.onLangChange.subscribe((event: LangChangeEvent) => {
      });
  }

  ngOnInit() {
    
    UIHelper.manageThemeCssFile();
    this.loggedInUserName = sessionStorage.getItem("UserId");
    this.DBName = sessionStorage.getItem("CompID");
    this.loggedinWarehouse = sessionStorage.getItem("whseId");
    this.updatetopBarSubs = this.commonService.refreshTopbarSubscriber.subscribe(data => {
      this.loggedinWarehouse = sessionStorage.getItem("whseId");
    });

    // this.appVersion = "Version: " +   this.commonservice.config_params.AppVersion;

    // this.appVersion = this.translate.instant("Dashboard_AppVersion") +   this.commonservice.config_params.AppVersion;
  }

  // open and close theme setting side panel
  openCloseRightPanel() {
    this.openThemeSetting = !this.openThemeSetting;

    // get theme color
    this.commonService.themeCurrentData.subscribe(
      data => {
        this.selectedThemeColor = data;
      }
    )
  }

  // evenet emitted by client(right) to parenet(top).
  receiverMessage($evenet) {
    this.openThemeSetting = $evenet;
  }

 

  openVerticallyCentered(content) {
    this.modalService.open(content, { centered: true });
  }  

  /**
   * 
   * @param event 
   * @param module 
   */
  listClick(event, module) { 
    this.selectedItem = module;
    this.router.navigate(['home/' + module]);
  }

  showDialog(dialogFor: string, yesbtn: string, nobtn: string, msg: string) {
    this.dialogFor = dialogFor;
    this.yesButtonText = yesbtn;
    this.noButtonText = nobtn;
    this.showConfirmDialog = true;
    this.dialogMsg = msg;
  }

  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;
    if ($event.Status == "yes") {
      switch ($event.From) {
        case ("Logout"):
          this.commonService.RemoveLicenseAndSignout(this.toastr, this.router, 
                this.translate.instant("Dashboard_LogoutSuccess"),true);
          this.clearLocalStorage();
          break;
      }
    } else {
      if ($event.Status == "no") {
        switch ($event.From) {
          case ("Logout"):
            break;
        }
      }
    }
  }

  signOut(){
    this.showDialog("Logout", this.translate.instant("yes"), this.translate.instant("no"),
    this.translate.instant("Dashboard_Logout_Msg"));
  }
  
  ngOnDestroy() {
    if (this.updatetopBarSubs != undefined)
      this.updatetopBarSubs.unsubscribe();
  }

  clearLocalStorage(){
    localStorage.setItem("PhysicalCountData", "");
    sessionStorage.setItem("whseId", "");
    localStorage.setItem("Line", "");
    localStorage.setItem("GRPOReceieveData", "");
    localStorage.setItem("AddToGRPO", "");
    localStorage.setItem("addToGRPOPONumbers", "");
    localStorage.setItem("VendCode", "");
    localStorage.setItem("VendName", "");
    localStorage.setItem("selectedPO", "");
    localStorage.setItem("PONumber", "");
    localStorage.setItem("VendRefNo", "");
    localStorage.setItem("GoodsReceiptModel", "");
    localStorage.setItem("primaryAutoLots", "");
    localStorage.setItem("PalletizationEnabledForItem", "");
    localStorage.setItem("radioSelection", "");
    localStorage.setItem("ComingFrom", "");
    localStorage.setItem("OutboundData", "");
    localStorage.setItem("towhseId", "");
    localStorage.setItem("fromwhseId", "");
    localStorage.setItem("IsSOAvailable", "");
    localStorage.setItem("isCustEnabled", "");
    localStorage.setItem("isUserIsSubcontracter", "");
    localStorage.setItem("IsMenuLoaded", "");
    localStorage.setItem("ProdReceptItem", "");
    localStorage.setItem("FromReceiptProd", "");
    localStorage.setItem("GoodsReceiptModel", "");
    localStorage.setItem("AvailableRejectQty", "");
    localStorage.setItem("fromscreen", "");
    localStorage.setItem("ProdReceptItem", "");
    localStorage.setItem("FromReceiptProd", "");
    localStorage.setItem("AvailableRejectQty", "");
    localStorage.setItem("primaryAutoLots", "");
    localStorage.setItem("VendCode", "");

    
    localStorage.setItem("inlineSVGdata", "");
    localStorage.setItem("inlineSVGrev", "");
    localStorage.setItem("ThousandSeparator", "");
    sessionStorage.setItem("UserId", "");
    localStorage.setItem("DATEFORMAT", "");
    localStorage.setItem("DecimalSeparator", "");
    localStorage.setItem("DecimalPrecision", "");
    sessionStorage.setItem("Token", "");
    localStorage.setItem("PalletizationEnabled", "");
    localStorage.setItem("AutoPalletIdGenerationChecked", "");
    localStorage.setItem("DefaultValues", "");
    sessionStorage.setItem("CompID", "");
    sessionStorage.setItem("GUID", "");
    localStorage.setItem("accessToken", "");
    localStorage.setItem("PSURLFORADMIN", "");
  }
} 
