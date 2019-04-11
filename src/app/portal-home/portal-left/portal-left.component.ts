import { Component, OnInit } from '@angular/core';
import { Commonservice } from '../../services/commonservice.service';
import { Router } from '@angular/router';
import { opticonstants } from '../../constants';
import { CurrentSidebarInfo } from '../../models/sidebar/current-sidebar-info';
import { MenuService } from '../../services/menu.service';
import { UIHelper } from 'src/app/helpers/ui.helpers';
import { CommandName } from 'selenium-webdriver';
import { CommonConstants } from 'src/app/const/common-constants';

@Component({
  selector: 'app-portal-left',
  templateUrl: './portal-left.component.html',
  styleUrls: ['./portal-left.component.scss']
})
export class PortalLeftComponent implements OnInit {

  
  constructor(private commonService: Commonservice, private router: Router, private menuService: MenuService) {
    router.events.subscribe((val) => {
       // get current url with last word
      let partsOfUrl = this.router.url.split('/');
      this.selectedItem = partsOfUrl[partsOfUrl.length - 1];
    });
   }
  selectedThemeColor: string = 'opticonstants.DEFAULTTHEMECOLOR';
  selectedItem: string;

  ngOnInit() {

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


  getAllMenus(){
    this.menuService.getAllMenus().subscribe(
      data => {
        this.displayMenuOptions(data.Modules);
      },
      error => {
        alert("get All Menus Failed");
      }
    );

    // var jObject = { CompanyDBId: companyDBObject.CompanyDbName, UserId: companyDBObject.LoggedOnUserName }
    // var url = this.WMSBaseURL();
    // var oView = this.getView();
    // oCtrl = this;
    // //oCurrentController = this;
    // oModelReq.loadData(url + "/api/Menu/AllModule", jObject, true, 'POST');
    // oModelReq.attachRequestCompleted(function (oEvent) {
    //     var model = oEvent.getSource();
    //     if (model != null) {
    //         if (model.oData.Modules.length > 0) {
    //             sap.ui.getCore().setModel(model.oData, oCtrl.CommonProperties.UserMenus);
    //             sessionStorage.setItem(oCtrl.SessionProperties.UserMenus, JSON.stringify(model.oData));
    //             var userMenus = JSON.parse(sessionStorage.getItem(oCtrl.SessionProperties.UserMenus));
    //             if (userMenus != null) {
    //                 if (userMenus.Modules.length > 0) {
    //                     for (var iIndex = 0; iIndex < userMenus.Modules.length; iIndex++) {

    //                         $("." + userMenus.Modules[iIndex].id).css("display", "block");
    //                         if (userMenus.Modules[iIndex].Screens.length > 0) {
    //                             for (var sIndex = 0; sIndex < userMenus.Modules[iIndex].Screens.length; sIndex++) {
    //                                 $("." + userMenus.Modules[iIndex].Screens[sIndex].id).css("display", "block");
    //                             }

    //                         }

    //                     }
    //                 }
    //             }

    //         }
    //     }
    // });
  }

  displayMenuOptions(menus: any[]){
    menus.forEach(element => {
      document.getElementById(element.id); 
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
  }

  /**
   * 
   */
  closeRightSidebar() {
    let currentSidebarInfo: CurrentSidebarInfo = new CurrentSidebarInfo();
    currentSidebarInfo.SideBarStatus = false;
    this.commonService.setCurrentSideBar(currentSidebarInfo);
  }

  onBinTransferClick(){
    localStorage.setItem("towhseId", localStorage.getItem("whseId"));
  }

  onInboundClick(){
    localStorage.setItem("GRPOReceieveData", "");
    localStorage.setItem("Line", "0")
  }

  onOutboundClick(){
    localStorage.setItem(CommonConstants.OutboundData, null);
  }
}
