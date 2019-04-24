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
  getOrderNumberList(batchNo:string): Observable<any> {
    var jObject = { BATCHNO: JSON.stringify([{ BATCHNO: batchNo, COMPANYDBNAME: localStorage.getItem("CompID"), WHSCODE: localStorage.getItem("whseId"),
       GUID: localStorage.getItem("GUID"), UsernameForLic: localStorage.getItem("UserId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/ProductionReceipt/GetBatchesForProductionReceipt", jObject, this.httpOptions);
  }

  
  GetItemsDetailForProductionReceipt(batchNo:string,): Observable<any>{
    var  jObject = { BATCHNO: JSON.stringify([{ BATCHNO: batchNo, COMPANYDBNAME: localStorage.getItem("CompID") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/ProductionReceipt/GetItemsForProductionReceipt", jObject, this.httpOptions);
  }

  GetBinsList(): Observable<any>{
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId:localStorage.getItem("CompID"), ItemCode: '', WhsCode: localStorage.getItem("whseId"), QCRequired: '', PageId: "FGRECEIPT" }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetBinsForReceiptWithReceivingBin", jObject, this.httpOptions);
  }
  
}
