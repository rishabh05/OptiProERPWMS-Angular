import { Component, OnInit } from '@angular/core';
import { Commonservice } from '../../services/commonservice.service';
import { Router } from '@angular/router';
import { opticonstants } from '../../constants';
import { CurrentSidebarInfo } from '../../models/sidebar/current-sidebar-info';
import { MenuService } from '../../services/menu.service';
import { UIHelper } from '../../helpers/ui.helpers';
import { CommandName } from 'selenium-webdriver';
import { CommonConstants } from '../../const/common-constants';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from '../../../../node_modules/ngx-toastr';

@Component({
  selector: 'app-portal-left',
  templateUrl: './portal-left.component.html',
  styleUrls: ['./portal-left.component.scss']
})
export class PortalLeftComponent implements OnInit {

  isPalletizationEnable: boolean = false;
  WarehouseTransfer: boolean = false;

  constructor(private commonService: Commonservice, private router: Router, private menuService: MenuService, private translate: TranslateService, private toastr: ToastrService) {
    router.events.subscribe((val) => {
      // get current url with last word
      let partsOfUrl = this.router.url.split('/');
      this.selectedItem = partsOfUrl[partsOfUrl.length - 1];
      setTimeout(() => {
        if (typeof (document.getElementById('opti_RightPanelID')) != 'undefined' && document.getElementById('opti_RightPanelID') != null) {
          document.getElementById('opti_RightPanelID').classList.remove('opti_menusidebar-mobile-open');
          document.getElementById('opti_LeftPanelID').classList.remove('opti_menusidebar-mobile-open');
        }
      }, 1000);

    });
  }
  selectedThemeColor: string = 'opticonstants.DEFAULTTHEMECOLOR';
  selectedItem: string;

  ngOnInit() {
    if (localStorage.getItem("PalletizationEnabled") == "True") {
      this.isPalletizationEnable = true;
    } else {
      this.isPalletizationEnable = false;
    }

    // get current url with last word
    let partsOfUrl = this.router.url.split('/');
    this.selectedItem = partsOfUrl[partsOfUrl.length - 1];

    // get selected theme color
    this.commonService.themeCurrentData.subscribe(
      data => {
        this.selectedThemeColor = data;
      }
    );
    this.getAllMenus();

    UIHelper.manageNavigationPanel(document.getElementById('sidebarCollapse-alt'));
  }


  getAllMenus() {
    let menuLoaded = window.localStorage.getItem('IsMenuLoaded');
    //  if(!menuLoaded){
    this.menuService.getAllMenus().subscribe(
      data => {
        if (data != null)
          this.displayMenuOptions(data.Modules);
        window.localStorage.setItem('IsMenuLoaded', 'true');
      },
      error => {
        //alert( this.translate.instant("ReloadPageMsg"));
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonService.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
    //   }    
  }

  displayMenuOptions(menus: any[]) {
    menus.forEach(element => {
      console.log(element)
      console.log(element.id)
      if (document.getElementById(element.id) != null) {
        document.getElementById(element.id).style.display = 'block';

        if (element.id == 15108) {
          this.WarehouseTransfer = true;
        }
      }
    });
  }


  /**
   * 
   * @param event 
   * @param module 
   */
  listClick(event, module) {
    this.selectedItem = module;

    this.closeRightSidebar();
    this.router.navigate(['home/' + module]);

    localStorage.setItem("ProdReceptItem", '');
    localStorage.setItem("FromReceiptProd", 'false');
    localStorage.setItem("GoodsReceiptModel", '');
    localStorage.setItem("AvailableRejectQty", 0 + "");
  }

  /** 
   * 
   */
  closeRightSidebar() {
    let currentSidebarInfo: CurrentSidebarInfo = new CurrentSidebarInfo();
    currentSidebarInfo.SideBarStatus = false;
    this.commonService.setCurrentSideBar(currentSidebarInfo);
  }

  binClick() {
    localStorage.setItem("towhseId", localStorage.getItem("whseId"));
  }

  onInboundClick() {
    this.clearInboundData();
  }

  clearInboundData() {
    localStorage.setItem("GRPOReceieveData", "");
    localStorage.setItem("Line", "0")
    localStorage.setItem("addToGRPOPONumbers", "");
    localStorage.setItem("AddToGRPO", "");
    localStorage.setItem("VendCode", "");
    localStorage.setItem("VendName", "");
    localStorage.setItem("selectedPO", "");
    localStorage.setItem("PONumber", "");
    localStorage.setItem("primaryAutoLots", "");
  }

  onOutboundClick() {
    localStorage.setItem(CommonConstants.OutboundData, null);
    localStorage.setItem("ComingFrom", "");
  }
}
