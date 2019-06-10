import { Component, OnInit, HostListener } from '@angular/core';
import { UIHelper } from '../helpers/ui.helpers';
import { Commonservice } from '../services/commonservice.service';
import { CurrentSidebarInfo } from '../models/sidebar/current-sidebar-info';

@Component({
  selector: 'app-portal-home',
  templateUrl: './portal-home.component.html',
  styleUrls: ['./portal-home.component.scss']
})
export class PortalHomeComponent implements OnInit {

  isMobile:boolean;
  localRightSectionContainer:boolean;
  currentSidebarInfo:CurrentSidebarInfo=null;
  constructor(private service: Commonservice){ }  
  ngOnInit(){  

    // Remove account related class from body
    const element = document.getElementsByTagName("body")[0];
    element.className = "";

    //this.localRightSectionContainer = this.globals.localRightSectionContainer;
    this.service.currentSidebarInfo.subscribe(
      data=> {
        if(data!=null){
          this.currentSidebarInfo=data;          
          this.localRightSectionContainer=data.SideBarStatus
        }
      }
    );
    
  //  this.getSettingOnSAP();
    // UI operations
    this.isMobile =UIHelper.isMobile();
    
    UIHelper.manageNavigationPanel(document.getElementById('sidebarCollapse'));
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event) { 
    // UI operations   
    this.isMobile =UIHelper.isMobile();
    UIHelper.manageNavigationPanel(document.getElementById('sidebarCollapse'));
  }

  
  getSettingOnSAP() {
    // this.showLoader = true;
    //here we will read the settings frm db
    this.service.getSettingOnSAP().subscribe(
      data => {
        if (data != null || data != undefined) {
          // this.showLoader = false;
          if (data.CustomizationDetails != undefined) {
            if (data.CustomizationDetails.length > 0) {
              // this.isCustEnabled = data.CustomizationDetails[0].CustEnabled;
              // this.isCustomizedFor = data.CustomizationDetails[0].CustFor;
              localStorage.setItem('isCustEnabled', data.CustomizationDetails[0].CustEnabled);
            }
          }

          if (data.SettingTable.length > 0) {
            if (data.SettingTable != undefined) {
              // this.IsMoveOrderTimeMandatory = data.SettingTable[0].IsMoveOrderTimeMandatory;
              // this.settingOnSAP = data.SettingTable[0].ScreenSetting;
            }
          }

         if(data.UserDetails != undefined){
          if (data.UserDetails.length > 0) {
            if (data.UserDetails != undefined) {
              // this.isUserIsSubcontracter = data.UserDetails[0].isUserIsSubcontracter;
              localStorage.setItem('isUserIsSubcontracter', data.UserDetails[0].isUserIsSubcontracter);
            }
            // this.showLoader = false;
          }
         }
          //because of async req.
          // this.getAllWorkOrders("init");
        }
        else {
          // this.showLoader = false;
        }
      },
      error => {
        // this.toastr.error('', this.language.some_error, this.baseClassObj.messageConfig);
        // this.showLoader = false;
      }
    )

  }
}
