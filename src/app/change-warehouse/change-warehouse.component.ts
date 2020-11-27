import { Component, OnInit } from '@angular/core';
import { SigninService } from '../services/signin.service';
import { Router } from '@angular/router';
import { WHS } from '../models/account/WHS';
import { Commonservice } from '../services/commonservice.service';
import { ToastrService } from '../../../node_modules/ngx-toastr';
import { TranslateService } from '../../../node_modules/@ngx-translate/core';

@Component({
  selector: 'app-change-warehouse',
  templateUrl: './change-warehouse.component.html',
  styleUrls: ['./change-warehouse.component.scss']
})
export class ChangeWarehouseComponent implements OnInit {

  whsList: WHS[] = [];
  zoneList: any[] = [];
  roleList: any[] = [];
  binRangeList: any[] = [];

  defaultWHS: any;
  selectedZone: any;
  selectedRole: any;
  selectedBin: any;
  selectedItem: string;
  showBinRange: boolean = false;
  showZone: boolean = false;
  constructor(private commonService: Commonservice, private signinService: SigninService,
    private router: Router, private toastr: ToastrService, private translate: TranslateService) {
    this.defaultWHS = { OPTM_WHSE: sessionStorage.getItem("whseId"), BPLid: 0 };
    this.selectedRole = { OPTM_ROLEID: sessionStorage.getItem("SelectedRole"), BPLid: 0 };
    this.selectedZone = { OPTM_WHSZONE: sessionStorage.getItem("SelectedZone"), BPLid: 0 };
    this.selectedBin = { OPTM_BIN_RANGE: sessionStorage.getItem("SelectedBinRange"), BPLid: 0 };
    if (sessionStorage.getItem("ShowBinRange") == "Y") {
      this.showBinRange = true;
    }
    if (sessionStorage.getItem("ShowZone") == "Y") {
      this.showZone = true;
    }
    this.selectedItem = sessionStorage.getItem("CompID")
  }

  ngOnInit() {
    this.setWarehouseList();
    this.showRoleList(true);

    if (this.showBinRange) this.showBinRangeList(true);
    if (this.showZone) this.showZoneList(true);

    this.defaultWHS = { OPTM_WHSE: sessionStorage.getItem("whseId"), BPLid: 0 };
    this.selectedRole = { OPTM_ROLEID: sessionStorage.getItem("SelectedRole"), BPLid: 0 };
    this.selectedZone = { OPTM_WHSZONE: sessionStorage.getItem("SelectedZone"), BPLid: 0 };
    this.selectedBin = { OPTM_BIN_RANGE: sessionStorage.getItem("SelectedBinRange"), BPLid: 0 };
    if (sessionStorage.getItem("ShowBinRange") == "Y") {
      this.showBinRange = true;
    }
    if (sessionStorage.getItem("ShowZone") == "Y") {
      this.showZone = true;
    }
    this.selectedItem = sessionStorage.getItem("CompID")
  }

  public setWarehouseList() {
    this.signinService.getWHS(sessionStorage.getItem("CompID")).subscribe(
      data => {
        this.whsList = data.Table;
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




  public showRoleList(isDirectCall: boolean = false) {
    if (isDirectCall != true) {
      if (this.selectedItem == this.translate.instant("Login_SelectCompany")) {
        this.toastr.error('', this.translate.instant("Login_SelectCompanyMsg"))
        return;
      }
    }
    this.signinService.getRoleList(this.selectedItem).subscribe(
      data => {
        this.roleList = data.Table;
        for (var i = 0; i < this.roleList.length; i++) {
          if (this.getCookie('Role') == this.roleList[i].OPTM_ROLEID) {
            this.selectedRole = { OPTM_ROLEID: this.roleList[i].OPTM_ROLEID, BPLid: 0 };
          }
        }
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonService.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
      }
    );
  }

  public showZoneList(isDirectCall: boolean = false) {

    if (isDirectCall != true) {
      if (this.selectedItem == this.translate.instant("Login_SelectCompany")) {
        this.toastr.error('', this.translate.instant("Login_SelectCompanyMsg"))
        return;
      }
      if (this.defaultWHS == undefined || this.defaultWHS == "") {
        this.toastr.error('', this.translate.instant("Login_SelectwarehouseMsg"))
        return;
      }
    }

    var whse=this.defaultWHS.OPTM_WHSE //nedd to pass whse actual value
    this.signinService.getZoneList(this.selectedItem, whse).subscribe(
      data => {
        this.zoneList = data.Table;
        for (var i = 0; i < this.zoneList.length; i++) {
          if (this.getCookie('Zone') == this.zoneList[i].OPTM_WHSZONE) {
            this.selectedZone = { OPTM_WHSZONE: this.zoneList[i].OPTM_WHSZONE, BPLid: 0 };
          }
        }
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonService.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
      }
    );
  }

  public showBinRangeList(isDirectCall: boolean = false) {
    if (isDirectCall != true) {
      if (this.selectedItem == this.translate.instant("Login_SelectCompany")) {
        this.toastr.error('', this.translate.instant("Login_SelectCompanyMsg"))
        return;
      }
      if (this.defaultWHS == undefined || this.defaultWHS == "") {
        this.toastr.error('', this.translate.instant("Login_SelectwarehouseMsg"))
        return;
      }
      if (this.selectedZone == undefined || this.selectedZone == "") {
        this.toastr.error('', this.translate.instant("Login_SelectZoneMsg"))
        return;
      }

    }
    this.signinService.getBinRanges(this.defaultWHS.OPTM_WHSE, this.selectedItem, this.selectedZone.OPTM_WHSZONE).subscribe(
      data => {
        this.binRangeList = data.Table;
        for (var i = 0; i < this.whsList.length; i++) {
          if (this.getCookie('BinRange') == this.binRangeList[i].OPTM_BIN_RANGE) {
            this.selectedBin = { OPTM_BIN_RANGE: this.binRangeList[i].OPTM_BIN_RANGE, BPLid: 0 };
          }
        }
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonService.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
      }
    );
  }

  onWhseChange($event) {
    this.resetZone();
    this.resetRole();
    this.resetBinRange();
  }
  onZoneChange($event) {
    this.resetBinRange()
    this.resetBinRange();
  }
  onBinRangeChange($event){
        //do needful if you want to use this event
  }
  onRoleChange($event){
         //do needful if you want to use this event
  }


  resetBinRange() {
    this.selectedBin = { OPTM_BIN_RANGE: this.translate.instant("SelectBin"), BPLid: 0 };
  }
  resetZone() {
    this.selectedZone = { OPTM_WHSZONE: this.translate.instant("SelectZone"), BPLid: 0 };
  }
  resetRole() {
    this.selectedRole = { OPTM_ROLEID: this.translate.instant("SelectRole"), BPLid: 0 };
  }
  validateDropDowns() {
    if (this.selectedRole.OPTM_ROLEID == this.translate.instant("SelectRole")) {
      this.toastr.error('', this.translate.instant("Login_SelectRole"))
      return false;
    }
    if (this.showZone) {
      if (this.selectedZone.OPTM_WHSZONE == this.translate.instant("SelectZone")) {
        this.toastr.error('', this.translate.instant("Login_SelectZoneMsg"))
        return false;
      }
    }
    if (this.showBinRange) {
      if (this.selectedBin.OPTM_BIN_RANGE == this.translate.instant("SelectBin")) {
        this.toastr.error('', this.translate.instant("Login_SelectBinRange"))
        return false;
      }
    }
    return true;
  }
  onSubmitClick() {
    if (!this.validateDropDowns()) return false;

    sessionStorage.setItem("whseId", this.defaultWHS.OPTM_WHSE);
    sessionStorage.setItem("SelectedRole", this.selectedRole.OPTM_ROLEID);
    sessionStorage.setItem("SelectedZone", this.selectedZone.OPTM_WHSZONE);
    sessionStorage.setItem("SelectedBinRange", this.selectedBin.OPTM_BIN_RANGE);
    this.setCookie('whseId', this.defaultWHS.OPTM_WHSE, 365);
    this.setCookie('Role', this.selectedRole.OPTM_ROLEID, 365);
    this.setCookie('Zone', this.selectedRole.OPTM_WHSZONE, 365);
    this.setCookie('BinRange', this.selectedRole.OPTM_BIN_RANGE, 365);
    this.commonService.refreshTopBarValue(sessionStorage.getItem("whseId"));
    this.router.navigate(['home/dashboard']);
  }

  /**
    * Function for set cookie data
    * @param cname 
    * @param cvalue 
    * @param exdays 
    */
  public setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }


  public getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
}
