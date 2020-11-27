
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
  allOptionMenus: any = []

  constructor(private commonService: Commonservice, private router: Router, private menuService: MenuService, private translate: TranslateService, private toastr: ToastrService) {
  }
  selectedThemeColor: string = 'opticonstants.DEFAULTTHEMECOLOR';
  selectedItem: string;

  ngOnInit() {
    if (sessionStorage.getItem("PalletizationEnabled") == "True") {
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
    this.GetConfigurationParam();
    UIHelper.manageNavigationPanel(document.getElementById('sidebarCollapse-alt'));
  }

  GetConfigurationParam() {
    this.commonService.GetConfigurationParam().subscribe(
      data => {
        if (data != null && data.OPTM_CONF_PARAM != undefined) {
          sessionStorage.setItem('ConfigurationParam', JSON.stringify(data.OPTM_CONF_PARAM));
        }
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonService.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }


  getAllMenus() {
    let menuLoaded = window.sessionStorage.getItem('IsMenuLoaded');
    //  if(!menuLoaded){
    this.menuService.getAllMenus().subscribe(
      data => {
        if (data != null) {
          this.displayMenuOptions(data.Modules);
          this.allOptionMenus = data.Modules
        }

        window.sessionStorage.setItem('IsMenuLoaded', 'true');
      },
      error => {
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
      var thisRefs = this;
     // console.log("forEach: element.id: " + document.getElementById(element.id))
      if (document.getElementById(element.id) != null) {
        document.getElementById(element.id).style.display = 'flex';
        if (document.getElementById(element.id).childNodes.length > 0 && document.querySelectorAll('#' + element.id + ".dropdown")[0] != undefined) {
          (<HTMLElement>document.querySelectorAll('#' + element.id + ".dropdown")[0].childNodes[0]).onclick = function () {
            for (var i = 0; i < document.querySelectorAll('#' + element.id + ".dropdown")[0].childNodes[2].childNodes.length; i++) {
              var menuId = (<HTMLElement>document.querySelectorAll('#' + element.id + ".dropdown")[0].childNodes[2].childNodes[i]).id;
              if (thisRefs.isMenuVisible(menuId)) {
                (<HTMLElement>document.querySelectorAll('#' + element.id + ".dropdown")[0].childNodes[2].childNodes[i]).style.display = 'flex';
              } else {
                (<HTMLElement>document.querySelectorAll('#' + element.id + ".dropdown")[0].childNodes[2].childNodes[i]).style.display = 'none';
              }
            }
          };
        }
      }
    });
  }

  isMenuVisible(menu: string) {
    for (var i = 0; i < this.allOptionMenus.length; i++) {
      if (this.allOptionMenus[i].id == menu) {
        return true;
      }
    }
    return false;
  }
  // from whre number is for out bound 1 for delivery, 2 for delivery from shipment

  /**
   * 
   * @param event 
   * @param module 
   */
  listClick(event, module, fromWhere: number = 0) {

    this.selectedItem = module;
    this.closeRightSidebar(event);
    sessionStorage.setItem("ProdReceptItem", '');
    sessionStorage.setItem("FromReceiptProd", 'false');
    sessionStorage.setItem("GoodsReceiptModel", '');
    sessionStorage.setItem("AvailableRejectQty", 0 + "");
    sessionStorage.setItem("GRPOHdrUDF", "");
    if (module == "outbound") {
      // manage delivery and shipment via delivery option in same outbound 
      if (fromWhere == 1) {
        sessionStorage.setItem("deliveryOptionType", '1');
        module = module + '/outcustomer'
      } else if (fromWhere == 2) {
        sessionStorage.setItem("deliveryOptionType", '2');
        module = module + '/deliveryThroughShipment'
      }
      this.onOutboundClick();
    } else if (module == "inbound") {
      this.onInboundClick();

      if (fromWhere == 1) {
        sessionStorage.setItem("inboundOptionType", '1');
        //module = module + '/outcustomer'
      } else if (fromWhere == 2) {
        sessionStorage.setItem("inboundOptionType", '2');
        module = module + '/inboundAPI'
      }
    } else if (module == "whsTransfer") {
      sessionStorage.setItem("fromscreen", "WhsTransfer");
    } else if (module == "InventoryTransferRequest") {
      sessionStorage.setItem("fromscreen", "InventoryTransferRequest");
    } else if (module == "binTransfer") {
      sessionStorage.setItem("fromscreen", "");
      sessionStorage.setItem("towhseId", sessionStorage.getItem("whseId"));
      sessionStorage.setItem("fromwhseId", sessionStorage.getItem("whseId"));
    } else if (module == "picking") {
      sessionStorage.setItem("PickType", "");
      sessionStorage.setItem("PickTypeIndex", "");
      sessionStorage.setItem("PickListSteps", "");
    } else if (module == "ShpLoading") {
      sessionStorage.setItem("PickListSteps", "");
    } else if (module == "shipment") {
      this.goToLink("http://localhost:6601/#/home/dashboard");
    }
    this.router.navigate(['home/' + module]);
  }

  goToLink(url: string) {
    window.open(url, "_blank");
  }
  /** 
   * 
   */
  closeRightSidebar(e) {
    let currentSidebarInfo: CurrentSidebarInfo = new CurrentSidebarInfo();
    currentSidebarInfo.SideBarStatus = false;
    this.commonService.setCurrentSideBar(currentSidebarInfo);
    if (UIHelper.isMobile() == true) {
      document.getElementById('opti_RightPanelID').classList.remove('opti_menusidebar-mobile-open');
      document.getElementById('opti_LeftPanelID').classList.remove('opti_menusidebar-mobile-open');
    }
  }

  binClick() {
    // sessionStorage.setItem("towhseId", sessionStorage.getItem("whseId"));
  }

  onInboundClick() {
    this.commonService.clearInboundData();
  }

  onOutboundClick() {
    sessionStorage.setItem(CommonConstants.FROM_DTS, "False");
    sessionStorage.setItem(CommonConstants.OutboundData, null);
    sessionStorage.setItem("ComingFrom", "");
  }
}
