import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SigninService {

  // private baseUrl = "http://localhost:57911";
  // private adminUrl = "http://172.16.6.167/OptiAdmin";
  private venderListUrl: string = "/api/GoodReceiptPO/GetVendorList";
  private validateUser: string = "/api/login/ValidateUserLogin";
  private lisenceDataUrl: string = "/api/Login/GetLicenseData";
  private POlistUrl: string = "/api/GoodReceiptPO/GetPOList";
  private PSUrl: string = "/api/Login/GetPSURL";
  private WHS: string = "/api/login/GetWHS";
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

  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  }

  constructor(private httpclient: HttpClient) {
    this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
  }

  public loadConfig(){
    this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
  }

  getPSURL(url:string): Observable<any> {
    //this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
    let jObject = {};
    return this.httpclient.post(url+"/api/Login/GetPSURL", jObject, this.httpOptions);
  } 

  getWHS(compId: string): Observable<any> {
    let jObject = {
      CompanyName: JSON.stringify([{
        Username: localStorage.getItem("UserId"),
        CompanyDBId: compId
      }])
    };
    return this.httpclient.post(localStorage.getItem("PSURLFORADMIN") + "/api/login/GetWHS", jObject,
      this.httpOptions);
  }

  ValidateUserLogin(uname: String, pwd: String): Observable<any> {
    //JSON Obeject Prepared to be send as a param to API
    let jObject = {
      Login: JSON.stringify([{
        User: uname,
        Password: pwd, IsAdmin: "true"
      }])
    };
    return this.httpclient.post(localStorage.getItem("PSURLFORADMIN") + this.validateUser, jObject,
      this.httpOptions);
  }

  getLicenseData(compId: string): Observable<any> {

    let jObject = {
      LoginId: localStorage.getItem("UserId"),
      CompanyId: compId
    };
    if(this.config_params == null){
      this.loadConfig();
     }
    //alert("in getLicenceData method of service :");
   
    //alert("in getLicenceData configparam S :"+this.config_params.service_url);
    //alert("in getLicenceData  :"+this.lisenceDataUrl);
    return this.httpclient.post(this.config_params.service_url + this.lisenceDataUrl, jObject, this.httpOptions);
  }
}
