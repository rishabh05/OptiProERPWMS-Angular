import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OutRequest } from '../models/outbound/request-model';
import { Commonservice } from './commonservice.service';

@Injectable({
  providedIn: 'root'
})
export class InboundService {


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

  getVendorList(): Observable<any> {
    let jObject = {
      GoodsReceiptToken: JSON.stringify([{
        UserId: '',
        CompanyDBId: sessionStorage.getItem("CompID"), WhseCode: sessionStorage.getItem("whseId"),
        FuturePO: false, PO: "", GUID: sessionStorage.getItem("GUID"),
        UsernameForLic: sessionStorage.getItem("UserId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetVendorList", jObject, this.commonService.httpOptions);
  }

  IsVendorExists(vendor: string): Promise<any> {
    var jObject = { VendorCode: JSON.stringify([{ UserId: '', CompanyDBId: sessionStorage.getItem("CompID"), VendorCode: vendor }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsVendorExists", jObject, this.commonService.httpOptions).toPromise();
  }

  getItemList(futurepo: boolean, vendercode: string, po: string, optmType:string): Observable<any> {
    let jObject = {
      GoodsReceiptToken: JSON.stringify([{
        UserId: '',
        CompanyDBId: sessionStorage.getItem("CompID"), WhseCode: sessionStorage.getItem("whseId"),
        VendorCode: vendercode,
        FuturePO: futurepo, 
        PO: po,
        OPTM_TYPE: optmType
      }])
    }; 
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetItemList", jObject, this.commonService.httpOptions);
  }

  getPOList(futurepo: boolean, vendercode: string, itemcode: string, optmType:string): Observable<any> {
   // console.log("get polist method :");
    let jObject = {
      GoodsReceiptToken: JSON.stringify([{
        UserId: '',
        CompanyDBId: sessionStorage.getItem("CompID"), WhseCode: sessionStorage.getItem("whseId"),
        ItemCode: itemcode, VendorCode: vendercode,
        FuturePO: futurepo, IsCustom: false, GUID: sessionStorage.getItem("GUID"),
        UsernameForLic: sessionStorage.getItem("UserId"),
        OPTM_TYPE: optmType
        
      }])
    };
    //console.log("get polist method call api :");
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetPOList", jObject, this.commonService.httpOptions);
  }

  IsPOExists(poCode: string, cardCode: string,optmType:string): Promise<any> {
    var jObject = { POCode: JSON.stringify([{ UserId: '', CompanyDBId: sessionStorage.getItem("CompID"), POCode: poCode,
     CardCode: cardCode,OPTM_TYPE: optmType }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsPOExists", jObject, this.commonService.httpOptions).toPromise();
  }

  GetOpenPOLines(futurepo: boolean, itemCode: string, po: string, optmType:string): Observable<any> {
    let jObject = {
      GoodsReceiptToken: JSON.stringify([{
        UserId: '',
        CompanyDBId: sessionStorage.getItem("CompID"),
        DOCNUM: po,
        ItemCode: itemCode,
        WhsCode: sessionStorage.getItem("whseId"),
        FuturePO: futurepo,
        OPTM_TYPE: optmType
        //1 po , 2 ar
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetOpenPOLines", jObject, this.commonService.httpOptions);
  }

  getAutoLot(itemCode: string, tracking: string, quantity: any): Observable<any> {
    let jObject = {
      GoodsReceiptToken: JSON.stringify([{
        UserId: '',
        CompanyDBId: sessionStorage.getItem("CompID"),
        ItemCode: itemCode,
        TRACKING: tracking,
        QUANTITY: quantity,
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetAutoLot", jObject, this.commonService.httpOptions);
  }
  IsGenealogyApplicable(): Observable<any> {
    let jObject = {
      GoodsReceiptToken: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsGenealogyApplicable", jObject, this.commonService.httpOptions);
  }

  getUOMs(itemCode: string): Observable<any> {
    let jObject = {
      ItemKey: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),
        ItemCode: itemCode
      }])
    };
   // console.log("getUOMs API's request:"+JSON.stringify(jObject));
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/getUOM", jObject, this.commonService.httpOptions);
  }

  getRevBins(QCrequired: string, itemcode: string): Observable<any> {
    var jObject = {
      WhsCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"), 
        ItemCode: itemcode,
        WhsCode: sessionStorage.getItem("whseId"), 
        QCRequired: QCrequired,
        PageId: "GRPO",
        GUID: sessionStorage.getItem("GUID"),
        UsernameForLic: sessionStorage.getItem("UserId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetBinsForReceiptWithReceivingBin", jObject, this.commonService.httpOptions);
  }

  getAllBins(QCrequired: string, targetWHS: string): Observable<any> {
    var jObject = {
      WhsCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"), ItemCode: '',
        WhsCode: targetWHS, QCRequired: QCrequired,
        GUID: sessionStorage.getItem("GUID"),
        UsernameForLic: sessionStorage.getItem("UserId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetBins", jObject, this.commonService.httpOptions);
  }

  GetTargetBins(QCrequired: string, targetWHS: string): Observable<any> {
    var jObject = {
      WhsCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"), ItemCode: '',
        WhsCode: targetWHS, QCRequired: QCrequired,
        GUID: sessionStorage.getItem("GUID"),
        UsernameForLic: sessionStorage.getItem("UserId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetTargetBins", jObject, this.commonService.httpOptions);
  }

  binChange(targetWhs: string, binCode: string): Promise<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: sessionStorage.getItem("CompID"), BinCode: binCode, ItemCode: '', WhsCode: targetWhs }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsBinExist", jObject, this.commonService.httpOptions).toPromise();
  } 

  isBinExistForProduction(targetWhs: string, binCode: string, Status: string): Promise<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: sessionStorage.getItem("CompID"), BinCode: binCode, Status: Status, ItemCode: '', WhseCode: targetWhs }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/isBinExistForProduction", jObject, this.commonService.httpOptions).toPromise();
  } 
 
  SubmitGoodsReceiptPO(oSubmitPOLots: any): Observable<any> {
    var jObject = { GoodsReceiptToken: JSON.stringify(oSubmitPOLots) };    
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/SubmitGoodsReceiptPO", jObject, this.commonService.httpOptions);
  }

  // getTargetBins(QCrequired: string): Observable<any> {
  //   var jObject = {
  //     WhsCode: JSON.stringify([{
  //       CompanyDBId: sessionStorage.getItem("CompID"), ItemCode: '',
  //       WhsCode: sessionStorage.getItem("whseId"), QCRequired: QCrequired,ageId: "GRPO"}])
  //   };
  //   return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetBinsForReceiptWithReceivingBin", jObject, this.commonService.httpOptions);
  // }

  /**
   * get whs list for target whs.
   */
  getQCTargetWhse(): Observable<any> {
    var jObject = {
      WhsCode: JSON.stringify([{
          CompanyDBId: sessionStorage.getItem("CompID"),
          //Need to pass Username as Warehouses are filled Accordind to the Permission from Admin Portal 
          //Chane dt 2-July-2018
          UserId: sessionStorage.getItem("UserId")
      }])};
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetWHS", jObject, this.commonService.httpOptions);
  }

  /**
   * check whs is valid or not.
   * @param whsCode 
   */
  isWHSExists(whsCode:string){

    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId:  sessionStorage.getItem("CompID"), ItemCode: '', WhsCode: whsCode}]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsWhsExist", jObject, this.commonService.httpOptions);
  }

   /**
   * check is serial exists or not.
   * @param whsCode 
   */
  isSerialExists(itemCode:string, serialNo:string){
    var jObject = { SerialNo: JSON.stringify([{ CompanyDBId:  sessionStorage.getItem("CompID"), ItemCode: itemCode, SerialNo: serialNo}]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/CheckSerialNo", jObject, this.commonService.httpOptions);
  }
  
  /**
   * check and scan code.
   * @param whsCode 
   */
  checkAndScanCode(vendCode:string,scanInputString): Promise<any>{
    var jObject = {Gs1Token: JSON.stringify([{Vsvendorid:vendCode,StrScan:scanInputString,CompanyDBId:sessionStorage.getItem("CompID")}])};
    return this.httpclient.post(this.config_params.service_url + "/api/Gs1/GS1SETUP", jObject, this.commonService.httpOptions).toPromise();
  }

    /**
    * This API method will return base64 string for pdf format for print.
    * @param item 
    * @param binNo 
    * @param noOfCopies 
    */
   printingServiceForSubmitGRPO(psReceiptNo:string, rptid:any, NOOFLABELS) : Observable<any> {
    var jObject = { PrintingObject: JSON.stringify([{ CompanyDBId: sessionStorage.getItem("CompID"),
    USERID: sessionStorage.getItem("UserId"), RPTID: rptid, DOCNO: psReceiptNo, 
    NOOFLABELS: NOOFLABELS,
    GUID: sessionStorage.getItem("GUID"), UsernameForLic: sessionStorage.getItem("UserId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/Printing/WMSPrintingService", jObject, this.commonService.httpOptions);
   }

   GetPalletListsForGRPO(opType: number, itemCode: string, BinCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        OPERATIONTYPE: "" + opType,
        WhseCode: sessionStorage.getItem("whseId"),
        ITEMCODE: itemCode,
        BinCode: BinCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletListsForGRPO", jObject, this.commonService.httpOptions);
  }


  IsPalletValidForGRPO(palletCode: string, itemCode: string, BinCode: string): Promise<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        WhseCode: sessionStorage.getItem("whseId"),
        PalletCode: palletCode,
        ITEMCODE: itemCode,
        BinCode: BinCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/IsPalletValidForGRPO", jObject, this.commonService.httpOptions).toPromise();
  }
}

