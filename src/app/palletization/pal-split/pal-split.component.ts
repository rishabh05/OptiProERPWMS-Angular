import { Component, OnInit } from '@angular/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Pallet } from 'src/app/models/Inbound/Pallet';
import { NumberFormatPipe } from 'src/app/common/number-format.pipe';
import { PalletOperationType } from 'src/app/enums/PalletEnums';

@Component({
  selector: 'app-pal-split',
  templateUrl: './pal-split.component.html',
  styleUrls: ['./pal-split.component.scss']
})
export class PalSplitComponent implements OnInit {

  showLoader: boolean = false;
  showLookup: boolean = false;
  showNewPallet: boolean = false;
  lookupFor: any = "";
  enableSplitPalletBtn: boolean = false;
  selectedToPallets: any = Array<Pallet>();
  savedPalletsArray: any = Array<Pallet>();
  public serviceData: any;
  autoGenereatePalletEnable: boolean = false;
  createdNewPallet: string;
  toPalletNo: string = "";
  fromPalletNo: string = "";
  fromPalletLookup: string;
  toBin: string;
  toWhse: string;
  itemCode: string = "";
  moveQty: number = 0;
  remainQty: number = 0;
  itemsList: any;
  showHideGridToggle: boolean = false;
  showHideBtnTxt: string;
  batchSerialNo: string = "";
  qty: number = 0;
  openQty: number;
  expDate: string;
  fromWhse: string;
  fromBinNo: string;
  palletData: any;
  sumOfQty: number = 0;
  itemType: string = "";
  isSerailTrackedItem: boolean = false;

  constructor(private commonservice: Commonservice,
    private router: Router, private toastr: ToastrService, private translate: TranslateService) {
    this.showHideBtnTxt = this.translate.instant("showGrid");
  }

  ngOnInit() {
    if (localStorage.getItem("AutoPalletIdGenerationChecked") == "True") {
      this.autoGenereatePalletEnable = true;
    }
  }

  public getPalletList(from: string) {

    var code = "";
    if (from == "from_pallet") {
      code = Array.prototype.map.call(this.selectedToPallets, function (item) { return "'" + item.Code + "'"; }).join(",");
      console.log("code: " + code);
    } else if (from == "to_pallet") {
      code = this.fromPalletNo;
    }
    this.showLoader = true;
    this.commonservice.getPalletsOfSameWarehouse(code).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            console.log(data);
            this.serviceData = data;
            this.showLookup = true;
            this.lookupFor = "PalletList";
            this.fromPalletLookup = from;

            return;
          } else {
            this.showLookup = false;
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        }
      },
      error => {
        this.showLoader = false;
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  onPalletScan() {
    // alert("scan click");
  }

  onPalletChange(from: string) {

    var plt;
    if (from == "from_pallet") {
      if (this.fromPalletNo == undefined || this.fromPalletNo == '') {
        return;
      }
      plt = this.fromPalletNo;
    } else {
      if (this.toPalletNo == undefined || this.toPalletNo == '') {
        return;
      }
      plt = this.toPalletNo;
    }

    this.showLoader = true;
    this.commonservice.isPalletValid(plt).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            if (from == "from_pallet") {
              this.fromPalletNo = data[0].Code;
              this.savedPalletsArray = [];
              this.resetVariables();
            } else if (from == "to_pallet") {
              this.toPalletNo = data[0].Code;
              this.batchSerialNo = '';
              this.qty = 0;
              // if (!this.containPallet(this.selectedToPallets, data[0].Code)) {
              //   this.selectedToPallets.push(data[0]);
              // }
            }
          } else {
            this.toastr.error('', this.translate.instant("InValidPalletNo"));
            if (from == "to_pallet") {
              this.toPalletNo = "";
            } else if (from == "from_pallet") {
              this.fromPalletNo = "";
            }
            return;
          }
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          if (from == "to_pallet") {
            this.toPalletNo = "";
          } else if (from == "from_pallet") {
            this.fromPalletNo = "";
          }
          return;
        }
      },
      error => {
        this.showLoader = false;
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  getLookupValue(lookupValue: any) {
    if (this.fromPalletLookup == "from_pallet") {
      this.showLoader = false;
      this.fromPalletNo = lookupValue.Code;
      this.savedPalletsArray = [];
      this.resetVariables();
    } else if (this.fromPalletLookup == "to_pallet") {
      this.toWhse = lookupValue.U_OPTM_WAREHOUSE_LOC;
      this.toBin = lookupValue.U_OPTM_BIN;
      this.toPalletNo = lookupValue.Code;
      //this.getPalletData(this.toPalletNo);
      if (!this.containPallet(this.selectedToPallets, lookupValue.Code)) {
        this.selectedToPallets.push(lookupValue);
      }
      this.batchSerialNo = '';
      this.qty = 0;
    } else if (this.lookupFor == "ItemsList") {
      this.itemCode = lookupValue.ITEMCODE;
      this.batchSerialNo = '';
      this.qty = 0;
      this.itemType = lookupValue.ITEMTYPE;
      if (this.itemType == "S") {
        this.isSerailTrackedItem = true;
      } else {
        this.isSerailTrackedItem = false;
      }
    } else if (this.lookupFor == "ShowBatachSerList") {
      this.batchSerialNo = lookupValue.LOTNO;
      this.expDate = "" + lookupValue.EXPDATE;
      this.fromWhse = lookupValue.WHSCODE;
      this.fromBinNo = lookupValue.BINNO;
      this.openQty = Number.parseInt(lookupValue.TOTALQTY);
      this.validateRemainigQuantity();
      //this.qty = this.openQty;
    }
  }

  containPallet(list: any, targetPallet: string) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].Code == targetPallet) {
        return true;
      }
    }
    return false;
  }

  getPalletData(fromPalletNo: string) {
    // this.showHideGridToggle = false;
    // this.showHideBtnTxt = this.translate.instant("showGrid");
    // this.showLoader = true;
    this.commonservice.GetPalletData(fromPalletNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          this.palletData = data;
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          return;
        }
      },
      error => {
        this.showLoader = false;
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  splitPallet(event: any) {
    this.showLoader = true;
    var oPalletReq: any = {};
    oPalletReq.Header = [];
    oPalletReq.Detail = [];
    oPalletReq.Header.push({
      COMPANYDBNAME: localStorage.getItem("CompID"),
      PALLETOPERATIONTYPE: PalletOperationType.Split,
      WhsCode: localStorage.getItem("whseId"),
      FromPalletCode: this.fromPalletNo,
      ToPalletCode: this.fromPalletNo,
      USERID: localStorage.getItem("UserId")
    });

    for (var i = 0; i < this.savedPalletsArray.length; i++) {
      oPalletReq.Detail.push({
        ITEMCODE: this.savedPalletsArray[i].ItemCode,
        BATCHNO: this.savedPalletsArray[i].ActualBSNo,
        FINALBATCHNO: this.savedPalletsArray[i].FinalLotNo,
        PALLETNO: this.savedPalletsArray[i].PalletCode,
        QTY: this.savedPalletsArray[i].Quantity,
        BIN: this.savedPalletsArray[i].FromBinNo,
        WHSE: this.savedPalletsArray[i].FromWhse,
        TOBIN: this.savedPalletsArray[i].ToBinNo,
        TOWHSE: this.savedPalletsArray[i].ToWhse,
        EXPIRYDATE: "" + this.savedPalletsArray[i].ExpiryDate,
      });
    }

    this.commonservice.palletSplit(oPalletReq).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null && data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
          this.savedPalletsArray = [];
          this.resetVariables();
          this.toastr.success('', this.translate.instant("Plt_Split_success"));
        } else if (data[0].ErrorMsg == "7001") {
          this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
            this.translate.instant("CommonSessionExpireMsg"));
          return;
        } else {
          this.toastr.error('', this.translate.instant("ErrorMsgSomethingWentWrong"));
          return;
        }
      },
      error => {
        this.showLoader = false;
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  back(fromwhereval: number) {
    this.router.navigateByUrl('home/dashboard', { skipLocationChange: true });
  }

  openConfirmForDelete(index: any, item: any) {
    console.log("index: " + index)
    console.log("item: " + item)
    this.savedPalletsArray.splice(index, 1);
  }

  onCheckChange() {
    this.showNewPallet = !this.showNewPallet;
    if (this.showNewPallet) {
    } else {
      this.createdNewPallet = "";
    }
  }

  clearPalletItems(item) {
    var tempArray: any = [];
    console.log(this.toPalletNo);
    for (var i = 0; i < this.savedPalletsArray.length; i++) {
      if (this.toPalletNo != this.savedPalletsArray[i].PalletCode) {
        //this.savedPalletsArray.splice(i, 1)
        tempArray.push(this.savedPalletsArray[i]);
      }
    }
    this.savedPalletsArray = tempArray;
    this.toPalletNo = '';
  }

  OnLotsChange() {

    if (this.batchSerialNo == "" || this.batchSerialNo == undefined) {
      return;
    }
    if (this.itemCode == "" || this.itemCode == undefined) {
      this.batchSerialNo = "";
      this.qty = 0;
      this.toastr.error('', this.translate.instant("SelectItemCode"));
      return;
    }
    if (this.fromPalletNo == "" || this.fromPalletNo == undefined) {
      this.batchSerialNo = "";
      this.qty = 0;
      this.toastr.error('', this.translate.instant("Plt_SelectFromPallet"));
      return;
    }


    this.showLoader = true;
    this.commonservice.IsValidBatchandSerialItemsFromPallet(this.batchSerialNo, this.itemCode,
      this.fromPalletNo).subscribe(
        (data: any) => {
          this.showLoader = false;
          console.log(data);
          if (data != null) {
            if (data.length > 0) {
              this.batchSerialNo = data[0].LOTNO;
              this.expDate = "" + data[0].EXPDATE;
              this.fromWhse = data[0].WHSCODE;
              this.fromBinNo = data[0].BINNO;
              this.openQty = Number.parseInt(data[0].TOTALQTY);
              this.validateRemainigQuantity();
            } else {
              this.batchSerialNo = "";
              this.qty = 0;
              this.toastr.error('', this.translate.instant("Plt_InValidBatchSerial"));
              return;
            }
          }
          else {
            this.batchSerialNo = "";
            this.qty = 0;
            this.toastr.error('', this.translate.instant("Plt_InValidBatchSerial"));
            return;
          }
        },
        error => {
          this.showLoader = false;
          if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
            this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
          }
          else {
            this.toastr.error('', error);
          }
        }
      );
  }

  addQuantity() {
    if (this.fromPalletNo == "" || this.fromPalletNo == undefined) {
      this.toastr.error('', this.translate.instant("Plt_FromPalletRequired"));
      return;
    }

    if (this.toPalletNo == "" || this.toPalletNo == undefined) {
      this.toastr.error('', this.translate.instant("Plt_ToPalletRequired"));
      return;
    }

    // if (this.moveQty == 0) {
    //   this.toastr.error('', this.translate.instant("Plt_MoveQtyRequired"));
    //   return;
    // }
    if (this.batchSerialNo == "" || this.batchSerialNo == undefined) {
      this.toastr.error('', this.translate.instant("SelectBatchSerial"));
      return;
    }

    if (this.qty == 0 || this.qty == undefined) {
      this.toastr.error('', this.translate.instant("Inbound_EnterQuantityErrMsg"));
      return;
    }
    if (this.qty < 0) {
      this.toastr.error('', this.translate.instant("ProdReceipt_QtyGraterThenZero"));
      return;
    }

    if(this.itemType == 'S'){
      if(this.validateSerialItem()){
        this.toastr.error('', this.translate.instant("SerialAlreadyExist"));
        return;
      }
    }

    if (!this.validateQuantity()) {
      return;
    }

    var index = this.batchSerialNo.lastIndexOf(this.fromPalletNo);
    var finalLotNo = this.batchSerialNo.substring(0, index) + this.toPalletNo;
    var object = {
      ItemCode: this.itemCode,
      ActualBSNo: this.batchSerialNo.substring(0, index),
      LotNo: this.batchSerialNo,
      MoveQty: this.moveQty,
      RemainQty: this.remainQty,
      FinalLotNo: finalLotNo,
      PalletCode: this.toPalletNo,
      Quantity: this.qty,
      FromBinNo: this.fromBinNo,
      ToBinNo: this.toBin,
      FromWhse: this.fromWhse,
      ToWhse: this.toWhse,
      ExpiryDate: "" + this.expDate
    }
    this.savedPalletsArray.push(object);

    if (this.savedPalletsArray.length > 0) {
      this.enableSplitPalletBtn = true;
    }

    // this.resetVariables();
    this.qty = 0;
    this.batchSerialNo = '';
  }

  validateQuantity() {
    this.sumOfQty = 0;
    for (let i = 0; i < this.savedPalletsArray.length; i++) {
      var savedItem = this.savedPalletsArray[i].ItemCode;
      var savedLotNo = this.savedPalletsArray[i].LotNo;

      if (this.itemCode == savedItem && this.batchSerialNo == savedLotNo) {
        this.sumOfQty = this.sumOfQty + Number.parseInt(this.savedPalletsArray[i].Quantity);
      }
    }

    this.sumOfQty = this.sumOfQty + Number.parseInt("" + this.qty);

    if (this.sumOfQty > this.openQty) {
      this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantityValid"));
      this.qty = 0;
      return false;
    }
    // else if(this.sumOfQty > this.openQty && this.savedPalletsArray.length == 0) {
    //   this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantityValid"));
    //   this.qty = 0;
    //   return false;
    // } 
    else {
      return true;
    }
  }

  OnBatchSerialLookupClick() {
    if (this.fromPalletNo == '' || this.fromPalletNo == undefined) {
      this.toastr.error('', this.translate.instant("Plt_FromPalletRequired"));
      return;
    }
    if (this.itemCode == '' || this.itemCode == undefined) {
      this.toastr.error('', this.translate.instant("SelectItemCode"));
      return;
    }
    this.fromPalletLookup = '';


    this.showLoader = true;
    this.commonservice.GetBatchandSerialItemsFromPallet(this.fromPalletNo, this.itemCode).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          console.log("GetBatchandSerialItemsFromPallet - " + JSON.stringify(data));
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookup = true;
          this.serviceData = data;
          this.lookupFor = "ShowBatachSerList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.showLoader = false;
          this.toastr.error('', error);
        }
      }
    );
  }

  onBatchSerialScan() {

  }

  OnItemCodeLookupClick() {
    if (this.fromPalletNo == '' || this.fromPalletNo == undefined) {
      this.toastr.error('', this.translate.instant("Plt_SelectFromPallet"));
      return;
    }
    this.fromPalletLookup = '';

    this.showLoader = true;
    this.commonservice.GetItemsFromPallet(this.fromPalletNo).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          console.log("GetItemsFromPallet - " + JSON.stringify(data));
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookup = true;
          this.serviceData = data;
          this.lookupFor = "ItemsList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.showLoader = false;
          this.toastr.error('', error);
        }
      }
    );
  }

  OnItemCodeChange() {
    if (this.itemCode == "" || this.itemCode == undefined) {
      // this.toastr.error('', this.translate.instant("InvalidItemCode"));
      return;
    }

    if (this.fromPalletNo == "" || this.fromPalletNo == undefined) {
      this.itemCode = "";
      this.toastr.error('', this.translate.instant("Plt_SelectFromPallet"));
      return;
    }

    this.showLoader = true;
    this.commonservice.IsValidItemsFromPallet(this.fromPalletNo, this.itemCode).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          console.log("" + data);
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.itemCode = data[0].ITEMCODE;
          this.itemType = data[0].ITEMTYPE;
          this.batchSerialNo = '';
          this.qty = 0;
          if (this.itemType == "S") {
            this.isSerailTrackedItem = true;
          } else {
            this.isSerailTrackedItem = false;
          }
        } else {
          this.toastr.error('', this.translate.instant("InvalidItemCode"));
          this.itemCode = "";
          this.batchSerialNo = '';
          this.qty = 0;
        }
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  resetVariables() {
    this.itemCode = '';
    this.batchSerialNo = '';
    this.toPalletNo = '';
    this.expDate = "";
    this.fromWhse = "";
    this.fromBinNo = "";
    this.openQty = 0;
    this.qty = 0;
    this.moveQty = 0;
  }

  clickShowHideGrid() {
    this.showHideGridToggle = !this.showHideGridToggle;
    if (this.showHideGridToggle) {
      this.showHideBtnTxt = this.translate.instant("hideGrid");
    } else {
      this.showHideBtnTxt = this.translate.instant("showGrid");
    }
  }

  validateRemainigQuantity() {
    this.sumOfQty = 0;
    for (let i = 0; i < this.savedPalletsArray.length; i++) {
      var savedItem = this.savedPalletsArray[i].ItemCode;
      var savedLotNo = this.savedPalletsArray[i].LotNo;

      if (this.itemCode == savedItem && this.batchSerialNo == savedLotNo) {
        this.sumOfQty = this.sumOfQty + Number.parseInt(this.savedPalletsArray[i].Quantity);
      }
    }

    this.qty = this.openQty - this.sumOfQty;
  }
  onHiddenFromPltScanClick() {
    this.onPalletChange('from_pallet');
  }

  onHiddenToPltScanClick() {
    this.onPalletChange('to_pallet');
  }
  onHiddenItemScanClick() {
    this.OnItemCodeChange();
  }
  onHiddenBatchSerialScanClick() {
    this.OnLotsChange();
  }

  validateSerialItem() {
    this.sumOfQty = 0;
    for (let i = 0; i < this.savedPalletsArray.length; i++) {
      var savedItem = this.savedPalletsArray[i].ItemCode;
      var savedLotNo = this.savedPalletsArray[i].LotNo;
      if (this.itemCode == savedItem && this.batchSerialNo == savedLotNo) {
        return true;
      }
    }
    return false;
  }
}
