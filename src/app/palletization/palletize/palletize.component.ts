import { Component, OnInit } from '@angular/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Pallet } from 'src/app/models/Inbound/Pallet';
import { PalletOperationType } from 'src/app/enums/PalletEnums';

@Component({
  selector: 'app-palletize',
  templateUrl: './palletize.component.html',
  styleUrls: ['./palletize.component.scss']
})
export class PalletizeComponent implements OnInit {
  //showGridBtn: boolean 
  showGrid: boolean = false;
  showLoader: boolean = false;
  showLookup: boolean = false;
  lookupFor: any = "";
  savedPalletsArray: any = Array<Pallet>();
  public serviceData: any;
  autoGenereatePalletEnable: boolean = false;
  palletNo: string = "";
  enableAddPalletBtn: boolean = false;
  showNewPallet: boolean = false;
  createdNewPallet: string = "";
  itemCode: string = "";
  itemsList: any;
  showHideGridToggle: boolean = false;
  showHideBtnTxt: string;
  batchSerialNo: string = "";
  qty: number = 0;
  openQty: string;
  expDate: string;
  toBin: string;
  toWhse: string;
  fromWhse: string;
  fromBinNo: string;

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
    if (this.itemCode == '' || this.itemCode == undefined) {
      return
    }

    this.showLoader = true;
    this.commonservice.getPalletList(1, this.itemCode).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            console.log(data);
            this.showLoader = false;
            this.serviceData = data;
            this.showLookup = true;
            this.lookupFor = "PalletList";
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

  onPalletChange() {
    if (this.palletNo == '' || this.palletNo == undefined) {
      return
    }

    this.showLoader = true;
    this.commonservice.isPalletValid(this.palletNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("InValidPalletNo"));
              this.palletNo = "";
              return;
            } else {
              //this.palletNo = "";
              this.showHideBtnTxt = this.translate.instant("showGrid");
            }
          }
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          this.palletNo = "";
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
    this.showLoader = false;
    if (this.lookupFor == "PalletList") {
      this.palletNo = lookupValue.Code;
      this.toWhse = lookupValue.U_OPTM_WAREHOUSE_LOC;
      this.toBin = lookupValue.U_OPTM_BIN;
      this.showHideBtnTxt = this.translate.instant("showGrid");
    } else if (this.lookupFor == "ItemsList") {
      this.itemCode = lookupValue.ITEMCODE;
      //Reset fields when change itemcode
      this.resetVariablesOnItemSelect();
    } else if (this.lookupFor == "ShowBatachSerList") {
      this.batchSerialNo = lookupValue.LOTNO;
      this.expDate = lookupValue.EXPDATE;
      this.fromWhse = lookupValue.WHSCODE;
      this.fromBinNo = lookupValue.BINNO;
      this.openQty = lookupValue.TOTALQTY;
    }
  }

  back(fromwhereval: number) {
    this.router.navigateByUrl('home/dashboard', { skipLocationChange: true });
  }

  // clickShowGrid(){
  //   this.showGrid = true;
  // }
  clickShowHideGrid() {

    this.showHideGridToggle = !this.showHideGridToggle;
    if (this.showHideGridToggle) {
      this.showGrid = true;
      this.showHideBtnTxt = this.translate.instant("hideGrid");
    } else {
      this.showGrid = false;
      this.showHideBtnTxt = this.translate.instant("showGrid");
    }
  }
  onCheckChange() {
    this.showNewPallet = !this.showNewPallet;
    if (this.showNewPallet) {
    } else {
      this.createdNewPallet = "";
    }
  }

  OnItemCodeLookupClick() {
    this.showLoader = true;
    this.commonservice.getItemsToPalletize().subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          console.log("getItemsToPalletize - " + JSON.stringify(data));
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
      return;
    }
    this.showLoader = true;
    this.commonservice.getItemInfo(this.itemCode).subscribe(
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
          this.resetVariablesOnItemSelect();
          // this.CheckTrackingandVisiblity();
          // if (localStorage.getItem("whseId") != localStorage.getItem("towhseId")) {
          //   this.getDefaultBin();
          // }
        } else {
          this.toastr.error('', this.translate.instant("InvalidItemCode"));
          this.itemCode = "";
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

  // clickShowHideGrid() {
  //   this.showHideGridToggle = !this.showHideGridToggle;
  //   if (this.showHideGridToggle) {
  //     this.showHideBtnTxt = this.translate.instant("hideGrid");
  //   } else {
  //     this.showHideBtnTxt = this.translate.instant("showGrid");
  //   }
  // }

  showHideGridBtn() {
    if ((this.itemCode != "" && this.itemCode != undefined)
      && (this.batchSerialNo != "" && this.batchSerialNo != undefined)
      && (this.palletNo != "" && this.palletNo != undefined)) {
      return true;
    }
    return false;
  }

  OnBatchSerialLookupClick() {
    if (this.itemCode == '' || this.itemCode == undefined) {
      this.toastr.error('', this.translate.instant("Please select item code"));
      return;
    }

    this.showLoader = true;
    this.commonservice.getBatchSerialForItem(this.itemCode).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          console.log("getItemsToPalletize - " + JSON.stringify(data));
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

  OnLotsChange() {
    if (this.batchSerialNo == "" || this.batchSerialNo == undefined) {
      return;
    }
  }

  addQuantity() {
    if (this.qty == 0 || this.qty == undefined) {
      this.toastr.error('', this.translate.instant("Inbound_EnterQuantityErrMsg"));
      return;
    }
    if (!Number.isInteger(this.qty)) {
      this.toastr.error('', this.translate.instant("DecimalQuantity"));
      return;
    }
    if (this.itemCode == "" || this.itemCode == undefined) {
      this.toastr.error('', this.translate.instant("SelectItemCode"));
      return;
    }
    if (this.batchSerialNo == "" || this.batchSerialNo == undefined) {
      this.toastr.error('', this.translate.instant("SelectBatchSerial"));
      return;
    }
    if (this.palletNo == "" || this.palletNo == undefined) {
      this.toastr.error('', this.translate.instant("Plt_PalletRequired"));
      return;
    }

    //  if (!this.validateQuantity()) {
    //    return;
    //  }

    var object = {
      ItemCode: this.itemCode,
      LotNo: this.batchSerialNo,
      FinalLotNo: this.batchSerialNo + "-" + this.palletNo,
      PalletCode: this.palletNo,
      Quantity: this.qty,
      FromBinNo: this.fromBinNo,
      ToBinNo: this.toBin,
      FromWhse: this.fromWhse,
      ToWhse: this.toWhse,
      ExpiryDate: this.expDate
    }
    this.savedPalletsArray.push(object);
    if (this.savedPalletsArray.length > 0) {
    this.enableAddPalletBtn = true;
    }
    this.resetVariablesOnItemSelect();

    //this.updateReceiveQty();
  }

  validateQuantity(): boolean {
    let quantitySum: number = 0;
    for (var i = 0; i < this.savedPalletsArray.length; i++) {
      quantitySum += Number(this.savedPalletsArray[i].Quantity);
    }
    quantitySum = quantitySum + Number(this.qty);

    if (Number(this.openQty) == 0) {
      this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantity"));
      this.qty = 0;
      return false;
    } else if (quantitySum > Number(this.openQty)) {
      this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantityValid"));
      this.qty = 0;
      return false;
    } else {
      return true;
    }
  }

  palletize() {

    this.showLoader = true;
    var oPalletReq: any = {};
    oPalletReq.Header = [];
    oPalletReq.Detail = [];
    oPalletReq.Header.push({
      COMPANYDBNAME: localStorage.getItem("CompID"),
      PALLETOPERATIONTYPE: PalletOperationType.Palletization,
      WhsCode: localStorage.getItem("whseId"),
      FromPalletCode: "",
      ToPalletCode: "",
      USERID: localStorage.getItem("UserId")
    }
    );

    for (var i = 0; i < this.savedPalletsArray.length; i++) {
      oPalletReq.Detail.push({
        ITEMCODE: this.savedPalletsArray[i].ItemCode,
        BATCHNO: this.savedPalletsArray[i].LotNo,
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
    this.commonservice.palletize(oPalletReq).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null && data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
          //  if (data != null && data.length>0 && data[0].ErrorMsg == "") {
          this.toastr.success('', this.translate.instant("Plt_Merge_success"));
          this.resetPageOnSuccess();
        } else if (data[0].ErrorMsg == "7001") {
          this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
            this.translate.instant("CommonSessionExpireMsg"));
          return;
        }
        else {
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

  resetPageOnSuccess() {
    this.batchSerialNo = '';
    this.palletNo = '';
    this.expDate = "";
    this.fromWhse = "";
    this.fromBinNo = "";
    this.openQty = "0";
    this.qty = 0;
    this.toBin = "";
    this.toWhse = "";
    this.itemCode = "";
  }

  openConfirmForDelete(index: any, item: any) {
    console.log("index: " + index)
    console.log("item: " + item)
    this.savedPalletsArray.splice(index, 1);
  }

  resetVariablesOnItemSelect() {
    this.batchSerialNo = '';
    this.palletNo = '';
    this.expDate = "";
    this.fromWhse = "";
    this.fromBinNo = "";
    this.openQty = "0";
    this.qty = 0;
  }
}
