import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { opticonstants } from '../constants';
import { CurrentSidebarInfo } from '../models/sidebar/current-sidebar-info';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Commonservice {
  static RemoveLicenseAndSignout(): any {
    throw new Error("Method not implemented.");
  }

  public href: any = window.location.href;
  public config_params: any;

  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  }

  constructor(private httpclient: HttpClient, private toastr: ToastrService, private router: Router ) {
    this.loadConfig();
    this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
  }
  // Declaration
  private commonData = new Subject<any>();
  commonData$ = this.commonData.asObservable();

  public async loadConfig() {
    this.httpclient.get(this.get_current_url() + '/assets/config.json').subscribe(
    //this.httpclient.get('http://localhost:4200/' + '/assets/config.json').subscribe(
      data => {
        sessionStorage.setItem('ConfigData', JSON.stringify(data));
        this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
      },
      (err: HttpErrorResponse) => {
        console.log(err.message);
      }
    );
  }

  public get_current_url() {
    let temp: any = this.href.substring(0, this.href.lastIndexOf('/'));
    if (temp.lastIndexOf('#') != '-1') {
      temp = temp.substring(0, temp.lastIndexOf('#'));
    }
    let sanitized = temp.replace(/^http\:\/\//, '').replace(/\/+/g, '/').replace(/\/+$/, '');
    temp = (window.location.protocol + '//' + sanitized);
    return temp;
  }


  public toast_config: any = {
    closeButton: true,
    progressBar: false,
    opacity: 1,
    timeOut: 5000,
    positionClass: 'toast-bottom-right',
    iconClasses: {
      error: 'alert alert-danger',
      info: 'alert alert-info ',
      success: 'alert alert-success ',
      warning: 'alert alert-warning'
    }
  };


  // Methods
  public ShareData(data: any) {
    this.commonData.next(data);
  }



  // for Seeting color of theme.
  private themeData = new BehaviorSubject<any>(opticonstants.DEFAULTTHEMECOLOR);
  themeCurrentData = this.themeData.asObservable();

  public setThemeData(data: any) {
    this.themeData.next(data);
  }

  // For opening content from left navigation links.
  private navigatedData = new BehaviorSubject<boolean>(false);
  currentNavigatedData = this.navigatedData.asObservable();

  public setNavigatedData(navigationLink: boolean) {
    this.navigatedData.next(navigationLink);
  }

  // For signup navigation link
  private navigatedFromData = new BehaviorSubject<number>(2);
  currentNavigatedFromValue = this.navigatedFromData.asObservable();

  public setCurrentNavigatedFromData(value: number) {
    this.navigatedFromData.next(value);
  }

  // sidebar code
  private isRigntSideBarOpenData = new BehaviorSubject<boolean>(false);
  currentSideBarOpenStatus = this.isRigntSideBarOpenData.asObservable();

  public setRightSidebarStatus(open: boolean) {
    this.isRigntSideBarOpenData.next(open);
  }


  // SideBar Observer
  private sidebarSubject = new BehaviorSubject<CurrentSidebarInfo>(null);
  currentSidebarInfo = this.sidebarSubject.asObservable();


  public setCurrentSideBar(currentSidebarInfoValue: CurrentSidebarInfo) {
    this.sidebarSubject.next(currentSidebarInfoValue);
  }


  // Refresh List
  private openPDFSub = new BehaviorSubject<any>(null);
  refreshPDFSubscriber = this.openPDFSub.asObservable();

  public refreshDisplyPDF(data: any) {
    this.openPDFSub.next(data);
  }


  // for Seeting color of theme.
  private purchaseInquiryAttachmentGrid = new BehaviorSubject<any>(true);
  purchaseInquiryAttachmentGridStatus = this.purchaseInquiryAttachmentGrid.asObservable();

  public setPurchaseInquiryAttachmentGrid(data: any) {
    this.purchaseInquiryAttachmentGrid.next(data);
  }


  //  share data between landing and signup page
  private customerUserDataSub = new BehaviorSubject<any>(null);
  getcustomerUserDataSub = this.customerUserDataSub.asObservable();

  public passCustomerUserDataToSignup(data: any) {
    this.customerUserDataSub.next(data);
  }

  RemoveLicenseAndSignout(toastr: ToastrService, router: Router, message: string) {
    var jObject = { GUID: localStorage.getItem("GUID"), LoginId: localStorage.getItem("UserId") };
    this.httpclient.post(this.config_params.service_url + "/Login/RemoveLoggedInUser", jObject, this.httpOptions);

    this.signOut(toastr, router, message);

  }

  signOut(toastr: ToastrService, router: Router, message: string){
    toastr.error('', message, this.toast_config);
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('selectedComp');
    sessionStorage.removeItem('loggedInUser');
    // sessionStorage.removeItem('ConfigData');

    localStorage.removeItem('CompID');
    localStorage.removeItem('GUID');
    localStorage.removeItem('UserId');
    localStorage.removeItem('whseId');
    localStorage.removeItem('Token');
    this.clearInboundData()
    this.router.navigateByUrl('/account'); 

  }

   // Refresh List
   private updateTopBarBSub = new BehaviorSubject<any>(null);
   refreshTopbarSubscriber = this.updateTopBarBSub.asObservable();
 
   public refreshTopBarValue(data: any) {
     this.updateTopBarBSub.next(data);
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
}
