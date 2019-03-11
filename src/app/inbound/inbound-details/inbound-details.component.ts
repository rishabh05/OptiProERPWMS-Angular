import { Component, OnInit } from '@angular/core';
import { InboundService } from 'src/app/services/inbound.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { TranslateService } from '../../../../node_modules/@ngx-translate/core';
import { Router } from '../../../../node_modules/@angular/router';

@Component({
  selector: 'app-inbound-details',
  templateUrl: './inbound-details.component.html',
  styleUrls: ['./inbound-details.component.scss']
})
export class InboundDetailsComponent implements OnInit {
  public viewLines :boolean;
  showLookupLoader: boolean = true;
  serviceData: any[];
  lookupfor: string;

  constructor(private inboundService: InboundService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService,) { }

  ngOnInit() {
  }


  onVendorLookupClick(content) {
    this.inboundService.getVendorList().subscribe(
      (data: any) => {
        console.log(data);

        if (data != undefined && data.length > 0) {
          // console.log("ItemList - " + data.toString());
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          this.serviceData = data;
          this.lookupfor = "VendorList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }

      },
      error => {
        console.log("Error: ", error);
        alert("fail");
      }
    );
  }
}
