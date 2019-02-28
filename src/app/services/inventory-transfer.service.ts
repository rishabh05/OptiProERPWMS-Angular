import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryTransferService {

  public config_params: any;

  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  }

  constructor(private httpclient: HttpClient) {
    this.config_params = JSON.parse(sessionStorage.getItem('ConfigData'));
  }

  getToWHS(): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ItemCode: '', WhsCode: localStorage.getItem("whseId"), UserId: localStorage.getItem("UserId"), GUID: localStorage.getItem("GUID"), UsernameForLic: localStorage.getItem("UserId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetToWHS", jObject, this.httpOptions);
  }

  getItemCodeList(): Observable<any> {
    var jObject = { ITEMCODE: '', ITEMNAME: '', WHSCODE: localStorage.getItem("whseId"), CompanyDBName: localStorage.getItem("CompID") }
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsIssue/AllItemLookup", jObject, this.httpOptions);
  }

  getBinListWithoutBinForNonTrack(ItemCode: string, lotNo: string, BINNO: string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ITEMCODE: ItemCode, LOTNO: lotNo, WHSCODE: localStorage.getItem("whseId"), BINNO: BINNO, SUPPORTTRX: '67' }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsIssue/GetLotWithoutBinNItemCode", jObject, this.httpOptions);
  }

  getLotWithoutBinItemCode(ItemCode: string, lotNo: string, BINNO: string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ITEMCODE: ItemCode, LOTNO: lotNo, WHSCODE: localStorage.getItem("whseId"), BINNO: BINNO, SUPPORTTRX: '67', LOTISSUEMETHOD: '' }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsIssue/GetLotWithoutBinNItemCode", jObject, this.httpOptions);
  }

  getToBIN(fromBin: string): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ItemCode: '', WhsCode: localStorage.getItem("whseId"), FromBin: fromBin }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetToBIN", jObject, this.httpOptions);
  }

  submitBinTransfer(oWhsTransAddLot: any): Observable<any> {
    var jObject = { BinTransToken: JSON.stringify(oWhsTransAddLot) };
    return this.httpclient.post(this.config_params.service_url + "/api/BinTransfer/PutAway", jObject, this.httpOptions);
  }

  isWHsExists(toWhs: string): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ItemCode: '', WhsCode: toWhs }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsWhsExist", jObject, this.httpOptions);
  }

  getItemInfo(itemCode: string): Observable<any> {
    var jObject = { ITEMCODE: JSON.stringify([{ CompanyDbName: localStorage.getItem("CompID"), ITEMCODE: itemCode, WHSCODE: localStorage.getItem("whseId") }]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodsReceipt/GetItemInfo", jObject, this.httpOptions);
  }


  getLotInfo(oFromWhs: string, FromBin: string, Item: string, Lot: string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), WHSCODE: oFromWhs, BINNO: FromBin, ITEMCODE: Item, LOTNO: Lot, DOCNUM: '', }]) };
    if (Item == "" && FromBin == "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotWithoutBinNItemCode", jObject, this.httpOptions);
    }
    else if (Item != "" && FromBin != "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotBinForPallet", jObject, this.httpOptions);

    }
    else if (Item != "" && FromBin == "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotWithoutBinForPallet", jObject, this.httpOptions);
    }
    else if (Item == "" && FromBin != "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotBinWithoutItemCode", jObject, this.httpOptions);
    }
  }


  getLotList(oFromWhs: string, FromBin: string, Item: string, Lot: string): Observable<any> {
    var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), WHSCODE: oFromWhs, BINNO: FromBin, ITEMCODE: Item, DOCNUM: '', SUPPORTEDTRX: 67 }]) };
    if (Item == "" && FromBin == "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotListWithoutBinNItemCodeforWhsTransfer", jObject, this.httpOptions);
    }
    else if (Item != "" && FromBin != "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotListWithoutBinForPalletforWhsTransfer", jObject, this.httpOptions);

    }
    else if (Item != "" && FromBin == "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotListWithoutBinForPalletforWhsTransfer", jObject, this.httpOptions);
    }
    else if (Item == "" && FromBin != "") {
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotListBinWithoutItemCodeforWhsTransfer", jObject, this.httpOptions);
    }
  }


  getFromBins(ItemTracking: string, FromBin: string, Item: string, Lot: string): Observable<any> {
    if (ItemTracking == "N") {
      var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ITEMCODE: Item, LOTNO: Lot, WHSCODE: localStorage.getItem("whseId"), BINNO: FromBin, SUPPORTTRX: '67' }]) };
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetBinListWithoutBinForNonTrack", jObject, this.httpOptions);
    }
    else {
      var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ITEMCODE: Item, LOTNO: Lot, WHSCODE: localStorage.getItem("whseId"), BINNO: FromBin, SUPPORTTRX: '67', LOTISSUEMETHOD: '' }]) };
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetLotWithoutBinWise", jObject, this.httpOptions);
    }
  }


  isFromBinExists(ItemTracking: string, FromBin: string, Item: string, Lot: string): Observable<any> {
    if (ItemTracking != "N") {
      var jObject = { DeliveryToken: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ITEMCODE: Item, LOTNO: Lot, WHSCODE: localStorage.getItem("whseId"), BINNO: FromBin, SUPPORTTRX: '67' }]) };
      return this.httpclient.post(this.config_params.service_url + "/api/Delivery/GetBinForNonTrackItem", jObject, this.httpOptions);
    }
    else {
      var jObject1 = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), BinCode: FromBin, ItemCode: '', WhsCode: localStorage.getItem("whseId")}]) };
      return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsBinExist", jObject1, this.httpOptions);
    }
  }

  isBinExist(ToBin: string, oToWhs: string): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), BinCode: ToBin, ItemCode: '', WhsCode: oToWhs}]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/IsBinExist", jObject, this.httpOptions);
  }

  getToBin(fromBin: string, oToWhs: string): Observable<any> {
    var jObject = { WhsCode: JSON.stringify([{ CompanyDBId: localStorage.getItem("CompID"), ItemCode: '', WhsCode: oToWhs, FromBin: fromBin}]) };
    return this.httpclient.post(this.config_params.service_url + "/api/GoodReceiptPO/GetToBIN", jObject, this.httpOptions);
  }

  
}
