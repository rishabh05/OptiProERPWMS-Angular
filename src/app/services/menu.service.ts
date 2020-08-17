import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commonservice } from './commonservice.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  public config_params: any;

  constructor(private httpclient: HttpClient,private commonService:Commonservice) {
    this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
  }

  // public httpOptions = {
  //   headers: new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/json'
  //   })
  // }
  

  getAllMenus(): Observable<any> {
    var jObject = { CompanyDBId: sessionStorage.getItem("CompID"), UserId: sessionStorage.getItem("UserId"), }
    return this.httpclient.post(this.config_params.service_url +  "/api/Menu/AllModule", jObject,
      this.commonService.httpOptions);
  }
}
