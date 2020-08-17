import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commonservice } from './commonservice.service';

@Injectable({
  providedIn: 'root'
})
export class ProductionService {

  public config_params: any;
  // public httpOptions = {
  //   headers: new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/json'
  //   })
  // }

  constructor(private httpclient: HttpClient,private commonService:Commonservice) {
    this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
  }

  /**
   * get list of items.
   */
  getOrderNumberList(batchNo: string): Observable<any> {
    var jObject = {
      BATCHNO: JSON.stringify([{
        BATCHNO: batchNo, COMPANYDBNAME: sessionStorage.getItem("CompID"), WHSCODE: sessionStorage.getItem("whseId"),
        GUID: sessionStorage.getItem("GUID"), UsernameForLic: sessionStorage.getItem("UserId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/ProductionReceipt/GetBatchesForProductionReceipt", jObject, this.commonService.httpOptions);
  }


  GetItemsDetailForProductionReceipt(batchNo: string, ): Observable<any> {
    var jObject = { BATCHNO: JSON.stringify([{ BATCHNO: batchNo, COMPANYDBNAME: sessionStorage.getItem("CompID") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/ProductionReceipt/GetItemsForProductionReceipt", jObject, this.commonService.httpOptions);
  }

  GetBinsList(): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: sessionStorage.getItem("CompID"), ItemCode: '', WhsCode: sessionStorage.getItem("whseId"), QCRequired: '', PageId: "FGRECEIPT" }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetBinsForReceiptWithReceivingBin", jObject, this.commonService.httpOptions);
  }

  /**
   * check bin is exists or not.
   * @param item 
   */
  isBinExists(bin: string): Observable<any> {
    var jObject = {
      WhsCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"), BinCode: bin,
        ItemCode: '', WhsCode: sessionStorage.getItem("whseId"), ALLBINS: true
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsBinExist", jObject, this.commonService.httpOptions);
  }

  submitProductionRecepit(submitReceiptProdData: any): Observable<any> {
    var jObject = { 
      GoodsReceiptModel: JSON.stringify(submitReceiptProdData),
      UsernameForLic: sessionStorage.getItem("UserId")
    };
    return this.httpclient.post(this.config_params.service_url + "/api/ProductionReceipt/SubmitProductionReceipt", jObject, this.commonService.httpOptions);
  }
  /**
   * check bin is exists or not.
   * @param item 
   */
  isSerialExists(serialNo: string, itemCode: string, transType: number, tracking: string, wono: string,
    fromReceiptProduction: boolean): Observable<any> {
    if(fromReceiptProduction){
      var jObject = { SerialNo: JSON.stringify([{ CompanyDBId: sessionStorage.getItem("CompID"), ItemCode: itemCode, SerialNo: serialNo,
       TransType: transType, TRACKING: tracking, WONO: wono }]) };
      return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/CheckSerialNoPROD", jObject, this.commonService.httpOptions);
    } else {
      //return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/CheckSerialNoPROD", jObject, this.commonService.httpOptions);
      var jObject = { SerialNo: JSON.stringify([{ CompanyDBId:  sessionStorage.getItem("CompID"), ItemCode: itemCode, SerialNo: serialNo}]) };
      return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/CheckSerialNo", jObject, this.commonService.httpOptions);
    }
  }

  /**
  * check bin is exists or not.
  * @param item 
  */
  GetBatchesForProductionIssueWithProcessCell(): Observable<any> {
    var jObject = { BATCHNO: JSON.stringify([{ COMPANYDBNAME: sessionStorage.getItem("CompID"), WHSCODE: sessionStorage.getItem("whseId"), GUID: sessionStorage.getItem("GUID"), UsernameForLic: sessionStorage.getItem("UserId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/ProductionIssue/GetBatchesForProductionIssueWithProcessCell", jObject, this.commonService.httpOptions);
  }

  GetBOMItemForProductionIssue(orderNo: string) {
    var jObject = { BATCHNO: JSON.stringify([{ COMPANYDBNAME: sessionStorage.getItem("CompID"), ORDERNO: orderNo, WHSCODE: sessionStorage.getItem("whseId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/ProductionIssue/GetBOMItemForProductionIssue", jObject, this.commonService.httpOptions);
  }



  public submitProduction(req: any) {
    var body: any = { 
      ProductionIssueModel: JSON.stringify(req),
      UsernameForLic: sessionStorage.getItem("UserId")
    };
    return this.httpclient.post(this.config_params.service_url + "/api/ProductionIssue/SubmitProductionIssue", body, this.commonService.httpOptions);
  }

}
