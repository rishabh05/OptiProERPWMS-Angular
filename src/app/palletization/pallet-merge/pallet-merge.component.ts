import { Component, OnInit } from '@angular/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Pallet } from 'src/app/models/Inbound/Pallet';
import { PalletOperationType } from 'src/app/enums/PalletEnums';
import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';

@Component({
  selector: 'app-pallet-merge',
  templateUrl: './pallet-merge.component.html',
  styleUrls: ['./pallet-merge.component.scss']
})
export class PalletMergeComponent implements OnInit {

  showLoader: boolean = false;
  showLookup: boolean = false;
  showNewPallet: boolean = false;
  lookupFor: any = "";
  selectedFromPallets: any = Array<Pallet>();
  public serviceData: any;
  autoGeneratePalletEnable: boolean = false;
  createdNewPallet: string;
  toPalletNo: string = "";
  fromPalletNo: string = "";
  fromPalletLookup: string;
  toBin: string;
  toWhse: string;
  newCreatedPalletNo: string;

  constructor(private commonservice: Commonservice,
    private router: Router, private toastr: ToastrService, private translate: TranslateService) {

  }

  ngOnInit() {
    if (localStorage.getItem("AutoPalletIdGenerationChecked") == "True") {
      this.autoGeneratePalletEnable = true;
    }
  }

  public getPalletList(from: string) {
    var code = "";
    if (from == "from_pallet") {
      code = this.toPalletNo;
    } else if (from == "to_pallet") {
      code = Array.prototype.map.call(this.selectedFromPallets, function (item) { return "'" + item.Code + "'"; }).join(",");
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

  onPalletChange(from: string) {
    var plt;
    if (from == "from_pallet") {
      plt = this.fromPalletNo;
    } else {
      // if (this.containPallet(this.selectedFromPallets, this.toPalletNo)) {
      //   this.toastr.error('', this.translate.instant("Plt_AlreadySelected"));
      //   this.toPalletNo = '';
      //   return;
      // }
      plt = this.toPalletNo;
    }

    if (plt == '') {
      return;
    }

    this.showLoader = true;
    this.commonservice.isPalletValid(plt).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            if (from == "from_pallet") {
              // this.fromPalletNo = data[0].Code;
              this.fromPalletNo = "";
              if (!this.containPallet(this.selectedFromPallets, data[0].Code)) {
                this.selectedFromPallets.push(data[0]);
              }
            } else if (from == "to_pallet") {
              this.toPalletNo = data[0].Code;
              if (this.containPallet(this.selectedFromPallets, this.toPalletNo)) {
                this.toastr.error('', this.translate.instant("Plt_AlreadySelected"));
                this.toPalletNo = '';
                return;
              }
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
      this.fromPalletNo = "";//lookupValue.Code;
      this.toWhse = lookupValue.U_OPTM_WAREHOUSE_LOC;
      this.toBin = lookupValue.U_OPTM_BIN;
      if (!this.containPallet(this.selectedFromPallets, lookupValue.Code)) {
        this.selectedFromPallets.push(lookupValue);
      }
    } else if (this.fromPalletLookup == "to_pallet") {
      this.toPalletNo = lookupValue.Code;
      if (this.containPallet(this.selectedFromPallets, this.toPalletNo)) {
        this.toastr.error('', this.translate.instant("Plt_AlreadySelected"));
        this.toPalletNo = '';
        return;
      }
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

  onCheckChange() {
    this.showNewPallet = !this.showNewPallet;
    if (this.showNewPallet) {
    } else {
      this.createdNewPallet = "";
    }
  }

  depalletize() {

  }

  back(fromwhereval: number) {
    this.router.navigateByUrl('home/dashboard', { skipLocationChange: true });
  }

  mergePallet() {
    if (this.selectedFromPallets.length == 0 || this.toPalletNo == '') {
      return
    }
    var fromPltCode = Array.prototype.map.call(this.selectedFromPallets, function (item) { return "'" + item.Code + "'"; }).join(",");
    this.showLoader = true;
    this.commonservice.mergePallet(fromPltCode, this.toPalletNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null && data != undefined && data.length > 0) {
          if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
            this.toastr.success('', this.translate.instant("Plt_Merge_success"));
            this.resetPageOnSuccess();
          } else if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          } else {
            this.toastr.error('', data[0].ErrorMsg);
          }
        } else {
          this.toastr.error('', this.translate.instant("ErrorMsgSomethingWentWrong"));
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
    this.fromPalletNo = "";
    this.toWhse = "";
    this.toBin = "";
    this.toPalletNo = "";
    this.selectedFromPallets = [];
  }

  openConfirmForDelete(index: any, item: any) {
    console.log("index: " + index)
    console.log("item: " + item)
    this.selectedFromPallets.splice(index, 1);
  }

  ScanToPalletField() {
    this.onPalletChange('to_pallet');
  }
  ScanFromPalletField() {
    this.onPalletChange('from_pallet');
  }

  public createNewPallet() {
    var palletId = this.newCreatedPalletNo;
    if (this.autoGeneratePalletEnable) {
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
            this.newCreatedPalletNo = data;
            this.toPalletNo = this.newCreatedPalletNo;
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
}
