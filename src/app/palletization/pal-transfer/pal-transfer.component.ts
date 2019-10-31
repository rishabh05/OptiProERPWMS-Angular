import { Component, OnInit } from '@angular/core';
import { Pallet } from 'src/app/models/Inbound/Pallet';
import { Commonservice } from 'src/app/services/commonservice.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pal-transfer',
  templateUrl: './pal-transfer.component.html',
  styleUrls: ['./pal-transfer.component.scss']
})
export class PalTransferComponent implements OnInit {

  showLoader: boolean = false;
  showLookup: boolean = false;
  lookupFor: any = "";
  selectedPallets: any = Array<Pallet>();
  public serviceData: any;
  autoGenereatePalletEnable: boolean = false;
  showNewPallet: boolean = false;
  createdNewPallet: string = "";
  itemCode: string = "";
  itemsList: any;
  showHideGridToggle: boolean = false;
  showHideBtnTxt: string;
  toPalletNo: string = "";
  fromPalletNo: string = "";
  fromPalletLookup: string = "";
  palletData: any;
  finalPalletData: any[] = [];
  showConfirmDialog: boolean;
  rowindexForDelete: any;
  gridDataAfterDelete: any[];
  dialogMsg: string = ""
  yesButtonText: string = "";
  noButtonText: string = "";
  operationType: string = "";
  dialogFor: string = "";
  toBin: string;
  toWhse: string;
  newPalletNoAutoGenerated: string;
  newPalletNoEntered: string;

  constructor(private commonservice: Commonservice,
    private router: Router, private toastr: ToastrService, private translate: TranslateService) {

  }

  ngOnInit() {
    if (localStorage.getItem("AutoPalletIdGenerationChecked") == "True") {
      this.autoGenereatePalletEnable = true;
    }
  }

  public getPalletList(from: string) {
    var code = "";
    if (from == "from_pallet") {
      code = this.toPalletNo;
    } else if (from == "to_pallet") {
      code = this.fromPalletNo;//Array.prototype.map.call(this.selectedPallets, function (item) { return "'"+item.Code+"'"; }).join(",");
      console.log("code: " + code);
    }

    this.showLoader = true;
    this.commonservice.getPalletsOfSameWarehouse(code).subscribe(
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
    if(from == "from_pallet") {
      if (this.fromPalletNo == '' ){
        return;
      }
    }
    if(from == "to_pallet") {
      if (this.toPalletNo == '' ){
        return;
      }
    }
    

    var plt;
    if (from == "from_pallet") {
      plt = this.fromPalletNo;
    } else {
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
            } else if (from == "to_pallet") {
              this.toPalletNo = data[0].Code;
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
    this.showLoader = false;
    if (this.fromPalletLookup == "from_pallet") {
      this.showLoader = false;
      if (!this.containPallet(this.selectedPallets, lookupValue.Code)) {
        this.fromPalletNo = lookupValue.Code;
        this.toWhse = lookupValue.U_OPTM_WAREHOUSE_LOC;
        this.toBin = lookupValue.U_OPTM_BIN;
      }
    } else if (this.fromPalletLookup == "to_pallet") {
      this.toPalletNo = lookupValue.Code;
    }

    if (this.fromPalletNo != '' && this.toPalletNo != '') {
      this.showHideGridToggle = false;
      this.showHideBtnTxt = this.translate.instant("showGrid");
      this.getPalletData();
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

  clickShowHideGrid() {
    this.showHideGridToggle = !this.showHideGridToggle;
    if (this.showHideGridToggle) {
      this.showHideBtnTxt = this.translate.instant("hideGrid");
    } else {
      this.showHideBtnTxt = this.translate.instant("showGrid");
    }
  }

  getPalletData() {
    // this.showLoader = true;
    this.commonservice.GetPalletData(this.fromPalletNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          this.finalPalletData = [];
          this.palletData = data;
          for (let i = 0; i < this.palletData.length; i++) {
            var index = this.palletData[i].SRLBATCH.lastIndexOf("-");
            var finalBS = this.palletData[i].SRLBATCH.substring(0, index) + "-" + this.toPalletNo;
            var object = {
              ITEMID: this.palletData[i].ITEMID,
              SRLBATCH: this.palletData[i].SRLBATCH,
              QTY: this.palletData[i].QTY,
              SELECT: this.palletData[i].SELECT,
              FINALSRLBATCH: finalBS
            };
            this.finalPalletData.push(object);
          }
          this.palletData = this.finalPalletData;
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

  back(fromwhereval: number) {
    this.router.navigateByUrl('home/dashboard', { skipLocationChange: true });
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

  transfer() {
    this.showLoader = true;
    this.commonservice.palletTransfer( this.fromPalletNo, this.toPalletNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null && data[0].ErrorMsg == ""){
          this.toastr.success('', this.translate.instant("Plt_Transfer_success"));
          this.resetPageOnSuccess();
        }
        else if (data[0].ErrorMsg == "7001") {
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
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  resetPageOnSuccess(){
    this.palletData = [];
    this.showHideGridToggle = false;
    this.fromPalletNo = "";
    this.toPalletNo = "";
    this.toWhse = "";
    this.toBin = "";
  }

  onCheckChange() {
    this.showNewPallet = !this.showNewPallet;
    if (this.showNewPallet) {
      this.newPalletNoAutoGenerated = "";
    } else {
      this.newPalletNoEntered = "";
    }
  }

  public createNewPallet() {
    var palletId;
    if (this.showNewPallet) {
      palletId = this.newPalletNoAutoGenerated;
    }

    if (this.autoGenereatePalletEnable) {
      palletId = "";
    } else {
      if (palletId == '' || palletId == undefined) {
        this.toastr.error('', this.translate.instant("Plt_EnterPalletNo"));
        return;
      }
    }

    console.log("palletId: " + palletId);
    this.showLoader = true;
    this.commonservice.createNewPallet(palletId).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            console.log(data);
            if (this.showNewPallet) {
              this.newPalletNoAutoGenerated = data;
            } else {
              this.newPalletNoEntered = data;
            }
            return;
          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  clearPalletItems(item) {
    this.showHideGridToggle = false;
    this.showHideBtnTxt = this.translate.instant("showGrid");

    console.log(this.toPalletNo);
    this.palletData = [];
    this.finalPalletData = [];
    // this.fromPalletNo = '';
    this.toPalletNo = '';
  }
}
