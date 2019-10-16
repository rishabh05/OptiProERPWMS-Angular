import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductionService {

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

  /**
   * get list of items.
   */
  getOrderNumberList(batchNo: string): Observable<any> {
    var jObject = {
      BATCHNO: JSON.stringify([{
        BATCHNO: batchNo, COMPANYDBNAME: localStorage.getItem("CompID"), WHSCODE: localStorage.getItem("whseId"),
        GUID: localStorage.getItem("GUID"), UsernameForLic: localStorage.getItem("UserId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/ProductionReceipt/GetBatchesForProductionReceipt", jObject, this.httpOptions);
  }


  GetItemsDetailForProductionReceipt(batchNo: string, ): Observable<any> {
    var jObject = { BATCHNO: JSON.stringify([{ BATCHNO: batchNo, COMPANYDBNAME: localStorage.getItem("CompID") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/ProductionReceipt/GetItemsForProductionReceipt", jObject, this.httpOptions);
  }

  GetBinsList(): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ItemCode: '', WhsCode: localStorage.getItem("whseId"), QCRequired: '', PageId: "FGRECEIPT" }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetBinsForReceiptWithReceivingBin", jObject, this.httpOptions);
  }

  /**
   * check bin is exists or not.
   * @param item 
   */
  isBinExists(bin: string): Observable<any> {
    var jObject = {
      WhsCode: JSON.stringify([{
        CompanyDBId: localStorage.getItem("CompID"), BinCode: bin,
        ItemCode: '', WhsCode: localStorage.getItem("whseId"), ALLBINS: true
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsBinExist", jObject, this.httpOptions);
  }

  submitProductionRecepit(submitReceiptProdData: any): Observable<any> {
    var jObject = { GoodsReceiptModel: JSON.stringify(submitReceiptProdData) };
    return this.httpclient.post(this.config_params.service_url + "/api/ProductionReceipt/SubmitProductionReceipt", jObject, this.httpOptions);
  }
  /**
   * check bin is exists or not.
   * @param item 
   */
  isSerialExists(serialNo: string, itemCode: string, transType: number, tracking: string, wono: string,
    fromReceiptProduction: boolean): Observable<any> {
   
    
    if(fromReceiptProduction){
      var jObject = { SerialNo: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ItemCode: itemCode, SerialNo: serialNo,
       TransType: transType, TRACKING: tracking, WONO: wono }]) };
      return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/CheckSerialNoPROD", jObject, this.httpOptions);
    } else {
      //return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/CheckSerialNoPROD", jObject, this.httpOptions);
      var jObject = { SerialNo: JSON.stringify([{ CompanyDBId:  localStorage.getItem("CompID"), ItemCode: itemCode, SerialNo: serialNo}]) };
      return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/CheckSerialNo", jObject, this.httpOptions);
    }
  }

  /**
  * check bin is exists or not.
  * @param item 
  */
  GetBatchesForProductionIssueWithProcessCell(): Observable<any> {
    var jObject = { BATCHNO: JSON.stringify([{ COMPANYDBNAME: localStorage.getItem("CompID"), WHSCODE: localStorage.getItem("whseId"), GUID: localStorage.getItem("GUID"), UsernameForLic: localStorage.getItem("UserId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/ProductionIssue/GetBatchesForProductionIssueWithProcessCell", jObject, this.httpOptions);
  }

  GetBOMItemForProductionIssue(orderNo: string) {
    var jObject = { BATCHNO: JSON.stringify([{ COMPANYDBNAME: localStorage.getItem("CompID"), ORDERNO: orderNo, WHSCODE: localStorage.getItem("whseId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/ProductionIssue/GetBOMItemForProductionIssue", jObject, this.httpOptions);
  }



  public submitProduction(req: any) {
    var body: any = { ProductionIssueModel: JSON.stringify(req) };
    return this.httpclient.post(this.config_params.service_url + "/api/ProductionIssue/SubmitProductionIssue", body, this.httpOptions);
  }

}
