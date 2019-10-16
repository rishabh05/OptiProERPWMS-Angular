import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OutRequest } from '../models/outbound/request-model';
import { Commonservice } from './commonservice.service';

@Injectable({
  providedIn: 'root'
})
export class OutboundService {


  public config_params: any;
  public outRequest: OutRequest = new OutRequest();

  // public httpOptions = {
  //   headers: new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/json'
  //   })
  // }

  constructor(private httpclient: HttpClient,private commonService:Commonservice) {
    this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
  }

  public getCustomerList(): Observable<any> {
    var body: any = { DeliveryToken: this.prepareRequest() };

    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/Customerlist", body, this.commonService.httpOptions);
  }

  public getCustomer(code: string): Observable<any> {
    this.outRequest.CompanyDBId = localStorage.getItem("CompID");
    var body: any = { DeliveryToken:JSON.stringify( [{ CompanyDBId: this.outRequest.CompanyDBId, CUSTCODE: code }] )};
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/Customer", body, this.commonService.httpOptions);
  }

  public getSOItemList(custCode: string, docNum: string, whse: string): Observable<any> {

    this.outRequest = new OutRequest();
    this.outRequest.DocEntry = docNum;
    this.outRequest.CUSTCODE = custCode;
    this.outRequest.Whse = whse;
    var body: any = { DeliveryToken: this.prepareRequest() };

    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetOpenSoItemList", body, this.commonService.httpOptions);
  }

  public getCustomerSOList(custCode: string, docNum: string, whseId: string): Observable<any> {
    this.outRequest = new OutRequest();
    this.outRequest.DOCNUM = docNum;
    this.outRequest.CUSTCODE = custCode;
    this.outRequest.Whse = whseId;
    var body: any = { DeliveryToken: this.prepareRequest() };

    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/SoCustomerWiseLookup", body, this.commonService.httpOptions);
  }

  public getUOMList(itemCode: string) {
    this.outRequest = new OutRequest();
    this.outRequest.ItemCode = itemCode;
    var body: any = { ItemKey: this.prepareRequest() };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/getUOM", body, this.commonService.httpOptions);
  }

  public getAvaliableMeterial(itemCode: string, docentry: string, palletCode: string) {
    var body: any = {
      DeliveryToken: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        WHSCODE: localStorage.getItem("whseId"), 
        ITEMCODE: itemCode, 
        DocEntry: docentry,
        PalletCode: palletCode
      }])
    };

    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetAllPickPackAndOtherSerialBatch", body, this.commonService.httpOptions);
  }

  public getAvaliableMeterialForNoneTracked(itemCode: string) {
    var body: any = { WHSCODE: JSON.stringify([{ COMPANYDBNAME: localStorage.getItem("CompID"), WHSCODE: localStorage.getItem("whseId"), ITEMCODE: itemCode }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/ProductionIssue/GetBinsToIssueForNonTrackItem", body, this.commonService.httpOptions);
  }

  public addDeleivery(req: any) {
    var body: any = { DeliveryToken: JSON.stringify(req) };
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/SubmitDelivery", body, this.commonService.httpOptions);
  }

  private prepareRequest(): any {
    //    this.outRequest = new OutRequest();
    this.outRequest.CompanyDBId = localStorage.getItem("CompID");
    this.outRequest.GUID = localStorage.getItem("GUID");
    this.outRequest.UsernameForLic = localStorage.getItem("UserId");
    return JSON.stringify([this.outRequest]);
  }

  /**
   * check and scan code.
   * @param whsCode 
   */
  checkAndScanCode(vendCode:string,scanInputString){
    var jObject = {Gs1Token: JSON.stringify([{Vsvendorid:vendCode,StrScan:scanInputString,CompanyDBId:localStorage.getItem("CompID")}])};
    return this.httpclient.post(this.config_params.service_url + "/api/Gs1/GS1SETUP", jObject, this.commonService.httpOptions);
  }



  getAllPickPackAndOtherSerialBatchWithoutBin(itemCode:string,scanBin:string,
    scannedSerialValue,docEntry:string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ COMPANYDBNAME: localStorage.getItem("CompID"), WHSCODE:  localStorage.getItem("whseId"), ITEMCODE: itemCode, BINNO: scanBin, SCANSERIAL: scannedSerialValue, 
      DocEntry: docEntry }]) };
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetAllPickPackAndOtherSerialBatchWithoutBin", jObject, this.commonService.httpOptions);
  }
}

