import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SigninService } from '../../services/signin.service';
import { Commonservice } from '../../services/commonservice.service';
import { ValidateUser } from '../../models/account/ValidateUser';
import { LicenseData } from '../../models/account/LicenseData';
import { WHS } from '../../models/account/WHS';

import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';


@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

    showLoader: boolean = false;
    showFullPageLoader: boolean = false;
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
    selectedItem: string = "";
    selectedWhse: string = "";
    whsList: WHS[] = [];
    defaultWHS: any;
    public companyName: Array<string> = [];
    readonlyFlag: boolean = false;
    public arrConfigData: any[];
    public config_params: any;

    constructor(private router: Router, private signinService: SigninService,
        private commonService: Commonservice, private toastr: ToastrService,
        private translate: TranslateService, private httpClientSer: HttpClient) {
        let userLang = navigator.language.split('-')[0];
        userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
        translate.use(userLang);
        translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.selectedItem = translate.instant("Login_SelectCompany");
            this.defaultWHS = { OPTM_WHSE: translate.instant("SelectWarehouse"), BPLid: 0 };
        });
        this.commonService.loadConfig();

    }

    @ViewChild('myCanvas') myCanvas;

    ngOnInit() {
        this.selectedItem = this.translate.instant("Login_SelectCompany");
        this.defaultWHS = { OPTM_WHSE: this.translate.instant("SelectWarehouse"), BPLid: 0 }

        this.showFullPageLoader = false;
        // Get cookie start
        if (this.getCookie('cookieEmail') != '' && this.getCookie('cookiePassword') != '') {
            this.userName = this.getCookie('cookieEmail');
            this.password = this.getCookie('cookiePassword');
            this.isRemember = true;
        } else {
            this.userName = '';
            this.password = '';
            this.isRemember = false;
        }
        // Apply classes on Body
        const element = document.getElementsByTagName("body")[0];
        element.className = "";
        element.classList.add("opti_body-login");
        element.classList.add("opti_account-module");
        //localStorage.setItem("service_url","http://172.16.6.134/OptiProWMS/");
        if (localStorage.getItem("service_url") != null && localStorage.getItem("service_url") != undefined
            && localStorage.getItem("service_url") != "") {

            var url: any = { 'service_url': localStorage.getItem("service_url") }
            // alert("serviceURL not null:"+JSON.stringify(url));
            this.getPSURL(); //call method after seting configDataObject.
        } else {
            // alert("serviceURL null:"+JSON.stringify(url));
            this.httpClientSer.get('./assets/config.json').subscribe(
                data => {
                    sessionStorage.setItem('ConfigData', JSON.stringify(data[0]));
                    this.signinService.loadConfig();
                    this.getPSURL();
                },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                    alert("HttpErrorResponse:" + err.message);
                }
            );
        }
    }

    getPSURL() {
        //    localStorage.setItem("PSURLFORADMIN", "http://139.144.10.220/optiproadmin/");
        // localStorage.setItem("PSURLFORADMIN", "http://172.16.6.140/OptiProAdmin/");
        this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
        this.signinService.getPSURL(this.config_params.service_url).subscribe(
            data => {
                if (data != null) {
                    localStorage.setItem("PSURLFORADMIN", data);
                }
            },
            error => {
                this.toastr.error('', 'There is some error to connect with server', error);
                this.showLoader = false;
            });


    }


    async ngOnChanges(): Promise<void> {
        this.commonService.loadConfig();
        this.signinService.loadConfig();
    }

    /**
    * Function for login
    */
    public async login() {
        // alert('login:: at login method top');
        // this.isCompleteLoginVisible = true;

        window.localStorage.setItem('IsMenuLoaded', 'false');
        if (this.userName == "" || this.password == "") {
            this.toastr.error('', this.translate.instant("Login_UnPwdBlankErrorMsg"), this.commonService.toast_config.iconClasses.error);
            return true;
        }

        this.showLoader = true;
        if (!this.isCompleteLoginVisible) {
            this.validateUserLogin();
        } else {
            this.selectedItem = document.getElementById("compId").innerText.trim();
            if (this.validateFields()) {
                this.showLoader = false;
                return;
            }
            this.getLicenseData();
            // this.showLoader = false;
            // // localStorage.setItem("GUID", this.licenseData[1].GUID);
            // localStorage.setItem("CompID", "BUILD128SRC12X");
            // localStorage.setItem("whseId", "01");
            // localStorage.setItem("Token", "2bf91be7-819c-4443-a1bc-82dc150da05d");
            // this.router.navigateByUrl('home/dashboard'); 
        }
    }

    private validateUserLogin() {
        //alert('validateUserLogin: ');
        this.signinService.ValidateUserLogin(this.userName, this.password).subscribe(
            data => {
                this.showLoader = false;
                if (data != null && data != undefined && data.Table.length > 0) {
                    if (data.AuthenticationDetails != null && data.AuthenticationDetails.length > 0) {
                        let access_token = data.AuthenticationDetails[0].token_type + " " + data.AuthenticationDetails[0].access_token;
                        localStorage.setItem('accessToken', access_token);
                        this.commonService.updateHeader();
                        this.userDetails = data.Table;
                        this.handleValidationUserSuccessResponse();
                    } else {
                        this.toastr.error('', this.translate.instant("SignIn_ValidateErrMsg"));
                    }
                } else {
                    this.toastr.error('', this.translate.instant("Login_InvalidUnPwdErrMsg"));
                }
            },
            error => {

                // alert("error:"+JSON.stringify(error));
                this.toastr.error('', this.translate.instant("Login_InvalidUnPwdErrMsg"),
                    this.commonService.toast_config.iconClasses.error);
                this.showLoader = false;
            }
        );
    }

    onResetClick(frm: any) {
        this.isCompleteLoginVisible = false;
        frm.resetForm();
        this.readonlyFlag = false;
        this.setCookie('cookieEmail', "", 365);
        this.setCookie('cookiePassword', "", 365);
        this.setCookie('CompID', "", 365);
        this.setCookie('whseId', "", 365);
        this.companyName = [];
        this.selectedItem = this.translate.instant("Login_SelectCompany");
        this.defaultWHS = { OPTM_WHSE: this.translate.instant("SelectWarehouse"), BPLid: 0 };
    }

    private getLicenseData() {
        this.showFullPageLoader = true;
        this.signinService.getLicenseData(this.selectedItem).subscribe(
            data => {
                this.licenseData = data;
                if (this.licenseData != null && this.licenseData != undefined) {
                    this.handleLicenseDataSuccessResponse();
                    // this.showFullPageLoader = false;
                } else {
                    this.showLoader = false;
                    this.showFullPageLoader = false;
                    this.toastr.error('', this.translate.instant("Login_licenseFailed"));
                }
            },
            error => {
                this.showLoader = false;
                this.showFullPageLoader = false;
                this.toastr.error('', this.translate.instant("Login_licenseFailed"),
                    this.commonService.toast_config.iconClasses.error);
            }
        );
    }

    private handleLicenseDataSuccessResponse() {
        console.log("log","handleLicense: start");
        // alert("in handle license data success response");
        this.selectedWhse = document.getElementById("whseId").innerText.trim();
        this.showLoader = false;
        if (this.licenseData.length > 1) {
            console.log("log","handleLicense: start data>1");
            if (this.licenseData[1].ErrMessage == "" || this.licenseData[1].ErrMessage == null) {
                if (this.licenseData[0].Message == "True") {
                    console.log("log","handleLicense:message true");
                    this.selectedItem = document.getElementById("compId").innerText.trim();
                    localStorage.setItem("GUID", this.licenseData[1].GUID);
                    localStorage.setItem("CompID", this.selectedItem);
                    localStorage.setItem("whseId", this.selectedWhse);
                    localStorage.setItem("Token", this.licenseData[0].Token);
                    localStorage.setItem("PalletizationEnabled", this.licenseData[0].PalletizationEnabled);
                    localStorage.setItem("AutoPalletIdGenerationChecked", this.licenseData[0].AutoPalletIdGenerationChecked);

                    localStorage.setItem("DefaultValues", JSON.stringify(this.licenseData[0].DefaultValues));
                    for (var i = 0; i < this.licenseData[0].DefaultValues.length; i++) {
                        switch (this.licenseData[0].DefaultValues[i].DefaultKey) {
                            case "DecimalPrecision":
                                localStorage.setItem("DecimalPrecision", this.licenseData[0].DefaultValues[i].DefaultValue);
                                break;
                            case "DecimalSeparator":
                                localStorage.setItem("DecimalSeparator", this.licenseData[0].DefaultValues[i].DefaultValue);
                                break;
                            case "ThousandSeparator":
                                localStorage.setItem("ThousandSeparator", this.licenseData[0].DefaultValues[i].DefaultValue);
                                break;
                            case "DATEFORMAT":
                                localStorage.setItem("DATEFORMAT", this.licenseData[0].DefaultValues[i].DefaultValue);
                                break;
                        }
                    }

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
                    console.log("log","handleLicense:abouve routing");
                    this.router.navigate(['home/dashboard']);
                } else if(this.licenseData[0].Message == "NotFound") {
                    this.toastr.error('', this.translate.instant("SignIn_Msg_NotFound"));
                    this.showFullPageLoader = false;
                } else if(this.licenseData[0].Message == "Unauthorized") {
                    this.toastr.error('', this.translate.instant("SignIn_Msg_Unauthorized"));
                    this.showFullPageLoader = false;
                } else if(this.licenseData[0].Message == "BadRequest") {
                    this.toastr.error('', this.translate.instant("SignIn_Msg_BadRequest"));
                    this.showFullPageLoader = false;
                } else {
                    console.log("log","handleLicense:else");
                    this.toastr.error('', this.translate.instant("SignIn_Msg_Default"));
                    this.showFullPageLoader = false;
                }
            } else {
                this.showFullPageLoader = false;
                this.toastr.error('', this.translate.instant("SignIn_Msg_Default"));
            }
        } else {
            this.showFullPageLoader = false;
            this.toastr.error('', this.translate.instant("SignIn_Msg_Default"));
        }
    }

    private handleValidationUserSuccessResponse() {
        this.showLoader = false;
        if (this.userDetails == null || this.userDetails.length < 1) {
            this.toastr.error('', this.translate.instant("Login_InvalidUn"), this.commonService.toast_config.iconClasses.error);
            return true;
        }
        if (this.userDetails[0].OPTM_ACTIVE == 0) {
            this.toastr.error('', this.translate.instant("Login_UsernotActive"), this.commonService.toast_config.iconClasses.error);
            return true;
        }
        localStorage.setItem("UserId", this.userName);
        this.isCompleteLoginVisible = true;
        this.readonlyFlag = true;

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
                        this.defaultWHS = { OPTM_WHSE: this.whsList[i].OPTM_WHSE, BPLid: 0 };
                        //this.selectedWhse = this.defaultWHS.OPTM_WHSE;
                        //localStorage.setItem("whseId", this.selectedWhse);
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


    private validateFields(): boolean {
        if (this.selectedItem == this.translate.instant("Login_SelectCompany") || this.selectedItem == '') {
            this.showLoader = false;
            this.toastr.error('', this.translate.instant("Login_SelectCompanyMsg"), this.commonService.toast_config.iconClasses.error);
            return true;
        }
        if (document.getElementById("whseId").innerText.trim() == this.translate.instant("SelectWarehouse") ||
            document.getElementById("whseId").innerText.trim() == "") {
            this.showLoader = false;
            this.toastr.error('', this.translate.instant("Login_SelectwarehouseMsg"), this.commonService.toast_config.iconClasses.error);
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
}