import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductionService } from 'src/app/services/production.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { RowClassArgs } from '@progress/kendo-angular-grid';
import { TranslateService } from '../../../../../node_modules/@ngx-translate/core';
import { ToastrService } from '../../../../../node_modules/ngx-toastr';
import { ProductionIssueComponent } from 'src/app/production/production-issue/production-issue.component';

@Component({
  selector: 'app-prod-orderlist',
  templateUrl: './prod-orderlist.component.html',
  styleUrls: ['./prod-orderlist.component.scss']
})
export class ProdOrderlistComponent implements OnInit {
  showLookupLoader: boolean = true;
  serviceData: any[];
  lookupfor: string;
  orderNo: string;
  showSOIetDetail: boolean = false;
  soItemsDetail: any;
  showLoader: boolean = false;
  public orderNumber: string;

  constructor(private router: Router, private productionService: ProductionService, public productionIssueComponent: ProductionIssueComponent,
    private toastr: ToastrService, private translate: TranslateService, private commonservice: Commonservice) { }

  ngOnInit() {
  }

  onCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

  getOrderList() {
    this.showLoader = true;
    this.productionService.GetBatchesForProductionIssueWithProcessCell().subscribe(
      (data: any) => {
        this.showLoader = false;
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
        this.showLoader = false;
        console.log("Error: ", error);
      }
    );
  }

  getItemListForOrder() {
    this.showLoader = true;
    this.productionService.GetBOMItemForProductionIssue(this.orderNo).subscribe(
      (data: any) => {
        this.showLoader = false;
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
          }
          else {
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

  public openPOByUOM(selection: any) {
    let selectdeData = selection.selectedRows[0].dataItem;
    localStorage.setItem("ProductionIssueData", JSON.stringify(selectdeData));
    this.productionIssueComponent.prodissueComponent = 2;
    // let outboundData: string = localStorage.getItem("ProductionIssueData");

    // if (outboundData != undefined && outboundData != '') {
    //   this.outbound = JSON.parse(outboundData);
    //   this.outbound.SelectedItem = selectdeData;
    //   //lsOutbound
    //   localStorage.setItem("ProductionIssueData", JSON.stringify(selectdeData));
    //   this.router.navigateByUrl('home/outbound/outprodissue', { skipLocationChange: true });
    // }

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
