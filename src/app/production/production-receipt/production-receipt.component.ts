import { Component, OnInit, Renderer } from '@angular/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { Router } from '@angular/router';
import { ProductionService } from 'src/app/services/production.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-production-receipt',
  templateUrl: './production-receipt.component.html',
  styleUrls: ['./production-receipt.component.scss']
})
export class ProductionReceiptComponent implements OnInit {
  
  
  //subscription variables.
  orderNoListSubs: ISubscription;
  
  //for making disable the three fields.
  enableSearialQty:boolean = false;
  enableOpenQty:boolean = false;
  enableAcceptQty:boolean = false;
  
  //showing loader for data loading purpose.
  showLookupLoader: boolean = true;
  
  // values related variables.
  public value: Date = new Date();
  orderNumber:string= "";
  item: string="";
  //lookup variables
  serviceData: any[];
  lookupfor: string;
  
  constructor(private renderer: Renderer, private commonservice: Commonservice, private router: Router, private productionService: ProductionService,
    private toastr: ToastrService, private translate: TranslateService) { }

  ngOnInit() {
  }

  OnOrderLookupClick(){
    //this.showOrderList();
  }
  /**
  * Method to get list of inquries from server.
  */
 public showOrderList() {
 
  this.orderNoListSubs = this.productionService.getOrderNumberList(this.orderNumber).subscribe(
    data => {
      if (data != undefined && data.Table!=null && data.Table!= undefined 
        && data.Table!="" && data.Table.length > 0) {//data[0].ErrorMsg == "7001"
        if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
          this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));
          return;
        }
        this.showLookupLoader = false;
        this.serviceData = data.Table;
        this.lookupfor = "OrderList";
      }
      else {
        this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
      }
    },
    error => {
      this.toastr.error('', error);
    },
  );
}

 /**
   * @param $event this will return the value on row click of lookup grid.
   */
  getLookupValue($event) {

    if (this.lookupfor == "OrderList") {
      //this.lotNo = $event[0];
      this.orderNumber = $event[0];
      this.item = $event[1];
    }
  }

  ngOnDestroy() {
  if (this.orderNoListSubs != undefined)
    this.orderNoListSubs.unsubscribe();
  }

  onCancelClick() {
    this.router.navigate(['home/dashboard']);
  }
}
