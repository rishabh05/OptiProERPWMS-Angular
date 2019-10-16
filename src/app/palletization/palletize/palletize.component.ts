import { Component, OnInit } from '@angular/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Pallet } from 'src/app/models/Inbound/Pallet';

@Component({
  selector: 'app-palletize',
  templateUrl: './palletize.component.html',
  styleUrls: ['./palletize.component.scss']
})
export class PalletizeComponent implements OnInit {

  showLoader: boolean = false;
  showLookup: boolean = false;
  lookupFor: any = "";
  selectedPallets: any = Array<Pallet>();
  public serviceData: any;
  autoGenereatePalletEnable: boolean = false;
  palletNo: string = "";
  showNewPallet: boolean = false;
  createdNewPallet: string = "";
  itemCode: string;

  constructor(private commonservice: Commonservice,
    private router: Router, private toastr: ToastrService, private translate: TranslateService) {

  }

  ngOnInit() {
    if (localStorage.getItem("AutoPalletIdGenerationChecked") == "True") {
      this.autoGenereatePalletEnable = true;
    }
  }

  public getPalletList(from: string) {
    this.showLoader = true;
    this.commonservice.getPalletList("itemCode").subscribe(
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
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
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
        if(error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined){
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));               
       } 
       else{
        this.toastr.error('', error);
       }
      }
    );
  }

  getLookupValue(lookupValue: any) {
    if (this.lookupFor == "PalletList") {
      this.showLoader = false;
      // this.showPalletLookup = true;
      this.palletNo = lookupValue.Code;
      //this.selectedPallets.push(lookupValue);
    }
  }

  back(fromwhereval: number) {
    this.router.navigateByUrl('home/dashboard', { skipLocationChange: true });
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
    this.commonservice.getItemCodeList().subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          // console.log("ItemList - " + data.toString());
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLoader = false;
          this.serviceData = data;
          this.lookupFor = "ItemsList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
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
          //this.itemName = data[0].ITEMNAME;
          //this.showItemName = true;
          // oWhsTransEditLot.Remarks = data[0].getValue();
          // this.ItemTracking = data[0].TRACKING;
          // this.transferQty = "0.000";
          // this.onHandQty = 0.000;
          this.CheckTrackingandVisiblity();
          if (localStorage.getItem("whseId") != localStorage.getItem("towhseId")) {
            this.getDefaultBin();
          }
        } else {
          this.toastr.error('', this.translate.instant("InvalidItemCode"));
          // this.showItemName = false;
          // this.itemCode = "";
          // this.fromBin = "";
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

  CheckTrackingandVisiblity() {
    // if (this.ItemTracking == "B") {
    //   this.isItemSerialTrack = false;
    //   this.showBatchNo = true;
    //   this.editTransferQty = false;
    //   this.batchNoPlaceholder = this.translate.instant("BatchNo");
    //   // oTxtTransferQty.setEnabled(true);
    // }
    // else if (this.ItemTracking == "S") {
    //   this.isItemSerialTrack = true;
    //   this.showBatchNo = true;
    //   this.editTransferQty = true;
    //   this.batchNoPlaceholder = this.translate.instant("SerialNo");
    // }
    // else if (this.ItemTracking == "N") {
    //   this.isItemSerialTrack = false;
    //   this.showBatchNo = false;
    //   this.editTransferQty = false;
    //   // olbllotno.setText("")
    // }
    // this.fromBin = "";
    // this.toBin = "";
    // this.lotValue = "";
  }

  getDefaultBin() {
    // this.inventoryTransferService.getDefaultBin(this.itemCode, localStorage.getItem("towhseId")).subscribe(
    //   data => {
    //     this.getDefaultBinFlag = true;
    //     if (data != null) {
    //       if (data != this.fromBin) {
    //         this.toBin = data;
    //       }
    //       return;
    //     }
    //     else {
    //       this.ShowToBins();
    //     }
    //   },
    //   error => {
    //     this.toastr.error('', error);
    //   }
    // );
  }

}
