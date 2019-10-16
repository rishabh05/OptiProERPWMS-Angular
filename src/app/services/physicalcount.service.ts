import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OutRequest } from '../models/outbound/request-model';
import { Commonservice } from './commonservice.service';

@Injectable({
  providedIn: 'root'
})
export class PhysicalcountService {


  public config_params: any;
  public outRequest: OutRequest = new OutRequest();

  // public httpOptions = {
  //   headers: new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/json'
  //   })
  // }

  constructor(private httpclient: HttpClient,private commonService:Commonservice) {
    this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
  }

  getPhysicalCountDataView(): Observable<any> {
    var jObject = {
      DeliveryToken: JSON.stringify([{
        CompanyDBId: localStorage.getItem("CompID"),
        WhsCode: localStorage.getItem("whseId"),
        User: localStorage.getItem("UserId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetPhysicalCountDataView", jObject, this.commonService.httpOptions);
  }

  getItemList(docNo: string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), DocNum: docNo, Warehouse: localStorage.getItem("whseId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetItemList", jObject, this.commonService.httpOptions);
  }

  GetSavedDocNoDetails(DocEntry: string, ItemCode: string, Bin: string, IsTeamCount: string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), DocEntry: DocEntry, ItemCode: ItemCode, Bin: Bin, User: localStorage.getItem("UserId"), IsTeamCount: IsTeamCount }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetSavedDocNoDetails", jObject, this.commonService.httpOptions);
  }

  ShowBILOTList(itemCode: string, Bin: string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), WHSCODE: localStorage.getItem("whseId"), BINNO: Bin, ITEMCODE: itemCode, DOCNUM: '', User: localStorage.getItem("UserId") }]) };

    if (itemCode == "" && Bin == "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotListWithoutBinNItemCode", jObject, this.commonService.httpOptions);
    }
    else if (itemCode != "" && Bin != "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotListBinForPallet", jObject, this.commonService.httpOptions);

    }
    else if (itemCode != "" && Bin == "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotListWithoutBinForPallet", jObject, this.commonService.httpOptions);
    }
    else if (itemCode == "" && Bin != "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotListBinWithoutItemCode", jObject, this.commonService.httpOptions);
    }
  }

  IslotExist(bin: string, itemCode: string, lot: string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), WHSCODE: localStorage.getItem("whseId"), BINNO: bin, ITEMCODE: itemCode, LOTNO: lot, DOCNUM: '' }]) };

    if (itemCode == "" && bin == "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotWithoutBinNItemCode", jObject, this.commonService.httpOptions);
    }
    else if (itemCode != "" && bin != "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/CheckLotValid", jObject, this.commonService.httpOptions);

    }
    else if (itemCode != "" && bin == "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotWithoutBinForPallet", jObject, this.commonService.httpOptions);
    }
    else if (itemCode == "" && bin != "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotBinWithoutItemCode", jObject, this.commonService.httpOptions);
    }
  }

  getItemInfo(itemCode: string, docNo: string, docEntry: string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDbName: localStorage.getItem("CompID"), ITEMCODE: itemCode, WHSCODE: localStorage.getItem("whseId"), DocNo: docNo, DocEntry: docEntry }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetItemValidate", jObject, this.commonService.httpOptions);
  }

  SavePhysicalCountData(oAddPhysicalCountData: any): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify(oAddPhysicalCountData) };
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/SavePhysicalCountData", jObject, this.commonService.httpOptions);
  }

  SubmitPhysicalCount(oAddPhysicalCountData: any): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify(oAddPhysicalCountData) };
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/SubmitPhysicalCount", jObject, this.commonService.httpOptions);
  }

  GetDocNoDetails(DocNum: string, CountType: string, IsTeamCount: string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), DocNum: DocNum, CountType: CountType, User: localStorage.getItem("UserId"), IsTeamCount: IsTeamCount }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetDocNoDetails", jObject, this.commonService.httpOptions);
  }

  /**
   * check whs is valid or not.
   * @param whsCode 
   */
  isWHSExists(whsCode: string) {

    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ItemCode: '', WhsCode: whsCode }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsWhsExist", jObject, this.commonService.httpOptions);
  }
  /**
   * check and scan code.
   * @param whsCode 
   */
  checkAndScanCode(vendCode: string, scanInputString) {
    var jObject = { Gs1Token: JSON.stringify([{ Vsvendorid: vendCode, StrScan: scanInputString, CompanyDBId: localStorage.getItem("CompID") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/Gs1/GS1SETUP", jObject, this.commonService.httpOptions);
  }

  /**
  * This API method will return base64 string for pdf format for print.
  * @param item 
  * @param binNo 
  * @param noOfCopies 
  */
  printingServiceForSubmitGRPO(psReceiptNo: string): Observable<any> {
    var jObject = {
      PrintingObject: JSON.stringify([{
        CompanyDBId: localStorage.getItem("CompID"),
        USERID: localStorage.getItem("UserId"), RPTID: 6, DOCNO: psReceiptNo,
        GUID: localStorage.getItem("GUID"), UsernameForLic: localStorage.getItem("UserId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Printing/WMSPrintingService", jObject, this.commonService.httpOptions);
  }


}

