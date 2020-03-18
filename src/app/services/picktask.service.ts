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

  constructor(private httpclient: HttpClient,private commonService:Commonservice) {
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
        OPTM_PICK_TYPE: OPTM_PICK_TYPE
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetPicklist", jObject, this.commonService.httpOptions);
  }

  GetDataBasedOnPickList(OPTM_TASK_CODE): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: localStorage.getItem("CompID"),
        OPTM_TASK_CODE: OPTM_TASK_CODE
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetDataBasedOnPickList", jObject, this.commonService.httpOptions);
  }

  InsertIntoContainerRelationship(OPTM_CONTAINER_TYPE: string, OPTM_PARENT_CONTTYPE: string, OPTM_CONT_PERPARENT, OPTM_CONT_PARTOFPARENT): Observable<any> {
    let jObject = {
      Shipment: JSON.stringify([{
        CompanyDBId: localStorage.getItem("CompID"), 
        OPTM_CONTAINER_TYPE: OPTM_CONTAINER_TYPE,
        OPTM_PARENT_CONTTYPE: OPTM_PARENT_CONTTYPE,
        OPTM_CONT_PERPARENT: OPTM_CONT_PERPARENT, 
        OPTM_CONT_PARTOFPARENT: OPTM_CONT_PARTOFPARENT,
        OPTM_CREATEDBY: localStorage.getItem("UserId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Shipment/InsertIntoContainerRelationship", jObject, this.commonService.httpOptions);
  }

  UpdateContainerRelationship(OPTM_CONTAINER_TYPE, OPTM_PARENT_CONTTYPE, OPTM_CONT_PERPARENT, OPTM_CONT_PARTOFPARENT): Observable<any> {
    let jObject = {
      Shipment: JSON.stringify([{
        CompanyDBId: localStorage.getItem("CompID"), 
        OPTM_CONTAINER_TYPE: OPTM_CONTAINER_TYPE,
        OPTM_PARENT_CONTTYPE: OPTM_PARENT_CONTTYPE,
        OPTM_CONT_PERPARENT: OPTM_CONT_PERPARENT, 
        OPTM_CONT_PARTOFPARENT: OPTM_CONT_PARTOFPARENT,
        OPTM_MODIFIEDBY: localStorage.getItem("UserId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Shipment/UpdateContainerRelationship", jObject, this.commonService.httpOptions);
  }

  DeleteFromContainerRelationship(ddDeleteArry: any[]): Observable<any> {
    var jObject = { Shipment: JSON.stringify(ddDeleteArry) };
    return this.httpclient.post(this.config_params.service_url + "/api/Shipment/DeleteFromContainerRelationship", jObject, this.commonService.httpOptions);
  }

  SubmitPickList(oSubmitPOLots: any): Observable<any> {
    var jObject = { Shipment: JSON.stringify(oSubmitPOLots) };    
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/SubmitPickList", jObject, this.commonService.httpOptions);
  }

  
  /**
   * check whs is valid or not.
   * @param whsCode 
   */
  isWHSExists(whsCode:string){

    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId:  localStorage.getItem("CompID"), ItemCode: '', WhsCode: whsCode}]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsWhsExist", jObject, this.commonService.httpOptions);
  }

   /**
   * check is serial exists or not.
   * @param whsCode 
   */
  isSerialExists(itemCode:string, serialNo:string){
    var jObject = { SerialNo: JSON.stringify([{ CompanyDBId:  localStorage.getItem("CompID"), ItemCode: itemCode, SerialNo: serialNo}]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/CheckSerialNo", jObject, this.commonService.httpOptions);
  }
  
  /**
   * check and scan code.
   * @param whsCode 
   */
  checkAndScanCode(vendCode:string,scanInputString){
    var jObject = {Gs1Token: JSON.stringify([{Vsvendorid:vendCode,StrScan:scanInputString,CompanyDBId:localStorage.getItem("CompID")}])};
    return this.httpclient.post(this.config_params.service_url + "/api/Gs1/GS1SETUP", jObject, this.commonService.httpOptions);
  }

    /**
    * This API method will return base64 string for pdf format for print.
    * @param item 
    * @param binNo 
    * @param noOfCopies 
    */
   printingServiceForSubmitGRPO(psReceiptNo:string) : Observable<any> {
    var jObject = { PrintingObject: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"),
    USERID: localStorage.getItem("UserId"), RPTID: 6, DOCNO: psReceiptNo, 
    GUID: localStorage.getItem("GUID"), UsernameForLic: localStorage.getItem("UserId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/Printing/WMSPrintingService", jObject, this.commonService.httpOptions);
   }

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
}

