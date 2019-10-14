import { Component, OnInit } from '@angular/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Pallet } from 'src/app/models/Inbound/Pallet';

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
  selectedPallets: any = Array<Pallet>();
  public serviceData: any;
  autoGenereatePalletEnable: boolean = false;
  createdNewPallet: string;
  toPalletNo: string;
  fromPalletNo: string;
  fromPalletLookup: string;

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
            // this.palletValue = this.serviceData[0].Code;
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
        console.log("Error: ", error);
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
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("InValidPalletNo"));
              this.fromPalletNo = "";
              this.toPalletNo = "";
              return;
            }
            else {
              if (from == "from_pallet") {
                this.fromPalletNo = data[0].Code;
              } else {
                this.toPalletNo = data[0].Code;
              }
            }
          }
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          this.fromPalletNo = "";
          this.toPalletNo = "";
          return;
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
      }
    );
  }

  getLookupValue(lookupValue: any) {
    if (this.fromPalletLookup == "from_pallet") {
      this.showLoader = false;
      // this.showPalletLookup = true;
      // this.palletValue = lookupValue[0];
      this.selectedPallets.push(lookupValue);
    } else if (this.fromPalletLookup == "to_pallet") {
      this.toPalletNo = lookupValue.Code;
    }
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
}
