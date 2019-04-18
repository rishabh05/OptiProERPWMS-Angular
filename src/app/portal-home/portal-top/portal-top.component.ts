import { Component, OnInit, TemplateRef } from '@angular/core';
import { UIHelper } from '../../helpers/ui.helpers';
import { Commonservice } from '../../services/commonservice.service';
import { Router } from '@angular/router';
import { opticonstants } from '../../constants';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';


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
  DBName: string;
  loggedInUserName: string;
  loggedinWarehouse: string;


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
    this.loggedInUserName = localStorage.getItem("UserId");
    this.DBName = localStorage.getItem("CompID");
    this.loggedinWarehouse = localStorage.getItem("whseId");
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


  signOut(){
    // this.toastr.success('', message, this.toast_config);

    // // let login_page = this.common_params.application_path + '/index.html#login';
        
    // sessionStorage.removeItem('isLoggedIn');
    // sessionStorage.removeItem('selectedComp');
    // sessionStorage.removeItem('loggedInUser');
    // sessionStorage.removeItem('ConfigData');

    // localStorage.removeItem('CompID');
    // localStorage.removeItem('GUID');
    // localStorage.removeItem('Token');
    // localStorage.removeItem('UserId');
    // localStorage.removeItem('whseId');
    
    // this.router.navigateByUrl('/account');    
    this.commonService.RemoveLicenseAndSignout(this.toastr, this.router, 
    this.translate.instant("CommonSessionExpireMsg"))

  }

} 
