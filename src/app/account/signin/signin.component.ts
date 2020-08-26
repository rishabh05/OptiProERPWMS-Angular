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
import { CommonData } from '../../models/CommonData';

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
    zoneList: any[] = [];
    roleList: any[] = [];
    binRangeList: any[] = [];

    binPermissionList: any[] = [];
    defaultZone: any;
    defaultWHS: any;
    selectedRole: any;
    selectedZone: any;
    selectedBin: any;
    public companyName: Array<string> = [];
    readonlyFlag: boolean = false;
    public arrConfigData: any[];
    public config_params: any;
    commonData: any = new CommonData();
    showConfirmDialog = false;
    dialogMsg: string = ""
    yesButtonText: string = "";
    noButtonText: string = "";
    dialogFor: string = "";

    constructor(private router: Router, private signinService: SigninService,
        private commonService: Commonservice, private toastr: ToastrService,
        private translate: TranslateService, private httpClientSer: HttpClient) {
        let userLang = navigator.language.split('-')[0];
        userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
        translate.use(userLang);
        translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.selectedItem = translate.instant("Login_SelectCompany");
            this.defaultWHS = { OPTM_WHSE: translate.instant("SelectWarehouse"), BPLid: 0 };
            this.selectedBin = { OPTM_BIN_RANGE: translate.instant("SelectBin"), BPLid: 0 };
            this.selectedRole = { OPTM_ROLEID: translate.instant("SelectRole"), BPLid: 0 };
            this.selectedZone = { OPTM_WHSZONE: translate.instant("SelectZone"), BPLid: 0 };
        });
        this.commonService.loadConfig();
    }

    @ViewChild('myCanvas') myCanvas;

    ngOnInit() {
        this.selectedItem = this.translate.instant("Login_SelectCompany");
        this.defaultWHS = { OPTM_WHSE: this.translate.instant("SelectWarehouse"), BPLid: 0 }
        this.selectedBin = { OPTM_BIN_RANGE: this.translate.instant("SelectBin"), BPLid: 0 };
        this.selectedRole = { OPTM_ROLEID: this.translate.instant("SelectRole"), BPLid: 0 };
        this.selectedZone = { OPTM_WHSZONE: this.translate.instant("SelectZone"), BPLid: 0 };

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
        if (localStorage.getItem("service_url") != null && localStorage.getItem("service_url") != undefined
            && localStorage.getItem("service_url") != "") {
            // sessionStorage.setItem('ConfigData', localStorage.getItem("service_url"));
            this.signinService.loadConfig();
            this.getPSURL(); //call method after seting configDataObject.
        } else {
            this.httpClientSer.get('./assets/config.json').subscribe(
                data => {
                    sessionStorage.setItem('ConfigData', JSON.stringify(data[0]));
                    this.signinService.loadConfig();
                    this.getPSURL();
                },
                (err: HttpErrorResponse) => {
                    console.log(err.message);
                    //  alert("HttpErrorResponse:" + err.message);
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
                //      this.toastr.error('', 'There is some error to connect with server', error);
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
            this.getLicenseData(this.commonData.getLicenseCheckTriggerText("FirstLogin"));

            // this.showLoader = false;
            // // sessionStorage.setItem("GUID", this.licenseData[1].GUID);
            // localStorage.setItem("CompID", "BUILD128SRC12X");
            // sessionStorage.setItem("whseId", "01");
            // sessionStorage.setItem("Token", "2bf91be7-819c-4443-a1bc-82dc150da05d");
            // this.router.navigateByUrl('home/dashboard'); 
        }
    }

    showDialog(dialogFor: string, yesbtn: string, nobtn: string, msg: string) {
        this.dialogFor = dialogFor;
        this.yesButtonText = yesbtn;
        this.noButtonText = nobtn;
        this.showConfirmDialog = true;
        this.dialogMsg = msg;
    }

    getConfirmDialogValue($event) {
        this.showConfirmDialog = false;
        if ($event.Status == "yes") {
            switch ($event.From) {
                case ("LicenseCheck"):
                    this.getLicenseData(this.commonData.getLicenseCheckTriggerText("RemoveSession"));
                    break;
            }
        } else if ($event.Status == "no") {
            switch ($event.From) {
                case ("LicenseCheck"):
                    this.getLicenseData(this.commonData.getLicenseCheckTriggerText("PersistSession"));
                    break;
            }
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
        this.setCookie('Role', "", 365);
        this.setCookie('Zone', "", 365);
        this.setCookie('BinRange', "", 365);
        this.companyName = [];
        this.selectedItem = this.translate.instant("Login_SelectCompany");
        this.defaultWHS = { OPTM_WHSE: this.translate.instant("SelectWarehouse"), BPLid: 0 };
    }

    private getLicenseData(LoginTrigger) {
        this.showFullPageLoader = true;
        this.signinService.getLicenseData(this.selectedItem, LoginTrigger).subscribe(
            data => {
                this.licenseData = data;
                if (this.licenseData != null && this.licenseData != undefined && this.licenseData.length > 0) {
                    if (this.licenseData[0].ErrMessage == "Already Login") {
                        this.showDialog("LicenseCheck", this.translate.instant("yes"), this.translate.instant("no"),
                            this.translate.instant("Already_Loggin_Msg"));
                    } else {
                        this.handleLicenseDataSuccessResponse();
                    }
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
        console.log("log", "handleLicense: start");
        // alert("in handle license data success response");
        this.selectedWhse = document.getElementById("whseId").innerText.trim();
        this.showLoader = false;
        if (this.licenseData.length > 1) {
            console.log("log", "handleLicense: start data>1");
            if (this.licenseData[1].ErrMessage == "" || this.licenseData[1].ErrMessage == null) {
                if (this.licenseData[0].Message == "True") {
                    console.log("log", "handleLicense:message true");
                    this.selectedItem = document.getElementById("compId").innerText.trim();
                    sessionStorage.setItem("GUID", this.licenseData[1].GUID);
                    sessionStorage.setItem("CompID", this.selectedItem);
                    sessionStorage.setItem("whseId", this.selectedWhse);
                    sessionStorage.setItem("Token", this.licenseData[0].Token);
                    localStorage.setItem("PalletizationEnabled", this.licenseData[0].PalletizationEnabled);
                    localStorage.setItem("isShipmentApplicable", "True");

                    localStorage.setItem("SelectedRole", this.selectedRole.OPTM_ROLEID);
                    localStorage.setItem("SelectedZone", this.selectedZone.OPTM_WHSZONE);
                    localStorage.setItem("SelectedBinRange", this.selectedBin.OPTM_BIN_RANGE);

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
                        this.setCookie('Role', this.selectedRole.OPTM_ROLEID, 365);
                        this.setCookie('Zone', this.selectedZone.OPTM_WHSZONE, 365);
                        this.setCookie('BinRange', this.selectedBin.OPTM_BIN_RANGE, 365);
                    } else {
                        this.setCookie('cookieEmail', "", 365);
                        this.setCookie('cookiePassword', "", 365);
                        this.setCookie('CompID', "", 365);
                        this.setCookie('whseId', "", 365);
                        this.setCookie('Role', "", 365);
                        this.setCookie('Zone', "", 365);
                        this.setCookie('BinRange', "", 365);
                    }
                    console.log("log", "handleLicense:abouve routing");
                    this.router.navigate(['home/dashboard']);
                } else if (this.licenseData[0].Message == "NotFound") {
                    this.toastr.error('', this.translate.instant("SignIn_Msg_NotFound"));
                    this.showFullPageLoader = false;
                } else if (this.licenseData[0].Message == "Unauthorized") {
                    this.toastr.error('', this.translate.instant("SignIn_Msg_Unauthorized"));
                    this.showFullPageLoader = false;
                } else if (this.licenseData[0].Message == "BadRequest") {
                    this.toastr.error('', this.translate.instant("SignIn_Msg_BadRequest"));
                    this.showFullPageLoader = false;
                } else {
                    console.log("log", "handleLicense:else");
                    this.toastr.error('', this.translate.instant("SignIn_Msg_Default"));
                    this.showFullPageLoader = false;
                }
            } else {
                this.showFullPageLoader = false;
                this.toastr.error('', this.translate.instant("SignIn_Msg_Default"));
            }
        } else {
            if (this.licenseData.length > 0 &&
                this.licenseData[0].ErrMessage != "" && this.licenseData[0].ErrMessage != null) {
                this.toastr.error('', this.licenseData[0].ErrMessage);
            } else {
                this.toastr.error('', this.translate.instant("SignIn_Msg_Default"));
            }
            this.showFullPageLoader = false;

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
        sessionStorage.setItem("UserId", this.userName);
        localStorage.setItem("UserGroup", this.userDetails[0].OPTM_GROUPCODE);
        this.isCompleteLoginVisible = true;
        this.readonlyFlag = true;

        this.userDetails.forEach(element => {
            this.companyName.push(element.OPTM_COMPID);
        });

        for (var i = 0; i < this.companyName.length; i++) {
            if (this.getCookie('CompID') == this.companyName[i]) {
                this.selectedItem = this.companyName[i];
                this.setWarehouseList(true);
            }
        }
    }


    public setWarehouseList(isDirectCall: boolean = false) {
        if (document.getElementById("compId") != null) {
            this.selectedItem = document.getElementById("compId").innerText.trim();
        }
        if (isDirectCall != true) {
            if (this.selectedItem == this.translate.instant("Login_SelectCompany")) {
                this.toastr.error('', this.translate.instant("Login_SelectCompanyMsg"))
                return;
            }
        }
        this.signinService.getWHS(this.selectedItem).subscribe(
            data => {
                this.whsList = data.Table;
                for (var i = 0; i < this.whsList.length; i++) {
                    if (this.getCookie('whseId') == this.whsList[i].OPTM_WHSE) {
                        this.defaultWHS = { OPTM_WHSE: this.whsList[i].OPTM_WHSE, BPLid: 0 };
                    }
                }
                this.showRoleList(true);
                //call permission api after whse select.
                if (isDirectCall) this.checkBinPermissionList(true);


            },
            error => {
                if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
                    this.commonService.unauthorizedToken(error, this.translate.instant("token_expired"));
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

        var whse = this.defaultWHS.OPTM_WHSE//nedd to pass whse actual value
        this.signinService.getZoneList(this.selectedItem, whse).subscribe(
            data => {
                this.zoneList = data.Table;
                for (var i = 0; i < this.zoneList.length; i++) {
                    if (this.getCookie('Zone') == this.zoneList[i].OPTM_WHSZONE) {
                        this.selectedZone = { OPTM_WHSZONE: this.zoneList[i].OPTM_WHSZONE, BPLid: 0 };
                    }
                }
                if (isDirectCall && this.showBinRange) this.showBinRangeList(true)
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
        var whse = this.defaultWHS.OPTM_WHSE
        this.signinService.getBinRanges(whse, this.selectedItem, this.selectedZone.OPTM_WHSZONE).subscribe(
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
    showZone: boolean = false;
    showBinRange: boolean = false;
    public checkBinPermissionList(isDirectCall: boolean = false) {
        if (this.defaultWHS == undefined || this.defaultWHS == "") {
            this.toastr.error('', this.translate.instant("Login_SelectwarehouseMsg"))
            return;
        }
        this.signinService.getBinPermissionList(this.selectedItem, this.defaultWHS.OPTM_WHSE).subscribe(
            data => {
                this.binPermissionList = data;
                if (this.binPermissionList != null && this.binPermissionList != undefined && this.binPermissionList.length > 0) {
                    if (this.binPermissionList[0].OPTM_PARAM_VALUE == "Bin Range") {
                        this.showBinRange = true;
                        this.showZone = true;
                        if (this.showZone) this.showZoneList(isDirectCall)
                    } else if (this.binPermissionList[0].OPTM_PARAM_VALUE == "Zone" || this.binPermissionList[0].OPTM_PARAM_VALUE == "zone") {
                        this.showZone = true;
                        this.showBinRange = false;
                        if (this.showZone) this.showZoneList(isDirectCall)
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

    onWhsChange($event) {
        console.log("event change");
        this.checkBinPermissionList()

    }

    private validateFields(): boolean {
        if (this.selectedItem == this.translate.instant("Login_SelectCompany") || this.selectedItem == '') {
            this.showLoader = false;
            this.toastr.error('', this.translate.instant("Login_SelectCompanyMsg"), this.commonService.toast_config.iconClasses.error);
            return true;
        }
        else if (document.getElementById("whseId").innerText.trim() == this.translate.instant("SelectWarehouse") ||
            document.getElementById("whseId").innerText.trim() == "") {
            this.showLoader = false;
            this.toastr.error('', this.translate.instant("Login_SelectwarehouseMsg"), this.commonService.toast_config.iconClasses.error);
            return true;
        }
        // else if (document.getElementById("Role").innerText.trim() == this.translate.instant("SelectRole") ||
        //     document.getElementById("Role").innerText.trim() == "") {
        //     this.showLoader = false;
        //     this.toastr.error('', this.translate.instant("SelectRoleMsg"), this.commonService.toast_config.iconClasses.error);
        //     return true;
        // }
        // else if (document.getElementById("Zone").innerText.trim() == this.translate.instant("SelectZone") ||
        //     document.getElementById("Zone").innerText.trim() == "") {
        //     this.showLoader = false;
        //     this.toastr.error('', this.translate.instant("SelectZoneMsg"), this.commonService.toast_config.iconClasses.error);
        //     return true;
        // }
        // else if (document.getElementById("BinRange").innerText.trim() == this.translate.instant("SelectBin") ||
        //     document.getElementById("BinRange").innerText.trim() == "") {
        //     this.showLoader = false;
        //     this.toastr.error('', this.translate.instant("SelectBinMsg"), this.commonService.toast_config.iconClasses.error);
        //     return true;
        // }
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