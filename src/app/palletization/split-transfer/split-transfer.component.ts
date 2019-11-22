import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Commonservice } from 'src/app/services/commonservice.service';
import { TranslateService } from '@ngx-translate/core';
import { PalletOperationType } from 'src/app/enums/PalletEnums';

@Component({
  selector: 'app-split-transfer',
  templateUrl: './split-transfer.component.html',
  styleUrls: ['./split-transfer.component.scss']
})
export class SplitTransferComponent implements OnInit {

  fromPallet:any;
  toPallet: any;
  itemsData:any;
  showNewPallet: any = false;
  isNonTrack: any = false;
  isPalletizationEnable: any = true;
  newPalletValue:any;
  palletValue:string = "";
  autoGenereatePalletEnable: boolean = false;
  showLoader: boolean = false;
  showLookupLoader = true;
  enteredQty:any = 0;
  constructor( private commonservice: Commonservice, private toastr: ToastrService, private translate: TranslateService) { }

  ngOnInit() {
    if (localStorage.getItem("AutoPalletIdGenerationChecked") == "True") {
      this.autoGenereatePalletEnable = true;
    }
  }

  onCheckChange() {
    this.showNewPallet = !this.showNewPallet;
    this.newPalletValue = "";
  }

  onFromLookupClick()
  {

  }
  fromPalletChange(){

  }

  onToLookupClick()
  {

  }
  toPalletChange(){
    
  }
  serviceData: any[];
  lookupfor: string;
  public getPalletList() {
    this.showLoader = true;
    this.commonservice.getPalletList(PalletOperationType.Split, "").subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            console.log(data);
            this.showLookupLoader = false;
            this.serviceData = data;
            this.palletValue = this.serviceData[0].Code;
            this.lookupfor = "PalletList";
            return;
          } else {
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

  public createNewPallet() {
    var palletId;
    if (this.showNewPallet) {
      palletId = this.newPalletValue;
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
    this.commonservice.createNewPallet(palletId, "").subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            console.log(data);
            this.showLookupLoader = false;
            // this.serviceData = data;
            if (this.showNewPallet) {
              this.newPalletValue = data;
            } else {
              this.palletValue = data;
            }
            return;
          } else {
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

}
