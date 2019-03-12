import { Component, OnInit } from '@angular/core';
import { InboundService } from 'src/app/services/inbound.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { TranslateService, LangChangeEvent } from '../../../../node_modules/@ngx-translate/core';
import { Router } from '../../../../node_modules/@angular/router';
import { InboundMasterComponent } from '../inbound-master.component';

@Component({
  selector: 'app-inbound-details',
  templateUrl: './inbound-details.component.html',
  styleUrls: ['./inbound-details.component.scss']
})
export class InboundDetailsComponent implements OnInit {
  public viewLines: boolean;
  showLookupLoader: boolean = true;
  serviceData: any[];
  lookupfor: string;
  VendCode: string;
  VendName: string;

  constructor(private inboundService: InboundService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent) {
      let userLang = navigator.language.split('-')[0];
      userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
      translate.use(userLang);
      translate.onLangChange.subscribe((event: LangChangeEvent) => {
      });
     }

  ngOnInit() {
  }

  onVendorLookupClick() {
    this.inboundService.getVendorList().subscribe(
      (data: any) => {
        console.log(data);
        if (data != undefined) {
          // console.log("ItemList - " + data.toString());
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          this.serviceData = data.Table;
          this.lookupfor = "VendorList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        console.log("Error: ", error);
        this.toastr.error('', error);
      }
    );
  }


  OnVendorChange() {
    if (this.VendCode == "" || this.VendCode == undefined) {
      return;
    }
    this.inboundService.IsVendorExists(this.VendCode).subscribe(
      (data: any) => {
        console.log(data);
        if (data != null) {
          if (data != undefined && data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data[0].Result == "0") {
            this.toastr.error('', this.translate.instant("VendorExistMessge"));
            return;
          } else {
            this.VendCode = data[0].ID;
            this.VendName = data[0].Name;
          }
        }else{
          this.toastr.error('', this.translate.instant("VendorExistMessge"));
        }
      },
      error => {
        console.log("Error: ", error);
        this.toastr.error('', error);
      }
    );
  }



  getLookupValue($event) {
    this.VendCode = $event[0];
    this.VendName = $event[1];
  }

  public onNextClick() {
    this.inboundMasterComponent.selectedVernder = this.VendCode;
    this.inboundMasterComponent.inboundComponent = 2;
  }
}
