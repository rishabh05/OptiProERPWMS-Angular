import { Component, OnInit } from '@angular/core';
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
    this.showLoader = true;
    this.commonservice.getPalletsOfSameWarehouse("").subscribe(
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
              this.showHideGridToggle = false;
              this.showHideBtnTxt = this.translate.instant("showGrid");

              this.getPalletData();
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
    this.router.navigateByUrl('home/dashboard', { skipLocationChange: true });
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
    this.showHideGridToggle = false;
    this.showHideBtnTxt = this.translate.instant("showGrid");

    // this.showLoader = true;
    this.commonservice.GetPalletData(this.palletNo).subscribe(
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

  depalletize() {
    this.showLoader = true;
    this.commonservice.depalletize(this.palletNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null && data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
          // if (data != null && data.length>0 && data[0].ErrorMsg == "") { 
          this.toastr.success('', this.translate.instant("Plt_DePalletize_success"));
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
  resetPageOnSuccess() {
    this.palletData = [];
    this.toWhse = "";
    this.toBin = "";
    this.palletNo = "";
  }

  ScanPalletField(){
    this.onPalletChange();
  }

}
