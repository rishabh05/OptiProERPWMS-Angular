import { Component, OnInit, ViewChild } from '@angular/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Pallet } from 'src/app/models/Inbound/Pallet';
import { PalletOperationType } from 'src/app/enums/PalletEnums';

@Component({
  selector: 'app-depalletize',
  templateUrl: './depalletize.component.html',
  styleUrls: ['./depalletize.component.scss']
})
export class DepalletizeComponent implements OnInit {

  showLoader: boolean = false;
  showLookup: boolean = false;
  lookupFor: any = "";
  selectedPallets: any = Array<Pallet>();
  public serviceData: any;
  autoGenereatePalletEnable: boolean = false;
  palletNo: string = "";
  showNewPallet: boolean = false;
  createdNewPallet: string = "";
  showHideGridToggle: boolean = false;
  showHideBtnTxt: string;
  palletData: any;
  toBin: string;
  toWhse: string;
  @ViewChild('scanPallet') scanPallet

  constructor(private commonservice: Commonservice,
    private router: Router, private toastr: ToastrService, private translate: TranslateService) {
    this.showHideBtnTxt = this.translate.instant("showGrid");
  }

  ngOnInit() {
    if (localStorage.getItem("AutoPalletIdGenerationChecked") == "True") {
      this.autoGenereatePalletEnable = true;
    }
  }

  ngAfterViewInit(): void {
    this.scanPallet.nativeElement.focus()
    setTimeout(() => {
      this.showHideBtnTxt = this.translate.instant("showGrid");
    }, 500)
  }

  public getPalletList(from: string) {
    this.showLoader = true;
    this.commonservice.GetPalletsWithRowsPresent().subscribe(
      // this.commonservice.getPalletsOfSameWarehouse("").subscribe(
      (data: any) => {
        this.showLoader = false;
        //  console.log(data);
        if (data != null) {
          if (data.length > 0) {
            // console.log(data);
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

  onPalletChangeBlur() {
    if (this.isValidateCalled) {
      return
    }
    this.onPalletChange();
  }

  async onPalletChange(): Promise<any> {
    if (this.palletNo == '' || this.palletNo == undefined) {
      this.palletData = [];
      return false;
    }

    this.showLoader = true;
    var result = false;
    await this.commonservice.isPalletValid(this.palletNo).then(
      (data: any) => {
        this.showLoader = false;
        console.log("inside isPalletValid");
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("InValidPalletNo"));
              this.palletNo = "";
              this.palletData = [];
              this.scanPallet.nativeElement.focus()
              result = false;
            } else {
              this.palletNo = data[0].Code;
              // this.showHideGridToggle = false;
              // this.showHideBtnTxt = this.translate.instant("showGrid");
              this.getPalletData();
              result = true;
            }
          } else {
            this.palletNo = "";
            this.palletData = [];
            this.toastr.error('', this.translate.instant("InValidPalletNo"));
            result = false;
          }
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          this.palletNo = "";
          result = false;
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
        result = false;
      }
    );
    return result;
  }

  getLookupValue(lookupValue: any) {
    if (this.lookupFor == "PalletList") {
      this.showLoader = false;
      this.palletNo = lookupValue.Code;
      this.toWhse = lookupValue.U_OPTM_WAREHOUSE_LOC;
      this.toBin = lookupValue.U_OPTM_BIN;
      this.showHideBtnTxt = this.translate.instant("showGrid");
      this.getPalletData();
    }
  }

  back(fromwhereval: number) {
    this.router.navigate(['home/dashboard', { skipLocationChange: true }]);
  }
  public manageEyeIcon: boolean = true;
  clickShowHideGrid() {
    this.showHideGridToggle = !this.showHideGridToggle;
    if (this.showHideGridToggle) {
      this.showHideBtnTxt = this.translate.instant("hideGrid");
      this.manageEyeIcon = false;
    } else {
      this.manageEyeIcon = true;
      this.showHideBtnTxt = this.translate.instant("showGrid");
    }
  }

  getPalletData() {
    // this.showHideGridToggle = false;
    // this.showHideBtnTxt = this.translate.instant("showGrid");

    // this.showLoader = true;
    this.commonservice.GetPalletData(this.palletNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        // console.log(data);
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

  async depalletize() {
    var result = await this.validateBeforeSubmit();
    this.isValidateCalled = false;
    console.log("validate result: " + result);
    if (result != undefined && result == false) {
      return;
    }
    if (this.palletNo == '' || this.palletNo == undefined) {
      this.palletData = [];
      return;
    }

    this.showLoader = true;
    this.commonservice.depalletize(this.palletNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        // console.log(data);
        if (data != null && data != undefined && data.length > 0) {
          if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
            this.toastr.success('', this.translate.instant("Plt_DePalletize_success"));
            this.resetPageOnSuccess();
          } else if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          } else {
            this.toastr.error('', data[0].ErrorMsg);
          }
        } else {
          this.toastr.error('', this.translate.instant("Plt_DepalletizeErrMsg"));
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
    this.palletData = [];
    this.toWhse = "";
    this.toBin = "";
    this.palletNo = "";
  }

  ScanPalletField() {
    var inputValue = (<HTMLInputElement>document.getElementById('Depalletize_PalletNoInput')).value;
    if (inputValue.length > 0) {
      this.palletNo = inputValue;
    }
    this.onPalletChange();
  }

  isValidateCalled: boolean = false;
  async validateBeforeSubmit(): Promise<any> {
    this.isValidateCalled = true;
    var currentFocus = document.activeElement.id;
    console.log("validateBeforeSubmit current focus: " + currentFocus);

    if (currentFocus != undefined) {
      if (currentFocus == "Depalletize_PalletNoInput") {
        return this.onPalletChange();
      }
    }
  }
}
