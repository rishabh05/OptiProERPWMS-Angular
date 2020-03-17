import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commonservice } from './commonservice.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryTransferService {

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

  getToWHS(): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ItemCode: '', WhsCode: localStorage.getItem("whseId"), UserId: localStorage.getItem("UserId"), GUID: localStorage.getItem("GUID"), UsernameForLic: localStorage.getItem("UserId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetToWHS", jObject, this.commonService.httpOptions);
  }

  getItemCodeList(): Observable<any> {
    var jObject = { ITEMCODE: '', ITEMNAME: '', WHSCODE: localStorage.getItem("whseId"), CompanyDBName: localStorage.getItem("CompID") }
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsIssue/AllItemLookup", jObject, this.commonService.httpOptions);
  }

  getBinListWithoutBinForNonTrack(ItemCode: string, lotNo: string, BINNO: string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ITEMCODE: ItemCode, LOTNO: lotNo, WHSCODE: localStorage.getItem("whseId"), BINNO: BINNO, SUPPORTTRX: '67' }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsIssue/GetLotWithoutBinNItemCode", jObject, this.commonService.httpOptions);
  }

  getLotWithoutBinItemCode(ItemCode: string, lotNo: string, BINNO: string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ITEMCODE: ItemCode, LOTNO: lotNo, WHSCODE: localStorage.getItem("whseId"), BINNO: BINNO, SUPPORTTRX: '67', LOTISSUEMETHOD: '' }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsIssue/GetLotWithoutBinNItemCode", jObject, this.commonService.httpOptions);
  }

  submitBinTransfer(oWhsTransAddLot: any): Observable<any> {
    var jObject = { BinTransToken: JSON.stringify(oWhsTransAddLot) };
    return this.httpclient.post(this.config_params.service_url + "/api/BinTransfer/PutAway", jObject, this.commonService.httpOptions);
  }

  CreateITR(oWhsTransAddLot: any): Observable<any> {
    var jObject = { DEFAULTSYSTEMBIN: JSON.stringify(oWhsTransAddLot) };
    return this.httpclient.post(this.config_params.service_url + "/api/WhsTrans/SubmitWhsTransRequest", jObject, this.commonService.httpOptions);
  }

  isWHsExists(toWhs: string): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ItemCode: '', WhsCode: toWhs }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsWhsExist", jObject, this.commonService.httpOptions);
  }

  GetItemCode(itemCode: string): Promise<any> {
    var jObject = { ITEMCODE: JSON.stringify([{ COMPANYDBNAME: localStorage.getItem("CompID"), ITEMCODE: itemCode, WHSCODE: localStorage.getItem("whseId"),
    GUID: localStorage.getItem("GUID"), UsernameForLic: localStorage.getItem("UserId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsReceipt/GetItemCode", jObject, this.commonService.httpOptions).toPromise();
  }

  getItemInfo(itemCode: string): Observable<any> {
    var jObject = { ITEMCODE: JSON.stringify([{ CompanyDbName: localStorage.getItem("CompID"), ITEMCODE: itemCode, WHSCODE: localStorage.getItem("whseId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsReceipt/GetItemInfo", jObject, this.commonService.httpOptions);
  }


  getLotInfo(FromBin: string, Item: string, Lot: string): Promise<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), WHSCODE:  localStorage.getItem("whseId"), BINNO: FromBin, ITEMCODE: Item, LOTNO: Lot, DOCNUM: '', }]) };
    if (Item == "" && FromBin == "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotWithoutBinNItemCode", jObject, this.commonService.httpOptions).toPromise();
    }
    else if (Item != "" && FromBin != "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotBinForPallet", jObject, this.commonService.httpOptions).toPromise();

    }
    else if (Item != "" && FromBin == "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotWithoutBinForPallet", jObject, this.commonService.httpOptions).toPromise();
    }
    else if (Item == "" && FromBin != "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotBinWithoutItemCode", jObject, this.commonService.httpOptions).toPromise();
    }
  }


  getLotList(oFromWhs: string, FromBin: string, Item: string, Lot: string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), WHSCODE: oFromWhs, BINNO: FromBin, ITEMCODE: Item, DOCNUM: '', SUPPORTEDTRX: 67 }]) };
    if (Item == "" && FromBin == "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotListWithoutBinNItemCodeforWhsTransfer", jObject, this.commonService.httpOptions);
    }
    else if (Item != "" && FromBin != "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotListWithoutBinForPalletforWhsTransfer", jObject, this.commonService.httpOptions);

    }
    else if (Item != "" && FromBin == "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotListWithoutBinForPalletforWhsTransfer", jObject, this.commonService.httpOptions);
    }
    else if (Item == "" && FromBin != "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotListBinWithoutItemCodeforWhsTransfer", jObject, this.commonService.httpOptions);
    }
  }


  getFromBins(ItemTracking: string, FromBin: string, Item: string, Lot: string): Observable<any> {
    if (ItemTracking == "N") {
      var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ITEMCODE: Item, LOTNO: Lot, WHSCODE: localStorage.getItem("whseId"), BINNO: FromBin, SUPPORTTRX: '67' }]) };
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetBinListWithoutBinForNonTrack", jObject, this.commonService.httpOptions);
    }
    else {
      var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ITEMCODE: Item, LOTNO: Lot, WHSCODE: localStorage.getItem("whseId"), BINNO: FromBin, SUPPORTTRX: '67', LOTISSUEMETHOD: '' }]) };
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotWithoutBinWise", jObject, this.commonService.httpOptions);
    }
  }


  isFromBinExists(ItemTracking: string, FromBin: string, Item: string, Lot: string): Promise<any> {
    if (ItemTracking == "N") {
      var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ITEMCODE: Item, LOTNO: Lot, WHSCODE: localStorage.getItem("whseId"), BINNO: FromBin, SUPPORTTRX: '67' }]) };
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetBinForNonTrackItem", jObject, this.commonService.httpOptions).toPromise();
    }
    else {
      var jObject1 = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), BinCode: FromBin, ItemCode: '', WhsCode: localStorage.getItem("whseId")}]) };
      return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsBinExist", jObject1, this.commonService.httpOptions).toPromise();
    }
  }

  isToBinExist(ToBin: string, oToWhs: string): Promise<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), BinCode: ToBin, ItemCode: '', WhsCode: oToWhs}]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsBinExist", jObject, this.commonService.httpOptions).toPromise();
  }

  getToBin(fromBin: string, oToWhs: string): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ItemCode: '', WhsCode: oToWhs, FromBin: fromBin}]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetToBIN", jObject, this.commonService.httpOptions);
  }

  GetDefaultBinOrBinWithQty(itemCode: string, oToWhs: string): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ ItemCode: itemCode, WhseCode: oToWhs, CompanyDBId: localStorage.getItem("CompID") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetDefaultBinOrBinWithQty", jObject, this.commonService.httpOptions);
  }  

  GetToBinForWhsTrnsfr(itemCode: string, oToWhs: string): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ ItemCode: itemCode, WhseCode: oToWhs, CompanyDBId: localStorage.getItem("CompID") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetToBinForWhsTrnsfr", jObject, this.commonService.httpOptions);
  }  

  getDefaultBin(itemCode: string, oToWhs: string): Observable<any> {
    var jObject = { DEFAULTSYSTEMBIN: JSON.stringify([{ ITEMCODE: itemCode, WHSCODE: oToWhs, CompanyDBName: localStorage.getItem("CompID") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/WhsTrans/GetDefaultBinFromWarehouse", jObject, this.commonService.httpOptions);
  }

  GetInventoryDocuments(fromBin: string, oToWhs: string): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ItemCode: '', WhsCode: oToWhs, FromBin: fromBin}]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetInventoryDocuments", jObject, this.commonService.httpOptions);
  }

  GetITRList(): Observable<any> {
    var jObject = { 
      DEFAULTSYSTEMBIN: JSON.stringify([
        { 
          CompanyDBId: localStorage.getItem("CompID"), 
          USERCODE: localStorage.getItem("UserId"), 
          WHSCODE: localStorage.getItem("whseId"),
          DocEntry: ""
        }]) 
      };
    return this.httpclient.post(this.config_params.service_url + "/api/WhsTrans/GetITRList", jObject, this.commonService.httpOptions);
  }

  IsValidITR(entryDoc: string): Observable<any> {
    var jObject = { 
      DEFAULTSYSTEMBIN: JSON.stringify([
        { 
          CompanyDBId: localStorage.getItem("CompID"), 
          USERCODE: localStorage.getItem("UserId"), 
          WHSCODE: localStorage.getItem("whseId"),
          DocEntry: entryDoc
        }]) 
      };
    return this.httpclient.post(this.config_params.service_url + "/api/WhsTrans/IsValidITR", jObject, this.commonService.httpOptions);
  }

  GetITRItemList(itrCode: string): Observable<any> {
    var jObject = { 
      DEFAULTSYSTEMBIN: JSON.stringify([
        { 
          CompanyDBId: localStorage.getItem("CompID"), 
          USERCODE: localStorage.getItem("UserId"), 
          WHSCODE: localStorage.getItem("whseId"),
          DocEntry: itrCode
        }]) 
      };
    return this.httpclient.post(this.config_params.service_url + "/api/WhsTrans/GetITRItemList", jObject, this.commonService.httpOptions);
  }

  GetItemListForWhseTrnsfr(): Observable<any> {
      var jObject = { 
        GETITEMS: JSON.stringify([
          { 
            WHSECODE: localStorage.getItem("whseId"), 
            CompanyDBId: localStorage.getItem("CompID") 
          }]) 
        };
    return this.httpclient.post(this.config_params.service_url + "/api/WhsTrans/GetItemListForWhseTrnsfr", jObject, this.commonService.httpOptions);
  }

  submitITByITR(oWhsTransAddLot: any): Observable<any> {
    var jObject = { 
      DEFAULTSYSTEMBIN: JSON.stringify(oWhsTransAddLot) 
    };
    return this.httpclient.post(this.config_params.service_url + "/api/WhsTrans/SubmitITByITR", jObject, this.commonService.httpOptions);
  }

  isFromBinExistsPromise(ItemTracking: string, FromBin: string, Item: string, Lot: string): Promise<any>{
    if (ItemTracking == "N") {
      var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ITEMCODE: Item, LOTNO: Lot, WHSCODE: localStorage.getItem("whseId"), BINNO: FromBin, SUPPORTTRX: '67' }]) };
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetBinForNonTrackItem", jObject, this.commonService.httpOptions).toPromise();
    }
    else {
      var jObject1 = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), BinCode: FromBin, ItemCode: '', WhsCode: localStorage.getItem("whseId")}]) };
      return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsBinExist", jObject1, this.commonService.httpOptions).toPromise();
    }
  }

  GetItemCodePromise(itemCode: string): Promise<any> {
    var jObject = { ITEMCODE: JSON.stringify([{ COMPANYDBNAME: localStorage.getItem("CompID"), ITEMCODE: itemCode, WHSCODE: localStorage.getItem("whseId"),
    GUID: localStorage.getItem("GUID"), UsernameForLic: localStorage.getItem("UserId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsReceipt/GetItemCode", jObject, this.commonService.httpOptions).toPromise();
  }

  getLotInfoPromise(FromBin: string, Item: string, Lot: string): Promise<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), WHSCODE:  localStorage.getItem("whseId"), BINNO: FromBin, ITEMCODE: Item, LOTNO: Lot, DOCNUM: '', }]) };
    if (Item == "" && FromBin == "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotWithoutBinNItemCode", jObject, this.commonService.httpOptions).toPromise();
    }
    else if (Item != "" && FromBin != "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotBinForPallet", jObject, this.commonService.httpOptions).toPromise();

    }
    else if (Item != "" && FromBin == "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotWithoutBinForPallet", jObject, this.commonService.httpOptions).toPromise();
    }
    else if (Item == "" && FromBin != "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotBinWithoutItemCode", jObject, this.commonService.httpOptions).toPromise();
    }
  }

  isToBinExistPromise(ToBin: string, oToWhs: string): Promise<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), BinCode: ToBin, ItemCode: '', WhsCode: oToWhs}]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsBinExist", jObject, this.commonService.httpOptions).toPromise();
  }
}
