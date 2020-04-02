import { Component, OnInit } from '@angular/core';
import { Commonservice } from '../services/commonservice.service';
import { Router } from '../../../node_modules/@angular/router';
import { ToastrService } from '../../../node_modules/ngx-toastr';
import { TranslateService, LangChangeEvent } from '../../../node_modules/@ngx-translate/core';

@Component({
  selector: 'app-shp-loading',
  templateUrl: './shp-loading.component.html',
  styleUrls: ['./shp-loading.component.scss']
})
export class ShpLoadingComponent implements OnInit {

  currentStep = 1;
  ScanContainer: string;
  ScanLoadLocation: string;
  PT_ShipmentId: string;
  LoadContainersList: any[] = [];
  LastStep = 2;
  showLoader: boolean = false;

  constructor(private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
  }

  onShipmentIDChange(){
    if(this.PT_ShipmentId == "" || this.PT_ShipmentId == undefined){
      return;
    }
    this.showLoader = true;
    this.commonservice.onShipmentIDChange(this.PT_ShipmentId).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          // if(data.leng)
          this.toastr.error('', this.translate.instant("InvalidShipmentCode"));
        } else {
          this.toastr.error('', this.translate.instant("InvalidShipmentCode"));
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

  onSubmitClick(){
    this.showLoader = true;
    this.commonservice.onShipmentIDChange(this.PT_ShipmentId).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          // if(data.leng)
          this.toastr.error('', this.translate.instant("InvalidShipmentCode"));
        } else {
          this.toastr.error('', this.translate.instant("InvalidShipmentCode"));
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

  nextStep(){
    this.currentStep = this.currentStep + 1;
  }

  prevStep(){
    this.currentStep = this.currentStep - 1;
  }

  OnCancelClick() {
    this.router.navigate(['home/dashboard']);
  }
}
