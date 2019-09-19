import { Component, OnInit, ViewChild, ComponentFactory } from '@angular/core';
import { InboundMasterComponent } from 'src/app/inbound/inbound-master.component';
import { Router } from '../../../../node_modules/@angular/router';
import { InboundService } from 'src/app/services/inbound.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { TranslateService, LangChangeEvent } from '../../../../node_modules/@ngx-translate/core';
import { UOM } from 'src/app/models/Inbound/UOM';
import { OpenPOLinesModel } from 'src/app/models/Inbound/OpenPOLinesModel';
import { RecvingQuantityBin } from 'src/app/models/Inbound/RecvingQuantityBin';
import { AutoLot } from 'src/app/models/Inbound/AutoLot';
import { ISubscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-inbound-grpo',
  templateUrl: './inbound-grpo.component.html',
  styleUrls: ['./inbound-grpo.component.scss']
})
export class InboundGRPOComponent implements OnInit {

  dialogMsg: string = ""
  yesButtonText: string = "";
  noButtonText: string = "";
  openPOLineModel: OpenPOLinesModel[] = [];
  Ponumber: any;
  ItemCode: any;
  OpenQty: number;
  tracking: string = "";
  RecvbBinvalue: any = "";
  uomSelectedVal: UOM;
  UOMList: UOM[];
  showLoader: boolean = false;
  qty: number = undefined;
  showButton: boolean = false;
  recvingQuantityBinArray: RecvingQuantityBin[] = [];
  defaultRecvBin: boolean = false;
  serviceData: any[];
  lookupfor: string;
  showLookupLoader = true;
  viewLines: any[];
  operationType: string = "";
  public value: Date = new Date();
  searlNo: any = "";
  MfrSerial: any = "";
  expiryDate: string = "";
  isNonTrack: boolean = false;
  isSerial: boolean = false;
  dialogFor: string = "";
  //locale string variables
  serialNoTitle: string = "";
  mfrRadioText: string = "";
  sysRadioText: string = "";
  scanInputPlaceholder: string = "";
  mfrGridColumnText: string = "";
  SRBatchColumnText: string = "";
  public oSubmitPOLotsArray: any[] = [];
  isAutoLotEnabled: boolean;
  isDisabledScanInput: boolean = false;
  ScanSerial: string = "";
  ScanInputs: any = "";
  targetBin: string = "";
  targetWhse: string = "";
  IsQCRequired: boolean;
  targetBinSubs: ISubscription;
  targetWhseSubs: ISubscription;
  showScanInput: boolean = true;
  targetBinClick: boolean = false;
  public primaryAutoLots: AutoLot[];
  radioSelected: any = 0;
  LastSerialNumber: any[];
  LineId: any[];
  previousReceivedQty: number = 0;
  dateFormat: string;
  showConfirmDialog: boolean;
  rowindexForDelete: any;
  gridDataAfterDelete: any[];

  showPDF: boolean = false;
  displayPDF1: boolean = false;
  base64String: string = "";
  fileName: string = "";
  UOMentry: any = "";
  isPalletizationEnable: boolean = false;
  palletValue: any = "";
  ActualSRBatchColumnText: string = "";
  showNewPallet: boolean = false;

  pageSize: number = Commonservice.pageSize;
  @ViewChild('Quantity') QuantityField;
  serialBatchNo: string ="";

  constructor(private inboundService: InboundService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent) {
    // let userLang = navigator.language.split('-')[0];
    // userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    // translate.use(userLang);
    // translate.onLangChange.subscribe((event: LangChangeEvent) => {
    // });
  }

  ngOnInit() {
    if (localStorage.getItem("PalletizationEnabled") == "True") {
      this.isPalletizationEnable = true;
    } else {
      this.isPalletizationEnable = false;
    }

    this.dateFormat = localStorage.getItem("DATEFORMAT");
    this.openPOLineModel[0] = this.inboundMasterComponent.openPOmodel;
    //update below variable with local storage data
    this.operationType = "";
    // also update this.openPOLineModel[0].RPTQTY with local storage value
    if (this.openPOLineModel != undefined && this.openPOLineModel != null) {
      this.Ponumber = this.openPOLineModel[0].DocNum;
      this.tracking = this.openPOLineModel[0].TRACKING;
      this.OpenQty = this.openPOLineModel[0].OPENQTY;
      this.ItemCode = this.openPOLineModel[0].ITEMCODE;
      this.showScanInput = true;
      if (this.tracking == "S") {
        this.isSerial = true;
        this.setLocalStringForSerial();
      } else if (this.tracking == "N") {
        this.isNonTrack = true;
        this.showScanInput = false;
      } else if (this.tracking == "B") {
        this.isSerial = false;
        this.isNonTrack = false;
        this.setLocalStringForBatch();
      }
      let autoLots = JSON.parse(localStorage.getItem("primaryAutoLots"));
      if (autoLots.length > 0 && autoLots[0].AUTOLOT == "Y") {
        this.isDisabledScanInput = true;
      } else {
        this.isDisabledScanInput = false;
      }

      if (this.openPOLineModel[0].QCREQUIRED == "Y") {
        this.IsQCRequired = true;
      } else {
        this.IsQCRequired = false;
      }

      this.getUOMList();
      if (this.RecvbBinvalue == "") {
        this.defaultRecvBin = true;
        this.ShowBins();
      }
    }
    this.LastSerialNumber = [];
    this.LineId = [];
    this.showSavedDataToGrid()
  }

  onInboundScan() {
    // alert("scan click");
  }

  setLocalStringForBatch() {
    this.serialNoTitle = this.translate.instant("SerialNo");
    this.mfrRadioText = this.translate.instant("Inbound_MfrBatchNo");
    this.sysRadioText = this.translate.instant("Inbound_SysBatch");
    this.scanInputPlaceholder = this.translate.instant("ScanBatch");
    this.mfrGridColumnText = this.translate.instant("Inbound_MfrBatchNo");
    this.SRBatchColumnText = this.translate.instant("BatchNo");
    this.ActualSRBatchColumnText = this.translate.instant("Inbound_ActualBatchNo");
  }
  setLocalStringForSerial() {
    this.serialNoTitle = this.translate.instant("SerialNo");
    this.mfrRadioText = this.translate.instant("MfrSerialNo");
    this.sysRadioText = this.translate.instant("SysSerial");
    this.scanInputPlaceholder = this.translate.instant("ScanSerial");
    this.mfrGridColumnText = this.translate.instant("MfrSerialNo");
    this.SRBatchColumnText = this.translate.instant("SerialNo");
    this.ActualSRBatchColumnText = this.translate.instant("Inbound_ActualSerialNo");
  }

  /**
    * Method to get list of inquries from server.
   */
  public ShowBins() {
    this.targetBinClick = false;
    this.showLoader = true;
    this.inboundService.getRevBins(this.openPOLineModel[0].QCREQUIRED).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            if (this.defaultRecvBin == true) {
              this.RecvbBinvalue = data[0].BINNO;
              this.defaultRecvBin = false
            }
            else {
              console.log(data);
              this.showLookupLoader = false;
              this.serviceData = data;
              this.lookupfor = "RecvBinList";
              return;
            }
          } else {
            this.toastr.error('', this.translate.instant("Inbound_NoBinsAvailableMsg"));
          }
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
      }
    );
  }


  OnBinChange() {
    if (this.RecvbBinvalue == "") {
      return;
    }
    this.showLoader = true;
    this.inboundService.binChange(this.RecvbBinvalue).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("INVALIDBIN"));
              this.RecvbBinvalue = "";
              return;
            }
            else {
              this.RecvbBinvalue = data[0].ID;
              // oCurrentController.isReCeivingBinExist();
            }
          }
        }
        else {
          this.toastr.error('', this.translate.instant("INVALIDBIN"));
          this.RecvbBinvalue = "";
          return;
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
        this.RecvbBinvalue = "";
      }
    );
  }

  onScanInputChange() {
    //  alert("scan change event")
  }
  /**
   * Method to validate entered scan code .
  */
  onScanCodeChange() {

    this.onGS1ItemScan()
  }
  /**
   * Method to get list of uoms from server.
  */
  public getUOMList() {
    this.showLoader = true;
    this.inboundService.getUOMs(this.openPOLineModel[0].ITEMCODE).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log("UOM data response:", data);
        this.openPOLineModel[0].UOMList = data;
        if (this.openPOLineModel[0].UOMList.length > 0) {
          this.uomSelectedVal = this.openPOLineModel[0].UOMList[0];
          this.getUOMVal(this.UOMentry);
        }
      },
      error => {
        console.log("Error: ", error);
      }
    );
  }

  handleCheckChange($event) {
    if ($event.currentTarget.id == "InventoryEnquiryOptions1") {
      // mfr serial radio selected.
      this.radioSelected = 0;
    }
    if ($event.currentTarget.id == "InventoryEnquiryOptions2") {
      // mfr serial radio selected.
      this.radioSelected = 1;
    }
  }

  validateQuantity(): boolean {
    let quantitySum: number = 0;
    for (var i = 0; i < this.recvingQuantityBinArray.length; i++) {
      quantitySum += Number(this.recvingQuantityBinArray[i].LotQty);
    }
    quantitySum = quantitySum + Number(this.qty);

    if (Number(this.OpenQty) == 0) {
      this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantity"));
      this.qty = 0;
      return false;
    } else if (quantitySum > Number(this.OpenQty)) {
      this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantityValid"));
      this.qty = 0;
      return false;
    } else {
      return true;
    }
  }

  updateVendorLot(value, rowindex) {
    for (let i = 0; i < this.recvingQuantityBinArray.length; ++i) {
      if (i === rowindex) {
        this.recvingQuantityBinArray[i].VendorLot = value;
      }
    }
  }

  updateLotNumber(value, rowindex, gridData: any) {
    let result = this.recvingQuantityBinArray.find(element => element.LotNumber == value);
    if (result != undefined) {
      if (this.openPOLineModel[0].TRACKING != "N") {
        if (this.openPOLineModel[0].TRACKING == "S") {
          this.toastr.error('', this.translate.instant("Inbound_SerialCanNotbeSame"));
        } else {
          this.toastr.error('', this.translate.instant("Inbound_BatchCanNotbeSame"));
        }
      }
      //this.recvingQuantityBinArray[rowindex].LotNumber = "";
      for (let i = 0; i < this.recvingQuantityBinArray.length; ++i) {
        if (i === rowindex) {
          this.recvingQuantityBinArray[i].LotNumber = "";
          this.recvingQuantityBinArray[i].palletSBNo = "";
        }
      }
      //gridData.data = this.recvingQuantityBinArray;
      //  return;
    } else {
      for (let i = 0; i < this.recvingQuantityBinArray.length; ++i) {
        if (i === rowindex) {
          this.recvingQuantityBinArray[i].LotNumber = value;
          this.recvingQuantityBinArray[i].palletSBNo = value+"-"+this.palletValue;
        }
      }
    }
  }

  addQuantity() {
    if (this.qty == 0 || this.qty == undefined) {
      this.toastr.error('', this.translate.instant("Inbound_EnterQuantityErrMsg"));
      return;
    }
    if (!Number.isInteger(this.qty)) {
      this.toastr.error('', this.translate.instant("DecimalQuantity"));
      this.QuantityField.nativeElement.focus();
      return;
    }
    if (this.RecvbBinvalue == "" || this.RecvbBinvalue == undefined) {
      this.toastr.error('', this.translate.instant("INVALIDBIN"));
      return;
    }
    if (this.isPalletizationEnable && (this.palletValue == "" || this.palletValue == undefined)) {
      this.toastr.error('', this.translate.instant("InValidPalletNo"));
      return;
    }
    if (!this.validateQuantity()) {
      return;
    }
    this.LastSerialNumber = [];
    this.LineId = [];
    if (this.isNonTrack) {
      this.addNonTrackQty(this.qty);
    } else {
      if (this.radioSelected == 0) {
        this.MfrSerial = this.ScanInputs;
      } else if (this.radioSelected == 1) {
        this.searlNo = this.ScanInputs;
      }
      let autoLots = JSON.parse(localStorage.getItem("primaryAutoLots"));
      if (this.isSerial) {
        while (this.qty > 0 && this.qty != 0) {
          if (autoLots.length > 0 && autoLots[0].AUTOLOT == "Y") {
            this.LastSerialNumber = [];
            this.LineId = [];
            this.addBatchSerialQty(autoLots, this.qty);
            let result = this.recvingQuantityBinArray.find(element => element.LotNumber == this.searlNo);
            if (result == undefined) {
              this.recvingQuantityBinArray.push(new RecvingQuantityBin(this.MfrSerial, this.searlNo, 1, this.RecvbBinvalue, this.expiryDate, this.palletValue));
              this.qty = this.qty - 1;
            }
          } else {
            this.recvingQuantityBinArray.push(new RecvingQuantityBin(this.MfrSerial, this.searlNo, 1, this.RecvbBinvalue, this.expiryDate, this.palletValue));
            this.qty = this.qty - 1;
          }
        }
      } else {
        this.batchCalculation(autoLots, this.qty);
      }
    }
    this.qty = undefined;
    this.ScanInputs = "";
    if (this.recvingQuantityBinArray.length > 0) {
      this.showButton = true;
    } else {
      this.showButton = false;
    }
    this.updateReceiveQty();
  }

  updateReceiveQty() {
    let quantitySum: number = 0;
    //quantitySum = 0;//this.openPOLineModel[0].RPTQTY;
    for (var i = 0; i < this.recvingQuantityBinArray.length; i++) {
      quantitySum += Number(this.recvingQuantityBinArray[i].LotQty);
    }
    if (this.openPOLineModel != null && this.openPOLineModel.length > 0) {
      this.openPOLineModel[0].RPTQTY = quantitySum;
    }
  }

  batchCalculation(autoLots: AutoLot[], qty: any) {
    if (autoLots.length > 0 && autoLots[0].AUTOLOT == "Y") {
      this.addBatchSerialQty(autoLots, this.qty);
      let result = this.recvingQuantityBinArray.find(element => element.LotNumber == this.searlNo);
      if (result == undefined) {
        this.recvingQuantityBinArray.push(new RecvingQuantityBin(this.MfrSerial, this.searlNo, qty, this.RecvbBinvalue, this.expiryDate, this.palletValue));
      } else {
        this.batchCalculation(autoLots, this.qty);
      }
    } else {
      this.recvingQuantityBinArray.push(new RecvingQuantityBin(this.MfrSerial, this.searlNo, qty, this.RecvbBinvalue, this.expiryDate, this.palletValue));
    }
  }

  addNonTrackQty(qty: any) {
    let result = this.recvingQuantityBinArray.find(element => element.Bin == this.RecvbBinvalue);
    if (result == undefined) {
      this.recvingQuantityBinArray.push(new RecvingQuantityBin("", "", qty, this.RecvbBinvalue, this.expiryDate, this.palletValue));
      this.showButton = true;
    } else {
      this.toastr.error('', this.translate.instant("Inbound_BinValidation"));
      return;
    }

  }
  /**
   * method to create logic for autolot for serial batch qty.
   * @param autoLots 
   * @param qty 
   */
  addBatchSerialQty(autoLots: AutoLot[], qty: any) {
    this.searlNo = "";
    for (var i = 0; i < autoLots.length; i++) {
      if (autoLots[i].OPRTYPE == "1") {
        this.searlNo = this.searlNo + autoLots[i].STRING
      }
      if (autoLots[i].OPRTYPE === "2" && autoLots[i].OPERATION == "2") {
        if (this.recvingQuantityBinArray.length > 0) {
          var finalString = this.getAutoLotStringOPR2(autoLots[i].STRING);
          autoLots[i].STRING = finalString;
          this.searlNo = this.searlNo + finalString;
          this.LastSerialNumber.push(this.getAutoLotStringOPR2(finalString))
          this.LineId.push(autoLots[i].LINEID);

        } else {
          var finalString = autoLots[i].STRING;
          this.searlNo = this.searlNo + finalString;
          this.LastSerialNumber.push(this.getAutoLotStringOPR2(finalString));
          this.LineId.push(autoLots[i].LINEID);
        }
      }
      if (autoLots[i].OPRTYPE == "2" && autoLots[i].OPERATION == "3") {
        if (this.recvingQuantityBinArray.length > 0) {
          var finalString = this.getAutoLotStringOPR3(autoLots[i].STRING);
          this.searlNo = this.searlNo + finalString;
          autoLots[i].STRING = finalString;
          this.LastSerialNumber.push(this.getAutoLotStringOPR3(autoLots[i].STRING));
          this.LineId.push(autoLots[i].LINEID);
        } else {
          var finalString = autoLots[i].STRING;
          this.searlNo = this.searlNo + finalString;
          this.LastSerialNumber.push(this.getAutoLotStringOPR3(autoLots[i].STRING));
          this.LineId.push(autoLots[i].LINEID);
        }
      }
    }
  }

  getAutoLotStringOPR2(autolotString: string): string {
    var strlength = autolotString.length;
    var numberLength = (parseInt(autolotString)).toString().length;
    var finlNumber = parseInt(autolotString) + 1
    var finalString = this.forwardZero(finlNumber, strlength - numberLength);
    return finalString;
  }

  getAutoLotStringOPR3(autolotString: string): string {
    var strlength = autolotString.length;
    var numberLength = (parseInt(autolotString)).toString().length;
    var finlNumber = parseInt(autolotString) - 1
    var finalString = this.forwardZero(finlNumber, strlength - numberLength);
    return finalString;
  }

  public openConfirmForDelete(rowindex, gridData: any) {
    this.dialogFor = "deleteRow";
    this.dialogMsg = this.translate.instant("Inbound_DoYouWantToDelete");
    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    this.rowindexForDelete = rowindex;
    this.gridDataAfterDelete = gridData;
    this.showConfirmDialog = true;
  }


  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;
    if ($event.Status == "yes") {
      switch ($event.From) {
        case ("deleteRow"):
          this.DeleteRowClick(this.rowindexForDelete, this.gridDataAfterDelete);
          break;
        case ("recCurrentOrAll"):
          // show pdf dialog
          this.yesButtonText = this.translate.instant("yes");
          this.noButtonText = this.translate.instant("no");
          this.dialogFor = "receiveMultiplePDFDialog";
          this.dialogMsg = this.translate.instant("Inbound_PrintAllLabelsAfterSubmit");
          this.operationType = "All";
          this.showConfirmDialog = true; // show dialog
          this.showPDF = true;
          break;
        case ("receiveSinglePDFDialog"):
          //do something. //yes mean all click
          this.submitCurrentGRPO();
          this.showPDF = true;
          break;
        case ("receiveMultiplePDFDialog"):
          // if pdf dialog yes click for multiple recevie.
          this.prepareAllData();
          break;

      }
    } else {
      if ($event.Status == "cancel") {
        // when user click on cross button nothing to do.
      } else {
        //means user click on negative button
        if ($event.From == "recCurrentOrAll") {
          //this.submitCurrentGRPO();
          this.yesButtonText = this.translate.instant("yes");
          this.noButtonText = this.translate.instant("no");
          this.dialogFor = "receiveSinglePDFDialog";
          this.dialogMsg = this.translate.instant("Inbound_PrintAllLabelsAfterSubmit");
          this.operationType = "Current";
          this.showConfirmDialog = true; // show dialog
        }
        else if ($event.From == "receiveSinglePDFDialog") {
          this.submitCurrentGRPO();
          this.showPDF = false;
        }
        else if ($event.From == "receiveMultiplePDFDialog") {
          this.prepareAllData();
          this.showPDF = false;
        }
      }
    }
  }

  submitCurrentGRPO() {
    var oSubmitPOLotsObj: any = {};
    oSubmitPOLotsObj.POReceiptLots = [];
    oSubmitPOLotsObj.POReceiptLotDetails = [];
    oSubmitPOLotsObj.UDF = [];
    oSubmitPOLotsObj.LastSerialNumber = [];
    var oSubmitPOLotsObj = this.prepareSubmitPurchaseOrder(oSubmitPOLotsObj); // current data only.
    this.SubmitGoodsReceiptPO(oSubmitPOLotsObj);
  }

  forwardZero(num: number, size: number): string {
    let s = num + "";
    let sign = "";
    if (s.length > 0 && s[0] == "-") {
      s = s.substring(1, s.length);
      sign = "-";
    }
    size = size + s.length;
    while (s.length < size) s = "0" + s;
    s = sign + s;
    return s;
  }

  save() {
    if (this.IsQCRequired && (this.targetBin == null || this.targetBin == undefined || this.targetBin == "")) {
      this.toastr.error('', "Target Warehouse cannot be blank");
      return;
    } else if (this.IsQCRequired && (this.targetWhse == null || this.targetWhse == undefined || this.targetWhse == "")) {
      this.toastr.error('', "Target Bin cannot be blank");
      return;
    }

    if (this.openPOLineModel[0].TRACKING != "N") {
      let result = this.recvingQuantityBinArray.find(element => element.LotNumber == "");
      if (result != undefined) {
        if (this.openPOLineModel[0].TRACKING == "S") {
          this.toastr.error('', this.translate.instant("Inbound_SerialNotBlank"));
        } else {
          this.toastr.error('', this.translate.instant("Inbound_BatchNotBlank"));
        }
        return;
      }

      // for(var i =0; i<this.recvingQuantityBinArray.length;i++){
      //   let result = this.recvingQuantityBinArray.find(element => element.LotNumber == );
      //   if (result != undefined) {
      //     if (this.openPOLineModel[0].TRACKING == "S") {
      //       this.toastr.error('', this.translate.instant("SerialNotBlank"));
      //     } else {
      //       this.toastr.error('', this.translate.instant("BatchNotBlank"));
      //     }
      //     return;
      //   }
      // }

    }

    this.prepareCommonData();
    localStorage.setItem("PONumber", this.Ponumber);
    this.inboundMasterComponent.inboundComponent = 2;
  }

  prepareCommonData() {
    var oSubmitPOLotsObj: any = {};
    var dataModel = localStorage.getItem("GRPOReceieveData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      oSubmitPOLotsObj.POReceiptLots = [];
      oSubmitPOLotsObj.POReceiptLotDetails = [];
      oSubmitPOLotsObj.UDF = [];
      oSubmitPOLotsObj.LastSerialNumber = [];
    } else {
      oSubmitPOLotsObj = JSON.parse(dataModel);
    }
    var oSubmitPOLotsObj = this.prepareSubmitPurchaseOrder(oSubmitPOLotsObj);
    localStorage.setItem("GRPOReceieveData", JSON.stringify(oSubmitPOLotsObj));
  }

  prepareAllData() {
    var oSubmitPOLotsObj: any = {};
    var dataModel = localStorage.getItem("AddToGRPO");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      oSubmitPOLotsObj.POReceiptLots = [];
      oSubmitPOLotsObj.POReceiptLotDetails = [];
      oSubmitPOLotsObj.UDF = [];
      oSubmitPOLotsObj.LastSerialNumber = [];
    } else {
      oSubmitPOLotsObj = JSON.parse(dataModel);
    }
    oSubmitPOLotsObj = this.prepareSubmitPurchaseOrder(oSubmitPOLotsObj);
    // localStorage.setItem("GRPOReceieveData", JSON.stringify(oSubmitPOLotsObj));
    // var dataModel = localStorage.getItem("AddToGRPO");
    // if (dataModel != null && dataModel != undefined && dataModel != "") {
    this.SubmitGoodsReceiptPO(oSubmitPOLotsObj);
    // }
  }

  showSavedDataToGrid() {
    this.openPOLineModel[0] = this.inboundMasterComponent.openPOmodel;
    if (this.openPOLineModel != undefined && this.openPOLineModel != null) {

    }
    var oSubmitPOLots: any = {};
    var dataModel = localStorage.getItem("GRPOReceieveData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      //this.oSubmitPOLotsArray = []; 
      oSubmitPOLots = {};
    } else {
      oSubmitPOLots = JSON.parse(dataModel);
    }
    if (oSubmitPOLots != null && oSubmitPOLots != undefined && oSubmitPOLots.POReceiptLots != null &&
      oSubmitPOLots.POReceiptLots != undefined && oSubmitPOLots.POReceiptLots != ""
      && oSubmitPOLots.POReceiptLots.length > 0) {
      for (var i = 0; i < oSubmitPOLots.POReceiptLots.length; i++) {
        if (oSubmitPOLots.POReceiptLots[i].PONumber == this.Ponumber &&
          oSubmitPOLots.POReceiptLots[i].ItemCode == this.ItemCode &&
          oSubmitPOLots.POReceiptLots[i].LineNo == this.openPOLineModel[0].LINENUM &&
          oSubmitPOLots.POReceiptLots[i].Tracking == this.tracking) {
          this.UOMentry = oSubmitPOLots.POReceiptLots[i].UOM;
          this.getUOMVal(this.UOMentry)
          for (var j = 0; j < oSubmitPOLots.POReceiptLotDetails.length; j++) {
            if (oSubmitPOLots.POReceiptLotDetails[j].ParentLineNo == oSubmitPOLots.POReceiptLots[i].Line) {
              this.recvingQuantityBinArray.push(oSubmitPOLots.POReceiptLotDetails[j]);
              this.previousReceivedQty = Number(this.previousReceivedQty) + Number(oSubmitPOLots
                .POReceiptLotDetails[j].LotQty);
            }
          }
          // this.LastSerialNumber = oSubmitPOLotsObj.LastSerialNumber;
          // this.LineId = oSubmitPOLotsObj.LastSerialNumber;
          for (var m = 0; m < oSubmitPOLots.LastSerialNumber.length; m++) {
            this.LastSerialNumber.push(oSubmitPOLots.LastSerialNumber[m].LastSerialNumber);
            this.LineId.push(oSubmitPOLots.LastSerialNumber[m].LineId);
          }
        }
      }
      // this.updateReceiveQty();
      this.openPOLineModel[0].RPTQTY = this.previousReceivedQty;
      if (oSubmitPOLots.UDF != undefined && oSubmitPOLots.UDF != null && oSubmitPOLots.UDF.length > 0) {
        this.targetWhse = oSubmitPOLots.UDF[0].Value;
        this.targetBin = oSubmitPOLots.UDF[1].Value;
      }
    }
    if (this.tracking == "S") {
      this.isNonTrack = false;
    } else if (this.tracking == "N") {
      this.isNonTrack = true;

    } else if (this.tracking == "B") {

      this.isNonTrack = false;

    }
    if (this.recvingQuantityBinArray.length > 0) {
      this.showButton = true;
    } else {
      this.showButton = false;
    }
  }


  getUOMVal(UomEntry: number) {
    if (this.openPOLineModel[0].UOMList != undefined) {
      for (var i = 0; i < this.openPOLineModel[0].UOMList.length; i++) {
        if (this.openPOLineModel[0].UOMList[i].UomEntry == UomEntry) {
          this.uomSelectedVal = this.openPOLineModel[0].UOMList[i];
        }
      }
    }
  }


  manageRecords(oSubmitPOLotsObj: any): any {
    var size = oSubmitPOLotsObj.POReceiptLots.length;
    for (var i = 0; i < oSubmitPOLotsObj.POReceiptLots.length; i++) {
      if (oSubmitPOLotsObj.POReceiptLots[i].PONumber == this.Ponumber &&
        oSubmitPOLotsObj.POReceiptLots[i].ItemCode == this.openPOLineModel[0].ITEMCODE &&
        oSubmitPOLotsObj.POReceiptLots[i].LineNo == this.openPOLineModel[0].LINENUM) {
        var s = oSubmitPOLotsObj.POReceiptLotDetails.length;
        for (var j = 0; j < oSubmitPOLotsObj.POReceiptLotDetails.length; j++) {
          if (oSubmitPOLotsObj.POReceiptLotDetails[j].ParentLineNo == oSubmitPOLotsObj.POReceiptLots[i].Line) {
            oSubmitPOLotsObj.POReceiptLotDetails.splice(j, 1);
            j = -1;
          }
        }

        for (var k = 0; k < oSubmitPOLotsObj.UDF.length; k++) {
          if (oSubmitPOLotsObj.UDF[k].Key == "OPTM_TARGETWHS" &&
            oSubmitPOLotsObj.UDF[k].LineNo == oSubmitPOLotsObj.POReceiptLots[i].Line) {
            oSubmitPOLotsObj.UDF.splice(k, 1);
          }

          if (oSubmitPOLotsObj.UDF[k].Key == "OPTM_TARGETBIN" &&
            oSubmitPOLotsObj.UDF[k].LineNo == oSubmitPOLotsObj.POReceiptLots[i].Line) {
            oSubmitPOLotsObj.UDF.splice(k, 1);
          }
        }

        // oSubmitPOLotsObj.UDF.splice(i, 1);
        for (var m = 0; m < oSubmitPOLotsObj.LastSerialNumber.length; m++) {
          if (oSubmitPOLotsObj.LastSerialNumber[m].ItemCode == oSubmitPOLotsObj.POReceiptLots[i].ItemCode) {
            oSubmitPOLotsObj.LastSerialNumber.splice(m, 1);
            m = -1;
          }
        }
        // oSubmitPOLotsObj.LastSerialNumber.splice(i, 1);
        oSubmitPOLotsObj.POReceiptLots.splice(i, 1);
      }
    }
    return oSubmitPOLotsObj;
  }

  receive(e) {

    if (this.IsQCRequired && (this.targetBin == null || this.targetBin == undefined || this.targetBin == "")) {
      this.toastr.error('', "Target Warehouse cannot be blank");
      return;
    } else if (this.IsQCRequired && (this.targetWhse == null || this.targetWhse == undefined || this.targetWhse == "")) {
      this.toastr.error('', "Target Bin cannot be blank");
      return;
    }

    if (this.openPOLineModel[0].TRACKING != "N") {
      let result = this.recvingQuantityBinArray.find(element => element.LotNumber == "");
      if (result != undefined) {
        if (this.openPOLineModel[0].TRACKING == "S") {
          this.toastr.error('', this.translate.instant("Inbound_SerialNotBlank"));
        } else {
          this.toastr.error('', this.translate.instant("Inbound_BatchNotBlank"));
        }
        return;
      }
    }

    var dataModel: any = localStorage.getItem("GRPOReceieveData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      //this.submitCurrentGRPO();
      // show print dialog here and onclick its handling.  
      this.yesButtonText = this.translate.instant("yes");
      this.noButtonText = this.translate.instant("no");
      this.dialogFor = "receiveSinglePDFDialog";
      this.dialogMsg = this.translate.instant("Inbound_PrintAllLabelsAfterSubmit");
      this.showConfirmDialog = true; // show dialog

    } else {
      dataModel = this.manageRecords(JSON.parse(dataModel));
      if (dataModel == null || dataModel == undefined || dataModel == "" || dataModel.POReceiptLots.length < 1) {
        this.yesButtonText = this.translate.instant("yes");
        this.noButtonText = this.translate.instant("no");
        this.dialogFor = "receiveSinglePDFDialog";
        this.dialogMsg = this.translate.instant("Inbound_PrintAllLabelsAfterSubmit");
        this.showConfirmDialog = true; // show dialog
        //this.submitCurrentGRPO();

        return;
      }
      this.yesButtonText = this.translate.instant("All");
      this.noButtonText = this.translate.instant("Current");
      this.dialogFor = "recCurrentOrAll";
      this.dialogMsg = this.translate.instant("Inbound_ReceiveCurrentOrAll")
      this.showConfirmDialog = true; // show dialog
    }
  }

  prepareSubmitPurchaseOrder(oSubmitPOLotsObj: any): any {
    oSubmitPOLotsObj = this.manageRecords(oSubmitPOLotsObj);
    if (localStorage.getItem("Line") == null || localStorage.getItem("Line") == undefined ||
      localStorage.getItem("Line") == "") {
      localStorage.setItem("Line", "0");
    }
    oSubmitPOLotsObj.POReceiptLots.push({
      DiServerToken: localStorage.getItem("Token"),
      PONumber: this.openPOLineModel[0].DOCENTRY,
      CompanyDBId: localStorage.getItem("CompID"),
      LineNo: this.openPOLineModel[0].LINENUM,
      ShipQty: this.openPOLineModel[0].RPTQTY.toString(),
      OpenQty: this.openPOLineModel[0].OPENQTY.toString(),
      WhsCode: localStorage.getItem("whseId"),
      Tracking: this.openPOLineModel[0].TRACKING,
      ItemCode: this.openPOLineModel[0].ITEMCODE,
      LastSerialNumber: 0,
      Line: Number(localStorage.getItem("Line")),
      GUID: localStorage.getItem("GUID"),
      UOM: this.uomSelectedVal.UomEntry,
      UsernameForLic: localStorage.getItem("UserId")

      //------end Of parameter For License----
    });
    // oSubmitPOLotsObj.UDF = [];  
    oSubmitPOLotsObj.UDF.push({
      Key: "OPTM_TARGETWHS",//UDF[iIndex].Key,
      Value: this.targetWhse,
      //LotNo: UDF[iIndex].LotNo,
      Flag: 'D', // D = Line, H= Header, L = Lots
      LineNo: Number(localStorage.getItem("Line"))
    });
    oSubmitPOLotsObj.UDF.push({
      Key: "OPTM_TARGETBIN",//UDF[iIndex].Key,
      Value: this.targetBin,
      //LotNo: UDF[iIndex].LotNo,
      Flag: 'D', // D = Line, H= Header, L = Lots
      LineNo: Number(localStorage.getItem("Line"))
    });


    for (var iBtchIndex = 0; iBtchIndex < this.recvingQuantityBinArray.length; iBtchIndex++) {
      oSubmitPOLotsObj.POReceiptLotDetails.push({
        // POItemCode: this.Ponumber+this.openPOLineModel[0].ITEMCODE,
        Bin: this.recvingQuantityBinArray[iBtchIndex].Bin,
        LineNo: this.openPOLineModel[0].LINENUM,
        LotNumber: this.recvingQuantityBinArray[iBtchIndex].LotNumber, //getUpperTableData.GoodsReceiptLineRow[iBtchIndex].SysSerNo,
        LotQty: this.recvingQuantityBinArray[iBtchIndex].LotQty,
        SysSerial: "0",
        ExpireDate: this.GetSubmitDateFormat(this.expiryDate),//GetSubmitDateFormat(getUpperTableData.GoodsReceiptLineRow[iBtchIndex].EXPDATE), // oCurrentController.GetSubmitDateFormat(oActualGRPOModel.PoDetails[iIndex].ExpireDate),//oActualGRPOModel.PoDetails[iIndex].ExpireDate,
        VendorLot: this.recvingQuantityBinArray[iBtchIndex].VendorLot,
        //NoOfLabels: oActualGRPOModel.PoDetails[iIndex].NoOfLabels,
        //Containers: piContainers,
        SuppSerial: this.recvingQuantityBinArray[iBtchIndex].VendorLot,
        ParentLineNo: Number(localStorage.getItem("Line")),
        LotSteelRollId: "",
        PalletCode: this.recvingQuantityBinArray[iBtchIndex].PalletCode
      });
    }

    for (var iLastIndexNumber = 0; iLastIndexNumber < this.LastSerialNumber.length; iLastIndexNumber++) {
      oSubmitPOLotsObj.LastSerialNumber.push({
        LastSerialNumber: this.LastSerialNumber[iLastIndexNumber],
        LineId: this.LineId[iLastIndexNumber],
        ItemCode: this.openPOLineModel[0].ITEMCODE
      });
    }
    localStorage.setItem("Line", "" + (Number(localStorage.getItem("Line")) + 1));
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
      // return day + ":" + mth + ":" + d.getFullYear();
      return mth + "/" + day + "/" + d.getFullYear();
    }
  }


  removePODetailData() {
    var inboundData = JSON.parse(localStorage.getItem("AddToGRPO"));
    if (inboundData != undefined && inboundData != null && inboundData != "") {
      for (var i = 0; i < inboundData.POReceiptLots.length; i++) {
        if (inboundData.POReceiptLots[i].PONumber == this.Ponumber &&
          inboundData.POReceiptLots[i].ItemCode == this.openPOLineModel[0].ITEMCODE &&
          inboundData.POReceiptLots[i].LineNo == this.openPOLineModel[0].LINENUM) {

          for (var j = 0; j < inboundData.POReceiptLotDetails.length; j++) {
            if (inboundData.POReceiptLotDetails[j].ParentLineNo == inboundData.POReceiptLots[i].Line) {
              inboundData.POReceiptLotDetails.splice(j, 1);
              j = -1;
            }
          }

          for (var k = 0; k < inboundData.UDF.length; k++) {
            if (inboundData.UDF[k].Key == "OPTM_TARGETWHS" &&
              inboundData.UDF[k].LineNo == inboundData.POReceiptLots[i].Line) {
              inboundData.UDF.splice(k, 1);
            }

            if (inboundData.UDF[k].Key == "OPTM_TARGETBIN" &&
              inboundData.UDF[k].LineNo == inboundData.POReceiptLots[i].Line) {
              inboundData.UDF.splice(k, 1);
            }
          }

          for (var m = 0; m < inboundData.LastSerialNumber.length; m++) {
            if (inboundData.LastSerialNumber[m].ItemCode == inboundData.POReceiptLots[i].ItemCode) {
              inboundData.LastSerialNumber.splice(m, 1);
              m = -1;
            }
          }

          inboundData.POReceiptLots.splice(i, 1);
        }
      }
      localStorage.setItem("AddToGRPO", JSON.stringify(inboundData));
    }



    var GRPOReceieveData = JSON.parse(localStorage.getItem("GRPOReceieveData"));
    if (GRPOReceieveData != undefined && GRPOReceieveData != null && GRPOReceieveData != "") {
      for (var i = 0; i < GRPOReceieveData.POReceiptLots.length; i++) {
        if (inboundData.POReceiptLots[i].PONumber == this.Ponumber &&
          inboundData.POReceiptLots[i].ItemCode == this.openPOLineModel[0].ITEMCODE &&
          inboundData.POReceiptLots[i].LineNo == this.openPOLineModel[0].LINENUM) {

          for (var j = 0; j < GRPOReceieveData.POReceiptLotDetails.length; j++) {
            if (GRPOReceieveData.POReceiptLotDetails[j].ParentLineNo == GRPOReceieveData.POReceiptLots[i].Line) {
              GRPOReceieveData.POReceiptLotDetails.splice(j, 1);
              j = -1;
            }
          }

          for (var k = 0; k < GRPOReceieveData.UDF.length; k++) {
            if (GRPOReceieveData.UDF[k].Key == "OPTM_TARGETWHS" &&
              GRPOReceieveData.UDF[k].LineNo == GRPOReceieveData.POReceiptLots[i].Line) {
              GRPOReceieveData.UDF.splice(k, 1);
            }

            if (GRPOReceieveData.UDF[k].Key == "OPTM_TARGETBIN" &&
              GRPOReceieveData.UDF[k].LineNo == GRPOReceieveData.POReceiptLots[i].Line) {
              GRPOReceieveData.UDF.splice(k, 1);
            }
          }

          for (var m = 0; m < GRPOReceieveData.LastSerialNumber.length; m++) {
            if (GRPOReceieveData.LastSerialNumber[m].ItemCode == GRPOReceieveData.POReceiptLots[i].ItemCode) {
              GRPOReceieveData.LastSerialNumber.splice(m, 1);
              m = -1;
            }
          }

          GRPOReceieveData.POReceiptLots.splice(i, 1);
        }
      }
      localStorage.setItem("GRPOReceieveData", JSON.stringify(GRPOReceieveData));
    }

  }



  SubmitGoodsReceiptPO(oSubmitPOLotsObj: any) {
    this.showLoader = true;
    this.inboundService.SubmitGoodsReceiptPO(oSubmitPOLotsObj).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {

          if (this.operationType == "All") {
            localStorage.setItem("Line", "0");
            localStorage.setItem("GRPOReceieveData", "");
            localStorage.setItem("AddToGRPO", "");
            localStorage.setItem("addToGRPOPONumbers", "");
          } else if (this.operationType == "Current") {
            this.removePODetailData();
          } else {
            localStorage.setItem("Line", "0");
            localStorage.setItem("GRPOReceieveData", "");
            localStorage.setItem("AddToGRPO", "");
            localStorage.setItem("addToGRPOPONumbers", "");
          }

          // alert("Goods Receipt PO generated successfully with Doc No: " + data.DocEntry);
          this.toastr.success('', this.translate.instant("Inbound_GRPOSuccessMessage") + " " + data[0].SuccessNo);

          if (this.showPDF) {
            //show pdf
            this.displayPDF(data[0].DocEntry);
            this.showPDF = false;
          } else {
            // no need to display pdf
            this.inboundMasterComponent.inboundComponent = 1;
          }

        } else if (data[0].ErrorMsg == "7001") {
          this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
            this.translate.instant("CommonSessionExpireMsg"));
          return;
        }
        else {
          // alert(data[0].ErrorMsg);
          this.toastr.error('', data[0].ErrorMsg);
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
      }
    );
  }

  cancel() {
    localStorage.setItem("PONumber", this.Ponumber);
    this.inboundMasterComponent.inboundComponent = 2;
  }

  DeleteRowClick(rowindex, gridData: any) {
    if (this.recvingQuantityBinArray.length > 0) {
      var qtyForRemove = this.recvingQuantityBinArray[rowindex].LotQty;
      if (this.openPOLineModel[0].RPTQTY >= qtyForRemove) {
        this.openPOLineModel[0].RPTQTY = this.openPOLineModel[0].RPTQTY - qtyForRemove;
      }
    }
    this.recvingQuantityBinArray.splice(rowindex, 1);
    gridData.data = this.recvingQuantityBinArray;
    if (this.recvingQuantityBinArray.length > 0) {
      this.showButton = true;
    } else {
      this.showButton = false;
    }
  }


  // item section.
  /**
  * Method to get list of inquries from server.
  */
  public getTargetWhseList() {
    this.showLoader = true;
    this.targetWhseSubs = this.inboundService.getQCTargetWhse().subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          this.serviceData = data;
          this.lookupfor = "toWhsList";

        }
        else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLoader = false;
        this.toastr.error('', error);
      },
    );
  }


  // item section.
  /**
  * Method to get list of inquries from server.
  */
  public getTargetBinList() {
    this.targetBinClick = true;
    //this.showLoader = true; this.getPIlistSubs = 
    this.showLoader = true;
    this.targetBinSubs = this.inboundService.getRevBins("N").subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {

          if (data.length > 0) {
            console.log(data);
            this.showLookupLoader = false;
            this.serviceData = data;
            this.lookupfor = "RecvBinList";

            return;
          }
          else {
            this.toastr.error('', this.translate.instant("Inbound_NoBinsAvailableMsg"));
          }
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
      }
    );
  }

  /**
  * @param $event this will return the value on row click of lookup grid.
  */
  getLookupValue($event) {

    if (this.lookupfor == "RecvBinList") {
      //this.itemCode = $event[0];
      if (this.targetBinClick) {
        this.targetBin = $event[0];
        this.targetBinClick = false;
      } else {
        this.RecvbBinvalue = $event[0];
      }

    }
    else if (this.lookupfor == "toWhsList") {
      console.log("value of lots" + $event);
      console.log("value of lots" + $event.LOTNO);
      this.targetWhse = $event[0];
      //this.itemCode = $event[2];

    } else if (this.lookupfor == "PalletList") {
      this.palletValue = $event[0];
    }
  }

  OnTargetBinChange() {
    if (this.targetBin == "") {
      return;
    }
    this.showLoader = true;
    this.inboundService.binChange(this.targetBin).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("INVALIDBIN"));
              this.targetBin = "";
              return;
            }
            else {
              this.targetBin = data[0].ID;
              // oCurrentController.isReCeivingBinExist();
            }
          }
        }
        else {
          this.toastr.error('', this.translate.instant("INVALIDBIN"));
          this.targetBin = "";
          return;
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
        this.targetBin = "";
      }
    );
  }

  onQCWHSChange() {
    if (this.targetWhse == "") {
      return;
    }
    this.showLoader = true;
    this.inboundService.isWHSExists(this.targetWhse).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("InvalidWhsErrorMsg"));
              this.targetWhse = "";
              return;
            }
            else {
              this.targetWhse = data[0].ID;
              // oCurrentController.isReCeivingBinExist();
            }
          }
        }
        else {
          this.toastr.error('', this.translate.instant("InvalidWhsErrorMsg"));
          this.targetWhse = "";
          return;
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
        this.targetWhse = "";
      }
    );
  }

  onHiddenScanClick() {
    this.onGS1ItemScan();
  }
  onGS1ItemScan() {
    // alert("at onGS1ItemScan ");
    var inputValue = (<HTMLInputElement>document.getElementById('inboundScanInputField')).value;
    if (inputValue.length > 0) {
      this.ScanInputs = inputValue;
    }
    // alert("at onGS1ItemScan value:: "+this.ScanInputs);

    if (this.ScanInputs != null && this.ScanInputs != undefined &&
      this.ScanInputs != "" && this.ScanInputs != "error decoding QR Code") {

    } else {
      // if any message is required to show then show.
      this.ScanInputs = "";
      return;
    }
    this.openPOLineModel;
    let piManualOrSingleDimentionBarcode = 0;
    // alert("check and scan code api call")
    this.inboundService.checkAndScanCode(this.openPOLineModel[0].CardCode, this.ScanInputs).subscribe(
      (data: any) => {
        //  alert("check and scan code api call response data:"+JSON.stringify(data));

        console.log("responseData: " + JSON.stringify(data));
        if (data != null) {
          if (data[0].Error != null) {
            if (data[0].Error == "Invalidcodescan") {
              piManualOrSingleDimentionBarcode = 1
              this.toastr.error('', this.translate.instant("InvalidScanCode"));
              // nothing is done in old code.
            } else {
              // some message is handle in else section in old code
              //return;
            }
            return;
          }
          console.log("Inapi call section openPoline::", JSON.stringify(this.openPOLineModel));
          // now check if the  code is for avilable item or not other wise invalid item error.
          var itemCode = this.openPOLineModel[0].ITEMCODE.toUpperCase()
          if (piManualOrSingleDimentionBarcode == 0) {
            if (data[0] != null && data[0].Value != null && (data[0].Value.toUpperCase() != itemCode.toUpperCase())) {
              this.toastr.error('', this.translate.instant("InvalidItemCode"));
              this.ScanInputs = "";
              return;
            }

            var piExpDateExist = 0;
            //var oGetExpDate = oTextExpiryDate.getValue();
            var tracking = this.openPOLineModel[0].TRACKING;
            for (var i = 0; i < data.length; i++) {
              if (data[i].Key == '10' || data[i].Key == '21' || data[i].Key == '23') {
                this.ScanInputs = data[i].Value;
                // make sure ScanInputs variable me puri string aati hai.. to uski value change karne
                // se kuch affect na kare.
                //scan input field par set karna hai.. ye value 10,21,23 k case me.
              }
              if (data[i].Key == '15' || data[i].Key == '17') {
                var d = data[i].Value.split('/');
                var oepxpdt = d[0] + '/' + d[1] + '/' + d[2];
                // set value to date field 
                this.expiryDate = oepxpdt;
                piExpDateExist = 1; //taken this variable for date purpose check if later used.
              }

              if (data[i].Key == '30' || data[i].Key == '310' ||
                data[i].Key == '315' || data[i].Key == '316' || data[i].Key == '320') {
                if (tracking == "S") {
                  //oAddserial.setValue("1");
                  this.qty = 1;
                }
                else {
                  this.qty = data[i].Value;
                }
                this.addQuantity();
              }
            }
          }

          var index = 0;
          var selectedMode = "WMS"; // I dont know why we are setting it to wms.
          let autoLots = JSON.parse(localStorage.getItem("primaryAutoLots"));
          if ((autoLots[0].AUTOLOT == "Y" || autoLots[0].AUTOLOT == "N" || autoLots[0].AUTOLOT == null)
            && selectedMode === "WMS" && tracking == "S" && this.ScanInputs != "") {
            //oAddserial.setValue("1");  I think not needed to set value because we are already setting in above code.
            this.QuantityField.nativeElement.disabled = true;
          }
          else {
            //oAddserial.setValue("");
            this.QuantityField.nativeElement.disabled = false;
          }

        }
      },
      error => {
        console.log("Error: ", error);
        this.targetWhse = "";
      });
  }

  public displayPDF(dNo: string) {
    this.showLoader = true;
    this.inboundService.printingServiceForSubmitGRPO(dNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          console.log("" + data);
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }

          if (data.Detail != null && data.Detail != undefined && data.Detail[0] != null && data.Detail[0] != undefined) {
            this.fileName = data.Detail[0].FileName;
            this.base64String = data.Detail[0].Base64String;
          }


          if (this.base64String != null && this.base64String != "") {
            // this.showPdf(); // this function is used to display pdf in new tab.
            this.base64String = 'data:application/pdf;base64,' + this.base64String;
            this.displayPDF1 = true;
            //this.commonservice.refreshDisplyPDF(true); 

          } else {
            // no data available then redirect to first screen.
            this.inboundMasterComponent.inboundComponent = 1;
          }
          //  console.log("filename:" + this.fileName);
          console.log("filename:" + this.base64String);
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLoader = false;
        this.toastr.error('', error);
      }
    );
  }

  closePDF() {
    //close current screen and redirect to first screen.
    this.inboundMasterComponent.inboundComponent = 1;
    console.log("PDF dialog is closed");
  }

  public getPalletList() {
    this.showLoader = true;
    this.inboundService.getPalletList(this.openPOLineModel[0].ITEMCODE).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            console.log(data);
            this.showLookupLoader = false;
            this.serviceData = data;
            this.palletValue = this.serviceData[0].Code;
            this.lookupfor = "PalletList";
            return;
          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
      }
    );
  }

  onPalletScan() {
    // alert("scan click");
  }

  enableNewwPallet(){
    this.showNewPallet = true;
  }

  OnPalletChange() {
    // if (this.palletValue == "") {
    //   return;
    // }
    // this.showLoader = true;
    // this.inboundService.palletChange(this.palletValue).subscribe(
    //   (data: any) => {
    //     this.showLoader = false;
    //     console.log(data);
    //     if (data != null) {
    //       if (data.length > 0) {
    //         if (data[0].Result == "0") {
    //           this.toastr.error('', this.translate.instant("InValidPalletNo"));
    //           this.palletValue = "";
    //           return;
    //         }
    //         else {
    //           this.palletValue = data[0].Code;
    //         }
    //       }
    //     }
    //     else {
    //       this.toastr.error('', this.translate.instant("InValidPalletNo"));
    //       this.palletValue = "";
    //       return;
    //     }
    //   },
    //   error => {
    //     this.showLoader = false;
    //     console.log("Error: ", error);
    //     this.RecvbBinvalue = "";
    //   }
    // );
  }
}
