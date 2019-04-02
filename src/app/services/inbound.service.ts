import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OutRequest } from '../models/outbound/request-model';

@Injectable({
  providedIn: 'root'
})
export class InboundService {


  public config_params: any;
  public outRequest: OutRequest = new OutRequest();

  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  }

  constructor(private httpclient: HttpClient) {
    this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
  }

  getVendorList(): Observable<any> {
    let jObject = {
      GoodsReceiptToken: JSON.stringify([{
        UserId: '',
        CompanyDBId: localStorage.getItem("CompID"), WhseCode: localStorage.getItem("whseId"),
        FuturePO: false, PO: "", GUID: localStorage.getItem("GUID"),
        UsernameForLic: localStorage.getItem("UserId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetVendorList", jObject, this.httpOptions);
  }

  IsVendorExists(vendor: string): Observable<any> {
    var jObject = { VendorCode: JSON.stringify([{ UserId: '', CompanyDBId: localStorage.getItem("CompID"), VendorCode: vendor }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsVendorExists", jObject, this.httpOptions);
  }

  getItemList(futurepo: boolean, vendercode: string, po: string): Observable<any> {
    let jObject = {
      GoodsReceiptToken: JSON.stringify([{
        UserId: '',
        CompanyDBId: localStorage.getItem("CompID"), WhseCode: localStorage.getItem("whseId"),
        VendorCode: vendercode,
        FuturePO: futurepo, PO: po
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetItemList", jObject, this.httpOptions);
  }

  getPOList(futurepo: boolean, vendercode: string, itemcode: string): Observable<any> {
    console.log("get polist method :");
    let jObject = {
      GoodsReceiptToken: JSON.stringify([{
        UserId: itemcode,
        CompanyDBId: localStorage.getItem("CompID"), WhseCode: localStorage.getItem("whseId"),
        ItemCode: '', VendorCode: vendercode,
        FuturePO: futurepo, IsCustom: false, GUID: localStorage.getItem("GUID"),
        UsernameForLic: localStorage.getItem("UserId")
      }])
    };
    console.log("get polist method call api :");
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetPOList", jObject, this.httpOptions);
  }

  IsPOExists(poCode: string, cardCode: string): Observable<any> {
    var jObject = { POCode: JSON.stringify([{ UserId: '', CompanyDBId: localStorage.getItem("CompID"), POCode: poCode, CardCode: cardCode }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsPOExists", jObject, this.httpOptions);
  }

  GetOpenPOLines(futurepo: boolean, itemCode: string, po: string): Observable<any> {
    let jObject = {
      GoodsReceiptToken: JSON.stringify([{
        UserId: '',
        CompanyDBId: localStorage.getItem("CompID"),
        DOCNUM: po,
        ItemCode: itemCode,
        WhsCode: localStorage.getItem("whseId"),
        FuturePO: futurepo
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetOpenPOLines", jObject, this.httpOptions);
  }

  getAutoLot(itemCode: string): Observable<any> {
    let jObject = {
      GoodsReceiptToken: JSON.stringify([{
        UserId: '',
        CompanyDBId: localStorage.getItem("CompID"),
        ItemCode: itemCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetAutoLot", jObject, this.httpOptions);
  }

  getUOMs(itemCode: string): Observable<any> {
    let jObject = {
      ItemKey: JSON.stringify([{
        CompanyDBId: localStorage.getItem("CompID"),
        ItemCode: itemCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/getUOM", jObject, this.httpOptions);
  }

  getRevBins(QCrequired: string): Observable<any> {
    var jObject = {
      WhsCode: JSON.stringify([{
        CompanyDBId: localStorage.getItem("CompID"), ItemCode: '',
        WhsCode: localStorage.getItem("whseId"), QCRequired: QCrequired,
        PageId: "GRPO"
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetBinsForReceiptWithReceivingBin", jObject, this.httpOptions);
  }

  binChange(binCode: string): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), BinCode: binCode, ItemCode: '', WhsCode: localStorage.getItem("whseId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsBinExist", jObject, this.httpOptions);
  }

  SubmitGoodsReceiptPO(oSubmitPOLots: any): Observable<any> {
    var jObject = { GoodsReceiptToken: JSON.stringify(oSubmitPOLots) };
    
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/SubmitGoodsReceiptPO", jObject, this.httpOptions);
  }

  // getTargetBins(QCrequired: string): Observable<any> {
  //   var jObject = {
  //     WhsCode: JSON.stringify([{
  //       CompanyDBId: localStorage.getItem("CompID"), ItemCode: '',
  //       WhsCode: localStorage.getItem("whseId"), QCRequired: QCrequired,ageId: "GRPO"}])
  //   };
  //   return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetBinsForReceiptWithReceivingBin", jObject, this.httpOptions);
  // }

  /**
   * get whs list for target whs.
   */
  getQCTargetWhse(): Observable<any> {
    var jObject = {
      WhsCode: JSON.stringify([{
          CompanyDBId: localStorage.getItem("CompID"),
          //Need to pass Username as Warehouses are filled Accordind to the Permission from Admin Portal 
          //Chane dt 2-July-2018
          UserId: localStorage.getItem("UserId")
      }])};
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetWHS", jObject, this.httpOptions);
  }

  /**
   * check whs is valid or not.
   * @param whsCode 
   */
  isWHSExists(whsCode:string){

    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId:  localStorage.getItem("CompID"), ItemCode: '', WhsCode: whsCode}]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsWhsExist", jObject, this.httpOptions);
  }
  /**
   * check and scan code.
   * @param whsCode 
   */
  checkAndScanCode(vendCode:string,scanInputString){
    var jObject = {Gs1Token: JSON.stringify([{Vsvendorid:vendCode,StrScan:scanInputString,CompanyDBId:localStorage.getItem("CompID")}])};
    
    return this.httpclient.post(this.config_params.service_url + "/api/Gs1/GS1SETUP", jObject, this.httpOptions);
  }
  
}

