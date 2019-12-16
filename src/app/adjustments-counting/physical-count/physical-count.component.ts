import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PhysicalcountService } from 'src/app/services/physicalcount.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { TranslateService, LangChangeEvent } from '../../../../node_modules/@ngx-translate/core';
import { ToastrService } from '../../../../node_modules/ngx-toastr';

@Component({
  selector: 'app-physical-count',
  templateUrl: './physical-count.component.html',
  styleUrls: ['./physical-count.component.scss']
})
export class PhysicalCountComponent implements OnInit {
  showLoader: boolean = false;
  showLookupLoader: boolean = false;
  serviceData: any[];
  lookupfor: string;
  DocNo: string = "";
  DocEntry: string = "";
  CountDate: string;
  ItemCode: string;
  ItemName: string;
  BinNo: string = "";
  SerialNo: string = "";
  CountedQty: string = "0";
  UOM: string;
  ItemTracking: string = "";
  batchNoPlaceholder: string;
  batchSrBtn: string;
  isNonTrack: boolean = false;
  IsteamCount: string = "";
  batchserno: string = "";
  QtyOnHand: string = "0";
  showItemName: string = "";
  showConfirmDialog: boolean = false;
  SavedDocNoDetailArray: any[] = [];
  dialogMsg: string = ""
  yesButtonText: string = "";
  noButtonText: string = "";
  dialogFor: string = "";
  isCounted: boolean = false;
  CountType: string;
  DocNoDetails: any;
  isLotAdded: boolean = false;
  LotSerialQtycheck: Number = 0;
  showSavedItems = false;
  showbatchser = false;
  showitemlist = false;
  // Kendo Dialog box
  public dialogOpened = false;
  BatchSerialArray: any = [];
  ItemArray: any = [];
  rowindex: any;
  gridData: any;
  ScanInputs: any = "";

  pagable: boolean = false;
  pageSize: number = Commonservice.pageSize;
  ItemCodeTemp: string;
  trackingtemp: string;
  scanPlaceholder: string = "Scan";

  constructor(private phycountService: PhysicalcountService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    localStorage.setItem("PhysicalCountData", "");
    this.getPhysicalCountData();
  }

  getPhysicalCountData() {
    this.showLoader = true;
    this.phycountService.getPhysicalCountDataView().subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != undefined) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = true;
          for (var i = 0; i < data.length; i++) {
            data[i].InWhsQty = Number(data[i].InWhsQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
          }
          this.serviceData = data;
          this.lookupfor = "PhyCntItemList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          this.onCancelClick();
        }
      },
      error => {
        this.showLoader = false;
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      }
    );
  }

  onItemlookupClick() {
    this.showLoader = true;
    this.phycountService.getItemList(this.DocNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != undefined) {
          if (data.ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = true;
          this.serviceData = data;
          this.lookupfor = "showPhyCntItemsList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLoader = false;
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      }
    );
  }

  ShowBatachSerList() {
    this.phycountService.ShowBILOTList(this.ItemCode, this.BinNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != undefined) {
          if (data.ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data.length > 0) {
            this.showLookupLoader = true;
            for (var i = 0; i < data.length; i++) {
              data[i].TOTALQTY = Number(data[i].TOTALQTY).toFixed(Number(localStorage.getItem("DecimalPrecision")));
            }
            this.serviceData = data;
            this.lookupfor = "ShowBatachSerList";
          } else {
            this.toastr.error('', this.translate.instant("PhyCount_BinTransfer.NoData"));
          }
        } else {
          this.toastr.error('', this.translate.instant("PhyCount_BinTransfer.NoData"));
        }
      },
      error => {
        this.showLoader = false;
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      }
    );
  }

  OnItemChange() {
    var inputValue = (<HTMLInputElement>document.getElementById('itemCodeInputPC')).value;
    if (inputValue.length > 0) {
      this.ItemCode = inputValue;
    }

    if (this.ItemCode == "" || this.ItemCode == undefined) {
      return;
    }
    this.showLoader = true;
    this.phycountService.getItemInfo(this.ItemCode, this.DocNo, this.DocEntry).subscribe(
      data => {
        this.showLoader = false;
        if (data != null) {
          if (data.length > 0) {

            this.ItemCode = data[0].ITEMCODE;
            this.ItemName = data[0].ITEMNAME;
            this.UOM = data[0].UomCode;
            this.ItemTracking = data[0].TRACKING;
            this.batchserno = "";
            this.CheckTrackingandVisiblity();
          }
          else {
            this.toastr.error('', this.translate.instant("PhyCount_GoodsIssue.INVALIDITEM"));
            this.ItemCode = "";
            this.ItemName = "";
            this.ItemTracking = "";
          }
        }
        else {
          this.toastr.error('', this.translate.instant("PhyCount_GoodsIssue.INVALIDITEM"));
          this.ItemCode = "";
          this.ItemName = "";
          this.ItemTracking = "";
        }
      },
      error => {
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      }
    );
  }


  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;
    if ($event.Status == "yes") {
      switch ($event.From) {
        case ("addBatchSer"):
          this.isLotAdded = true;
          break;
        case ("DeleteItem"):
          this.ItemListRowDelete();
          break;

        case ("DeleteLot"):
          this.LotSerialDelete();
          break;
        case ("overwrite"):
          this.LotSerialQtycheck = 2;
          break;
        case ("SubmitAll"):
          this.onSubmitClick();
          break;
      }
    } else {
      if ($event.Status == "no") {
        switch ($event.From) {
          case ("addBatchSer"):
            this.isLotAdded = false;
            break;
          case ("DeleteItem"):
            break;
          case ("DeleteLot"):
            break;
          case ("overwrite"):
            if (this.ItemTracking == "S") {
              this.LotSerialQtycheck = 2;
            } else if (this.ItemTracking == "B") {
              this.LotSerialQtycheck = 1;
            }
            break;
        }
      }
    }
  }

  LotExistCheck() {
    if (this.ItemTracking == "S") {
      this.showDialog("addBatchSer", this.translate.instant("yes"), this.translate.instant("no"),
        this.translate.instant("PhyCount_LotvalidSerial"));
      this.CountedQty = "1";
      this.formatCountedQty();
    }
    if (this.ItemTracking == "B") {
      this.showDialog("addBatchSer", this.translate.instant("yes"), this.translate.instant("no"),
        this.translate.instant("PhyCount_LotvalidBatch"));
    }
  }

  showDialog(dialogFor: string, yesbtn: string, nobtn: string, msg: string) {
    this.dialogFor = dialogFor;
    this.yesButtonText = yesbtn;
    this.noButtonText = nobtn;
    this.showConfirmDialog = true;
    this.dialogMsg = msg;
  }

  OnLotChange(savenext?: string) {

    var inputValue = (<HTMLInputElement>document.getElementById('batchSerialInputPC')).value;
    if (inputValue.length > 0) {
      this.batchserno = inputValue;
    }


    if (this.batchserno == "" || this.batchserno == undefined) {
      return;
    }
    this.showLoader = true;
    this.phycountService.IslotExist(this.BinNo, this.ItemCode, this.batchserno).subscribe(
      data => {
        this.showLoader = false;
        if (data != null) {
          if (data.length == "0") {
            if (this.ItemTracking != "N") {
              this.LotExistCheck();
            }
          }
          else {
            this.batchserno = data[0].LOTNO;
            this.BinNo = data[0].BINNO;
            this.ItemCode = data[0].ITEMCODE;
            this.ItemName = data[0].ITEMNAME;
            this.QtyOnHand = data[0].TOTALQTY;
            this.CountedQty = data[0].TOTALQTY;
            this.ItemTracking = data[0].TRACKING;
            this.CheckTrackingandVisiblity();
            this.formatCountedQty();
            this.formatOnHandQty();
            if (savenext == "savenext") {
              this.onSaveClick(true)
            }
          }
        }

      },
      error => {
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      }
    );
  }

  GetSavedDocNoDetails() {
    this.showLoader = true;
    this.phycountService.GetSavedDocNoDetails(this.DocNo, this.ItemCode, this.BinNo, this.IsteamCount).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != undefined) {
          if (data.ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          for (var i = 0; i < data.length; i++) {
            if (data[i].OPTM_LOTSERQTY != null) {
              data[i].OPTM_LOTSERQTY = data[i].OPTM_LOTSERQTY.toFixed(Number(localStorage.getItem("DecimalPrecision")));
            }
          }
          this.SavedDocNoDetailArray = data;
          if (this.SavedDocNoDetailArray.length > 0) {
            this.ItemTracking = this.SavedDocNoDetailArray[this.SavedDocNoDetailArray.length - 1].Tracking;
            this.CountType = this.SavedDocNoDetailArray[this.SavedDocNoDetailArray.length - 1].CountType;
            //      this.CountDate = this.SavedDocNoDetailArray[this.SavedDocNoDetailArray.length - 1].CountDate;
            this.UOM = this.SavedDocNoDetailArray[this.SavedDocNoDetailArray.length - 1].UomCode;
            this.CountedQty = this.SavedDocNoDetailArray[this.SavedDocNoDetailArray.length - 1].Qty;
            if (this.SavedDocNoDetailArray.length == 1) {
              this.QtyOnHand = this.SavedDocNoDetailArray[this.SavedDocNoDetailArray.length - 1].Qty;
            }
            this.formatCountedQty();
            this.formatOnHandQty();
            this.CheckTrackingandVisiblity();
          }
          this.GetDocNoDetails();
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLoader = false;
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      }
    );
  }

  GetDocNoDetails() {
    this.phycountService.GetDocNoDetails(this.DocNo, this.CountType, this.IsteamCount).subscribe(
      (data: any) => {
        if (data != undefined) {
          this.DocNoDetails = data;
          var index = 0;
          for (var i = 0; i < this.DocNoDetails.length; i++) {
            if (this.DocNoDetails[i].ItemCode == this.ItemCode) {
              index = i;
            }
          }
          this.ItemTracking = this.DocNoDetails[index].Tracking;
          this.CountType = this.DocNoDetails[index].CountType;
          this.ItemName = this.DocNoDetails[index].ItemDesc;
          this.UOM = this.DocNoDetails[index].UomCode;
          this.CheckTrackingandVisiblity();
        }
      },
      error => {
        this.showLoader = false;
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      }
    );
  }

  getLookupValue($event) {
    if ($event != null && $event == "close") {
      //nothing to do
      return;
    }else{
    if (this.lookupfor == "PhyCntItemList") {
      this.DocNo = $event[0];
      this.DocEntry = $event[1];
      this.CountDate = $event[4];
      this.ItemCode = $event[2];

      this.BinNo = $event[3];
      this.QtyOnHand = $event[5];
      this.IsteamCount = $event[6];
      this.GetSavedDocNoDetails();
    } else if (this.lookupfor == "showPhyCntItemsList") {
      this.ItemCode = $event[0];
      this.ItemName = $event[1];
      this.BinNo = $event[3];
      this.ItemTracking = $event[2];
      this.UOM = $event[4];
      this.CountedQty = "0";
      this.QtyOnHand = "0";
      this.batchserno = "";
      this.CheckTrackingandVisiblity();
    } else if (this.lookupfor == "ShowBatachSerList") {
      this.batchserno = $event[0];
      this.ItemCode = $event[2];
      this.ItemName = $event[3];
      this.ItemTracking = $event[11];
      // this.UOM = $event[19];
      this.CountedQty = $event[7];
      this.QtyOnHand = $event[7];
      this.CheckTrackingandVisiblity();
    }
    this.formatCountedQty();
    this.formatOnHandQty();
  }
  }

  formatCountedQty() {
    this.CountedQty = Number(this.CountedQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
  }

  formatOnHandQty() {
    this.QtyOnHand = Number(this.QtyOnHand).toFixed(Number(localStorage.getItem("DecimalPrecision")));
  }

  CheckTrackingandVisiblity() {
    if (this.ItemTracking == "B") {
      this.isNonTrack = false;
      this.batchNoPlaceholder = this.translate.instant("BatchNo");
      this.batchSrBtn = this.translate.instant("Batch");
      this.scanPlaceholder = this.translate.instant("ScanBatch");
    }
    else if (this.ItemTracking == "S") {
      this.isNonTrack = false;
      this.batchNoPlaceholder = this.translate.instant("SerialNo");
      this.batchSrBtn = this.translate.instant("Serial");
      this.scanPlaceholder = this.translate.instant("ScanSerial");
    }
    else if (this.ItemTracking == "N") {
      this.isNonTrack = true;
    }
    var oAddPhysicalCountData: any = {};
    var dataModel = localStorage.getItem("PhysicalCountData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      oAddPhysicalCountData.Detail = [];
      oAddPhysicalCountData.LotSerial = [];
      oAddPhysicalCountData.ItemList = [];
    } else {
      oAddPhysicalCountData = JSON.parse(dataModel);
    }
    let result = oAddPhysicalCountData.LotSerial.find(element => element.ItemCode == this.ItemCode);
    if (result != undefined) {
      this.showbatchser = true;
    } else {
      this.showbatchser = false;
    }
  }

  onCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

  NextRecord() {
    var isBinAdd = 0;
    var TotalSave = 0;
    var nextIndex;
    var DocDataLength = 0;
    var isDocAdd = 0;
    if (this.DocNoDetails != null) {
      if (this.DocNoDetails.length > 0) {

        var oAddPhysicalCountData: any = {};
        var dataModel = localStorage.getItem("PhysicalCountData");
        if (dataModel == null || dataModel == undefined || dataModel == "") {
          oAddPhysicalCountData.Detail = [];
          oAddPhysicalCountData.LotSerial = [];
          oAddPhysicalCountData.ItemList = [];
        } else {
          oAddPhysicalCountData = JSON.parse(dataModel);
        }
        // oPhysicalCountModel.Detail.sort(function (a, b) { return a.RowOrder - b.RowOrder });
        for (var iCountindex = 0; iCountindex < this.DocNoDetails.length; iCountindex++) {
          if (this.DocNo == this.DocNoDetails[iCountindex].DocNum) {
            DocDataLength++;
          }
        }

        for (var index = 0; index < oAddPhysicalCountData.Detail.length; index++) {
          for (var iPhyindex = 0; iPhyindex < this.DocNoDetails.length; iPhyindex++) {

            if (oAddPhysicalCountData.Detail[index].ItemCode == this.DocNoDetails[iPhyindex].ItemCode && oAddPhysicalCountData.Detail[index].DocNo == this.DocNoDetails[iPhyindex].DocNum && oAddPhysicalCountData.Detail[index].BinNo == this.DocNoDetails[iPhyindex].BinCode) {
              TotalSave++;
              nextIndex = iPhyindex + 1;
              if (nextIndex == this.DocNoDetails.length) {
                nextIndex = 0;
              }
            }
          }
        }

        if (TotalSave == DocDataLength) {
          this.showDialog("SubmitAll", this.translate.instant("yes"), this.translate.instant("no"),
            this.translate.instant("PhyCount_SubmitSaveLines"));
        }
        else {
          this.resetData();
          this.ItemCode = this.DocNoDetails[nextIndex].ItemCode;
          this.ItemName = this.DocNoDetails[nextIndex].ItemName;
          this.BinNo = this.DocNoDetails[nextIndex].BinCode;
          this.UOM = this.DocNoDetails[nextIndex].UomCode;
          this.QtyOnHand = this.DocNoDetails[nextIndex].InWhsQty;
          this.CountedQty = "0"
          this.ItemTracking = this.DocNoDetails[nextIndex].Tracking;
          this.formatCountedQty();
          this.formatOnHandQty();
          this.CheckTrackingandVisiblity();
        }
      }
    }
  }

  SavePhysicalCountData(oAddPhysicalCountData: any) {
    this.showLoader = true;
    this.phycountService.SavePhysicalCountData(oAddPhysicalCountData).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != null) {
          if (data == "True") {
            this.toastr.success('', this.translate.instant("PhyCount_DataSavedSuccessfully"));
            this.QtyOnHand = "0";
            this.CountedQty = "0";
            this.formatCountedQty();
            this.formatOnHandQty();
            this.NextRecord();
            this.showitemlist = true;
          }
          else {
            this.toastr.success('', this.translate.instant("PhyCount_NoDataSaved"));
          }
        }
      },
      error => {
        this.showLoader = false;
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      }
    );
  }

  SubmitPhysicalCount(oAddPhysicalCountData: any) {
    this.showLoader = true;
    this.phycountService.SubmitPhysicalCount(oAddPhysicalCountData).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != null) {
          if (data.length > 0) {
            //--------------------------------------Function to Check for the Licence---------------------------------------
            if (data[0].ErrorMsg != undefined) {
              if (data[0].ErrorMsg.length > 0) {
                if (data[0].ErrorMsg == "7001") {
                  this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                    this.translate.instant("CommonSessionExpireMsg"));
                  return;
                }
              }
            }
            if (data[0].ErrorMsg == "" && data[0].Successmsg != "") {

              this.toastr.success('', this.translate.instant("PhyCount_DocUpdatedSucessfullyMsg") + " " + this.DocEntry);
              this.clearData();
              this.getPhysicalCountData();
              return;
            }
            else {
              if (data.oData[0].ErrorMsg.startsWith("env:Sender-50021470000498 -") == true) {
                data.oData[0].ErrorMsg = data.oData[0].ErrorMsg.split("env:Sender-50021470000498 -")[1]
                data.oData[0].ErrorMsg = data.oData[0].ErrorMsg.split("[INC1.ItemCode]")[0]
              }
              this.toastr.error('', data[0].ErrorMsg);
              return;
            }
          }
        }
      },
      error => {
        this.showLoader = false;
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      }
    );
  }


  PreparePhysicalCountData(oAddPhysicalCountData: any): any {
    var index = 0;
    for (var i = 0; i < this.DocNoDetails.length; i++) {
      if (this.DocNoDetails[i].ItemCode == this.ItemCode) {
        index = i;
      }
    }

    let isDetailExist = false;
    for (var iAdd = 0; iAdd < oAddPhysicalCountData.Detail.length; iAdd++) {
      if (oAddPhysicalCountData.Detail[iAdd].ItemCode == this.ItemCode && oAddPhysicalCountData.Detail[iAdd].DocNo == this.DocNo && oAddPhysicalCountData.Detail[iAdd].BinNo == this.BinNo) {
        if (oAddPhysicalCountData.Detail[iAdd].Tracking == "B" || oAddPhysicalCountData.Detail[iAdd].Tracking == "S") {
          if ((oAddPhysicalCountData.Detail[iAdd].LotNo).toUpperCase() != this.batchserno.toUpperCase()) {

          } else {
            oAddPhysicalCountData.Detail[iAdd].QtyCounted = this.CountedQty;
          }
        } else {
          oAddPhysicalCountData.Detail[iAdd].QtyCounted = this.CountedQty;
        }
        oAddPhysicalCountData.Detail[iAdd].Counted = this.isCounted == false ? "N" : "Y";
        isDetailExist = true;
      }
    }

    if (!isDetailExist) {
      oAddPhysicalCountData.Detail.push({
        DocEntry: "" + this.DocEntry,
        DiServerToken: localStorage.getItem("Token"),
        DocNo: this.DocNo,
        CompanyUsername: localStorage.getItem("UserId"),
        // CompanyPassword: "",
        CompanyDBId: localStorage.getItem("CompID"),
        LotNo: this.batchserno,
        ItemCode: this.ItemCode,
        ItemName: this.ItemName,
        QtyCounted: this.CountedQty,
        BinNo: this.BinNo,
        CountType: this.DocNoDetails[index].CountType,
        InWhsQty: Number(this.QtyOnHand),
        UOM: this.UOM,
        Counted: this.isCounted == false ? "N" : "Y",
        CountDate: this.DocNoDetails[index].CountDate,
        LineStatus: this.DocNoDetails[index].LineStatus,
        LineNum: this.DocNoDetails[index].LineNum,
        RowOrder: this.DocNoDetails[index].RowOrder,
        Time: this.DocNoDetails[index].Time,
        BinEntry: this.DocNoDetails[index].BinEntry,
        CounterId: this.DocNoDetails[index].CounterId,
        CounteName: this.DocNoDetails[index].CounteName,
        CounterNum: this.DocNoDetails[index].CounterNum,
        VisOrder: this.DocNoDetails[index].VisOrder,
        Taker1Type: this.DocNoDetails[index].Taker1Type,
        Tracking: this.ItemTracking,
        WhsCode: localStorage.getItem("whseId"),
        isSaved: "N",
        TeamCount: this.DocNoDetails[index].TeamCount,
        IsTeamCount: this.IsteamCount,
        IndvCount: this.DocNoDetails[index].IndvCount,
        Username: localStorage.getItem("UserId"),
        GUID: localStorage.getItem("GUID"),
        UsernameForLic: localStorage.getItem("UserId"),
      });
    }

    let isLotSerExist = false;
    for (var iAddLot = 0; iAddLot < oAddPhysicalCountData.LotSerial.length; iAddLot++) {
      if (oAddPhysicalCountData.LotSerial[iAddLot].LotNo.toUpperCase() == this.batchserno.toUpperCase() && oAddPhysicalCountData.LotSerial[iAddLot].ItemCode == this.ItemCode &&
        oAddPhysicalCountData.LotSerial[iAddLot].DocNo == this.DocNo) {
        isLotSerExist = true;
        if (this.LotSerialQtycheck == 1) {
          oAddPhysicalCountData.LotSerial[iAddLot].QtyCounted = (Number(this.CountedQty) + Number(oAddPhysicalCountData.LotSerial[iAddLot].QtyCounted)).toFixed(Number(localStorage.getItem("DecimalPrecision")));
          this.LotSerialQtycheck = 0;
        }
        if (this.LotSerialQtycheck == 2) {
          oAddPhysicalCountData.LotSerial[iAddLot].QtyCounted = this.CountedQty;
          this.LotSerialQtycheck = 0;
        }
      }
    }

    if (!isLotSerExist) {
      oAddPhysicalCountData.LotSerial.push({
        DocEntry: "" + this.DocEntry,
        DocNo: this.DocNo,
        CompanyUsername: localStorage.getItem("UserId"),
        // CompanyPassword: "",
        CompanyDBId: localStorage.getItem("CompID"),
        LotNo: this.batchserno,
        InWhsQty: this.QtyOnHand,
        ItemCode: this.ItemCode,
        ItemName: this.ItemName,
        QtyCounted: this.CountedQty,
        BinNo: this.BinNo,
        CountType: this.CountType,
        Tracking: this.ItemTracking,
        WhsCode: localStorage.getItem("whseId"),
        Username: localStorage.getItem("UserId"),
        GUID: localStorage.getItem("GUID"),
        UsernameForLic: localStorage.getItem("UserId")
      });
    }

    if (oAddPhysicalCountData.Detail.length > 0) {
      for (var iDetail = 0; iDetail < oAddPhysicalCountData.Detail.length; iDetail++) {
        var totalQuantity = 0;
        var totalNoneQuantity = 0;
        for (var iLotSerial = 0; iLotSerial < oAddPhysicalCountData.LotSerial.length; iLotSerial++) {
          if (oAddPhysicalCountData.Detail[iDetail].ItemCode == oAddPhysicalCountData.LotSerial[iLotSerial].ItemCode && oAddPhysicalCountData.Detail[iDetail].DocNo == oAddPhysicalCountData.LotSerial[iLotSerial].DocNo && oAddPhysicalCountData.Detail[iDetail].BinNo == oAddPhysicalCountData.LotSerial[iLotSerial].BinNo) {
            if (oAddPhysicalCountData.Detail[iDetail].Tracking == "B" || oAddPhysicalCountData.Detail[iDetail].Tracking == "S") {
              totalQuantity = totalQuantity + parseFloat(oAddPhysicalCountData.LotSerial[iLotSerial].QtyCounted)
              oAddPhysicalCountData.Detail[iDetail].QtyCounted = totalQuantity
            }
            if (oAddPhysicalCountData.Detail[iDetail].Tracking == "N") {
              totalNoneQuantity = totalNoneQuantity + parseFloat(oAddPhysicalCountData.LotSerial[iLotSerial].QtyCounted)
              oAddPhysicalCountData.Detail[iDetail].QtyCounted = totalNoneQuantity
            }
          }
        }
      }
    }
    return oAddPhysicalCountData;
  }

  onCountedQtyChanged() {
    var inputValue = (<HTMLInputElement>document.getElementById('countedQtyInputPC')).value;
    if (inputValue.length > 0) {
      this.CountedQty = inputValue;
    } 

    this.LotSerialQtycheck = 0;
    var oAddPhysicalCountData: any = {};
    var dataModel = localStorage.getItem("PhysicalCountData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      this.formatCountedQty();
      return;
    } else {
      oAddPhysicalCountData = JSON.parse(dataModel);
    }
    let result = oAddPhysicalCountData.LotSerial.find(element => element.ItemCode == this.ItemCode && element.DocNo == this.DocNo && element.LotNo.toUpperCase() == this.batchserno.toUpperCase());
    if (result != undefined) {
      if (this.ItemTracking == "S") {
        this.showDialog("overwrite", this.translate.instant("PhyCount_Overwrite"), "",
          this.translate.instant("PhyCount_SerialQtyChangeMsg"));
      }
      if (this.ItemTracking == "B") {
        this.showDialog("overwrite", this.translate.instant("PhyCount_Overwrite"), "add",
          this.translate.instant("PhyCount_BatchQtyChangeMsg"));
      }
    }
    this.formatCountedQty();
  }

  onSaveClick(existingItem?: boolean) {
    if (this.ItemTracking != "N") {
      if (this.batchserno == undefined || this.batchserno == "" || this.batchserno == null) {
        if (this.ItemTracking == "S") {
          this.toastr.error('', this.translate.instant("PhyCount_SerialLotcannotbeblank"));
        } else {
          this.toastr.error('', this.translate.instant("PhyCount_BatchLotcannotbeblank"));
        }
        return;
      }
      if (!this.isLotAdded && !existingItem) {
        this.OnLotChange("savenext");
        return;
      }
    }

    if (!this.isLotAdded && this.ItemTracking != "N" && !existingItem) {
      if (this.ItemTracking == "S") {
        this.toastr.error('', this.translate.instant("PhyCount_SerialLotisnotadded"));
      } else {
        this.toastr.error('', this.translate.instant("PhyCount_BatchLotisnotadded"));
      }
      return;
    }

    if (this.ItemTracking == "S") {
      this.CountedQty = "1";
      this.formatCountedQty();
    }

    var oAddPhysicalCountData: any = {};
    var dataModel = localStorage.getItem("PhysicalCountData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      oAddPhysicalCountData.Detail = [];
      oAddPhysicalCountData.LotSerial = [];
      oAddPhysicalCountData.ItemList = [];
    } else {
      oAddPhysicalCountData = JSON.parse(dataModel);
    }
    oAddPhysicalCountData = this.PreparePhysicalCountData(oAddPhysicalCountData);
    localStorage.setItem("PhysicalCountData", JSON.stringify(oAddPhysicalCountData));
    this.SavePhysicalCountData(oAddPhysicalCountData);
  }

  onAddItemClick() {
    if (this.ItemTracking != "N") {
      if (this.batchserno == undefined || this.batchserno == "" || this.batchserno == null) {
        if (this.ItemTracking == "S") {
          this.toastr.error('', this.translate.instant("PhyCount_SerialLotcannotbeblank"));
        } else {
          this.toastr.error('', this.translate.instant("PhyCount_BatchLotcannotbeblank"));
        }
        return;
      }
      if (!this.isLotAdded) {
        this.LotExistCheck();
        return;
      }
    }

    if (!this.isLotAdded && this.ItemTracking != "N") {
      if (this.ItemTracking == "S") {
        this.toastr.error('', this.translate.instant("PhyCount_SerialLotisnotadded"));
      } else {
        this.toastr.error('', this.translate.instant("PhyCount_BatchLotisnotadded"));
      }
      return;
    }
    if (this.ItemTracking == "S") {
      this.CountedQty = "1";
      this.formatCountedQty();
    }
    var oAddPhysicalCountData: any = {};
    var dataModel = localStorage.getItem("PhysicalCountData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      oAddPhysicalCountData.Detail = [];
      oAddPhysicalCountData.LotSerial = [];
      oAddPhysicalCountData.ItemList = [];
    } else {
      oAddPhysicalCountData = JSON.parse(dataModel);
    }
    oAddPhysicalCountData = this.PreparePhysicalCountData(oAddPhysicalCountData);
    localStorage.setItem("PhysicalCountData", JSON.stringify(oAddPhysicalCountData));
    if (oAddPhysicalCountData.LotSerial.length > 0) {
      this.showbatchser = true;
      this.showitemlist = true;
    } else {
      this.showbatchser = false;
      this.showitemlist = false;
    }
    this.toastr.success('', this.translate.instant("PhyCount_Operation"));
    this.batchserno = "";
    this.CountedQty = "0";
    this.formatCountedQty();
  }

  public close(component) {
    this[component + 'Opened'] = false;
  }

  public open(component) {
    this[component + 'Opened'] = true;
  }

  public action(status) {
    this.dialogOpened = false;
  }

  showLotSerList() {
    var oAddPhysicalCountData: any = {};
    var dataModel = localStorage.getItem("PhysicalCountData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
    } else {
      oAddPhysicalCountData = JSON.parse(dataModel);
    }
    this.ItemCodeTemp = this.ItemCode;
    this.trackingtemp = this.ItemTracking;
    this.dialogOpened = true;
    this.BatchSerialArray = [];

    for (var iLotSerial = 0; iLotSerial < oAddPhysicalCountData.LotSerial.length; iLotSerial++) {
      if (this.ItemCode == oAddPhysicalCountData.LotSerial[iLotSerial].ItemCode && this.DocNo == oAddPhysicalCountData.LotSerial[iLotSerial].DocNo && this.BinNo == oAddPhysicalCountData.LotSerial[iLotSerial].BinNo) {
        this.BatchSerialArray.push(oAddPhysicalCountData.LotSerial[iLotSerial])
      }
    }
    if (this.BatchSerialArray.length > this.pageSize) {
      this.pagable = true;
    } else {
      this.pagable = false;
    }
  }

  viewSavedItems() {
    this.showSavedItems = true;
    var oAddPhysicalCountData: any = {};
    var dataModel = localStorage.getItem("PhysicalCountData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
    } else {
      oAddPhysicalCountData = JSON.parse(dataModel);
    }
    this.ItemArray = oAddPhysicalCountData.Detail;
    // apply paging..
    if (this.ItemArray.length > this.pageSize) {
      this.pagable = true;
    } else {
      this.pagable = false;
    }
  }

  loadFistPage() {
    this.showSavedItems = false;
  }

  ShowBatachSerListForClickRow(rowindex, gridData: any) {
    var oAddPhysicalCountData: any = {};
    var dataModel = localStorage.getItem("PhysicalCountData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
    } else {
      oAddPhysicalCountData = JSON.parse(dataModel);
    }
    this.ItemCodeTemp = gridData.data[rowindex].ItemCode;
    this.trackingtemp = gridData.data[rowindex].ItemCode;
    this.dialogOpened = true;
    this.BatchSerialArray = [];

    for (var iLotSerial = 0; iLotSerial < oAddPhysicalCountData.LotSerial.length; iLotSerial++) {
      if (oAddPhysicalCountData.Detail[rowindex].ItemCode == oAddPhysicalCountData.LotSerial[iLotSerial].ItemCode && oAddPhysicalCountData.Detail[rowindex].DocNo == oAddPhysicalCountData.LotSerial[iLotSerial].DocNo && oAddPhysicalCountData.Detail[rowindex].BinNo == oAddPhysicalCountData.LotSerial[iLotSerial].BinNo) {
        this.BatchSerialArray.push(oAddPhysicalCountData.LotSerial[iLotSerial])
      }
    }
    if (this.BatchSerialArray.length > this.pageSize) {
      this.pagable = true;
    } else {
      this.pagable = false;
    }
  }

  onSubmitClick() {

    var oAddPhysicalCountData: any = {};
    var dataModel = localStorage.getItem("PhysicalCountData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      oAddPhysicalCountData.Detail = [];
      oAddPhysicalCountData.LotSerial = [];
      oAddPhysicalCountData.ItemList = [];
    } else {
      oAddPhysicalCountData = JSON.parse(dataModel);
    }

    if (this.ItemTracking != "N") {
      if (this.batchserno == undefined || this.batchserno == "" || this.batchserno == null) {
        if (oAddPhysicalCountData.Detail.length < 1) {
          if (this.ItemTracking == "S") {
            this.toastr.error('', this.translate.instant("PhyCount_SerialLotcannotbeblank"));
          } else {
            this.toastr.error('', this.translate.instant("PhyCount_BatchLotcannotbeblank"));
          }
          return;
        }
      }
      if (!this.isLotAdded) {
        this.OnLotChange();
        return;
      }
    }

    if (!this.isLotAdded && this.ItemTracking != "N") {
      if (oAddPhysicalCountData.Detail.length < 1) {
        if (this.ItemTracking == "S") {
          this.toastr.error('', this.translate.instant("PhyCount_SerialLotisnotadded"));
        } else {
          this.toastr.error('', this.translate.instant("PhyCount_BatchLotisnotadded"));
        }
      }
      return;
    }
    if (this.ItemTracking == "S") {
      this.CountedQty = "1";
      this.formatCountedQty();
    }

    oAddPhysicalCountData = this.PreparePhysicalCountData(oAddPhysicalCountData);
    for (var iCopy = 0; iCopy < this.DocNoDetails.length; iCopy++) {
      let result = oAddPhysicalCountData.Detail.find(element => element.ItemCode == this.DocNoDetails[iCopy].ItemCode && element.DocNo == this.DocNoDetails[iCopy].DocNum);
      if (result == undefined) {
        oAddPhysicalCountData.ItemList.push({
          ItemCode: this.DocNoDetails[iCopy].ItemCode,
          Counted: this.DocNoDetails[iCopy].Counted,
          LineNum: this.DocNoDetails[iCopy].LineNum,
          IsTeamCount: this.DocNoDetails[iCopy].TeamCount == 0 ? "N" : "Y"
        });
      }
    }
    this.SubmitPhysicalCount(oAddPhysicalCountData);
  }

  LotSerialDeleteClick(rowindex, gridData: any) {
    this.gridData = gridData;
    this.rowindex = rowindex;
    this.showDialog("DeleteLot", this.translate.instant("yes"), this.translate.instant("no"),
      this.translate.instant("DeleteRecordsMsg"));
  }

  LotSerialDelete() {
    var oAddPhysicalCountData: any = {};
    var dataModel = localStorage.getItem("PhysicalCountData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
    } else {
      oAddPhysicalCountData = JSON.parse(dataModel);
    }
    for (var iLotSerial = 0; iLotSerial < oAddPhysicalCountData.LotSerial.length; iLotSerial++) {
      if (this.BatchSerialArray[this.rowindex].ItemCode == oAddPhysicalCountData.LotSerial[iLotSerial].ItemCode && this.BatchSerialArray[this.rowindex].DocNo == oAddPhysicalCountData.LotSerial[iLotSerial].DocNo && this.BatchSerialArray[this.rowindex].BinNo == oAddPhysicalCountData.LotSerial[iLotSerial].BinNo && this.BatchSerialArray[this.rowindex].LotNo == oAddPhysicalCountData.LotSerial[iLotSerial].LotNo) {
        oAddPhysicalCountData.LotSerial.splice(iLotSerial, 1);
      }
    }
    this.BatchSerialArray.splice(this.rowindex, 1);
    this.gridData.data = this.BatchSerialArray;
    localStorage.setItem("PhysicalCountData", JSON.stringify(oAddPhysicalCountData));
  }

  ItemListRowDeleteClick(rowindex, gridData: any) {
    this.gridData = gridData;
    this.rowindex = rowindex;
    this.showDialog("DeleteItem", this.translate.instant("yes"), this.translate.instant("no"),
      this.translate.instant("DeleteRecordsMsg"));
  }

  ItemListRowDelete() {
    var oAddPhysicalCountData: any = {};
    var dataModel = localStorage.getItem("PhysicalCountData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
    } else {
      oAddPhysicalCountData = JSON.parse(dataModel);
    }

    for (var iAdd = 0; iAdd < oAddPhysicalCountData.Detail.length; iAdd++) {
      if (oAddPhysicalCountData.Detail[iAdd].ItemCode == this.ItemArray[this.rowindex].ItemCode && oAddPhysicalCountData.Detail[iAdd].DocNo == this.ItemArray[this.rowindex].DocNo && oAddPhysicalCountData.Detail[iAdd].BinNo == this.ItemArray[this.rowindex].BinNo) {
        oAddPhysicalCountData.Detail.splice(iAdd, 1);
      }
    }

    for (var iLotSerial = 0; iLotSerial < oAddPhysicalCountData.LotSerial.length; iLotSerial++) {
      if (this.ItemArray[this.rowindex].ItemCode == oAddPhysicalCountData.LotSerial[iLotSerial].ItemCode && this.ItemArray[this.rowindex].DocNo == oAddPhysicalCountData.LotSerial[iLotSerial].DocNo && this.ItemArray[this.rowindex].BinNo == oAddPhysicalCountData.LotSerial[iLotSerial].BinNo) {
        oAddPhysicalCountData.LotSerial.splice(iLotSerial, 1);
        iLotSerial = -1;
      }
    }
    this.ItemArray.splice(this.rowindex, 1);
    this.gridData.data = this.ItemArray;
    localStorage.setItem("PhysicalCountData", JSON.stringify(oAddPhysicalCountData));
  }

  clearData() {
    localStorage.setItem("PhysicalCountData", "");
    // showLoader: boolean = false;
    // showLookupLoader: boolean = false;
    // serviceData: any[];
    this.lookupfor = "";
    this.DocNo = "";
    this.DocEntry = "";
    this.CountDate = "";
    this.ItemCode = "";
    this.ItemName = "";
    this.BinNo = "";
    this.SerialNo = "";
    this.CountedQty = "0";
    // UOM: string;
    // ItemTracking = "";
    // batchNoPlaceholder: string;
    // batchSrBtn: string;
    // isNonTrack: boolean = false;
    // IsteamCount: string = "";
    this.batchserno = "";
    // QtyOnHand = "0";
    // showItemName = "";
    // showConfirmDialog: boolean = false;
    // SavedDocNoDetailArray: any[] = [];
    // dialogMsg = ""
    // yesButtonText = "";
    // noButtonText = "";
    // dialogFor = "";
    // isCounted: boolean = false;
    // CountType: string;
    // DocNoDetails: any;
    // isLotAdded: boolean = false;
    // LotSerialQtycheck: Number = 0;
    // showSavedItems = false;
    this.showbatchser = false;
    this.showitemlist = false;
    this.QtyOnHand = "0";
    this.CountedQty = "0";
    this.formatCountedQty();
    this.formatOnHandQty();
  }

  resetData() {
    this.batchserno = "";
    this.QtyOnHand = "0";
    this.CountedQty = "0";
  }

  onHiddenScanClick() {
    this.onScanCodeChange();
  }
  onScanPC() {
    //alert("scan click");
  }

  onScanCodeChange() {
    this.onGS1ItemScan()
  }

  onGS1ItemScan() {

    var inputValue = (<HTMLInputElement>document.getElementById('scanInputFieldPC')).value;
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
    let piManualOrSingleDimentionBarcode = 0;

    this.commonservice.checkAndScanCode("", this.ScanInputs).subscribe(
      (data: any) => {

        if (data != null) {
          if (data.length > 0) {
            if (data[0].Error != null) {
              piManualOrSingleDimentionBarcode = 1
              this.toastr.error('', data[0].Error);//this.translate.instant("InvalidItemCode"));
              this.ScanInputs = "";
              return;
            }
            else {
              this.ScanInputs = data[0].Value;
            }

            if (piManualOrSingleDimentionBarcode == 0) {
              for (var i = 0; i < data.length; i++) {
                if (data[i].Key == '10' || data[i].Key == '21' || data[i].Key == '23') {
                  this.batchserno = data[i].Value;
                }
                if (data[i].Key == '30' || data[i].Key == '310' ||
                  data[i].Key == '315' || data[i].Key == '316' || data[i].Key == '320') {
                  if (this.ItemTracking == "S") {
                    this.CountedQty = "1";
                  }
                  else {
                    this.CountedQty = data[i].Value;
                  }
                  this.formatCountedQty();
                }
              }
            }
          }

          if (this.ScanInputs != "error decoding QR Code") {
            // this.OnItemChange();
            //if (oFCModel.Tracking != "N") {
            //    oCurrentController.OnLotChange();
            //}
            // ScanLotChange = 1;
          }
          else {
            var psMsg
            if (this.ScanInputs == "error decoding QR Code") {
              psMsg = "Cannot read QC Code, please scan again";
            } else {
              psMsg = this.ScanInputs + ", Please scan again.";
            }
            this.ScanInputs = "";
            this.toastr.error('', psMsg);
          }
          // $("input[type=file]").val("");
          // otxtScan.setValue();
        }
      },
      error => {
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      });
  }


  onHiddenScanItemCodeClick(){
    this.OnItemChange();
  }

  onHiddenScanSrNoClick(){
    this.OnLotChange();
  }

  onHiddenScanCountedQtyClick(){ 
    this.onCountedQtyChanged();
  }
}
