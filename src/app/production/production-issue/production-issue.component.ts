import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductionService } from 'src/app/services/production.service';
import { TranslateService } from '../../../../node_modules/@ngx-translate/core';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { Commonservice } from 'src/app/services/commonservice.service';
import { RowClassArgs } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-production-issue',
  templateUrl: './production-issue.component.html',
  styleUrls: ['./production-issue.component.scss']
})
export class ProductionIssueComponent implements OnInit {

  showLookupLoader: boolean = true;
  serviceData: any[];
  lookupfor: string;
  orderNo: string;
  showSOIetDetail: boolean = false;
  soItemsDetail: any;

  constructor(private router: Router, private productionService: ProductionService,
    private toastr: ToastrService, private translate: TranslateService, private commonservice: Commonservice) { }

  ngOnInit() {
  }

  onCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

  getOrderList() {
    this.productionService.GetBatchesForProductionIssueWithProcessCell().subscribe(
      (data: any) => {
        if (data != null) {
          if (data.length > 0) {
            // -------------------Check For Licence---------------
            if (data[0].ErrorMsg != undefined) {
              if (data[0].ErrorMsg.length > 0) {
                this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                  this.translate.instant("CommonSessionExpireMsg"));
                return;
              }
            }

            this.showLookupLoader = false;
            this.serviceData = data;
            this.lookupfor = "PIOrderList";
          }
          else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        }
      },
      error => {
        console.log("Error: ", error);
      }
    );
  }

  getItemListForOrder(){
    this.productionService.GetBOMItemForProductionIssue(this.orderNo).subscribe(
      (data: any) => {
        if (data != null) {
          if (data.length > 0) {
            // -------------------Check For Licence---------------
            if (data[0].ErrorMsg != undefined) {
              if (data[0].ErrorMsg.length > 0) {
                this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                  this.translate.instant("CommonSessionExpireMsg"));
                return;
              }
            }
            this.showSOIetDetail = true;
            this.soItemsDetail = data;
            // this.showLookupLoader = false;
            // this.serviceData = data;
            // this.lookupfor = "PIOrderList";
          }
          else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        }
      },
      error => {
        console.log("Error: ", error);
      }
    );
  }

  getLookupValue($event) {
    this.orderNo = $event[0];
  }

  public rowCallback = (context: RowClassArgs) => {
    switch (context.dataItem.TRACKING) {
      case 'S':
        return { serial: true };
      case 'B':
        return { batch: true };
      case 'N':
        return { none: false };
      default:
        return {};
    }
  }
}
