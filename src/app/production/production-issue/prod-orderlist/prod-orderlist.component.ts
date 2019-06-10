import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductionService } from 'src/app/services/production.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { RowClassArgs } from '@progress/kendo-angular-grid';
import { TranslateService } from '../../../../../node_modules/@ngx-translate/core';
import { ToastrService } from '../../../../../node_modules/ngx-toastr';
import { ProductionIssueComponent } from 'src/app/production/production-issue/production-issue.component';
import { OutboundData } from 'src/app/models/outbound/outbound-data';
import { CommonConstants } from 'src/app/const/common-constants';

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
  prodOrderlist: boolean = true;
  public outbound: OutboundData = new OutboundData();

  pagable: boolean = false;
  pageSize:number = Commonservice.pageSize;
  constructor(private router: Router, private productionService: ProductionService, public productionIssueComponent: ProductionIssueComponent,
    private toastr: ToastrService, private translate: TranslateService, private commonservice: Commonservice) { }

  ngOnInit() {
    let outboundData: string = localStorage.getItem("OutboundData");
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      // this.selectedCustomer = this.outbound.CustomerData;

      if (this.outbound != null && this.outbound.OrderData !== undefined && this.outbound.OrderData !== null && this.outbound.OrderData.DOCNUM !== undefined && this.outbound.OrderData.DOCNUM !== null) {
        this.orderNumber = this.outbound.OrderData.DOCNUM;
        // this.openSOOrderList();
        // this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();
      }
      // this.calculatePickQty();
    }
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
            for(var i=0; i<data.length; i++){
              this.soItemsDetail[i].ITEMCODE = data[i].ItemCode;
              this.soItemsDetail[i].RPTQTY = data[i].IssuedQty;
              this.soItemsDetail[i].OPENQTY = data[i].BalQty;
              this.soItemsDetail[i].DOCENTRY = data[i].DocEntry;
            }
            if(this.soItemsDetail.length>this.pageSize){
              this.pagable = true;
            }else{
              this.pagable = false;
            }
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
    let outboundData: string = localStorage.getItem(CommonConstants.OutboundData);

    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      this.outbound.SelectedItem = selectdeData;
      //lsOutbound
      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      this.prodOrderlist = false;
    }
  }

  getLookupValue(lookupValue: any) {
    this.orderNo = lookupValue[0];
    if(this.outbound == null){
      this.outbound = new OutboundData();
    }
    this.outbound.OrderData = lookupValue;
    this.orderNumber = this.outbound.OrderData.DOCNUM;
    localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
    localStorage.setItem("ComingFrom", "ProductionIssue");
    // this.showDeleiveryAndAdd = this.showAddToMeterialAndDelevery();
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

  CancelEvent(){
    this.prodOrderlist = !this.prodOrderlist;
  }
}
