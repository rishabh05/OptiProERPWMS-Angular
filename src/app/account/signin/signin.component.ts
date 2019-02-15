import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SigninService } from '../../services/signin.service';
import { Commonservice } from '../../services/commonservice.service';
import { ValidateUser } from '../../models/account/ValidateUser';
import { LicenseData } from '../../models/account/LicenseData';
import { WHS } from '../../models/account/WHS';

import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  showLoader: boolean = false;
  isError: boolean = false;

  invalidCredentialMsg: string = "";
  userNotExist: boolean = false;

  // Cookie
  userName: any;
  password: string;
  isRemember: boolean = false;

  // Captcha
  randomstring = '';
  capchaText: string;
  invalidCapcha: boolean = false;

  isCompleteLoginVisible: boolean = false;
  userDetails: ValidateUser[];
  licenseData: LicenseData[];
  selectedItem: string = "Select Company";
  selectedWhse: string = "";
  whsList: WHS[] = [];
  defaultWHS = { OPTM_WHSE: "Select Warehouse", BPLid: 0 };
  public companyName: Array<string> = [];
  readonlyFlag: boolean = false;

  constructor(private router: Router, private signinService: SigninService, private commonService: Commonservice, private toastr: ToastrService, private translate: TranslateService) {
    // translate.setDefaultLang('en');
  }

  @ViewChild('myCanvas') myCanvas;

  ngOnInit() {

    // Get cookie start
    if (this.getCookie('cookieEmail') != '' && this.getCookie('cookiePassword') != '') {
      this.userName = this.getCookie('cookieEmail');
      this.password = this.getCookie('cookiePassword');
    } else {
      this.userName = '';
      this.password = '';
    }

    // Apply classes on Body
    const element = document.getElementsByTagName("body")[0];
    element.className = "";
    element.classList.add("opti_body-login");
    element.classList.add("opti_account-module");
    // this.userName = this.translate.instant("Username");
    this.getPSURL();
  }



  getPSURL() {
    this.signinService.getPSURL().subscribe(
      data => {
        localStorage.setItem("PSURLFORADMIN", data);
      },
      error => {
        alert("get PSURL Failed");
        this.toastr.error('', "get PSURL Failed", this.commonService.toast_config);
      }
    );
  }

  /**
   * Function for login
   */
  public async login() {
    // this.isCompleteLoginVisible = true;
    if (this.userName == "" || this.password == "") {
      alert("username or password cannot be blank");
      return true;
    }

    this.showLoader = true;
    if (!this.isCompleteLoginVisible) {
      this.signinService.ValidateUserLogin(this.userName, this.password).subscribe(
        data => {
          
          this.userDetails = data.Table;
          this.handleValidationUserSuccessResponse();
        },
        error => {
          
          this.showLoader = false;

          alert("Login Failed");
        }
      );
    } else {
      this.selectedItem = document.getElementById("compId").innerText.trim();
      if (this.validateFields()) {
        this.showLoader = false;
        return;
      }
      this.signinService.getLicenseData(this.selectedItem).subscribe(
        data => {
          
          this.licenseData = data;
          this.handleLicenseDataSuccessResponse();
        },
        error => {
          
          this.showLoader = false;
          alert("license Failed");
        }
      );
    }

  }


  private handleLicenseDataSuccessResponse() {

    this.selectedWhse = document.getElementById("whseId").innerText.trim();
    this.showLoader = false;
    if (this.licenseData.length > 1) {
      if (this.licenseData[1].ErrMessage == "" || this.licenseData[1].ErrMessage == null) {
        if (this.licenseData[0].Message == "True") {
          this.selectedItem = document.getElementById("compId").innerText.trim();
          localStorage.setItem("GUID", this.licenseData[1].GUID);
          localStorage.setItem("CompID", this.selectedItem);
          localStorage.setItem("whseId", this.selectedWhse);
          localStorage.setItem("Token", this.licenseData[0].Token);
          // code for remember me
          if (this.isRemember == true) {
            this.setCookie('cookieEmail', this.userName, 365);
            this.setCookie('cookiePassword', this.password, 365);
            this.setCookie('CompID', this.selectedItem, 365);
            this.setCookie('whseId', this.selectedWhse, 365);
          } else {
            this.setCookie('cookieEmail', "", 365);
            this.setCookie('cookiePassword', "", 365);
            this.setCookie('CompID', "", 365);
            this.setCookie('whseId', "", 365);
          }
          alert("login done");
          this.router.navigateByUrl('home/dashboard');
        } else {
          alert(this.licenseData[0].Message + " " + this.licenseData[0].Token);
        }
      } else {
        alert(this.licenseData[1].ErrMessage);
      }
    } else {
      alert(this.licenseData[0].ErrMessage);
    }
  }


  private handleValidationUserSuccessResponse() {
    this.showLoader = false;
    if (this.userDetails == null || this.userDetails.length < 1) {
      alert("Invalid username");
      return true;
    }
    if (this.userDetails[0].OPTM_ACTIVE == 0) {
      alert("User not active");
      return true;
    }

    localStorage.setItem("UserId", this.userName);
    // document.getElementById("connectbtn").innerText = "Login";

    this.isCompleteLoginVisible = true;
    this.readonlyFlag = true;
    // this.companyName.push("Select Company");
    this.userDetails.forEach(element => {
      this.companyName.push(element.OPTM_COMPID);
    });


    for (var i = 0; i < this.companyName.length; i++) {
      if (this.getCookie('CompID') == this.companyName[i]) {
        this.selectedItem = this.companyName[i];
        this.setWarehouseList();
      }
    }
  }


  public setWarehouseList() {

    if (document.getElementById("compId") != null) {
      this.selectedItem = document.getElementById("compId").innerText.trim();
    }

    this.signinService.getWHS(this.selectedItem).subscribe(
      data => {
        this.whsList = data.Table;
        for (var i = 0; i < this.whsList.length; i++) {
          if (this.getCookie('whseId') == this.whsList[i].OPTM_WHSE) {
            this.defaultWHS = this.whsList[i];
          }
        }
      },
      error => {
        alert("get setWarehouseList Failed");
      }
    );
  }


  private validateFields(): boolean {
    if (this.selectedItem == 'Select Company' || this.selectedItem == '') {
      this.showLoader = false;
      alert("Please Select Company!");
      return true;
    }
    if (document.getElementById("whseId").innerText.trim() == 'Select Warehouse' ||
      document.getElementById("whseId").innerText.trim() == "") {
      this.showLoader = false;
      alert("Please Select Warehouse!");
      return true;
    }
    return false;
  }
  /**
   * function for get cookie data
   * @param cname 
   */

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


  /**
   * Function for redirect to forget password
   */
  navigateToResetPassword() {
    this.router.navigateByUrl('account/resetpassword');
  }



}
