import { Component, OnInit } from '@angular/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Pallet } from 'src/app/models/Inbound/Pallet';

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
  selectedToPallets: any = Array<Pallet>();
  public serviceData: any;
  autoGenereatePalletEnable: boolean = false;
  createdNewPallet: string;
  toPalletNo: string = "";
  fromPalletNo: string = "";
  fromPalletLookup: string;
  toBin: string;
  toWhse: string;
  
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
    if (this.fromPalletNo == '' && this.toPalletNo == '') {
      return;
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
              if (!this.containPallet(this.selectedToPallets, data[0].Code)) {
                this.selectedToPallets.push(data[0]);
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
      this.fromPalletNo = lookupValue.Code;
      this.toWhse = lookupValue.U_OPTM_WAREHOUSE_LOC;
      this.toBin = lookupValue.U_OPTM_BIN;
    } else if (this.fromPalletLookup == "to_pallet") {
      this.toPalletNo = lookupValue.Code;
      //this.getPalletData(this.toPalletNo);
      if (!this.containPallet(this.selectedToPallets, lookupValue.Code)) {
        this.selectedToPallets.push(lookupValue);
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

  getPalletData(toPalletNo: string) {
    // this.showHideGridToggle = false;
    // this.showHideBtnTxt = this.translate.instant("showGrid");

    // this.showLoader = true;
    this.commonservice.GetPalletData(toPalletNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          //this.palletData = data;
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

  splitPallet(event:any){

  }

  back(fromwhereval: number) {
    this.router.navigateByUrl('home/dashboard', { skipLocationChange: true });
  }

  openConfirmForDelete(index: any, item: any){
    console.log("index: "+index)
    console.log("item: "+item)
    this.selectedToPallets.splice(index);
  }

  onCheckChange() {
    this.showNewPallet = !this.showNewPallet;
    if (this.showNewPallet) {
    } else {
      this.createdNewPallet = "";
    }
  }

  clearPalletItems(item) {
    console.log(this.toPalletNo);
    for (var i = 0; i < this.selectedToPallets.length; i++) {
      if (this.toPalletNo == this.selectedToPallets[i].Code) {
        this.selectedToPallets.splice(i)
        break;
      }
    }
    this.toPalletNo = '';
  }
}
