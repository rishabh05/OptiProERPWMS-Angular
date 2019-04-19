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
      setTimeout(()=>{   
        if (typeof(document.getElementById('opti_RightPanelID')) != 'undefined' && document.getElementById('opti_RightPanelID') != null){
          document.getElementById('opti_RightPanelID').classList.remove('opti_menusidebar-mobile-open');
          document.getElementById('opti_LeftPanelID').classList.remove('opti_menusidebar-mobile-open');
        } 
      }, 1000);   
                 
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

  binClick(){
    localStorage.setItem("towhseId", localStorage.getItem("whseId"));
  }

  onInboundClick(){
    this.clearInboundData();
  }

  clearInboundData(){
    localStorage.setItem("GRPOReceieveData", "");
    localStorage.setItem("Line", "0")
    localStorage.setItem("addToGRPOPONumbers", "");
    localStorage.setItem("AddToGRPO", "");
    localStorage.setItem("VendCode", "");
    localStorage.setItem("VendName", "");
    localStorage.setItem("selectedPO", "");
    localStorage.setItem("PONumber", "");
  }

  onOutboundClick(){
    localStorage.setItem(CommonConstants.OutboundData, null);
  }
}
