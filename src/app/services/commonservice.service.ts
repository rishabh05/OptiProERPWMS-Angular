import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { opticonstants } from '../constants';
import { CurrentSidebarInfo } from '../models/sidebar/current-sidebar-info';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { PalletOperationType } from '../enums/PalletEnums';

@Injectable({
  providedIn: 'root'
})
export class Commonservice {

  public static pageSize: number = 10;
  static RemoveLicenseAndSignout(): any {
    throw new Error("Method not implemented.");
  }

  public href: any = window.location.href;
  public config_params: any;
  public authTokenstr: string = "The remote server returned an error: (401) Unauthorized.";

  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  }

  constructor(private httpclient: HttpClient, private toastr: ToastrService, private router: Router) {
    this.loadConfig();
    this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
  }
  // Declaration
  private commonData = new Subject<any>();
  commonData$ = this.commonData.asObservable();

  public async loadConfig() {

    this.httpclient.get('./assets/config.json').subscribe(
      data => {
        sessionStorage.setItem('ConfigData', JSON.stringify(data[0]));
        this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
      },
      (err: HttpErrorResponse) => {
        console.log(err.message);
      }
    );
  }

  public loadJsonData() {
    this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
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
    positionClass: 'toast-top-right',
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

  public unauthorizedToken(Error, message: string) {
    if (Error.error.ExceptionMessage == this.authTokenstr) {
      this.RemoveLicenseAndSignout(this.toastr, this.router, message);
    }
  }

  public updateHeader() {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': localStorage.getItem('accessToken')
      })
    };
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

  checkAndScanCode(vendCode: string, scanInputString) {
    var jObject = { Gs1Token: JSON.stringify([{ Vsvendorid: vendCode, StrScan: scanInputString, CompanyDBId: localStorage.getItem("CompID") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/Gs1/GS1SETUP", jObject, this.httpOptions);
  }

  RemoveLicenseAndSignout(toastr: ToastrService, router: Router, message: string, fromLogout:boolean = false) {
    this.RemoveLicense().subscribe(
      (data: any) => {
        this.signOut(this.toastr, this.router, message,fromLogout);
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.signOut(this.toastr, this.router, message,fromLogout);
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }


  RemoveLicense(): Observable<any> {
    var jObject = { GUID: localStorage.getItem("GUID"), LoginId: localStorage.getItem("UserId") };
    return this.httpclient.post(this.config_params.service_url + "/api/WMSLogin/RemoveLoggedInUser", jObject, this.httpOptions);
  }


  //Get Setting from DB
  getSettingOnSAP(): Observable<any> {
    //JSON Obeject Prepared to be send as a param to API
    let jObject: any = {
      MoveOrder: JSON.stringify([{
        CompanyDBID: localStorage.getItem("CompID"),
        UserID: localStorage.getItem("UserId")
      }])
    };
    //Return the response form the API  
    return this.httpclient.post(this.config_params.service_url + "/MoveOrder/GetSettingOnSAP", jObject, this.httpOptions);
  }

  signOut(toastr: ToastrService, router: Router, message: string, fromLogout: boolean= false) {
    if(fromLogout){
      toastr.success('', message);
    }else{
      toastr.error('', message);
    }
    
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
    this.router.navigate(['/account']);

  }

  // Refresh List
  private updateTopBarBSub = new BehaviorSubject<any>(null);
  refreshTopbarSubscriber = this.updateTopBarBSub.asObservable();

  public refreshTopBarValue(data: any) {
    this.updateTopBarBSub.next(data);
  }

  clearInboundData() {
    localStorage.setItem("GRPOReceieveData", "");
    localStorage.setItem("Line", "0")
    localStorage.setItem("addToGRPOPONumbers", "");
    localStorage.setItem("AddToGRPO", "");
    localStorage.setItem("VendCode", "");
    localStorage.setItem("VendName", "");
    localStorage.setItem("selectedPO", "");
    localStorage.setItem("PONumber", "");
    localStorage.setItem("primaryAutoLots", "");
    localStorage.setItem("VendRefNo", "");
  }

  getPalletList(opType: number, itemCode: string): Observable<any> {
    var jObject = { 
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        OPERATIONTYPE: "" + opType,
        WhseCode: localStorage.getItem("whseId"),
        ITEMCODE: itemCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletList", jObject, this.httpOptions);
  }

  createNewPallet(palletCode: string, binNo: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        USER: localStorage.getItem("UserId"),
        WHSCODE: localStorage.getItem("whseId"),
        PalletId: palletCode,
        BINCODE: binNo
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/CreateNewPallet", jObject, this.httpOptions);
  }

  isPalletValid(palletCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        WhseCode: localStorage.getItem("whseId"),
        PalletCode: palletCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/IsPalletValid", jObject, this.httpOptions);
  }

  getItemCodeList(): Observable<any> {
    var jObject = { ITEMCODE: '', ITEMNAME: '', WHSCODE: localStorage.getItem("whseId"), CompanyDBName: localStorage.getItem("CompID") }
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsIssue/AllItemLookup", jObject, this.httpOptions);
  }

  getItemInfo(itemCode: string): Observable<any> {
    var jObject = { ITEMCODE: JSON.stringify([{ CompanyDbName: localStorage.getItem("CompID"), ITEMCODE: itemCode, WHSCODE: localStorage.getItem("whseId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsReceipt/GetItemInfo", jObject, this.httpOptions);
  }

  // Palletization APIs 
  getPalletsOfSameWarehouse(palletCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        PalletCode: palletCode,
        WhseCode: localStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletsOfSameWarehouse", jObject, this.httpOptions);
  }

  /**
   * API to get item
   * @param palletCode
   */
  getItemsToPalletize(): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        WhseCode: localStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetItemsToPalletize", jObject, this.httpOptions);
  }

  /**
   * API to get pallet details for show grid.
   * @param palletCode 
   */
  GetPalletData(palletCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        PalletCode: palletCode,
        WhseCode: localStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletData", jObject, this.httpOptions);
  }

  /**
   * API to get pallet details for show grid.
   * @param palletCode 
   */
  GetPalletDataForOutBound(palletCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        PalletCode: palletCode,
        WhseCode: localStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletDataForOutBound", jObject, this.httpOptions);
  }


  /**
   * API for depalletize
   * 
   * @param palletCode
   */
  depalletize(fromPallet: string): Observable<any> {
    var oPalletReq: any = {};
    oPalletReq.Header = [];
    oPalletReq.Header.push({
      COMPANYDBNAME: localStorage.getItem("CompID"),
      FromPalletCode: fromPallet,
      ToPalletCode: fromPallet,
      PALLETOPERATIONTYPE: PalletOperationType.Depalletization,
      WhseCode: localStorage.getItem("whseId"),
      USERID: localStorage.getItem("UserId"),
      DIServerToken: localStorage.getItem("Token")
    });
    var reqObject = { Header: oPalletReq.Header }

    var jObject = {

      PalletCode: JSON.stringify(reqObject)
    };

    // var jObject = {
    //   PalletCode: JSON.stringify([{
    //     COMPANYDBNAME: localStorage.getItem("CompID"),
    //     FromPalletCode: fromPallet,
    //     ToPalletCode: fromPallet,
    //     PALLETOPERATIONTYPE: PalletOperationType.Depalletization,
    //     WhseCode: localStorage.getItem("whseId"),
    //     USERID: localStorage.getItem("UserId")
    //   }])
    // };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/PalletTransaction", jObject, this.httpOptions);
  }

  /**
   * API for palletTransfer
   * 
   * @param palletCode
   */
  palletTransfer(fromPallet: string, toPallet): Observable<any> {
    var oPalletReq: any = {};
    oPalletReq.Header = [];
    oPalletReq.Header.push({
      COMPANYDBNAME: localStorage.getItem("CompID"),
      FromPalletCode: fromPallet,
      ToPalletCode: toPallet,
      PALLETOPERATIONTYPE: PalletOperationType.Transfer,
      WhseCode: localStorage.getItem("whseId"),
      USERID: localStorage.getItem("UserId"),
      DIServerToken: localStorage.getItem("Token")
    });
    var reqObject = { Header: oPalletReq.Header }


    var jObject = {

      PalletCode: JSON.stringify(reqObject)
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/PalletTransaction", jObject, this.httpOptions);
  }

  /**
   * API for depalletize
   * 
   * @param palletCode
   */
  palletTransfer1(fromPallet: string, toPallet): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        FromPalletCode: fromPallet,
        ToPalletCode: toPallet,
        PALLETOPERATIONTYPE: PalletOperationType.Transfer,
        WhseCode: localStorage.getItem("whseId"),
        DIServerToken: localStorage.getItem("Token")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/PalletTransaction", jObject, this.httpOptions);
  }

  getBatchSerialForItem(itemCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        ItemCode: itemCode,
        WhseCode: localStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetBatchSerialForItem", jObject, this.httpOptions);
  }

  /**
   * API for depalletize
   * 
   * @param palletCode
   */
  palletizeOld(palletCode: any): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        FromPalletCode: palletCode,
        ToPalletCode: palletCode,
        PALLETOPERATIONTYPE: PalletOperationType.Palletization,
        WhseCode: localStorage.getItem("whseId"),
        DIServerToken: localStorage.getItem("Token")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/PalletTransaction", jObject, this.httpOptions);
  }

  /**
   * API for depalletize
   * 
   * @param palletCode
   */
  mergePallet(fromPallet: any, toPallet: any): Observable<any> {

    var oPalletReq: any = {};
    oPalletReq.Header = [];
    oPalletReq.Header.push({
      COMPANYDBNAME: localStorage.getItem("CompID"),
      FromPalletCode: fromPallet,
      ToPalletCode: toPallet,
      PALLETOPERATIONTYPE: PalletOperationType.Merge,
      WhseCode: localStorage.getItem("whseId"),
      USERID: localStorage.getItem("UserId"),
      DIServerToken: localStorage.getItem("Token")
    });
    var reqObject = { Header: oPalletReq.Header }

    var jObject = {

      PalletCode: JSON.stringify(reqObject)
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/PalletTransaction", jObject, this.httpOptions);
  }

  /**
   * API for transfer Pallet  USE FOR PALATIZE
   * 
   * @param palletCode
   */
  palletize(palletCode): Observable<any> {//toWhse: string, toBin: string, fromPallet: string, toPallet: string
    var requestObject = { PalletCode: JSON.stringify(palletCode) }
    // var jObject = {
    //   PalletCode: JSON.stringify([{
    //     COMPANYDBNAME: localStorage.getItem("CompID"),
    //     FromPalletCode: fromPallet,
    //     ToPalletCode: toPallet,
    //     PALLETOPERATIONTYPE: PalletOperationType.Palletization,
    //     WhseCode: localStorage.getItem("whseId"),
    //     BIN: "",
    //     WHSE: "",
    //     TOBIN: toBin,
    //     TOWHSE: toWhse,
    //     EXPIRYDATE: "",
    //     ITEMCODE: "",
    //     FINALPALLETNO: "",
    //     BATCHNO: "",
    //     QTY: "",
    //     USERID: localStorage.getItem("UserId")
    //   }])
    // };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/PalletTransaction", requestObject, this.httpOptions);
  }

  GetBatchandSerialItemsFromPallet(palletCode: string, itemCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        ITEMCODE: itemCode,
        PALLETCODE: palletCode,
        WhseCode: localStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetBatchandSerialItemsFromPallet", jObject, this.httpOptions);
  }

  /**
 * API to get item
 * @param palletCode
 */
  GetItemsFromPallet(palletCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        PALLETCODE: palletCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetItemsFromPallet", jObject, this.httpOptions);
  }

  /**
   * API for pallet split
   * 
   * @param palletCode
   */
  palletSplit(palletCode: any): Observable<any> {
    var jObject = { PalletCode: JSON.stringify(palletCode) }
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/PalletTransaction", jObject, this.httpOptions);
  }

  IsValidItemsFromPallet(palletCode: string, itemCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        ITEMCODE: itemCode,
        PALLETCODE: palletCode,
        WhseCode: localStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/IsValidItemsFromPallet", jObject, this.httpOptions);
  }

  IsValidBatchandSerialItemsFromPallet(batchNo: string, itemCode: string, palletCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        ITEMCODE: itemCode,
        PALLETCODE: palletCode,
        BATCHNO: batchNo,
        WhseCode: localStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/IsValidBatchandSerialItemsFromPallet", jObject, this.httpOptions);
  }

  GetPalletListForOutBound(itemCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        WHSECODE: localStorage.getItem("whseId"),
        ITEMCODE: itemCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletListForOutBound", jObject, this.httpOptions);
  }

  IsPalletValidForOutBound(palletCode: string, itemCodeArray: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        WHSECODE: localStorage.getItem("whseId"),
        ITEMCODE: itemCodeArray,
        PALLETCODE: palletCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/IsPalletValidForOutBound", jObject, this.httpOptions);
  }

  GetPalletDataForWhseTrns(palletCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        PalletCode: palletCode,
        WhseCode: localStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletDataForWhseTrns", jObject, this.httpOptions);
  }

  autoGeneratePallet(): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        WHSCODE: localStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletCode", jObject, this.httpOptions);
  }

  GetDefaultBinOrBinWithQtyForProduction(itemCode: string, oToWhs: string, status: string): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ ItemCode: itemCode, WhseCode: oToWhs, Status: status, CompanyDBId: localStorage.getItem("CompID") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetDefaultBinOrBinWithQtyForProduction", jObject, this.httpOptions);
  }

  GetDefaultBinOrBinWithQty(itemCode: string, oToWhs: string): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ ItemCode: itemCode, WhseCode: oToWhs, CompanyDBId: localStorage.getItem("CompID") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetDefaultBinOrBinWithQty", jObject, this.httpOptions);
  }

  // Palletization APIs 
  GetPalletsWithRowsPresent(): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"), 
        WhseCode: localStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletsWithRowsPresent", jObject, this.httpOptions);
  }
}
