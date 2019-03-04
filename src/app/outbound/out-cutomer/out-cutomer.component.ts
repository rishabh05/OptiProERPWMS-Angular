import { Component, OnInit } from '@angular/core';
import { OutboundService } from 'src/app/services/outbound.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { Router } from '@angular/router';
import { OutboundData } from 'src/app/models/outbound/outbound-data';
import { CommonConstants } from 'src/app/const/common-constants';

@Component({
  selector: 'app-out-cutomer',
  templateUrl: './out-cutomer.component.html',
  styleUrls: ['./out-cutomer.component.scss']
})
export class OutCutomerComponent implements OnInit {

  public serviceData: any;
  public lookupfor: any = 'out-customer';
  public showLookup: boolean = false;
  public selectedCustomerElement: any;
  public customerName:string='';
  public customerCode:string='';


  constructor(private outboundservice: OutboundService, private router: Router, private commonservice: Commonservice, private toastr: ToastrService, private translate: TranslateService) { }

  ngOnInit() {
    this.customerName='';
  }

  getLookupValue(lookupValue: any) {
    this.selectedCustomerElement = lookupValue;
    let outbound: OutboundData = new OutboundData();
    this.customerCode = this.selectedCustomerElement[0];
     this.customerName = this.selectedCustomerElement[1];

    outbound.CustomerData = { CustomerCode: this.customerCode, CustomerName: this.customerName };

    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
  }

  public openCustomerLookup() {

    this.outboundservice.getCustomerList().subscribe(
      resp => {
        if (resp != undefined && resp != null) {
          if (resp[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
            return;
          }
          this.showLookup = true;
          this.serviceData = resp;
        }
        else {
          
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        console.log("Error:", error);
        this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
      }
    )
  }

  public openCustSO() {
    this.router.navigateByUrl('home/outbound/outorder', { skipLocationChange: true });
  }

  public cancel(){
    this.router.navigateByUrl('home/dashboard');
  }

}
