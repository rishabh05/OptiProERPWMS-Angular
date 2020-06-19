
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
    // router.events.subscribe((val) => {
    //   // get current url with last word
    //   let partsOfUrl = this.router.url.split('/');
    //   this.selectedItem = partsOfUrl[partsOfUrl.length - 1];
    //   setTimeout(() => {
    //     if (typeof (document.getElementById('opti_RightPanelID')) != 'undefined' && document.getElementById('opti_RightPanelID') != null) {
    //       document.getElementById('opti_RightPanelID').classList.remove('opti_menusidebar-mobile-open');
    //       document.getElementById('opti_LeftPanelID').classList.remove('opti_menusidebar-mobile-open');
    //     }
    //   }, 1000);

    // });
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
    this.GetConfigurationParam();
    UIHelper.manageNavigationPanel(document.getElementById('sidebarCollapse-alt'));
  }

  GetConfigurationParam() {
    this.commonService.GetConfigurationParam().subscribe(
      data => {
        if (data != null && data.OPTM_CONF_PARAM != undefined) {
          localStorage.setItem('ConfigurationParam', JSON.stringify(data.OPTM_CONF_PARAM));
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
    let menuLoaded = window.localStorage.getItem('IsMenuLoaded');
    //  if(!menuLoaded){
    this.menuService.getAllMenus().subscribe(
      data => {
        if (data != null) {
          this.displayMenuOptions(data.Modules);
          this.allOptionMenus = data.Modules
        }

        window.localStorage.setItem('IsMenuLoaded', 'true');
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
      console.log("forEach: element.id: " + document.getElementById(element.id))
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
    localStorage.setItem("ProdReceptItem", '');
    localStorage.setItem("FromReceiptProd", 'false');
    localStorage.setItem("GoodsReceiptModel", '');
    localStorage.setItem("AvailableRejectQty", 0 + "");

    if (module == "outbound") {
      // manage delivery and shipment via delivery option in same outbound 
      if (fromWhere == 1) {
        localStorage.setItem("deliveryOptionType", '1');
        module = module + '/outcustomer'
      } else if (fromWhere == 2) {
        localStorage.setItem("deliveryOptionType", '2');
        module = module + '/deliveryThroughShipment'
      }
      this.onOutboundClick();
    } else if (module == "inbound") {
      this.onInboundClick();

      if (fromWhere == 1) {
        localStorage.setItem("inboundOptionType", '1');
        //module = module + '/outcustomer'
      } else if (fromWhere == 2) {
        localStorage.setItem("inboundOptionType", '2');
        module = module + '/inboundAPI'
      }
    } else if (module == "whsTransfer") {
      localStorage.setItem("fromscreen", "WhsTransfer");
    } else if (module == "InventoryTransferRequest") {
      localStorage.setItem("fromscreen", "InventoryTransferRequest");
    } else if (module == "binTransfer") {
      localStorage.setItem("fromscreen", "");
      localStorage.setItem("towhseId", localStorage.getItem("whseId"));
      localStorage.setItem("fromwhseId", localStorage.getItem("whseId"));
    } else if (module == "picking") {
      localStorage.setItem("PickType", "");
      localStorage.setItem("PickTypeIndex", "");
      localStorage.setItem("PickListSteps", "");
    } else if (module == "ShpLoading") {
      localStorage.setItem("PickListSteps", "");
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
    // localStorage.setItem("towhseId", localStorage.getItem("whseId"));
  }

  onInboundClick() {
    this.commonService.clearInboundData();
  }

  onOutboundClick() {
    localStorage.setItem(CommonConstants.FROM_DTS, "False");
    localStorage.setItem(CommonConstants.OutboundData, null);
    localStorage.setItem("ComingFrom", "");
  }
}
