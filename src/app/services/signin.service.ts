import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commonservice } from './commonservice.service';
import { CommonConstants } from '../const/common-constants';

@Injectable({
  providedIn: 'root'
})
export class SigninService {

  // private baseUrl = "http://localhost:57911";
  // private adminUrl = "http://172.16.6.167/OptiAdmin";
  private venderListUrl: string = "/api/GoodReceiptPO/GetVendorList";
  private validateUser: string = "/api/WMSlogin/ValidateUserLogin";
  private lisenceDataUrl: string = "/api/WMSlogin/GetLicenseData";
  private POlistUrl: string = "/api/GoodReceiptPO/GetPOList";
  private getItemListUrl: string = "/api/GoodReceiptPO/GetItemList";
  private OpenPOLinesurl: string = "/api/GoodReceiptPO/GetOpenPOLines";
  private AutoLotUrl: string = "/api/GoodReceiptPO/GetAutoLot";
  private UOMUrl: string = "/api/GoodReceiptPO/getUOM";
  private RevBinUrl: string = "/api/GoodReceiptPO/GetBinsForReceiptWithReceivingBin";
  private BinExistUrl = "/api/GoodReceiptPO/IsBinExist";
  private SubmitPOUrl = "/api/GoodReceiptPO/SubmitGoodsReceiptPO";
  private VenderExistUrl = "/api/GoodReceiptPO/IsVendorExists";
  private POExistUrl = "/api/GoodReceiptPO/IsPOExists";
  public config_params: any;

  // public httpOptions = {
  //   headers: new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/json'
  //   })
  // }  

  constructor(private httpclient: HttpClient, private commonService:Commonservice) {
    this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
  }

  public loadConfig(){
    this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
  } 

  getPSURL(url:string): Observable<any> {
    //this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
    let jObject = {};
    return this.httpclient.post(url+"/api/WMSlogin/GetPSURL", jObject, this.commonService.httpOptions);
  } 

  getWHS(compId: string): Observable<any> {
     
    let jObject = {
      CompanyName: JSON.stringify([{
        Username: sessionStorage.getItem("UserId"),
        CompanyDBId: compId
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/WMSlogin/GetWHS", jObject,
      this.commonService.httpOptions);
  }

  ValidateUserLogin(uname: String, pwd: String): Observable<any> {
    //JSON Obeject Prepared to be send as a param to API
    let jObject = {
      Login: JSON.stringify([{
        User: uname,
        Password: pwd, IsAdmin: "true"
      }])
    };
    return this.httpclient.post(this.config_params.service_url + this.validateUser, jObject,
      this.commonService.httpOptions);
  }

  getLicenseData(compId: string, LoginTrigger?): Observable<any> {

    let jObject = {
      LoginId: sessionStorage.getItem("UserId"),
      CompanyId: compId,
      LoginTrigger: LoginTrigger
    };
    if(this.config_params == null){
      this.loadConfig();
     }
    return this.httpclient.post(this.config_params.service_url + this.lisenceDataUrl, jObject, this.commonService.httpOptions);
  }


  getBinRanges(whse:String,compId:string,zone: string): Observable<any> {
    let jObject = {
      CompanyName: JSON.stringify([{
        Warehouse: whse,
        Company: compId,
        UserCode:sessionStorage.getItem("UserId"),
        Zone:zone
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/WMSlogin/GetBinDataByUser", jObject,
      this.commonService.httpOptions);
  }

  getRoleList(compId: string): Observable<any> {
    let jObject = {
      CompanyName: JSON.stringify([{
        UserCode: sessionStorage.getItem("UserId"),
        Company: compId
      }])
    };
    
    return this.httpclient.post(this.config_params.service_url + "/api/WMSlogin/GetRoless", jObject,
      this.commonService.httpOptions);
  }

  getZoneList(compId: string,whseId:string): Observable<any> {
    let jObject = {
      CompanyName: JSON.stringify([{
        Warehouse: whseId,
        Company: compId,
        UserCode:sessionStorage.getItem("UserId")
      }])
    };//'/api/login/GetZoneData'
    return this.httpclient.post(this.config_params.service_url + "/api/WMSlogin/GetZoneDataByUser", jObject,
      this.commonService.httpOptions);
  }

  getBinPermissionList(compId: string,whse:String): Observable<any> {
     
    let jObject = {
      CompanyName: JSON.stringify([{
        CompanyDBId: compId,
        WH:whse,
        Product:CommonConstants.PRODCT_NAME

      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/WMSlogin/IsZoneBinPermissionByUser", jObject,
      this.commonService.httpOptions);
  }

  getBinDataByZone(compId: string): Observable<any> {
     
    let jObject = {
      CompanyName: JSON.stringify([{
        Username: sessionStorage.getItem("UserId"),
        CompanyDBId: compId
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/WMSlogin/GetWHS", jObject,
      this.commonService.httpOptions);
  }
}
