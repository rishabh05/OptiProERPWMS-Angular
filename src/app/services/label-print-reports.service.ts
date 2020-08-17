//===============================================================================
// © 2018 Optipro.  All rights reserved.
// Original Author: Ankur Sharma
// Original Date: 13 March 2019
//==============================================================================

import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commonservice } from './commonservice.service';

@Injectable({
  providedIn: 'root'
})
export class LabelPrintReportsService {

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
  getItemCode(): Observable<any> {
    //var jObject = { COMPANYDBNAME: companyDBObject.CompanyDbName };
    var jObject = { CompanyDBName: sessionStorage.getItem("CompID") }
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsReceipt/AllItemLookup", jObject, this.commonService.httpOptions);
  }
  
  /**
   * check item is exists or not.
   * @param item 
   */
  isItemExists( item:string): Observable<any> {
    var jObject = { ITEMCODE: JSON.stringify([{ COMPANYDBNAME: sessionStorage.getItem("CompID"), ItemCode: item }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsReceipt/IsItemExists", jObject, this.commonService.httpOptions);
  }

  isItemExistsPromise( item:string): Promise<any> {
    var jObject = { ITEMCODE: JSON.stringify([{ COMPANYDBNAME: sessionStorage.getItem("CompID"), ItemCode: item }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsReceipt/IsItemExists", jObject, this.commonService.httpOptions).toPromise();
  }

  /**
   * get tracking type for the item.
   * @param item 
   */
  getItemTracking ( item:string): Observable<any> {
    var jObject = { ITEMCODE: JSON.stringify([{ COMPANYDBNAME: sessionStorage.getItem("CompID"), ItemCode: item }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsReceipt/GetItemTracking", jObject, this.commonService.httpOptions);
    
  }
  ///api/LabelPrint/GetAllLotsForItemLabelReport
  
  /**
   * get list for batch, serial, bin list (lots list).
   * @param item 
   */
  getLotsList( item:string): Observable<any> {
    var jObject = { LabelPrintToken: JSON.stringify([{ CompanyDBId: sessionStorage.getItem("CompID"), ItemCode: item, WhsCode: sessionStorage.getItem("whseId") , ALLBINS: true, LOTISSUEMETHOD: '1', SUPPORTTRX: '15' }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/LabelPrint/GetAllLotsForItemLabelReport", jObject, this.commonService.httpOptions);
  }

   /**
    * check bin for non tracked items.
    * @param item selected or entered item.
    * @param binNo selected or entered bin no.
    */
   checkBinForItemLabelReport( item:string,binNo:string): Observable<any> {
    //var jObject = null;
    var jObject = { LabelPrintToken: JSON.stringify([{ BINNO: binNo, CompanyDBId: sessionStorage.getItem("CompID"), ItemCode: item, WhsCode: '', ALLBINS: true, LOTISSUEMETHOD: '1', SUPPORTTRX: '15' }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/LabelPrint/CheckBinForItemLabelReport", jObject, this.commonService.httpOptions);
  }
  
  /**
   * get lot scan list.
   * @param item 
   * @param binNo 
   */
  getLotScanListWithoutWhseBinAndItemWise( item:string,binNo:string): Observable<any>{
   var jObject = { DeliveryToken: JSON.stringify([{ LOTNO: binNo, CompanyDBId: sessionStorage.getItem("CompID"), ITEMCODE: item, WhsCode: '', ALLBINS: true, LOTISSUEMETHOD: '1', SUPPORTTRX: '15' }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotScanListWithoutWhseBinAndItemWise", jObject, this.commonService.httpOptions);
  }

  /**
   * get lot scan list.
   * @param item 
   * @param binNo 
   */
  getLotScanListWithoutWhseBinAndItemWisePromise( item:string,binNo:string): Promise<any>{
    var jObject = { DeliveryToken: JSON.stringify([{ LOTNO: binNo, CompanyDBId: sessionStorage.getItem("CompID"), ITEMCODE: item, WhsCode: '', ALLBINS: true, LOTISSUEMETHOD: '1', SUPPORTTRX: '15' }]) };
     return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotScanListWithoutWhseBinAndItemWise", jObject, this.commonService.httpOptions).toPromise();
   }

  /**
   * get the value for no. of copies for print.
   */
  getCopyCountForItemLabelReport(){
    var jObject = { Print: JSON.stringify([{ USERID: sessionStorage.getItem("UserId"), COMPANYDBNAME: sessionStorage.getItem("CompID"), RPTID: "Item Label Report" }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/Printing/GetCopyCount", jObject, this.commonService.httpOptions);
   }

   /**
    * This API method will return base64 string for pdf format for print.
    * @param item 
    * @param binNo 
    * @param noOfCopies 
    */
   printingServiceForItemLabel(item:string,binNo:string,noOfCopies:string){
    var jObject = { PrintingObject: JSON.stringify([{ CompanyDBId: sessionStorage.getItem("CompID"), 
     USERID: sessionStorage.getItem("UserId"), ITEMCODE: item, LOTNO: binNo,
     RPTID: 1, NOOFLABELS: noOfCopies, WHSCODE:  sessionStorage.getItem("whseId"), 
     GUID:  sessionStorage.getItem("GUID"), UsernameForLic: sessionStorage.getItem("UserId")}]) };
    return this.httpclient.post(this.config_params.service_url + "/api/Printing/WMSPrintingService", jObject, this.commonService.httpOptions);
   }
  

   /**
   * get list for batch, serial, bin list (lots list).
   * @param item 
   */
  getFromBinsList(): Observable<any> {
    //var jObject = null;
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: sessionStorage.getItem("CompID"), ItemCode: '', WhsCode: sessionStorage.getItem("whseId"),
     ALLBINS: true, GUID: sessionStorage.getItem("GUID"), UsernameForLic: sessionStorage.getItem("UserId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetBins", jObject, this.commonService.httpOptions);
  }


  /**
   * get list for batch, serial, bin list (lots list).
   * @param item 
   */
  getToBinsList(): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: sessionStorage.getItem("CompID"), ItemCode: '', WhsCode: sessionStorage.getItem("whseId"), 
    ALLBINS: true, GUID: sessionStorage.getItem("GUID"), UsernameForLic:  sessionStorage.getItem("UserId") }]) };
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: sessionStorage.getItem("CompID"), ItemCode: '', WhsCode: sessionStorage.getItem("whseId"),
     ALLBINS: true, GUID: sessionStorage.getItem("GUID"), UsernameForLic: sessionStorage.getItem("UserId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetBins", jObject, this.commonService.httpOptions);
  }
  
 /**
   * get the value for no. of copies for print.
   */
  getCopyCountForBinLabelReport(){
    var jObject = { Print: JSON.stringify([{ USERID: sessionStorage.getItem("UserId"), COMPANYDBNAME: sessionStorage.getItem("CompID"), RPTID: "Bin Label Report" }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/Printing/GetCopyCount", jObject, this.commonService.httpOptions);
   }

   /**
    * This API method will return base64 string for pdf format for print.
    * @param item 
    * @param binNo 
    * @param noOfCopies 
    */
   printingServiceForBinLabel(fromBin:string,toBin:string,noOfCopies:string){
    var jObject ={ PrintingObject: JSON.stringify([{ CompanyDBId: sessionStorage.getItem("CompID"), USERID: sessionStorage.getItem("UserId"),
    BINFROM: fromBin, BINTO: toBin, RPTID: 2, NOOFLABELS: noOfCopies, 
    GUID: sessionStorage.getItem("GUID"), UsernameForLic: sessionStorage.getItem("UserId") }])};
    return this.httpclient.post(this.config_params.service_url + "/api/Printing/WMSPrintingService", jObject, this.commonService.httpOptions);
   }

   
   /**
   * check bin is exists or not.
   * @param item 
   */
  isBinExists( bin:string): Promise<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: sessionStorage.getItem("CompID"), BinCode: bin, 
      ItemCode: '', WhsCode: sessionStorage.getItem("whseId"), ALLBINS: true }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsBinExist", jObject, this.commonService.httpOptions).toPromise();
  }

  
  /**
   * get the value for no. of copies for print.
   */
  GetItemOrBatchDetail(item:string,lot:string,itemName:string){
    var jObject = {
      ITEMCODE: JSON.stringify([{
          COMPANYDBNAME: sessionStorage.getItem("CompID"),WHSCODE: sessionStorage.getItem("whseId"),
          ItemCode: item,LotNo: lot,ItemName: itemName}])};
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsReceipt/GetItemOrBatchDetail", jObject, this.commonService.httpOptions);
   }
}
