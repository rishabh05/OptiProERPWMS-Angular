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
  CountedQty: string="0";
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

  constructor(private phycountService: PhysicalcountService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
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
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
        this.toastr.error('', error);
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
        console.log("Error: ", error);
      }
    );
  }

  ShowBatachSerList() {
    var LotLookup = 0;
    // if (isSaved == "N" && this.SavedDocNoDetailArray.length == 0) {
    //     LotLookup = 1;
    // }
    // if (isSaved == "Y" && this.SavedDocNoDetailArray.length == 0) {
    //     LotLookup = 1;
    // }
    // if (isSaved == "N" && this.SavedDocNoDetailArray.length > 0) {
    //     LotLookup = 1;
    // }
    // if (isSaved == "Y" && this.SavedDocNoDetailArray.length > 0) {
    //     LotLookup = 0;
    // }

    if (LotLookup == 1) {
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
              this.serviceData = data;
              this.lookupfor = "showPhyCntItemsList";
            } else {
              this.toastr.error('', this.translate.instant("BinTransfer.NoData"));
            }
          } else {
            this.toastr.error('', this.translate.instant("BinTransfer.NoData"));
          }
        },
        error => {
          this.showLoader = false;
          console.log("Error: ", error);
        }
      );
    } else {
      setTimeout(() => {
        if (this.SavedDocNoDetailArray.length > 0) {
          this.showLookupLoader = true;
          this.serviceData = this.SavedDocNoDetailArray;
          this.lookupfor = "ShowBatachSerList";
        }
      }, 500);
    }
  }

  OnItemChange() {
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
            this.CheckTrackingandVisiblity();

            // if (ScanLotChange == 1) {
            //   ScanLotChange = 0;
            //   oCurrentController.OnLotQtyChange();
            //   oCurrentController.OnLotChange();
            // }
          }
          else {
            this.toastr.error('', this.translate.instant("GoodsIssue.INVALIDITEM"));
            this.ItemCode = "";
            this.ItemName = "";
            this.ItemTracking = "";
          }
        }
        else {
          this.toastr.error('', this.translate.instant("GoodsIssue.INVALIDITEM"));
          this.ItemCode = "";
          this.ItemName = "";
          this.ItemTracking = "";
        }
      },
      error => {
        this.toastr.error('', error);
      }
    );
  }

  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;
    if ($event.Status == "yes") {
      switch ($event.From) {
        case ("addBatchSer"):
          // this.DeleteRowClick(this.rowindexForDelete, this.gridDataAfterDelete);
          break;


      }
    } else {
      if ($event.Status == "no") {
        // when user click on cross button nothing to do.
      }
    }
  }

  LotExistCheck() {
    this.dialogFor = "addBatchSer";

    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    // this.rowindexForDelete = rowindex;
    // this.gridDataAfterDelete = gridData;
    this.showConfirmDialog = true;


    // var psMsgYes = oCurrentController.GetResourceString("GoodsReceiptLineModification.Yes");
    // var psMsgNo = oCurrentController.GetResourceString("GoodsReceiptLineModification.No");
    // var psDialogConfirm = oCurrentController.GetResourceString("GoodsReceiptPOViewLots.DialogTitle");
    if (this.ItemTracking == "S") {
      this.dialogMsg = this.translate.instant("LotvalidSerial");
      this.CountedQty = "1";
      this.formatCountedQty();
      // otxtQty.setValue(oCurrentController.getFormatedValue(1));
      // Qty = (oCurrentController.getFormatedValue(1))
    }
    if (this.ItemTracking == "B") {
      this.dialogMsg = this.translate.instant("LotvalidBatch");
    }

    // var beginButton = new Button({
    //     text: psMsgYes,
    //     press: function () {
    //         isLotValid = true;
    //         dialog.close();
    //         //  return isLotValid;
    //     }
    // })

    // var endButton = new Button({
    //     text: psMsgNo,
    //     press: function () {
    //         // Lot = "";
    //         // otxtLot.setValue();
    //         isLotValid = false;
    //         otxtLot.focus();
    //         dialog.close();
    //         // return isLotValid;
    //     }
    // })

    // var dialog = new Dialog({
    //     title: 'Confirm',
    //     type: 'Message',
    //     content: new Text({
    //         text: psMsg
    //     }),
    //     buttons: [beginButton, endButton]
    // });
    // dialog.open();

  }

  OnLotChange() {
    if (this.batchserno == "" || this.batchserno == undefined) {
      return;
    }
    this.showLoader = true;
    this.phycountService.IslotExist(this.BinNo, this.ItemCode, this.batchserno).subscribe(
      data => {
        this.showLoader = false;
        if (data != null) {
          if (data.length == "0") {
            // isLotValid = false;
            if (this.ItemTracking != "N") {
              this.LotExistCheck();
            }
          }
          else {
            this.batchserno = data[0].LOTNO;
            this.BinNo = data[0].BINNO;
            // this.w = data[0].WHSCODE;
            this.ItemCode = data[0].ITEMCODE;
            this.ItemName = data[0].ITEMNAME;
            this.QtyOnHand = data[0].TOTALQTY;
            this.CountedQty = data[0].TOTALQTY;
            this.ItemTracking = data[0].TRACKING;
            // EnableContainer = data[0].ENABLECONTAINER;
            // SysNumber = data[0].SYSNUMBER;
            // otxtUnitPrice.setValue(data[0].UnitPrice);
            // otxtUnitPrice.setTextAlign(sap.ui.core.TextAlign.Right);
            this.CheckTrackingandVisiblity();
            // isLotValid = true;
          }
        }
        else {
          this.batchserno = data[0].LOTNO;
          this.BinNo = data[0].BINNO;
          // WhsCode = data[0].WHSCODE;
          this.ItemCode = data[0].ITEMCODE;
          this.ItemName = data[0].ITEMNAME;
          this.QtyOnHand = data[0].TOTALQTY;
          this.CountedQty = data[0].TOTALQTY;
          // InvType = data[0].INVTYPE;
          this.ItemTracking = data[0].TRACKING;
          // SysNumber = data[0].SYSNUMBER;
          // otxtUnitPrice.setValue(data[0].UnitPrice);
          // otxtUnitPrice.setTextAlign(sap.ui.core.TextAlign.Right);
          this.CheckTrackingandVisiblity();
        }
      },
      error => {
        this.toastr.error('', error);
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
            data[i].OPTM_LOTSERQTY = data[i].OPTM_LOTSERQTY.toFixed(Number(localStorage.getItem("DecimalPrecision")));
          }
          this.SavedDocNoDetailArray = data;
          if (this.SavedDocNoDetailArray.length > 0) {
            this.ItemTracking = this.SavedDocNoDetailArray[this.SavedDocNoDetailArray.length - 1].Tracking;
            this.CountType = this.SavedDocNoDetailArray[this.SavedDocNoDetailArray.length - 1].CountType;
            this.CountDate = this.SavedDocNoDetailArray[this.SavedDocNoDetailArray.length - 1].CountDate;
            this.UOM = this.SavedDocNoDetailArray[this.SavedDocNoDetailArray.length - 1].UomCode;
            this.CountedQty = this.SavedDocNoDetailArray[this.SavedDocNoDetailArray.length - 1].Qty;
            if (this.SavedDocNoDetailArray.length == 1) {
              this.QtyOnHand = this.SavedDocNoDetailArray[this.SavedDocNoDetailArray.length - 1].Qty;
            }
            this.formatCountedQty();
            this.formatOnHandQty();
            this.CheckTrackingandVisiblity();
            this.GetDocNoDetails();
          }
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
      }
    );
  }

  GetDocNoDetails() {
    this.phycountService.GetDocNoDetails(this.DocNo, this.CountType, this.IsteamCount).subscribe(
      (data: any) => {
        if (data != undefined) {
          this.DocNoDetails = data;
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
      }
    );
  }

  getLookupValue($event) {
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
      this.BinNo = $event[3];
      this.ItemTracking = $event[2];
      this.UOM = $event[4];
      this.CheckTrackingandVisiblity();
    } else if (this.lookupfor == "ShowBatachSerList") {
      this.batchserno = $event[7];
      this.ItemCode = $event[3];
      this.ItemTracking = $event[31];
      this.UOM = $event[19];
      this.CountedQty = $event[9];
      this.QtyOnHand = $event[9];
      this.CheckTrackingandVisiblity();
    }
    this.formatCountedQty();
    this.formatOnHandQty();
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
    }
    else if (this.ItemTracking == "S") {
      this.isNonTrack = false;
      this.batchNoPlaceholder = this.translate.instant("SerialNo");
      this.batchSrBtn = this.translate.instant("Serial");
    }
    else if (this.ItemTracking == "N") {
      this.isNonTrack = true;
    }

    // this.fromBin = "";
    // this.toBin = "";
    // this.lotValue = "";
  }

  onCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

  AddLotSerBtnClick() {
    if (this.batchserno == "" || this.batchserno == undefined) {
      if (this.ItemTracking == "B") {
        this.toastr.error('', this.translate.instant("BatchNotBlank"));
      } else if (this.ItemTracking == "S") {
        this.toastr.error('', this.translate.instant("SerialNotBlank"));
      }
      return;
    }
    this.LotExistCheck();
  }

  SavePhysicalCountData() {
    this.showLoader = true;
    this.phycountService.SavePhysicalCountData("").subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != null) {
          if (data == "True") {
            this.toastr.success('', this.translate.instant("PhysicalCount.DataSavedSuccessfully"));
            this.QtyOnHand = "0";
            this.CountedQty = "0";
            this.formatCountedQty();
            this.formatOnHandQty();
            // otxtQty.setValue(oCurrentController.getFormatedValue("0"));
            // oCurrentController.NextRecord1();
          }
          else {
            this.toastr.success('', this.translate.instant("PhysicalCount.NoDataSaved"));
          }
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
      }
    );
  }


  PreparePhysicalCountData() {
    var oAddPhysicalCountData: any = {};
    oAddPhysicalCountData.Detail = [];
    oAddPhysicalCountData.LotSerial = [];
    oAddPhysicalCountData.ItemList = [];

    var index = 0;
    for (var i = 0; i < this.DocNoDetails.length; i++) {
      if (this.DocNoDetails[i].ItemCode == this.ItemCode) {
        index = i;
      }
    }

    oAddPhysicalCountData.Detail.push({
      DocEntry: this.DocEntry,
      DiServerToken: localStorage.getItem("Token"),
      DocNo: this.DocNo,
      CompanyUsername: localStorage.getItem("UserId"),
      CompanyPassword: "",
      CompanyDBId: localStorage.getItem("CompID"),
      LotNo: this.batchserno,
      ItemCode: this.ItemCode,
      ItemName: this.ItemName,
      QtyCounted: this.CountedQty,
      BinNo: this.BinNo,
      CountType: this.CountType,
      InWhsQty: this.QtyOnHand,
      UOM: this.UOM,
      Counted: this.isCounted,
      CountDate: this.CountDate,
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
      //--------------------Adding Parameters for the Licence--------------------------------------------
      GUID: localStorage.getItem("GUID"),
      UsernameForLic: localStorage.getItem("UserId"),
      //------------------End for the Licence Parameter-------------------------------------------------------

    });

    oAddPhysicalCountData.LotSerial.push({
      DocEntry: this.DocEntry,
      DocNo: this.DocNo,
      CompanyUsername: localStorage.getItem("UserId"),
      CompanyPassword: "",
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
      //--------------------Adding Parameters for the Licence--------------------------------------------
      GUID: localStorage.getItem("GUID"),
      UsernameForLic: localStorage.getItem("UserId")
      //------------------End for the Licence Parameter-------------------------------------------------------
    });

    oAddPhysicalCountData.ItemList.push({
      ItemCode: this.ItemCode,
      Counted: this.isCounted,
      // LineNum: this.LineNum,
      IsTeamCount: this.IsteamCount
    });
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
            //-----------------------------------End for the Function Check for Licence--------------------------------
            if (data[0].ErrorMsg == "" && data[0].Successmsg != "") {

              this.toastr.success('', this.translate.instant("DocUpdatedSucessfullyMsg") + data[0].DocEntry);
              // sessionStorage.removeItem(oCurrentController.SessionProperties.WMSLookupRowObject);
              // sessionStorage.removeItem(oCurrentController.SessionProperties.oAddPhysicalCountData);
              // var psMsgOk = oCurrentController.GetResourceString("GoodsReceiptPOViewLots.Ok");
              // var psDialogConfirm = oCurrentController.GetResourceString("physicalCount.Success");

              // var beginButton = new Button({
              //     text: psMsgOk,
              //     press: function () {
              //         oCurrentController.PhysicalCountDataView();
              //     }
              // })

              // var dialog = new Dialog({
              //     title: 'Success',
              //     type: 'Message',
              //     content: new Text({ text: psMsg }),
              //     buttons: [beginButton]
              // });
              // dialog.open();
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
        console.log("Error: ", error);
      }
    );
  }
}
