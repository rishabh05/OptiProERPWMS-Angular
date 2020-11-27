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
        CompanyDBId: sessionStorage.getItem("CompID"),
        OPTM_PICK_TYPE: OPTM_PICK_TYPE,
        loggedinWH: sessionStorage.getItem("whseId"),
        loggedinUserGR: localStorage.getItem("UserGroup")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetPicklist", jObject, this.commonService.httpOptions);
  }

  GetDataBasedOnPickList(OPTM_TASK_CODE, OPTM_PICKLIST_ID): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),
        OPTM_TASK_CODE: OPTM_TASK_CODE,
        OPTM_PICKLIST_ID: OPTM_PICKLIST_ID,
        OPTM_USER_GRP: localStorage.getItem("UserGroup")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetDataBasedOnPickList", jObject, this.commonService.httpOptions);
  }

  ValidatePackingContainer(ScannedContCode: string, strTaskID: string, OPTM_SHIPMENT_CODE?): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),
        OPTM_CONTCODE: ScannedContCode,
        OPTM_TASKID: strTaskID,
        OPTM_SHIPMENT_CODE: OPTM_SHIPMENT_CODE,
        OPTM_WHSE: sessionStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/ValidatePackingContainer", jObject, this.commonService.httpOptions);
  } 
  
  ValidateTote(ScannedContCode: string, strTaskID: string, strBin: string, intPickSeq: number, intMaxPickSeq: number, allowMultToteOrCont:string): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),
        OPTM_CONTCODE: ScannedContCode,
        OPTM_TASKID: strTaskID,
        OPTM_WHSE: sessionStorage.getItem("whseId"),
        OPTM_BIN: strBin,
        OPTM_PICK_SEQ: intPickSeq,
        OPTM_MAX_PICK_SEQ: intMaxPickSeq,
        OPTM_ALLOW_MULTI_TOTE_CONT: allowMultToteOrCont
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/ValidateToteAtPicking", jObject, this.commonService.httpOptions);
  }   

  ValidateScannedBinForDropping(ScannedBinCode: string): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),     
        OPTM_WHSE: sessionStorage.getItem("whseId"),
        OPTM_BIN: ScannedBinCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/ValidateScannedBinForDropping", jObject, this.commonService.httpOptions);
  } 
  
  ValidateAndDropTote(ScannedBinCode: string, ScannedTote: string, blnDropFlg: boolean, blnPickDropAllowedInAnyBin: boolean): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),     
        OPTM_WHSE: sessionStorage.getItem("whseId"),
        OPTM_BIN: ScannedBinCode,
        OPTM_TOTE: ScannedTote,
        OPTM_USER_NAME: sessionStorage.getItem("UserId"),
        OPTM_DROP_FLG: blnDropFlg,
        DROP_IN_ANY_BIN: blnPickDropAllowedInAnyBin
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/ValidateToteAndDropAtProperBin", jObject, this.commonService.httpOptions);
  } 

  ValidateAndDropContainer(ScannedBinCode: string, ScannedContainer: string, blnDropFlg: boolean, blnPickDropAllowedInAnyBin: boolean): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),     
        OPTM_WHSE: sessionStorage.getItem("whseId"),
        OPTM_BIN: ScannedBinCode,
        OPTM_CONTCODE: ScannedContainer,
        OPTM_USER_NAME: sessionStorage.getItem("UserId"),
        OPTM_DROP_FLG: blnDropFlg,
        DROP_IN_ANY_BIN: blnPickDropAllowedInAnyBin
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/ValidateContainerAndDropAtProperBin", jObject, this.commonService.httpOptions);
  } 

  /*
  ValidateAndDropPicklist(ScannedBinCode: string, ScannedPicklist: string, blnPickDropAllowedInAnyBin: boolean): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),     
        OPTM_WHSE: sessionStorage.getItem("whseId"),
        OPTM_BIN: ScannedBinCode,
        OPTM_PICKLIST_ID: ScannedPicklist,
        OPTM_USER_NAME: sessionStorage.getItem("UserId"),
        DROP_IN_ANY_BIN: blnPickDropAllowedInAnyBin
      }])
    };    
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/DropPicklist", jObject, this.commonService.httpOptions);
  } 
  */

  DropPickListAPI(OPTM_PICKLIST_ID: number, UserGrp: string, compId: string, dropBin: string, intPickOpn: number, blnPickDropAllowedInAnyBin: boolean) {
    var jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: compId,
        OPTM_PICKLIST_ID: OPTM_PICKLIST_ID,
        OPTM_USER_NAME: UserGrp,
        OPTM_BIN: dropBin,
        OPTM_WHSE: sessionStorage.getItem("whseId"),
        OPTM_PICK_OPN: intPickOpn,
        DROP_IN_ANY_BIN: blnPickDropAllowedInAnyBin
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/DropPickList", jObject, this.commonService.httpOptions);
  }

  IsValidBatchSerial(ITEMCODE: string, LOTNO: string, OPTM_SRC_BIN: string): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),
        ITEMCODE: ITEMCODE,
        LOTNO: LOTNO,
        OPTM_SRC_BIN: OPTM_SRC_BIN,
        OPTM_WHSECODE: sessionStorage.getItem("whseId"),
        OPTM_CREATEDBY: localStorage.getItem("UserGroup")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/IsValidBatchSerial", jObject, this.commonService.httpOptions);
  }

  SubmitPickList(oSubmitPOLots: any): Observable<any> {
    var jObject = { PickPackCont: JSON.stringify(oSubmitPOLots) };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/SavePickTaskInformation", jObject, this.commonService.httpOptions);
  }

  /**
   * check and scan code.
   * @param whsCode 
   */
  GetNextPickList(OPTM_PICKTYPE, OPTM_PICKLIST_ID,currentPickListFlg) {
    var jObject = {
      PalletCode: JSON.stringify([{
        OPTM_WHSECODE: sessionStorage.getItem("whseId"),
        OPTM_USERGRP: localStorage.getItem("UserGroup"),
        OPTM_PICKTYPE: OPTM_PICKTYPE,
        CompanyDBId: sessionStorage.getItem("CompID"),
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
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        OPERATIONTYPE: "" + opType,
        WhseCode: sessionStorage.getItem("whseId"),
        ITEMCODE: itemCode,
        BinCode: BinCode
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/Pallet/GetPalletListsForGRPO", jObject, this.commonService.httpOptions);
  }


  IsPalletValidForGRPO(palletCode: string, itemCode: string, BinCode: string): Observable<any> {
    var jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        WhseCode: sessionStorage.getItem("whseId"),
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
        CompanyDBId: sessionStorage.getItem("CompID"),
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
        CompanyDBId: sessionStorage.getItem("CompID"),
        OPTM_PICKLIST_ID: OPTM_PICKLIST_ID
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetCountOfOpenTasksInPickList", jObject, this.commonService.httpOptions);
  }  

  getServerDate(): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/getServerDate", jObject, this.commonService.httpOptions);
  }
  
//PACKING APIS  
  GetDroppedToteList(OPTM_BIN): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        OPTM_WHSE: sessionStorage.getItem("whseId"),
        OPTM_BIN: OPTM_BIN
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetDroppedToteList", jObject, this.commonService.httpOptions);
  }

  GetToteShipments(OPTM_TOTE_NUMBER, OPTM_BIN): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        OPTM_TOTE_NUMBER: OPTM_TOTE_NUMBER,
        OPTM_WHSE: sessionStorage.getItem("whseId"),
        OPTM_BIN: OPTM_BIN
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetToteShipments", jObject, this.commonService.httpOptions);
  }

  GetShpmntPackStatus(OPTM_SHIPMENTID): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        OPTM_SHIPMENTID: OPTM_SHIPMENTID,
        OPTM_WHSE: sessionStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetShpmntPackStatus", jObject, this.commonService.httpOptions);
  }

  
  GetShipmentRelTotes(OPTM_SHIPMENTID): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        OPTM_SHIPMENTID: OPTM_SHIPMENTID,
        OPTM_WHSE: sessionStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetShipmentRelTotes", jObject, this.commonService.httpOptions);
  }

  GetToteItemBtchSer(OPTM_TOTE_NUMBER, OPTM_SHIPMENTID, OPTM_BINCODE): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        OPTM_TOTE_NUMBER: OPTM_TOTE_NUMBER,
        OPTM_SHIPMENTID: OPTM_SHIPMENTID,
        OPTM_WHSECODE: sessionStorage.getItem("whseId"),
        OPTM_BINCODE: OPTM_BINCODE
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetToteItemBtchSer", jObject, this.commonService.httpOptions);
  }
   
  ValidateSelectedToteForPacking(OPTM_TOTE_NUMBER: string, OPTM_BINCODE: string): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        OPTM_TOTE_NUMBER: OPTM_TOTE_NUMBER,
        OPTM_WHSE: sessionStorage.getItem("whseId"),
        OPTM_BIN: OPTM_BINCODE
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/ValidateSelectedToteForPacking", jObject, this.commonService.httpOptions);
  }

  ValidateSelectedShipmentForPacking(OPTM_TOTE_NUMBER, OPTM_SHIPMENT_CODE): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        OPTM_TOTE_NUMBER: OPTM_TOTE_NUMBER,
        OPTM_SHIPMENT_CODE: OPTM_SHIPMENT_CODE
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/ValidateSelectedShipmentForPacking", jObject, this.commonService.httpOptions);
  }
   
  GetPackingBinsForWarehouse(): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        COMPANYDBNAME: sessionStorage.getItem("CompID"),
        WHSECODE: sessionStorage.getItem("whseId")
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetPackingBinsForWarehouse", jObject, this.commonService.httpOptions);
  }

  GetToteShipmentItems(OPTM_TOTE_NUMBER, OPTM_SHIPMENT_CODE): Observable<any> {
    let jObject = {
      PalletCode: JSON.stringify([{
        CompanyDBId: sessionStorage.getItem("CompID"),
        OPTM_TOTE_NUMBER: OPTM_TOTE_NUMBER,
        OPTM_SHIPMENT_CODE: OPTM_SHIPMENT_CODE
      }])
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/GetToteShipmentItems", jObject, this.commonService.httpOptions);
  }
  
  SavePackingContainerAndUpdateShipment(oSubmitPickPackObj): Observable<any> {
    let jObject = {
      PickPackCont: JSON.stringify(oSubmitPickPackObj)
    };
    return this.httpclient.post(this.config_params.service_url + "/api/PickList/SavePackingContainerAndUpdateShipment", jObject, this.commonService.httpOptions);
  }

  checkIfPickDropAllowedInAnyBin():boolean {
    let blnPickDropAllowedInAnyBin = false;
    var confiParams: any;
    confiParams = JSON.parse(localStorage.getItem('ConfigurationParam'));
    let result = confiParams.find(e => e.OPTM_PARAM_NAME == "Param_Allow_PickDrop_In_Any_Bin")
    if (result != undefined) {
      if (result.OPTM_PARAM_VALUE != undefined || result.OPTM_PARAM_VALUE != '') {
        if (result.OPTM_PARAM_VALUE == "Y") {
          blnPickDropAllowedInAnyBin = true;
        }        
      }      
    }
    return blnPickDropAllowedInAnyBin;
  }
}

