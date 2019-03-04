import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OutRequest } from '../models/outbound/request-model';

@Injectable({
  providedIn: 'root'
})
export class OutboundService {


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

  public getCustomerList(): Observable<any> {
    var body: any = { DeliveryToken: this.prepareRequest()};

    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/Customerlist", body, this.httpOptions);
  }

  public getSOItemList(custCode: string,docNum: string,whse:string): Observable<any> {
    //DeliveryToken: [{"CompanyDBId":"BUILD128SRC12X",
   // "DOCENTRY":"165",
    //"CUSTCODE":"SP Contact","Whse":"01"}]

    this.outRequest=new OutRequest();
    this.outRequest.DocEntry = docNum;
    this.outRequest.CUSTCODE = custCode;
    this.outRequest.Whse=whse;
    var body: any = { DeliveryToken: this.prepareRequest()};

    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetOpenSoItemList", body, this.httpOptions);
  }

  public getCustomerSOList( custCode: string,docNum: string=""): Observable<any> {
    this.outRequest=new OutRequest();
    this.outRequest.DOCNUM = docNum;
    this.outRequest.CUSTCODE = custCode;
    var body: any = { DeliveryToken:this.prepareRequest() };
  
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/SoCustomerWiseLookup", body, this.httpOptions);
  }

  public getRecieverPOByUMO(itemCode:string){
    this.outRequest=new OutRequest();
    this.outRequest.ItemCode;
    var body:any=[this.prepareRequest()];
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/getUOM", body, this.httpOptions);
  }

  private prepareRequest(): any {
    //    this.outRequest = new OutRequest();
    this.outRequest.CompanyDBId = localStorage.getItem("CompID");
    this.outRequest.GUID = localStorage.getItem("GUID");
    this.outRequest.UsernameForLic = localStorage.getItem("UserId");
    return JSON.stringify([this.outRequest]);
  }
}

