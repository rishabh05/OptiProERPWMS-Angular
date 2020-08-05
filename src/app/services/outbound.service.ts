import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OutRequest } from '../models/outbound/request-model';
import { Commonservice } from './commonservice.service';
import { CommonConstants } from '../const/common-constants';

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

  public getCustomer(code: string): Promise<any> {
    this.outRequest.CompanyDBId = localStorage.getItem("CompID");
    var body: any = { DeliveryToken:JSON.stringify( [{ CompanyDBId: this.outRequest.CompanyDBId, CUSTCODE: code }] )};
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/Customer", body, this.commonService.httpOptions).toPromise();
  }

  public getSOItemList(custCode: string, docNum: string, whse: string): Observable<any> {

    this.outRequest = new OutRequest();
    this.outRequest.DocEntry = docNum;
    this.outRequest.CUSTCODE = custCode;
    this.outRequest.Whse = whse;
    var body: any = { DeliveryToken: this.prepareRequest() };

    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetOpenSoItemList", body, this.commonService.httpOptions);
  }

  public GetCustomerDetailFromSO(custCode: string, docNum: string, whse: string): Promise<any> {
    this.outRequest = new OutRequest();
    this.outRequest.DOCNUM = docNum;
    this.outRequest.CUSTCODE = custCode;
    this.outRequest.Whse = whse;
    var body: any = { DeliveryToken: this.prepareRequest() };
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetCustomerDetailFromSO", body, this.commonService.httpOptions).toPromise();
  }


  public getShipmentDetail(shipmentId: string): Observable<any> {
    this.outRequest = new OutRequest();
    this.outRequest.CompanyDBId = localStorage.getItem("CompID");
    var body: any = { PalletCode:JSON.stringify( [{ COMPANYDBNAME: this.outRequest.CompanyDBId, OPTM_SHIPMENTID: shipmentId }] )};
    return this.httpclient.post(this.config_params.service_url + "/api/Shipment/GetItemContainerDataForShipment", body, this.commonService.httpOptions);
  }
  public isValidShipmentId(shipmentId: string): Observable<any> {
    this.outRequest = new OutRequest();
    this.outRequest.CompanyDBId = localStorage.getItem("CompID");
    var body: any = { PalletCode:JSON.stringify( [{ COMPANYDBNAME: this.outRequest.CompanyDBId, OPTM_SHIPMENTID: shipmentId }] )};
    return this.httpclient.post(this.config_params.service_url + "/api/Shipment/IsValidShipmentID", body, this.commonService.httpOptions);
  }
  
  public getShipmentIdList(OPTM_BPCODE, OPTM_DOCKDOORID): Observable<any> { 
    this.outRequest = new OutRequest();
    this.outRequest.CompanyDBId = localStorage.getItem("CompID");
    var body: any = { PalletCode:JSON.stringify( [{ COMPANYDBNAME: this.outRequest.CompanyDBId,
      OPTM_BPCODE: OPTM_BPCODE, OPTM_DOCKDOORID: OPTM_DOCKDOORID}] )};
    return this.httpclient.post(this.config_params.service_url + "/api/Shipment/GetShipmentId", body, this.commonService.httpOptions);
  }

  public getDockDoorList(): Observable<any> { 
    this.outRequest = new OutRequest();
    this.outRequest.CompanyDBId = localStorage.getItem("CompID");
    var body: any = { PalletCode:JSON.stringify( [{ COMPANYDBNAME: this.outRequest.CompanyDBId,
      OPTM_WHSE: localStorage.getItem("whseId")}] )};
    return this.httpclient.post(this.config_params.service_url + "/api/Shipment/GetDataForDockDoor", body, this.commonService.httpOptions);
  }

  public isValidDockDoorId(dockDoorId: string): Observable<any> {
    this.outRequest = new OutRequest();
    this.outRequest.CompanyDBId = localStorage.getItem("CompID");
    var body: any = { PalletCode:JSON.stringify( [{ COMPANYDBNAME: this.outRequest.CompanyDBId, 
      OPTM_WHSE: localStorage.getItem("whseId"), OPTM_DOCKDOORID:dockDoorId }] )};
    return this.httpclient.post(this.config_params.service_url + "/api/Shipment/IsValidDockDoor", body, this.commonService.httpOptions);
  }

  public getShipmentInformation(): Observable<any> { 
    this.outRequest = new OutRequest();
    this.outRequest.CompanyDBId = localStorage.getItem("CompID");
    var body: any = { PalletCode:JSON.stringify( [{ COMPANYDBNAME: this.outRequest.CompanyDBId}] )};
    return this.httpclient.post(this.config_params.service_url + "/api/Shipment/GetShipmentId", body, this.commonService.httpOptions);
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

  public getAvaliableMeterial(itemCode: string, docentry: string) {
    var body: any = {
      DeliveryToken: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        WHSCODE: localStorage.getItem("whseId"), 
        ITEMCODE: itemCode, 
        DocEntry: docentry,
        PalletCode: ""
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

  public GetItemCode(itemcode: string): Observable<any> {
    var jObject = {
      ITEMCODE: JSON.stringify([{
          ITEMCODE: itemcode, COMPANYDBNAME: localStorage.getItem("CompID"),
          GUID: localStorage.getItem("GUID"),
        UsernameForLic: localStorage.getItem("UserId")
      }])
    };

    return this.httpclient.post(this.config_params.service_url + "/api/GoodsReceipt/GetItemCode", jObject, this.commonService.httpOptions);
  }

   


  public isPackingNoExists(code: string): Observable<any> {
    this.outRequest.CompanyDBId = localStorage.getItem("CompID");
    var body: any = { DeliveryToken:JSON.stringify( [{ CompanyDBId: this.outRequest.CompanyDBId, CUSTCODE: code }] )};
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/Customer", body, this.commonService.httpOptions);
  }
  
  public GetPackSlipType(number: String,type: String): Observable<any> {
    this.outRequest.CompanyDBId = localStorage.getItem("CompID");
    var body: any = { DeliveryToken:JSON.stringify( [{ CompanyDBId: this.outRequest.CompanyDBId,
      PackType:type,}] )};
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetPackSlipType", body, this.commonService.httpOptions);
  }
  public CreatePackingSlip(number: String,type: String,DocEntry:String){
    this.outRequest.CompanyDBId = localStorage.getItem("CompID");
    var body: any = { DeliveryToken:JSON.stringify( [{ CompanyDBId: this.outRequest.CompanyDBId, Number: number,
      Type:type,UsernameforLic:localStorage.getItem("UserId"),DocEntry:DocEntry}] )};
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/CreatePackingSlip", body, this.commonService.httpOptions);

  }

  
  public GetPackNoBasedOnDelivery(PackNo: String,DocEntry:String){
    this.outRequest.CompanyDBId = localStorage.getItem("CompID");
    var body: any = { DeliveryToken:JSON.stringify( [{ CompanyDBId: this.outRequest.CompanyDBId, PackNo: PackNo,
      DocEntry:DocEntry}] )};
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetPackNoBasedOnDelivery", body, this.commonService.httpOptions);

  }

}

