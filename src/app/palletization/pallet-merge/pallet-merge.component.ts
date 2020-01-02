import { Component, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('scanFromPallet') scanFromPallet
  @ViewChild('scanToPallet') scanToPallet

  constructor(private commonservice: Commonservice,
    private router: Router, private toastr: ToastrService, private translate: TranslateService) {

  }

  ngOnInit() {
    if (localStorage.getItem("AutoPalletIdGenerationChecked") == "True") {
      this.autoGeneratePalletEnable = true;
    }
  }

  ngAfterViewInit(): void{
    this.scanFromPallet.nativeElement.focus()
  }

  public getFromPalletList(from: string) {
    this.showLoader = true;
    this.commonservice.GetPalletsWithRowsPresent().subscribe(
      (data: any) => {
        this.showLoader = false;
       // console.log(data);
        if (data != null) {
          if (data.length > 0) {
           // console.log(data);
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

  public getPalletList(from: string) {
    //This code will only work for get ToPallet....we are calling seperate api for FromPallet
    var code = "";
    if (from == "from_pallet") {
      code = this.toPalletNo;
    } else if (from == "to_pallet") {
      code = Array.prototype.map.call(this.selectedFromPallets, function (item) { return "'" + item.Code + "'"; }).join(",");
     // console.log("code: " + code);
    }
    this.showLoader = true;
    this.commonservice.getPalletsOfSameWarehouse(code).subscribe(
      (data: any) => {
        this.showLoader = false;
       // console.log(data);
        if (data != null) {
          if (data.length > 0) {
          //  console.log(data);
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
      //  console.log(data);
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
              this.scanToPallet.nativeElement.focus();
            } else if (from == "from_pallet") {
              this.fromPalletNo = "";
              this.scanFromPallet.nativeElement.focus()
            }
            return;
          }
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          if (from == "to_pallet") {
            this.toPalletNo = "";
            this.scanToPallet.nativeElement.focus();
          } else if (from == "from_pallet") {
            this.fromPalletNo = "";
            this.scanFromPallet.nativeElement.focus()
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
      this.showLookup = false;
      this.showLoader = false;
      this.fromPalletNo = "";//lookupValue.Code;
      this.toWhse = lookupValue.U_OPTM_WAREHOUSE_LOC;
      this.toBin = lookupValue.U_OPTM_BIN;
      if (!this.containPallet(this.selectedFromPallets, lookupValue.Code)) {
        this.selectedFromPallets.push(lookupValue);
      }
      this.scanFromPallet.nativeElement.focus()
    } else if (this.fromPalletLookup == "to_pallet") {
      this.showLookup = false;
      this.toPalletNo = lookupValue.Code;
      this.scanToPallet.nativeElement.focus()
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
    this.newCreatedPalletNo = "";
    this.showInputDialog("NewPallet_PalletMerge", this.translate.instant("Done"), this.translate.instant("Cancel"),
    this.translate.instant("Plt_CreateNewPallet"));
  }

  depalletize() {

  }

  back(fromwhereval: number) {
    this.router.navigate(['home/dashboard', { skipLocationChange: true }]);
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
        //console.log(data);
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
    //console.log("index: " + index)
    //console.log("item: " + item)
    this.selectedFromPallets.splice(index, 1);
  }

  HiddenScanPalletField() {
    var inputValue = (<HTMLInputElement>document.getElementById('pltMergePalletNoInput')).value;
    if (inputValue.length > 0) {
      this.toPalletNo = inputValue;
    }
    this.onPalletChange('to_pallet');
  }
  HiddenScanToPalletField() {
    var inputValue = (<HTMLInputElement>document.getElementById('pltMergeToPalletInput')).value;
    if (inputValue.length > 0) {
      this.toPalletNo = inputValue;
    }
    this.onPalletChange('from_pallet');
  }

  public createNewPallet(palletNo: string, binNo: string) {
    this.showLoader = true;
    this.commonservice.createNewPallet(palletNo, binNo).subscribe(
      (data: any) => {
        this.showLoader = false;
       // console.log(data);
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

  inputDialogFor: any;
  yesButtonText: any;
  noButtonText: any;
  titleMessage: any;
  showInputDialogFlag: boolean = false;
  showInputDialog(dialogFor: string, yesbtn: string, nobtn: string, msg: string) {
    this.inputDialogFor = dialogFor;
    this.yesButtonText = yesbtn;
    this.noButtonText = nobtn;
    this.showInputDialogFlag = true;
    this.titleMessage = msg;
  }

  getInputDialogValue($event) {
    //console.log("getInputDialogValue " + event)
    this.showInputDialogFlag = false;
    if ($event.Status == "yes") {
      switch ($event.From) {
        case ("NewPallet_PalletMerge"):
          this.createNewPallet($event.PalletNo, $event.BinNo);
          break
      }
    }
  }

  viewPalletClick(index: any, item: any) {
    this.fromPalletLookup = "";
    var code = this.selectedFromPallets[index].Code;
    this.getPalletData(code);
  }

  itemList: any = [];

  getPalletData(pallet: any) {
    // this.showLoader = true;
    this.commonservice.GetPalletData(pallet).subscribe(
      (data: any) => {
        this.showLoader = false;
       // console.log(data);
        if (data != null && data.length > 0) {
          // this.serviceData = data;
          var tempList: any = [];
          for(let i=0;i<data.length;i++){
            tempList.push({
              ITEMCODE: data[i].ITEMID,
              ITEMNAME: data[i].ITEMNAME
            });
          }
          this.serviceData = tempList;
          this.lookupFor = "ItemsList";
          this.showLookup = true;
        }
        else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
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
}
