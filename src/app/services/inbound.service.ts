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
    return this.httpclient.post(this.config_params.service_url +"/api/GoodReceiptPO/GetVendorList", jObject, this.httpOptions);
  }

  IsVendorExists(vendor: string): Observable<any> {
    var jObject = { VendorCode: JSON.stringify([{ UserId: '', CompanyDBId: localStorage.getItem("CompID"), VendorCode: vendor}]) };
    return this.httpclient.post(this.config_params.service_url +"/api/GoodReceiptPO/IsVendorExists", jObject, this.httpOptions);
  }
}

