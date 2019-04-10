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

  dialogMsg:string="Do you want to delete?"
  yesButtonText:string = "Yes";
  noButtonText:string = "No";
  openPOLineModel: OpenPOLinesModel[] = [];
  Ponumber: any;
  ItemCode: any;
  OpenQty: number;
  tracking: string = "";
  RecvbBinvalue: any = "";
  uomSelectedVal: UOM;
  UOMList: UOM[];
  qty: number;
  showButton: boolean = false;
  recvingQuantityBinArray: RecvingQuantityBin[] = [];
  defaultRecvBin: boolean = false;
  serviceData: any[];
  lookupfor: string;
  showLookupLoader = false;
  viewLines: any[];
  //getLookupValue: any[];
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

  showConfirmDialog:boolean;
  rowindexForDelete:any;
  gridDataAfterDelete:any[];


  @ViewChild('Quantity') QuantityField;
  constructor(private inboundService: InboundService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {

    this.openPOLineModel[0] = this.inboundMasterComponent.openPOmodel;
    //update below variable with local storage data
    //previousReceivedQty:number = 0;
    // also update this.openPOLineModel[0].RPTQTY with local storage value
    if (this.openPOLineModel != undefined && this.openPOLineModel != null) {
      this.Ponumber = this.openPOLineModel[0].DOCENTRY;
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
  
 

  setLocalStringForBatch() {
    this.serialNoTitle = this.translate.instant("SerialNo");
    this.mfrRadioText = this.translate.instant("MfrBatch");
    this.sysRadioText = this.translate.instant("SysBatch");
    this.scanInputPlaceholder = this.translate.instant("ScanBatch");
    this.mfrGridColumnText = this.translate.instant("MfrBatchNo");
    this.SRBatchColumnText = this.translate.instant("BatchNo");
  }
  setLocalStringForSerial() {
    this.serialNoTitle = this.translate.instant("SerialNo");
    this.mfrRadioText = this.translate.instant("MfrSerial");
    this.sysRadioText = this.translate.instant("SysSerial");
    this.scanInputPlaceholder = this.translate.instant("ScanSerial");
    this.mfrGridColumnText = this.translate.instant("MfrSerialNo");
    this.SRBatchColumnText = this.translate.instant("SerialNo");
  }

  /**
    * Method to get list of inquries from server.
   */
  public ShowBins() {
    this.targetBinClick = false;
    this.inboundService.getRevBins(this.openPOLineModel[0].QCREQUIRED).subscribe(
      (data: any) => {
        console.log(data);
        if (data != null) {
          if (this.defaultRecvBin == true) {
            this.RecvbBinvalue = data[0].BINNO;
            this.defaultRecvBin = false
          }
          else {
            if (data.length > 0) {
              console.log(data);
              this.showLookupLoader = false;
              this.serviceData = data;
              this.lookupfor = "RecvBinList";
              return;
            }
            else {
              this.toastr.error('', this.translate.instant("NoBinsAvailableMsg"));
            }
          }
        }
      },
      error => {
        console.log("Error: ", error);
      }
    );
  }


  OnBinChange() {
    if (this.RecvbBinvalue == "") {
      return;
    }
    this.inboundService.binChange(this.RecvbBinvalue).subscribe(
      (data: any) => {
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
        console.log("Error: ", error);
        this.RecvbBinvalue = "";
      }
    );
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
    this.inboundService.getUOMs(this.openPOLineModel[0].ITEMCODE).subscribe(
      (data: any) => {
        console.log(data);
        this.openPOLineModel[0].UOMList = data;
        if (this.openPOLineModel[0].UOMList.length > 0) {
          this.uomSelectedVal = this.openPOLineModel[0].UOMList[0];
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
    if (quantitySum > Number(this.OpenQty)) {
      this.toastr.error('', this.translate.instant("NoOpenQuantity"));
      this.qty = 0;
      return false;
    } else {
      return true;
    }
  }

  addQuantity() {
    if (this.qty == 0 || this.qty == undefined) {
      this.toastr.error('', this.translate.instant("EnterQuantityErrMsg"));
      return;
    }
    if (this.RecvbBinvalue == "" || this.RecvbBinvalue == undefined) {
      this.toastr.error('', this.translate.instant("INVALIDBIN"));
      return;
    }
    if (!this.validateQuantity()) {
      return;
    }
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
            this.addBatchSerialQty(autoLots, this.qty);
          }
          let result = this.recvingQuantityBinArray.find(element => element.LotNumber == this.searlNo);
          if (result == undefined) {
            this.recvingQuantityBinArray.push(new RecvingQuantityBin(this.MfrSerial, this.searlNo, 1, this.RecvbBinvalue, this.expiryDate));
            this.qty = this.qty - 1;
          }
        }
      } else {
        this.batchCalculation(autoLots, this.qty);
      }
    }
    this.qty = undefined;
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
    }

    let result = this.recvingQuantityBinArray.find(element => element.LotNumber == this.searlNo);
    if (result == undefined) {
      this.recvingQuantityBinArray.push(new RecvingQuantityBin(this.MfrSerial, this.searlNo, qty, this.RecvbBinvalue, this.expiryDate));
    } else {
      this.batchCalculation(autoLots, this.qty);
    }
  }
  addNonTrackQty(qty: any) {
    let result = this.recvingQuantityBinArray.find(element => element.Bin == this.RecvbBinvalue);
    if (result == undefined) {
      this.recvingQuantityBinArray.push(new RecvingQuantityBin("", "", qty, this.RecvbBinvalue, this.expiryDate));
      this.showButton = true;
    } else {
      this.toastr.error('', this.translate.instant("BinValidation"));
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
          // var strlength = autoLots[i].STRING.length;
          // var numberLength = (parseInt(autoLots[i].STRING)).toString().length;
          // var finlNumber = parseInt(autoLots[i].STRING) + 1
          // var finalString = this.forwardZero(finlNumber, strlength - numberLength);

          var finalString = this.getAutoLotStringOPR2(autoLots[i].STRING);
          autoLots[i].STRING = finalString;
          this.searlNo = this.searlNo + finalString;
          this.LastSerialNumber[0] = this.getAutoLotStringOPR2(finalString);
          this.LineId[0] = autoLots[i].LINEID;

        } else {
          var finalString = autoLots[i].STRING;
          this.searlNo = this.searlNo + finalString;
          this.LastSerialNumber[0] = this.getAutoLotStringOPR2(finalString);
          this.LineId[0] = autoLots[i].LINEID;
        }
      }
      if (autoLots[i].OPRTYPE == "2" && autoLots[i].OPERATION == "3") {
        if (this.recvingQuantityBinArray.length > 0) {
          var finalString = this.getAutoLotStringOPR3(autoLots[i].STRING);
          this.searlNo = this.searlNo + finalString;
          autoLots[i].STRING = finalString;
          this.LastSerialNumber[0] = this.getAutoLotStringOPR3(autoLots[i].STRING);
          this.LineId[0] = autoLots[i].LINEID;
        } else {
          var finalString = autoLots[i].STRING;
          this.searlNo = this.searlNo + finalString;
          this.LastSerialNumber[0] = this.getAutoLotStringOPR3(autoLots[i].STRING);
          this.LineId[0] = autoLots[i].LINEID;
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
    this.dialogMsg =  this.translate.instant("DoYouWantToDelete")
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
          //do something. //yes mean all click
          this.prepareAllData();  
          break;
      }
    } else {
      if ($event.Status == "cancel") {
        // when user click on cross button nothing to do.
      } else { 
        //means user click on negative button
        if ($event.From == "recCurrentOrAll") {

          this.submitCurrentGRPO();
        } 
      }
    }
  }

submitCurrentGRPO(){
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
    size = size + s.length;
    while (s.length < size) s = "0" + s;
    return s;
  }

  save() {

    this.prepareCommonData();
    //after save redirect to previous page.
    this.inboundMasterComponent.inboundComponent = 2;
  }

  prepareCommonData(){
    var oSubmitPOLotsObj: any = {};
    var dataModel = localStorage.getItem("GRPOReceieveData");
    if(dataModel == null|| dataModel == undefined || dataModel == ""){
      //this.oSubmitPOLotsArray = [];

      oSubmitPOLotsObj.POReceiptLots = [];
      oSubmitPOLotsObj.POReceiptLotDetails = [];
      oSubmitPOLotsObj.UDF = [];
      oSubmitPOLotsObj.LastSerialNumber = [];
    }else{
      oSubmitPOLotsObj = JSON.parse(dataModel);
    }
    var oSubmitPOLotsObj = this.prepareSubmitPurchaseOrder(oSubmitPOLotsObj);
    localStorage.setItem("GRPOReceieveData", JSON.stringify(oSubmitPOLotsObj));
  }

  public tempPOLotsArray: any[] = []; 
  prepareAllData(){
    this.prepareCommonData();
     // club multiple items in single object.
    // var oSubmitPOLotsObj: any = {};
    // oSubmitPOLotsObj.POReceiptLots = [];
    // oSubmitPOLotsObj.POReceiptLotDetails = []; 
    // oSubmitPOLotsObj.UDF = []; 
    // oSubmitPOLotsObj.LastSerialNumber = [];
    // for(var i=0; i<this.oSubmitPOLotsArray.length; i++){
    //   var submitData = this.oSubmitPOLotsArray[i];
    //   oSubmitPOLotsObj.POReceiptLots = submitData.POReceiptLots;
    //   oSubmitPOLotsObj.POReceiptLotDetails = submitData.POReceiptLotDetails;
    //   oSubmitPOLotsObj.UDF =submitData.UDF;
    //   oSubmitPOLotsObj.LastSerialNumber = submitData.LastSerialNumber;
    //   this.tempPOLotsArray.push(oSubmitPOLotsObj);
    // } 
    var dataModel = localStorage.getItem("GRPOReceieveData");
    if(dataModel != null && dataModel != undefined && dataModel != ""){
      this.SubmitGoodsReceiptPO(JSON.parse(dataModel));
    }
    
    
  }

  

  showSavedDataToGrid(){
    this.openPOLineModel[0] = this.inboundMasterComponent.openPOmodel;
    if (this.openPOLineModel != undefined && this.openPOLineModel != null) {

    }
    var oSubmitPOLots: any = {};
    var dataModel = localStorage.getItem("GRPOReceieveData");
    if(dataModel == null|| dataModel == undefined || dataModel == ""){
      this.oSubmitPOLotsArray = []; 
    }else{
      oSubmitPOLots = JSON.parse(dataModel); 
    }
    if(oSubmitPOLots != null && oSubmitPOLots != undefined && oSubmitPOLots.POReceiptLots != null &&
      oSubmitPOLots.POReceiptLots != undefined && oSubmitPOLots.POReceiptLots != "" 
      && oSubmitPOLots.POReceiptLots.length>0){
      for(var i=0; i<oSubmitPOLots.POReceiptLots.length; i++ ){
        if(oSubmitPOLots.POReceiptLots[i].PONumber == this.Ponumber &&
          oSubmitPOLots.POReceiptLots[i].ItemCode == this.ItemCode &&
          oSubmitPOLots.POReceiptLots[i].Tracking == this.tracking ){

            for(var i=0; i<oSubmitPOLots.POReceiptLotDetails.length; i++ ){
              if(oSubmitPOLots.POReceiptLotDetails[i].POItemCode == this.Ponumber+this.ItemCode){
                this.recvingQuantityBinArray.push(oSubmitPOLots.POReceiptLotDetails[i]);
                this.previousReceivedQty = Number(this.previousReceivedQty) + Number(oSubmitPOLots
                  .POReceiptLotDetails[i].LotQty);
              }
            }
          }
      }
      // this.updateReceiveQty();
      this.openPOLineModel[0].RPTQTY = this.previousReceivedQty;
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
  manageRecords(oSubmitPOLotsObj: any): any{
    var size = oSubmitPOLotsObj.POReceiptLots.length;  
    for(var i=0; i<size; i++){
      if(oSubmitPOLotsObj.POReceiptLots[i].PONumber == this.Ponumber && 
        oSubmitPOLotsObj.POReceiptLots[i].ItemCode == this.openPOLineModel[0].ITEMCODE && 
        oSubmitPOLotsObj.POReceiptLots[i].LineNo == this.openPOLineModel[0].LINENUM){
          oSubmitPOLotsObj.POReceiptLots.splice(i, 1); 
           var s = oSubmitPOLotsObj.POReceiptLotDetails.length;
          for(var i=0; i<oSubmitPOLotsObj.POReceiptLotDetails.length; i++ ){
            if(oSubmitPOLotsObj.POReceiptLotDetails[i].POItemCode == this.Ponumber+this.ItemCode){
              oSubmitPOLotsObj.POReceiptLotDetails.splice(i, 1);
              i = -1;
            }
          }        
          
          // oSubmitPOLotsObj.POReceiptLotDetails.forEach(element => {
          //   if(oSubmitPOLotsObj.POReceiptLotDetails[i].POItemCode == this.Ponumber+this.ItemCode){
          //     oSubmitPOLotsObj.POReceiptLotDetails.splice(i, 1);
          //   }
          // });
          oSubmitPOLotsObj.UDF.splice(i, 1); 
          oSubmitPOLotsObj.LastSerialNumber.splice(i, 1); 
          // this.oSubmitPOLotsArray.splice(i, 1); 
      } 
    }
    return oSubmitPOLotsObj;
  }

  receive(e) {
    var dataModel = localStorage.getItem("GRPOReceieveData");
    if(dataModel == null|| dataModel == undefined || dataModel == ""){
      this.submitCurrentGRPO();
    }else{
      this.yesButtonText = this.translate.instant("All");
      this.noButtonText = this.translate.instant("Current");
      this.dialogFor = "recCurrentOrAll";
      this.dialogMsg =  this.translate.instant("ReceiveCurrentOrAll")
      this.showConfirmDialog = true; // show dialog
    }
  //  alert("Do you want to print all labels after submit ?");
    
    
  }

  prepareSubmitPurchaseOrder(oSubmitPOLotsObj : any): any {
    oSubmitPOLotsObj = this.manageRecords(oSubmitPOLotsObj);

    oSubmitPOLotsObj.POReceiptLots.push({
      DiServerToken: localStorage.getItem("Token"),
      PONumber: this.Ponumber,
      CompanyDBId: localStorage.getItem("CompID"),
      LineNo: this.openPOLineModel[0].LINENUM,
      ShipQty: this.openPOLineModel[0].RPTQTY.toString(),
      OpenQty: this.openPOLineModel[0].OPENQTY,
      WhsCode: localStorage.getItem("whseId"),
      Tracking: this.openPOLineModel[0].TRACKING,
      ItemCode: this.openPOLineModel[0].ITEMCODE,
      LastSerialNumber: 0,
      Line: 0,
      UOM: this.uomSelectedVal.UomEntry,
      GUID: localStorage.getItem("GUID"),
      UsernameForLic: localStorage.getItem("UserId")
      //------end Of parameter For License----
    });
    oSubmitPOLotsObj.UDF = [];  
    // oSubmitPOLotsObj.UDF.push({
    //   Key: "OPTM_TARGETWHS",//UDF[iIndex].Key,
    //   Value: this.targetWhse,
    //   //LotNo: UDF[iIndex].LotNo,
    //   Flag: 'D', // D = Line, H= Header, L = Lots
    //   LineNo: 0
    // });
    // oSubmitPOLotsObj.UDF.push({
    //   Key: "OPTM_TARGETBIN",//UDF[iIndex].Key,
    //   Value: this.targetBin,
    //   //LotNo: UDF[iIndex].LotNo,
    //   Flag: 'D', // D = Line, H= Header, L = Lots
    //   LineNo: 0
    // });


    for (var iBtchIndex = 0; iBtchIndex < this.recvingQuantityBinArray.length; iBtchIndex++) {
      oSubmitPOLotsObj.POReceiptLotDetails.push({ 
        POItemCode: this.Ponumber+this.openPOLineModel[0].ITEMCODE,
        Bin: this.recvingQuantityBinArray[iBtchIndex].Bin,
        LineNo: this.openPOLineModel[0].LINENUM,
        LotNumber: this.recvingQuantityBinArray[iBtchIndex].LotNumber, //getUpperTableData.GoodsReceiptLineRow[iBtchIndex].SysSerNo,
        LotQty: this.recvingQuantityBinArray[iBtchIndex].LotQty.toString(),
        SysSerial: "0",
        ExpireDate: this.GetSubmitDateFormat(this.expiryDate),//GetSubmitDateFormat(getUpperTableData.GoodsReceiptLineRow[iBtchIndex].EXPDATE), // oCurrentController.GetSubmitDateFormat(oActualGRPOModel.PoDetails[iIndex].ExpireDate),//oActualGRPOModel.PoDetails[iIndex].ExpireDate,
        VendorLot: this.recvingQuantityBinArray[iBtchIndex].VendorLot,
        //NoOfLabels: oActualGRPOModel.PoDetails[iIndex].NoOfLabels,
        //Containers: piContainers,
        SuppSerial: this.recvingQuantityBinArray[iBtchIndex].VendorLot,
        ParentLineNo: 0
        //InvType: oActualGRPOModel.GoodsReceiptLineRow[iIndex].LotStatus,
      });
    }

    for (var iLastIndexNumber = 0; iLastIndexNumber < this.LastSerialNumber.length; iLastIndexNumber++) {
      oSubmitPOLotsObj.LastSerialNumber.push({
        LastSerialNumber: this.LastSerialNumber[iLastIndexNumber],
        LineId: this.LineId[iLastIndexNumber],
        ItemCode: this.openPOLineModel[0].ITEMCODE
      });
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
      // return day + ":" + mth + ":" + d.getFullYear();
      return mth + "/" + day + "/" + d.getFullYear();
    }
  }

  SubmitGoodsReceiptPO(oSubmitPOLotsObj: any) {
    this.inboundService.SubmitGoodsReceiptPO(oSubmitPOLotsObj).subscribe(
      (data: any) => {
        console.log(data);
        if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
          // alert("Goods Receipt PO generated successfully with Doc No: " + data.DocEntry);
          this.toastr.success('', this.translate.instant("GRPOSuccessMessage") + data[0].DocEntry);
          this.inboundMasterComponent.inboundComponent = 2;
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
        console.log("Error: ", error);
        // alert("fail");
      }
    );
  }

  cancel() {
    this.inboundMasterComponent.inboundComponent = 2;
  }

  DeleteRowClick(rowindex, gridData: any) {

    if (this.recvingQuantityBinArray.length > 0) {
      this.showButton = true;
    } else {
      this.showButton = false;
    }
    if (this.recvingQuantityBinArray.length > 0) {
      var qtyForRemove = this.recvingQuantityBinArray[rowindex].LotQty;
      if (this.openPOLineModel[0].RPTQTY > qtyForRemove) {
        this.openPOLineModel[0].RPTQTY = this.openPOLineModel[0].RPTQTY - qtyForRemove;
      } 
    } 
    this.recvingQuantityBinArray.splice(rowindex, 1);
    gridData.data = this.recvingQuantityBinArray;
  }


  // item section.
  /**
  * Method to get list of inquries from server.
  */
  public getTargetWhseList() {

    this.targetWhseSubs = this.inboundService.getQCTargetWhse().subscribe(
      data => {
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
    this.targetBinSubs = this.inboundService.getRevBins("N").subscribe(
      (data: any) => {
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
            this.toastr.error('', this.translate.instant("NoBinsAvailableMsg"));
          }
        }
      },
      error => {
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

    }
  }

  OnTargetBinChange() {
    if (this.targetBin == "") {
      return;
    }
    this.inboundService.binChange(this.targetBin).subscribe(
      (data: any) => {
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
        console.log("Error: ", error);
        this.targetBin = "";
      }
    );
  }

  onQCWHSChange() {
    if (this.targetWhse == "") {
      return;
    }
    this.inboundService.isWHSExists(this.targetWhse).subscribe(
      (data: any) => {
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
        console.log("Error: ", error);
        this.targetWhse = "";
      }
    );
  }

  onGS1ItemScan() {
    if (this.ScanInputs != null && this.ScanInputs != undefined &&
      this.ScanInputs != "" && this.ScanInputs != "error decoding QR Code") {

    } else {
      // if any message is required to show then show.
      this.ScanInputs = "";
      return;
    }
    this.openPOLineModel;
    let piManualOrSingleDimentionBarcode = 0;
    this.inboundService.checkAndScanCode(this.openPOLineModel[0].CardCode, this.ScanInputs).subscribe(
      (data: any) => {
        console.log(data);
        if (data != null) {
          if (data.Error != null) {
            if (data.Error == "Invalidcodescan") {
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
          this.addQuantity();
        }
      },
      error => {
        console.log("Error: ", error);
        this.targetWhse = "";
      });

  }

}
