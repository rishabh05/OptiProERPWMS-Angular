import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OutRequest } from '../models/outbound/request-model';
import { Commonservice } from './commonservice.service';

@Injectable({
  providedIn: 'root'
})
export class PickTaskService {


  public config_params: any;
  public outRequest: OutRequest = new OutRequest();

  constructor(private httpclient: HttpClient, private commonService: Commonservice) {
    this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
  }

  clearLocaStorage() {
    localStorage.setItem("PickItemIndex", "");
    localStorage.setItem("TaskDetail", "");
  }
  GetPicklist(OPTM_PICK_TYPE): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: localStorage.getItem("CompID"),
        OPTM_PICK_TYPE: OPTM_PICK_TYPE,
        loggedinWH: localStorage.getItem("whseId"),
        loggedinUserGR: localStorage.getItem("UserGroup")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetPicklist", jObject, this.commonService.httpOptions);
  }

  GetDataBasedOnPickList(OPTM_TASK_CODE, OPTM_PICKLIST_ID): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: localStorage.getItem("CompID"),
        OPTM_TASK_CODE: OPTM_TASK_CODE,
        OPTM_PICKLIST_ID: OPTM_PICKLIST_ID,
        OPTM_USER_GRP: localStorage.getItem("UserGroup")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetDataBasedOnPickList", jObject, this.commonService.httpOptions);
  }

  IsValidBatchSerial(ITEMCODE: string, LOTNO: string, OPTM_SRC_BIN: string): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: localStorage.getItem("CompID"),
        ITEMCODE: ITEMCODE,
        LOTNO: LOTNO,
        OPTM_SRC_BIN: OPTM_SRC_BIN,
        OPTM_CREATEDBY: localStorage.getItem("UserGroup")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/IsValidBatchSerial", jObject, this.commonService.httpOptions);
  }

  SubmitPickList(oSubmitPOLots: any): Observable<any> {
    var jObject = { PalletCode: JSON.stringify(oSubmitPOLots) };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/SavePickTaskInformation", jObject, this.commonService.httpOptions);
  }

  /**
   * check and scan code.
   * @param whsCode 
   */
  GetNextPickList(OPTM_PICKTYPE, OPTM_PICKLIST_ID,currentPickListFlg) {
    var jObject = {
      PalletCode: JSON.stringify([{
        OPTM_WHSECODE: localStorage.getItem("whseId"),
        OPTM_USERGRP: localStorage.getItem("UserGroup"),
        OPTM_PICKTYPE: OPTM_PICKTYPE,
        CompanyDBId: localStorage.getItem("CompID"),
        OPTM_PICKLIST_ID: OPTM_PICKLIST_ID,
        currentPickListFlg: currentPickListFlg
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetNextPickList", jObject, this.commonService.httpOptions);
  }

  /**
  * This API method will return base64 string for pdf format for print.
  * @param item 
  * @param binNo 
  * @param noOfCopies 
  */
  

  GetPalletListsForGRPO(opType: number, itemCode: string, BinCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        OPERATIONTYPE: "" + opType,
        WhseCode: localStorage.getItem("whseId"),
        ITEMCODE: itemCode,
        BinCode: BinCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletListsForGRPO", jObject, this.commonService.httpOptions);
  }


  IsPalletValidForGRPO(palletCode: string, itemCode: string, BinCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: localStorage.getItem("CompID"),
        WhseCode: localStorage.getItem("whseId"),
        PalletCode: palletCode,
        ITEMCODE: itemCode,
        BinCode: BinCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/IsPalletValidForGRPO", jObject, this.commonService.httpOptions);
  }

  UpdatePickListStatusBasedOnSelected(OPTM_STATUS, OPTM_PICKLIST_ID, OPTM_STATUS1): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: localStorage.getItem("CompID"),
        OPTM_STATUS: OPTM_STATUS,
        OPTM_PICKLIST_ID: OPTM_PICKLIST_ID,
        OPTM_STATUS1: OPTM_STATUS1
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/UpdatePickListStatusBasedOnSelected", jObject, this.commonService.httpOptions);
  }

  GetCountOfOpenTasksInPickList(OPTM_PICKLIST_ID): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: localStorage.getItem("CompID"),
        OPTM_PICKLIST_ID: OPTM_PICKLIST_ID
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetCountOfOpenTasksInPickList", jObject, this.commonService.httpOptions);
  }  
}

