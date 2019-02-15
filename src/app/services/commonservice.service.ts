import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { opticonstants } from '../constants';
import { CurrentSidebarInfo } from '../models/sidebar/current-sidebar-info';
import { HttpClient, HttpErrorResponse } from '../../../node_modules/@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Commonservice {

  public href: any = window.location.href;
  constructor(private httpclient: HttpClient) {
    this.loadConfig();
  } 
  // Declaration
  private commonData = new Subject<any>();
  commonData$ = this.commonData.asObservable();

  public async loadConfig(){
    // let config_call = await fetch( this.get_current_url() +  "/assets/config.json");
    // let config_data = await config_call.json();
    // sessionStorage.setItem('system_config', JSON.stringify(config_data));

    //This will get all config
    this.httpclient.get(this.get_current_url() + '/assets/config.json').subscribe(
      data => {
        sessionStorage.setItem('ConfigData', JSON.stringify(data));
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


public toast_config = {
  closeButton: true,
  progressBar: false,
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
  private isRigntSideBarOpenData=new BehaviorSubject<boolean>(false);
  currentSideBarOpenStatus=this.isRigntSideBarOpenData.asObservable();

  public setRightSidebarStatus(open:boolean){
    this.isRigntSideBarOpenData.next(open);
  }


  // SideBar Observer
  private sidebarSubject =new BehaviorSubject<CurrentSidebarInfo>(null);
  currentSidebarInfo=this.sidebarSubject.asObservable();


  public setCurrentSideBar(currentSidebarInfoValue:CurrentSidebarInfo){
    this.sidebarSubject.next(currentSidebarInfoValue);
  }


  // Refresh List
  private refreshPIListSub =new BehaviorSubject<any>(null);
  refreshPIListSubscriber=this.refreshPIListSub.asObservable();

  public refreshPIList(data:any){
    this.refreshPIListSub.next(data);
  }


  // for Seeting color of theme.
  private purchaseInquiryAttachmentGrid = new BehaviorSubject<any>(true);
  purchaseInquiryAttachmentGridStatus = this.purchaseInquiryAttachmentGrid.asObservable();

  public setPurchaseInquiryAttachmentGrid(data: any) {
    this.purchaseInquiryAttachmentGrid.next(data);
  }


  //  share data between landing and signup page
  private customerUserDataSub =new BehaviorSubject<any>(null);
  getcustomerUserDataSub=this.customerUserDataSub.asObservable();

  public passCustomerUserDataToSignup(data:any){
    this.customerUserDataSub.next(data);
  }


}
