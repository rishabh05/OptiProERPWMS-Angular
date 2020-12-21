import { Component, OnInit } from '@angular/core';
import { AutoLot } from '../models/Inbound/AutoLot';
import { OpenPOLinesModel } from '../models/Inbound/OpenPOLinesModel';

@Component({
  selector: 'app-inbound-master',
  templateUrl: './inbound-master.component.html',
  styleUrls: ['./inbound-master.component.scss']
})
export class InboundMasterComponent implements OnInit {

  constructor() { }

  public inboundComponent: number = 1;
  public selectedVernder: string = "";
  public openPOmodel: any;
  public oSubmitPOLotsArray: any[] = [];
  public AddtoGRPOFlag: boolean = false;
  public SubmitPOArray: OpenPOLinesModel[] = [];
  UDFDetails: any[];
  public InboundUserPreference: any[];
  udfArray = [];

  ngOnInit() {
  }

  getUDF(): any[]{
    return this.udfArray;
  }

  updateUDF(udf){
    this.udfArray = udf;
  }

  clearUDF(){
    this.udfArray = [];
  }

  setSelectedVender(vender: string) {
    this.selectedVernder = vender;
  }

  setClickedItemDetail(openPOmodel) {
    this.openPOmodel = openPOmodel;
  }

  public savePOLots(oSubmitPOLot: any) {
    this.oSubmitPOLotsArray.push(oSubmitPOLot);
    this.AddtoGRPOFlag = true;
  }

  public AddPOList(openPOLinesModel: OpenPOLinesModel) {
    this.SubmitPOArray.push(openPOLinesModel);
  }

  public setUDFData(UDFDetails) {
    this.UDFDetails = UDFDetails;
  }

  public getUDFData(): any[] {
    return this.UDFDetails;
  }

  prepareCommonData(inboundFromWhere, Ponumber, DocEntry, uomSelectedVal, recvingQuantityBinArray, expiryDate, UDF, fromPOList?) {
    var oSubmitPOLotsObj: any = {};
    var dataModel = sessionStorage.getItem("GRPOReceieveData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      oSubmitPOLotsObj.Header = [];
      oSubmitPOLotsObj.POReceiptLots = [];
      oSubmitPOLotsObj.POReceiptLotDetails = [];
      oSubmitPOLotsObj.UDF = [];
      oSubmitPOLotsObj.LastSerialNumber = [];
    } else {
      oSubmitPOLotsObj = JSON.parse(dataModel);
    }
    var oSubmitPOLotsObj = this.prepareSubmitPurchaseOrder(oSubmitPOLotsObj, inboundFromWhere, Ponumber, DocEntry, uomSelectedVal, recvingQuantityBinArray, expiryDate, UDF, fromPOList);
    sessionStorage.setItem("GRPOReceieveData", JSON.stringify(oSubmitPOLotsObj));
  }

  prepareSubmitPurchaseOrder(oSubmitPOLotsObj, inboundFromWhere, Ponumber, DocEntry, uomSelectedVal,
    recvingQuantityBinArray, expiryDate, UDF, fromPOList?): any {
    if (sessionStorage.getItem("Line") == null || sessionStorage.getItem("Line") == undefined ||
      sessionStorage.getItem("Line") == "") {
      sessionStorage.setItem("Line", "0");
    }
    let templine = Number(sessionStorage.getItem("Line"))
    for (var i = 0; i < oSubmitPOLotsObj.POReceiptLots.length; i++) {
      if (oSubmitPOLotsObj.POReceiptLots[i].PONumber == Ponumber &&
        oSubmitPOLotsObj.POReceiptLots[i].ItemCode == this.openPOmodel.ITEMCODE &&
        oSubmitPOLotsObj.POReceiptLots[i].LineNo == this.openPOmodel.LINENUM) {
        templine = oSubmitPOLotsObj.POReceiptLots[i].Line;
      }
    }
    oSubmitPOLotsObj = this.manageRecords(oSubmitPOLotsObj, Ponumber);

    let UomEntry = -1;
    if (fromPOList != undefined) {
      UomEntry = -1
    } else {
      if(uomSelectedVal != undefined){
        UomEntry = uomSelectedVal.UomEntry;
      }      
    }
    oSubmitPOLotsObj.POReceiptLots.push({
      OPTM_TYPE: inboundFromWhere,
      DiServerToken: sessionStorage.getItem("Token"),
      PONumber: Ponumber,
      DocEntry: DocEntry,
      CompanyDBId: sessionStorage.getItem("CompID"),
      LineNo: this.openPOmodel.LINENUM,
      ShipQty: this.openPOmodel.RPTQTY.toString(),
      OpenQty: this.openPOmodel.OPENQTY.toString(),
      WhsCode: sessionStorage.getItem("whseId"),
      Tracking: this.openPOmodel.TRACKING,
      ItemCode: this.openPOmodel.ITEMCODE,
      LastSerialNumber: 0,
      Line: templine,
      GUID: sessionStorage.getItem("GUID"),
      UOM: UomEntry,
      UsernameForLic: sessionStorage.getItem("UserId")
    });

    this.udfArray.forEach(element => {
      if(element.Flag != "H"){
        oSubmitPOLotsObj.UDF.push(element);
      }
    });
    while (oSubmitPOLotsObj.UDF.length > 0) {
      let index = oSubmitPOLotsObj.UDF.findIndex(e => e.Flag == "H");
      if (index == -1) {
        break;
      }
      oSubmitPOLotsObj.UDF.splice(index, 1);
    }
    if (oSubmitPOLotsObj.UDF.findIndex(e => e.Flag == "H") == -1) {
      if (sessionStorage.getItem("GRPOHdrUDF") != undefined && sessionStorage.getItem("GRPOHdrUDF") != "") {
        JSON.parse(sessionStorage.getItem("GRPOHdrUDF")).forEach(element => {
          oSubmitPOLotsObj.UDF.push(element);
        });
      }
    }

    if (fromPOList != undefined) {
      oSubmitPOLotsObj.POReceiptLotDetails.push({
        Bin: fromPOList,
        LineNo: this.openPOmodel.LINENUM,
        LotNumber: "",
        LotQty: this.openPOmodel.RPTQTY.toString(),
        SysSerial: "0",
        ExpireDate: "",
        VendorLot: "",
        SuppSerial: "",
        ParentLineNo: templine,
        LotSteelRollId: "",
        ItemCode: this.openPOmodel.ITEMCODE,
        PalletCode: ""
      });
    } else {
      for (var iBtchIndex = 0; iBtchIndex < recvingQuantityBinArray.length; iBtchIndex++) {
        let lotqty;
        if (this.openPOmodel.TRACKING == 'S') {
          lotqty = recvingQuantityBinArray[iBtchIndex].LotQty.toString();
        } else {
          lotqty = (recvingQuantityBinArray[iBtchIndex].LotQty * uomSelectedVal.BaseQty).toFixed(Number(sessionStorage.getItem("DecimalPrecision")))
        }
        oSubmitPOLotsObj.POReceiptLotDetails.push({
          Bin: recvingQuantityBinArray[iBtchIndex].Bin,
          LineNo: this.openPOmodel.LINENUM,
          LotNumber: recvingQuantityBinArray[iBtchIndex].LotNumber,
          LotQty: lotqty,
          SysSerial: "0",
          ExpireDate: this.GetSubmitDateFormat(recvingQuantityBinArray[iBtchIndex].expiryDate),
          VendorLot: recvingQuantityBinArray[iBtchIndex].VendorLot,
          SuppSerial: recvingQuantityBinArray[iBtchIndex].VendorLot,
          ParentLineNo: templine,
          LotSteelRollId: "",
          ItemCode: this.openPOmodel.ITEMCODE,
          PalletCode: recvingQuantityBinArray[iBtchIndex].PalletCode
        });
      }
    }

    sessionStorage.setItem("Line", "" + (Number(sessionStorage.getItem("Line")) + 1));
    oSubmitPOLotsObj.Header = []
    oSubmitPOLotsObj.Header.push({
      NumAtCard: sessionStorage.getItem("VendRefNo")
    });
    return oSubmitPOLotsObj;
  }

  manageRecords(oSubmitPOLotsObj, Ponumber): any {
    var size = oSubmitPOLotsObj.POReceiptLots.length;
    for (var i = 0; i < oSubmitPOLotsObj.POReceiptLots.length; i++) {
      if (oSubmitPOLotsObj.POReceiptLots[i].PONumber == Ponumber &&
        oSubmitPOLotsObj.POReceiptLots[i].ItemCode == this.openPOmodel.ITEMCODE &&
        oSubmitPOLotsObj.POReceiptLots[i].LineNo == this.openPOmodel.LINENUM) {
        var s = oSubmitPOLotsObj.POReceiptLotDetails.length;
        for (var j = 0; j < oSubmitPOLotsObj.POReceiptLotDetails.length; j++) {
          if (oSubmitPOLotsObj.POReceiptLotDetails[j].ParentLineNo == oSubmitPOLotsObj.POReceiptLots[i].Line) {
            oSubmitPOLotsObj.POReceiptLotDetails.splice(j, 1);
            j = -1;
          }
        }

        while (oSubmitPOLotsObj.UDF.length > 0) {
          let index = oSubmitPOLotsObj.UDF.findIndex(e => e.LineNo == oSubmitPOLotsObj.POReceiptLots[i].Line)
          if (index == -1) {
            break;
          }
          oSubmitPOLotsObj.UDF.splice(index, 1);
        }

        for (var m = 0; m < oSubmitPOLotsObj.LastSerialNumber.length; m++) {
          if (oSubmitPOLotsObj.LastSerialNumber[m].ItemCode == oSubmitPOLotsObj.POReceiptLots[i].ItemCode) {
            oSubmitPOLotsObj.LastSerialNumber.splice(m, 1);
            m = -1;
          }
        }
        oSubmitPOLotsObj.POReceiptLots.splice(i, 1);
      }
    }
    return oSubmitPOLotsObj;
  }

  GetSubmitDateFormat(EXPDATE) {
    if (EXPDATE == "" || EXPDATE == null)
      return "";
    else {
      var d = new Date(EXPDATE);
      var day;

      if (d.getDate().toString().length < 2) {
        day = "0" + d.getDate();
      }
      else {
        day = d.getDate();
      }
      var mth;
      if ((d.getMonth() + 1).toString().length < 2) {
        mth = "0" + (d.getMonth() + 1).toString();
      }
      else {
        mth = d.getMonth() + 1;
      }
      return mth + "/" + day + "/" + d.getFullYear();
    }
  }
}

