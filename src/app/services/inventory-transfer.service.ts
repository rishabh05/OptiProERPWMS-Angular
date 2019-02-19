import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryTransferService {

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

  getToWHS(): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ItemCode: '', WhsCode: localStorage.getItem("whseId"), UserId: localStorage.getItem("UserId"), GUID: sessionStorage.getItem("GUID"), UsernameForLic: sessionStorage.getItem("UserId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetToWHS", jObject, this.httpOptions);
  }

  getBinListWithoutBinForNonTrack(ItemCode: string, lotNo: string, BINNO: string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ITEMCODE: ItemCode, LOTNO: lotNo, WHSCODE: localStorage.getItem("whseId"), BINNO: BINNO, SUPPORTTRX: '67' }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsIssue/AllItemLookup", jObject, this.httpOptions);
  }

  getLotWithoutBinWise(ItemCode: string, lotNo: string, BINNO: string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ITEMCODE: ItemCode, LOTNO: lotNo, WHSCODE: localStorage.getItem("whseId"), BINNO: BINNO, SUPPORTTRX: '67', LOTISSUEMETHOD: '' }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsIssue/AllItemLookup", jObject, this.httpOptions);
  }

  getToBIN(fromBin: string): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ItemCode: '', WhsCode: localStorage.getItem("whseId"), FromBin: fromBin}]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetToBIN", jObject, this.httpOptions);
  }

  submitBinTransfer(oWhsTransAddLot: any): Observable<any> {
    var jObject = { BinTransToken: JSON.stringify(oWhsTransAddLot) };
    return this.httpclient.post(this.config_params.service_url + "/api/BinTransfer/PutAway", jObject, this.httpOptions);
  }

}
