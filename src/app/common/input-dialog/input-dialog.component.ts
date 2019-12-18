import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { InventoryTransferService } from 'src/app/services/inventory-transfer.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { InboundService } from 'src/app/services/inbound.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-input-dialog',
  templateUrl: './input-dialog.component.html',
  styleUrls: ['./input-dialog.component.scss']
})
export class InputDialogComponent implements OnInit {

  palletNo: string = "";
  @Input() titleMessage: any;
  @Input() yesButtonText: any;
  @Input() noButtonText: any;
  @Input() fromWhere: any;
  @Output() isYesClick = new EventEmitter();
  showNoButton: boolean = true;
  showLoader: boolean = false;
  showLookup: boolean = true;
  serviceData: any[];
  lookupfor: string;
  binNo: string = "";
  autoGeneratePalletEnable: boolean = false;
  isPalletizationEnable: boolean = false;

  constructor(private commonservice: Commonservice, private translate: TranslateService, private toastr: ToastrService,
    private inboundService: InboundService, private router: Router) { }

  ngOnInit() {
    if (localStorage.getItem("AutoPalletIdGenerationChecked") == "True") {
      this.autoGeneratePalletEnable = true;
    }

    // if (localStorage.getItem("PalletizationEnabled") == "True" && localStorage.getItem("PalletizationEnabledForItem") == "True") {
    //   this.isPalletizationEnable = true;
    // } else {
    //   this.isPalletizationEnable = false;
    // }

    this.showLookup = true;
    this.showNoButton = true;
    if (this.noButtonText == undefined || this.noButtonText == "") {
      this.showNoButton = false;
    }

    this.autoGeneratePallet();

    this.OnBinLookupClick("OnInit");
  }

  public opened: boolean = true;

  public close(status) {
    if (status == "yes") {
      if (this.palletNo == undefined || this.palletNo == '') {
        this.toastr.error('', this.translate.instant("Plt_PalletRequired"));
        return
      }

      if (this.binNo == undefined || this.binNo == '') {
        this.toastr.error('', this.translate.instant("BinNoRequired"));
        return
      }
    }

    this.isYesClick.emit({
      Status: status,
      From: this.fromWhere,
      BinNo: this.binNo,
      PalletNo: this.palletNo
    });
    this.opened = false;
  }

  public open() {
    this.opened = true;
  }

  public ShowAllBins(callFrom: string) {
    this.showLoader = true;
    this.inboundService.GetTargetBins('N', localStorage.getItem("whseId")).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null && data.length > 0) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          } else {
            this.binNo = data[0].BINNO;
              if(callFrom != "OnInit"){
                this.showLookup = false;
                this.serviceData = data;
                this.lookupfor = "toBinsList";
              }
          }
        } else {
          this.toastr.error('', this.translate.instant("Inbound_NoBinsAvailableMsg"));
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


  OnBinLookupClick(callFrom: string) {
    if (this.fromWhere != "NewPallet_GRPO") {
      this.ShowAllBins(callFrom);
    } else {
      this.showLoader = true;
      this.inboundService.getRevBins('N', "").subscribe(
        data => {
          this.showLoader = false;
          if (data != null && data.length > 0) {
            if (data[0].ErrorMsg == "7001") {
              this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                this.translate.instant("CommonSessionExpireMsg"));
              return;
            } else {
              this.binNo = data[0].BINNO;
              if(callFrom != "OnInit"){
                this.showLookup = false;
                this.serviceData = data;
                this.lookupfor = "toBinsList";
              }
            }
          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
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
  }

  OnBinChange() {
    if (this.binNo == "" || this.binNo == undefined) {
      return;
    }
    this.showLoader = true;
    this.inboundService.binChange(localStorage.getItem("whseId"), this.binNo).subscribe(
      data => {
        this.showLoader = false;
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("INVALIDBIN"));
              this.binNo = '';
              return;
            }
            else {
              this.binNo = data[0].ID;
            }
          }
          else {
            this.binNo = "";
            this.toastr.error('', this.translate.instant("INVALIDBIN"));
            return;
          }
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

  getLookupValue($event) {
    if ($event != null && $event == "close") {
      //nothing to do
      return;
    }
    else if (this.lookupfor == "toBinsList") {
      this.binNo = $event[0];
    }
  }

  autoGeneratePallet() {
    this.showLoader = true;
    this.commonservice.autoGeneratePallet().subscribe(
      data => {
        console.log(data);
        this.showLoader = false;
        if (data != null) {
          if (data.length > 0) {
            this.palletNo = data;
          }
          else {
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
}
