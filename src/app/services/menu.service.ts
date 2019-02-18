import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  public config_params: any;

  constructor(private httpclient: HttpClient) {
    this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
  }

  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  }
  

  getAllMenus(): Observable<any> {
    var jObject = { CompanyDBId: localStorage.getItem("CompID"), UserId: localStorage.getItem("UserId"), }
    return this.httpclient.post(this.config_params.service_url +  "/api/Menu/AllModule", jObject,
      this.httpOptions);
  }
}
