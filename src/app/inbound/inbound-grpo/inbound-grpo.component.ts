import { Component, OnInit } from '@angular/core';
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
import { ConfirmdialogService } from 'src/app/common/confirm-dialog/confirmdialog.service';

@Component({
  selector: 'app-inbound-grpo',
  templateUrl: './inbound-grpo.component.html',
  styleUrls: ['./inbound-grpo.component.scss']
})
export class InboundGRPOComponent implements OnInit {

  openPOLineModel: OpenPOLinesModel[] = [];
  Ponumber: any;
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
  showLookupLoader = true;
  viewLines: any[];
  //getLookupValue: any[];
  public value: Date = new Date();
  searlNo: any = "";
  MfrSerial: any = "";
  expiryDate: string = "";
  isNonTrack: boolean = false;
  isSerial: boolean = false;
  serialNoTitle: string = "";
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

  constructor(private inboundService: InboundService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent, private confDialogService: ConfirmdialogService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    this.openPOLineModel[0] = this.inboundMasterComponent.openPOmodel;
    if (this.openPOLineModel != undefined && this.openPOLineModel != null) {
      this.Ponumber = this.openPOLineModel[0].DOCENTRY;
      this.tracking = this.openPOLineModel[0].TRACKING;
      this.OpenQty = this.openPOLineModel[0].OPENQTY;
      this.showScanInput = true;
      if (this.tracking == "S") {
        this.isSerial = true;
        this.serialNoTitle = this.translate.instant("Serial");
      } else if (this.tracking == "N") {
        this.isNonTrack = true;
        this.showScanInput = false;
      } else if (this.tracking == "B") {
        this.isSerial = false;
        this.isNonTrack = false;
        this.serialNoTitle = this.translate.instant("Batch");
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
      quantitySum += Number(this.recvingQuantityBinArray[i].Quantity);
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
          this.addBatchSerialQty(autoLots, this.qty);
          let result = this.recvingQuantityBinArray.find(element => element.searlNo == this.searlNo);
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
  }

  batchCalculation(autoLots: AutoLot[], qty: any) {
    this.addBatchSerialQty(autoLots, this.qty);
    let result = this.recvingQuantityBinArray.find(element => element.searlNo == this.searlNo);
    if (result == undefined) {
      this.recvingQuantityBinArray.push(new RecvingQuantityBin(this.MfrSerial, this.searlNo, qty, this.RecvbBinvalue, this.expiryDate));
    } else {
      this.batchCalculation(autoLots, this.qty);
    }
  }
  addNonTrackQty(qty: any) {
    let result = this.recvingQuantityBinArray.find(element => element.Bin == this.RecvbBinvalue);
    if (result == undefined) {
      this.recvingQuantityBinArray.push(new RecvingQuantityBin(this.MfrSerial, this.searlNo, qty, this.RecvbBinvalue, this.expiryDate));
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
          var strlength = autoLots[i].STRING.length;
          var numberLength = (parseInt(autoLots[i].STRING)).toString().length;
          var finlNumber = parseInt(autoLots[i].STRING) + 1
          var finalString = this.forwardZero(finlNumber, strlength - numberLength);
          this.searlNo = this.searlNo + finalString;
          // this.inboundMasterComponent.autoLots[i].STRING = finalString;
          this.LastSerialNumber[i] = finalString;
          this.LineId[i] = autoLots[i].LineId;
          autoLots[i].STRING = finalString;
        } else {
          var finalString = autoLots[i].STRING;
          this.searlNo = this.searlNo + finalString;
          this.LastSerialNumber[i] = finalString;
          this.LineId[i] = autoLots[i].LineId;
        }
      }
      if (autoLots[i].OPRTYPE == "2" && autoLots[i].OPERATION == "3") {
        if (this.recvingQuantityBinArray.length > 0) {
          var strlength = autoLots[i].STRING.length;
          var numberLength = (parseInt(autoLots[i].STRING)).toString().length;
          var finlNumber = parseInt(autoLots[i].STRING) - 1
          var finalString = this.forwardZero(finlNumber, strlength - numberLength);
          this.searlNo = this.searlNo + finalString;
          autoLots[i].STRING = finalString;
        } else {
          var finalString = autoLots[i].STRING;
          this.searlNo = this.searlNo + finalString;
        }
      }
    }
  }

  deleteButtonConfirmation(rowindex, gridData: any) {
    if (confirm()) {
      console.log("Implement delete functionality here");
      this.DeleteRowClick(rowindex, gridData);
    }
  }

  public openConfirmationDialog(rowindex, gridData: any) {

    if (confirm("Are you sure to delete ?")) {
      this.DeleteRowClick(rowindex, gridData);
    }

    // this.confDialogService.confirm('Please confirm..', 'Do you really want to ... ?')
    // .then((confirmed) => console.log('User confirmed:', confirmed))
    // .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
    // this.DeleteRowClick(rowindex,gridData); 
  }

  forwardZero(num: number, size: number): string {
    let s = num + "";
    size = size + s.length;
    while (s.length < size) s = "0" + s;
    return s;
  }

  save() {
    var oSubmitPOLotsObj: any = this.prepareSubmitPurchaseOrder();
    this.inboundMasterComponent.savePOLots(oSubmitPOLotsObj);
    this.inboundMasterComponent.inboundComponent = 2;
  }

  receive(e) {
    alert("Do you want to print all labels after submit ?");
    var oSubmitPOLotsObj = this.prepareSubmitPurchaseOrder();
    this.SubmitGoodsReceiptPO(oSubmitPOLotsObj);
  }

  prepareSubmitPurchaseOrder(): any {
    var oSubmitPOLotsObj: any = {};
    oSubmitPOLotsObj.POReceiptLots = [];
    oSubmitPOLotsObj.POReceiptLotDetails = [];
    oSubmitPOLotsObj.UDF = [];
    oSubmitPOLotsObj.LastSerialNumber = [];

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
      UOM: this.openPOLineModel[0].UOM,
      GUID: localStorage.getItem("GUID"),
      UsernameForLic: localStorage.getItem("UserId")
      //------end Of parameter For License----
    });

    oSubmitPOLotsObj.UDF.push({
      Key: "OPTM_TARGETWHS",//UDF[iIndex].Key,
      Value: this.targetWhse,
      //LotNo: UDF[iIndex].LotNo,
      Flag: 'D', // D = Line, H= Header, L = Lots
      LineNo: 0
    });
    oSubmitPOLotsObj.UDF.push({
      Key: "OPTM_TARGETBIN",//UDF[iIndex].Key,
      Value: this.targetBin,
      //LotNo: UDF[iIndex].LotNo,
      Flag: 'D', // D = Line, H= Header, L = Lots
      LineNo: 0
    });


    for (var iBtchIndex = 0; iBtchIndex < this.recvingQuantityBinArray.length; iBtchIndex++) {
      oSubmitPOLotsObj.POReceiptLotDetails.push({
        Bin: this.recvingQuantityBinArray[iBtchIndex].Bin,
        LineNo: this.openPOLineModel[0].LINENUM,
        LotNumber: this.recvingQuantityBinArray[iBtchIndex].searlNo, //getUpperTableData.GoodsReceiptLineRow[iBtchIndex].SysSerNo,
        LotQty: this.recvingQuantityBinArray[iBtchIndex].Quantity.toString(),
        SysSerial: "0",
        ExpireDate: "",//GetSubmitDateFormat(getUpperTableData.GoodsReceiptLineRow[iBtchIndex].EXPDATE), // oCurrentController.GetSubmitDateFormat(oActualGRPOModel.PoDetails[iIndex].ExpireDate),//oActualGRPOModel.PoDetails[iIndex].ExpireDate,
        VendorLot: this.recvingQuantityBinArray[iBtchIndex].MfrSerial,
        //NoOfLabels: oActualGRPOModel.PoDetails[iIndex].NoOfLabels,
        //Containers: piContainers,
        SuppSerial: this.recvingQuantityBinArray[iBtchIndex].MfrSerial,
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


  //   GetSubmitDateFormat (EXPDATE) {
  //     if (EXPDATE == "" || EXPDATE == null)
  //         return EXPDATE;
  //     else {
  //         var d = new Date(EXPDATE);
  //         var day;

  //         if (d.getDate().toString().length < 2) {
  //             day = "0" + d.getDate();
  //         }
  //         else {
  //             day = d.getDate();
  //         }


  //         var mth;
  //         if ((d.getMonth() + 1).toString().length < 2) {
  //             mth = "0" + (d.getMonth() + 1).toString();
  //         }
  //         else {
  //             mth = d.getMonth() + 1;
  //         }
  //         // return day + ":" + mth + ":" + d.getFullYear();
  //         return mth + "/" + day + "/" + d.getFullYear();
  //     }
  // }

  SubmitGoodsReceiptPO(oSubmitPOLotsObj: any) {
    this.inboundService.SubmitGoodsReceiptPO(oSubmitPOLotsObj).subscribe(
      (data: any) => {
        console.log(data);
        if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
          // alert("Goods Receipt PO generated successfully with Doc No: " + data.DocEntry);
          this.toastr.success('', this.translate.instant("GRPOSuccessMessage" + data.DocEntry));
          this.inboundMasterComponent.inboundComponent = 2;
        } else if (data[0].ErrorMsg == "7001") {
          this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
            this.translate.instant("CommonSessionExpireMsg"));
          return;
        }
        else {
          // alert(data[0].ErrorMsg);
          this.toastr.success('', data[0].ErrorMsg);
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

}
