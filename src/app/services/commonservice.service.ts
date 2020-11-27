import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { opticonstants } from '../constants';
import { CurrentSidebarInfo } from '../models/sidebar/current-sidebar-info';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { PalletOperationType } from '../enums/PalletEnums';
import { IUIComponentTemplate } from 'src/app/common/ui-component.interface';
import { TranslateService } from '../../../node_modules/@ngx-translate/core';

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

  constructor(private httpclient: HttpClient, private toastr: ToastrService, private router: Router, private translate: TranslateService) {
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
        'Authorization': sessionStorage.getItem('accessToken')
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

  checkAndScanCode(vendCode: string, scanInputString, ItemCode, Tracking, ScreenId?) {
    if(ScreenId == undefined)ScreenId = "";
    var jObject = {
      Gs1Token: JSON.stringify([{
        Vsvendorid: vendCode,
        StrScan: scanInputString,
        CompanyDBId: sessionStorage.getItem("CompID"),
        ItemCode: ItemCode,
        Tracking: Tracking,
        ScreenId: ScreenId,
        GS1SetupScanningEnabled: sessionStorage.getItem("GS1SetupScanningEnabled")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Gs1/GS1SETUP", jObject, this.httpOptions);
  }

  RemoveLicenseAndSignout(toastr: ToastrService, router: Router, message: string, fromLogout: boolean = false) {
    this.RemoveLicense().subscribe(
      (data: any) => {
        this.signOut(this.toastr, this.router, message, fromLogout);
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.signOut(this.toastr, this.router, message, fromLogout);
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }


  RemoveLicense(): Observable<any> {
    var jObject = { GUID: sessionStorage.getItem("GUID"), LoginId: sessionStorage.getItem("UserId") };
    return this.httpclient.post(this.config_params.service_url + "/api/WMSLogin/RemoveLoggedInUser", jObject, this.httpOptions);
  }


  //Get Setting from DB
  getSettingOnSAP(): Observable<any> {
    //JSON Obeject Prepared to be send as a param to API
    let jObject: any = {
      MoveOrder: JSON.stringify([{
        CompanyDBID: sessionStorage.getItem("CompID"),
        UserID: sessionStorage.getItem("UserId")
      }])
    };
    //Return the response form the API  
    return this.httpclient.post(this.config_params.service_url + "/MoveOrder/GetSettingOnSAP", jObject, this.httpOptions);
  }

  signOut(toastr: ToastrService, router: Router, message: string, fromLogout: boolean = false) {
    if (fromLogout) {
      toastr.success('', message);
    } else {
      toastr.error('', message);
    }
    
    if(JSON.parse(localStorage.getItem("TaskInfo")) != "" && JSON.parse(localStorage.getItem("TaskInfo")) != undefined && JSON.parse(localStorage.getItem("TaskInfo")) != null){
     // this.CancelPickList((JSON.parse(localStorage.getItem("TaskInfo"))).OPTM_PICKLIST_CODE);
    }

    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('selectedComp');
    sessionStorage.removeItem('loggedInUser');
    // sessionStorage.removeItem('ConfigData');

    sessionStorage.removeItem("CompID");
    sessionStorage.removeItem("GUID");
    sessionStorage.removeItem("UserId");
    sessionStorage.removeItem("whseId");
    sessionStorage.removeItem("Token");
    this.clearInboundData()
    this.router.navigate(['/account']);

  }

  CancelPickList(OPTM_PICKLIST_ID, compId): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: compId,
        OPTM_PICKLIST_ID: OPTM_PICKLIST_ID
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/CancelPickList", jObject, this.httpOptions);
  }

  // Refresh List
  private updateTopBarBSub = new BehaviorSubject<any>(null);
  refreshTopbarSubscriber = this.updateTopBarBSub.asObservable();

  public refreshTopBarValue(data: any) {
    this.updateTopBarBSub.next(data);
  }

  clearInboundData() {
    sessionStorage.setItem("GRPOReceieveData", "");
    sessionStorage.setItem("Line", "0")
    sessionStorage.setItem("addToGRPOPONumbers", "");
    sessionStorage.setItem("AddToGRPO", "");
    sessionStorage.setItem("VendCode", "");
    sessionStorage.setItem("VendName", "");
    sessionStorage.setItem("selectedPO", "");
    sessionStorage.setItem("PONumber", "");
    sessionStorage.setItem("primaryAutoLots", "");
    sessionStorage.setItem("VendRefNo", "");
    sessionStorage.setItem("isFuturePOChecked", "false"),
      sessionStorage.setItem("GRPOHdrUDF", "");
  }

  getPalletList(opType: number, itemCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        OPERATIONTYPE: "" + opType,
        WhseCode: sessionStorage.getItem("whseId"),
        ITEMCODE: itemCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletList", jObject, this.httpOptions);
  }

  createNewPallet(palletCode: string, binNo: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        USER: sessionStorage.getItem("UserId"),
        WHSCODE: sessionStorage.getItem("whseId"),
        PalletId: palletCode,
        BINCODE: binNo
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/CreateNewPallet", jObject, this.httpOptions);
  }

  isPalletValid(palletCode: string): Promise<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        WhseCode: sessionStorage.getItem("whseId"),
        PalletCode: palletCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/IsPalletValid", jObject, this.httpOptions).toPromise();
  }

  isContainerValid(containerCode: string): Promise<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        WhseCode: sessionStorage.getItem("whseId"),
        PalletCode: containerCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/IsPalletValid", jObject, this.httpOptions).toPromise();
  }

  getItemCodeList(): Observable<any> {
    var jObject = { ITEMCODE: '', ITEMNAME: '', WHSCODE: sessionStorage.getItem("whseId"), CompanyDBName: sessionStorage.getItem("CompID") }
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsIssue/AllItemLookup", jObject, this.httpOptions);
  }

  getItemInfo(itemCode: string): Promise<any> {
    var jObject = { ITEMCODE: JSON.stringify([{ CompanyDbName: sessionStorage.getItem("CompID"), ITEMCODE: itemCode, WHSCODE: sessionStorage.getItem("whseId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsReceipt/GetItemInfo", jObject, this.httpOptions).toPromise();
  }

  // Palletization APIs 
  getPalletsOfSameWarehouse(palletCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        PalletCode: palletCode,
        WhseCode: sessionStorage.getItem("whseId")
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
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        WhseCode: sessionStorage.getItem("whseId")
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
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        PalletCode: palletCode,
        WhseCode: sessionStorage.getItem("whseId")
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
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        PalletCode: palletCode,
        WhseCode: sessionStorage.getItem("whseId")
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
      COMPANYDBNAME: sessionStorage.getItem("CompID"),
      FromPalletCode: fromPallet,
      ToPalletCode: fromPallet,
      PALLETOPERATIONTYPE: PalletOperationType.Depalletization,
      WhseCode: sessionStorage.getItem("whseId"),
      USERID: sessionStorage.getItem("UserId"),
      DIServerToken: sessionStorage.getItem("Token")
    });
    var reqObject = { Header: oPalletReq.Header }

    var jObject = {

      PalletCode: JSON.stringify(reqObject)
    };

    // var jObject = {
    //   PalletCode: JSON.stringify([{
    //     COMPANYDBNAME: sessionStorage.getItem("CompID"),
    //     FromPalletCode: fromPallet,
    //     ToPalletCode: fromPallet,
    //     PALLETOPERATIONTYPE: PalletOperationType.Depalletization,
    //     WhseCode: sessionStorage.getItem("whseId"),
    //     USERID: sessionStorage.getItem("UserId")
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
      COMPANYDBNAME: sessionStorage.getItem("CompID"),
      FromPalletCode: fromPallet,
      ToPalletCode: toPallet,
      PALLETOPERATIONTYPE: PalletOperationType.Transfer,
      WhseCode: sessionStorage.getItem("whseId"),
      USERID: sessionStorage.getItem("UserId"),
      DIServerToken: sessionStorage.getItem("Token")
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
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        FromPalletCode: fromPallet,
        ToPalletCode: toPallet,
        PALLETOPERATIONTYPE: PalletOperationType.Transfer,
        WhseCode: sessionStorage.getItem("whseId"),
        DIServerToken: sessionStorage.getItem("Token")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/PalletTransaction", jObject, this.httpOptions);
  }

  getBatchSerialForItem(itemCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        ItemCode: itemCode,
        WhseCode: sessionStorage.getItem("whseId")
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
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        FromPalletCode: palletCode,
        ToPalletCode: palletCode,
        PALLETOPERATIONTYPE: PalletOperationType.Palletization,
        WhseCode: sessionStorage.getItem("whseId"),
        DIServerToken: sessionStorage.getItem("Token")
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
      COMPANYDBNAME: sessionStorage.getItem("CompID"),
      FromPalletCode: fromPallet,
      ToPalletCode: toPallet,
      PALLETOPERATIONTYPE: PalletOperationType.Merge,
      WhseCode: sessionStorage.getItem("whseId"),
      USERID: sessionStorage.getItem("UserId"),
      DIServerToken: sessionStorage.getItem("Token")
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
    //     COMPANYDBNAME: sessionStorage.getItem("CompID"),
    //     FromPalletCode: fromPallet,
    //     ToPalletCode: toPallet,
    //     PALLETOPERATIONTYPE: PalletOperationType.Palletization,
    //     WhseCode: sessionStorage.getItem("whseId"),
    //     BIN: "",
    //     WHSE: "",
    //     TOBIN: toBin,
    //     TOWHSE: toWhse,
    //     EXPIRYDATE: "",
    //     ITEMCODE: "",
    //     FINALPALLETNO: "",
    //     BATCHNO: "",
    //     QTY: "",
    //     USERID: sessionStorage.getItem("UserId")
    //   }])
    // };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/PalletTransaction", requestObject, this.httpOptions);
  }

  GetBatchandSerialItemsFromPallet(palletCode: string, itemCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        ITEMCODE: itemCode,
        PALLETCODE: palletCode,
        WhseCode: sessionStorage.getItem("whseId")
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
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
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

  IsValidItemsFromPallet(palletCode: string, itemCode: string): Promise<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        ITEMCODE: itemCode,
        PALLETCODE: palletCode,
        WhseCode: sessionStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/IsValidItemsFromPallet", jObject, this.httpOptions).toPromise();
  }

  IsValidBatchandSerialItemsFromPallet(batchNo: string, itemCode: string, palletCode: string): Promise<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        ITEMCODE: itemCode,
        PALLETCODE: palletCode,
        BATCHNO: batchNo,
        WhseCode: sessionStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/IsValidBatchandSerialItemsFromPallet", jObject, this.httpOptions).toPromise();
  }

  GetPalletListForOutBound(itemCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        WHSECODE: sessionStorage.getItem("whseId"),
        ITEMCODE: itemCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletListForOutBound", jObject, this.httpOptions);
  }

  IsPalletValidForOutBound(palletCode: string, itemCodeArray: string): Promise<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        WHSECODE: sessionStorage.getItem("whseId"),
        ITEMCODE: itemCodeArray,
        PALLETCODE: palletCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/IsPalletValidForOutBound", jObject, this.httpOptions).toPromise();
  }

  GetPalletDataForWhseTrns(palletCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        PalletCode: palletCode,
        WhseCode: sessionStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletDataForWhseTrns", jObject, this.httpOptions);
  }

  autoGeneratePallet(): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        WHSCODE: sessionStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletCode", jObject, this.httpOptions);
  }

  GetDefaultBinOrBinWithQtyForProduction(itemCode: string, oToWhs: string, status: string): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ ItemCode: itemCode, WhseCode: oToWhs, Status: status, CompanyDBId: sessionStorage.getItem("CompID") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetDefaultBinOrBinWithQtyForProduction", jObject, this.httpOptions);
  }

  GetDefaultBinOrBinWithQty(itemCode: string, oToWhs: string): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ ItemCode: itemCode, WhseCode: oToWhs, CompanyDBId: sessionStorage.getItem("CompID") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetDefaultBinOrBinWithQty", jObject, this.httpOptions);
  }

  // Palletization APIs 
  GetPalletsWithRowsPresent(): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        WhseCode: sessionStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletsWithRowsPresent", jObject, this.httpOptions);
  }

  GetContainerWithRowsPresent(containerId: any): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        WhseCode: sessionStorage.getItem("whseId"),
        ContainerCode: containerId
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetContainersWithRowsPresent", jObject, this.httpOptions);
  }

  GetContainerDataForWhseTrns(containerCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        CONTAINERCODE: containerCode,
        WhseCode: sessionStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetContainerDataForWhseTrns", jObject, this.httpOptions);
  }

  onShipmentIDChange(OPTM_SHIPMENT_CODE): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),
        OPTM_WHSCODE: sessionStorage.getItem("whseId"),
        OPTM_SHIPMENT_CODE: OPTM_SHIPMENT_CODE
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetShipmentContainers", jObject, this.httpOptions);
  }

  UnloadContainer(OPTM_SHIPMENT_CODE:string, containerCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"), 
        OPTM_WHSCODE: sessionStorage.getItem("whseId"),
        OPTM_SHIPMENT_CODE: OPTM_SHIPMENT_CODE,
        OPTM_CONTCODE: containerCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/UnloadContainer", jObject, this.httpOptions);
  }

  SaveLoadTaskInformation(containerData): Observable<any> {
    var jObject = { PalletCode: JSON.stringify(containerData) };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/SaveLoadTaskInformation", jObject, this.httpOptions);
  }

  GetPickTaskSelectedSteps(OPTM_TRANS_CATEGORY): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),
        OPTM_TRANS_CATEGORY: OPTM_TRANS_CATEGORY
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetPickTaskSelectedSteps", jObject, this.httpOptions);
  }

  getServerDate(): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/getServerDate", jObject, this.httpOptions);
  }

  GetSelectedSteps(OPTM_TRANS_CATEGORY) {
    this.GetPickTaskSelectedSteps(OPTM_TRANS_CATEGORY).subscribe(
      (data: any) => {
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.RemoveLicenseAndSignout(this.toastr, this.router,
              "Session expire");
            return; 
          }
          if (OPTM_TRANS_CATEGORY == "Picking") {
            localStorage.setItem("PickListSteps", JSON.stringify(data.OPTM_TRANS_STEPS));
          } else if (OPTM_TRANS_CATEGORY == "Drop") {
            sessionStorage.setItem("DropSteps", JSON.stringify(data.OPTM_TRANS_STEPS));
          } else if (OPTM_TRANS_CATEGORY == "Loading") {
            sessionStorage.setItem("LoadSteps", JSON.stringify(data.OPTM_TRANS_STEPS));
          } else if (OPTM_TRANS_CATEGORY == "Packing") {
            sessionStorage.setItem("PackingSteps", JSON.stringify(data.OPTM_TRANS_STEPS));
          } else if (OPTM_TRANS_CATEGORY == "Shp_Loading") {
            sessionStorage.setItem("ShpLoadingSteps", JSON.stringify(data.OPTM_TRANS_STEPS));
          } 
          
        } else {
          // this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
      }
    );
  }

  GetConfigurationParam(): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),
        OPTM_APPLICABLE_WHSE: sessionStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetConfigurationParam", jObject, this.httpOptions);
  }

  CreateContainerForPacking(oSaveModel): Observable<any> {
    let jObject = { PalletCode: JSON.stringify(oSaveModel) };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/CreateContainerForPacking", jObject, this.httpOptions);
  }

  CancelPickListAPI(OPTM_PICKLIST_ID, compId, translate) {
    if (OPTM_PICKLIST_ID == "" || OPTM_PICKLIST_ID == undefined) {
      return;
    }
    // this.showLoader = true;
    this.CancelPickList(OPTM_PICKLIST_ID, compId).subscribe(
      (data: any) => {
        // this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.RemoveLicenseAndSignout(this.toastr, this.router,
              translate.instant("CommonSessionExpireMsg"));
            return;
          }
        }
      },
      error => {
        // this.showLoader = false;
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.unauthorizedToken(error, translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  GetUDFBasedOnScreen(OPTM_MODULECODE, OPTM_SCREENID): Observable<any> {
    let jObject = {
      DEFAULTSYSTEMBIN: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),
        OPTM_MODULECODE: OPTM_MODULECODE,
        OPTM_SCREENID: OPTM_SCREENID
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/WhsTrans/GetUDFBasedOnScreen", jObject, this.httpOptions);
  }

  public GetWMSUDFBasedOnScreen(moduleId) {
    // this.showPDFLoading = true;
    this.GetUDFBasedOnScreen("WMS", moduleId).subscribe(
      (data: any) => {
        // this.showPDFLoading = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.UDFApiResponse = data;
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        // this.showLookupLoader = false;
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  getUDFData(): any {
    return this.UDFApiResponse;
  }

  UDFComponentData: IUIComponentTemplate[] = [];
  itUDFComponents: IUIComponentTemplate = <IUIComponentTemplate>{};
  templates = [];
  UDFApiResponse;

  loadUDF(displayArea, UDFData, UDF?): String {
    this.onUDFDialogClose();
    let data = UDFData;
    let subarray = [];
    let UDFStatus = "";
    data.Fields.forEach(element => {
      if (element.OPTM_DISPLAYAREA == displayArea) {
        subarray.push(element);
      }
    });
    if (subarray.length == 0) {
      this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
      UDFStatus = "NO_DATA";
      return UDFStatus;
    }
    let index = subarray.findIndex(e => e.OPTM_ISMANDATORY == 1)
    if (index != -1) {
      UDFStatus = "MANDATORY_AVL"
    }
    for (var i = 0; i < subarray.length; i++) {
      let DropdownArray = data.ValidValues.filter(e => e.OPTM_SEQ == subarray[i].OPTM_SEQ);
      if (DropdownArray.length == 0) {
        this.addUDFdata(true, false, DropdownArray, subarray[i], UDF);
      } else {
        this.addUDFdata(false, true, DropdownArray, subarray[i], UDF);
      }
    }
    return UDFStatus;
  }

  addUDFdata(istextbox, isdropdown, DropdownArray, Field, UDF?) {
    this.itUDFComponents = <IUIComponentTemplate>{};
    this.itUDFComponents.dropDown = "";
    this.itUDFComponents.textBox = "";
    this.itUDFComponents.ismandatory = Field.OPTM_ISMANDATORY == 1 ? true : false;
    if (this.itUDFComponents.ismandatory) {
      this.itUDFComponents.LabelName = Field.Descr + "*";
    } else {
      this.itUDFComponents.LabelName = Field.Descr;
    }
    this.itUDFComponents.istextbox = istextbox;
    this.itUDFComponents.isdropDown = isdropdown;
    this.itUDFComponents.OPTM_SEQ = Field.OPTM_SEQ;
    this.itUDFComponents.AliasID = Field.AliasID;
    this.itUDFComponents.Size = Field.SizeID;
    let UDFRow = undefined;
    if (UDF != undefined && UDF.length > 0) {
      UDFRow = UDF.find(e => e.Key == Field.AliasID)
    }
    if (isdropdown) {
      this.itUDFComponents.DropdownArray = DropdownArray;
      if (UDFRow != undefined) {
        this.itUDFComponents.dropDown = DropdownArray.find(e => e.FldValue == UDFRow.Value);
      } else {
        this.itUDFComponents.dropDown = DropdownArray[Number(Field.Dflt) - 1];
      }
    } else {
      this.itUDFComponents.textType = Field.OPTM_FIELD_TYPE == "numeric" ? "number" : Field.OPTM_FIELD_TYPE;
      if (UDFRow != undefined) {
        this.itUDFComponents.textBox = UDFRow.Value
      } else {
        this.itUDFComponents.textBox = Field.Dflt
      }
    }
    this.templates.push(this.templates.length);
    this.UDFComponentData.push(this.itUDFComponents);
  }

  getTemplateArray(): any[] {
    return this.templates;
  }

  getUDFComponentDataArray(): any[] {
    return this.UDFComponentData;
  }

  onUDFDialogClose() {
    // this.showUDF = false;
    this.UDFComponentData = [];
    this.templates = [];
  }

  ComponentVisibilityList = [];
  async getComponentVisibilityList(moduleId, screenId, CntrlId): Promise<any> {
    await this.GetControlVisibility("WMS", moduleId, screenId, CntrlId).then(
      (data: any) => {
        if (data != null) {
          // if (data.length > 0) {
            this.ComponentVisibilityList = data;
          // } else {
            // this.toastr.error('', this.translate.instant("InValidPalletNo"));
          // }
        }
        else {
          // this.toastr.error('', this.translate.instant("InValidPalletNo"));
        }
      },
      error => {

      }
    );
    // return true;
  }

  GetControlVisibility(ApplicationID, ModuleID, ScreenID, ControlID): Promise<any> {
    let jObject = {
      UserId: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),
        ApplicationID: ApplicationID,
        ModuleID: ModuleID,
        ScreenID: ScreenID,
        ControlID: ControlID
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/menu/GetAllControl", jObject, this.httpOptions).toPromise();
  }

  getComponentVisibility():any[]{
    return this.ComponentVisibilityList;
  }
}



