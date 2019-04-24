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
  binListSubs: ISubscription;
  
  //for making disable the three fields.
  enableSearialQty:boolean = false;
  enableOpenQty:boolean = false;
  enableAcceptQty:boolean = false;
  
  //showing loader for data loading purpose.
  showLookupLoader: boolean = true;
  
  // values related variables.
  public value: Date = new Date();
 
  //lookup variables
  serviceData: any[];
  lookupfor: string;
  orderNumber:string= "";
  item: string="";
  itemCode:string = "";
  itemName: string ="";
  orderQty = "";
  tracking: string="";
  rejectQty: string = "";
  postedFGQTY: string = "";
  passedQty: string = "";
  acctDefectQty: string = "";
  binList: any[];
  binNo: string = "";
  whsCode: string = "";
  showRejectQtyField = false;
  type =""; //S for serial, B for Batch, N for non tracked.
  constructor(private renderer: Renderer, private commonservice: Commonservice, private router: Router, private productionService: ProductionService,
    private toastr: ToastrService, private translate: TranslateService) { }

  ngOnInit() {
  }

  OnOrderLookupClick(){
    this.showOrderList();
  }
  OnOrderValueChange(){
    if (this.orderNumber == "" || this.orderNumber == undefined) {
      return;
    }
    this.getProductionDetail();
  }
  /**
  * Method to get list of inquries from server.
  */
 public showOrderList() {
 
  this.orderNoListSubs = this.productionService.getOrderNumberList(this.orderNumber).subscribe(
    data => {
      if (data != undefined) { 
      if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
        this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
          this.translate.instant("CommonSessionExpireMsg"));
        return;
      }
      if (data.Table != undefined && data.Table != null && data.Table!="") {
        this.showLookupLoader = false;
         this.serviceData = data.Table;
        this.lookupfor = "OrderList";
        return;
      }
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


  getProductionDetail(){
    if(this.orderNumber == ""){
      this.toastr.error('', this.translate.instant("OrderNoBlank"));
      return;
    }
    this.orderNoListSubs = this.productionService.GetItemsDetailForProductionReceipt(this.orderNumber).subscribe(
      data => {
        if (data != undefined) { 
        if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
          this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
            this.translate.instant("CommonSessionExpireMsg"));
          return;
        }
        if (data.Table != undefined && data.Table != null && data.Table!="" ) {
          this.showLookupLoader = false;
          this.itemCode = data.Table[0].ItemCode;
          this.itemName = data.Table[0].ItemName;
          this.orderNumber = data.Table[0].OrderNo;
          this.itemCode = data.Table[0].ItemCode;
          this.itemCode = data.Table[0].ItemCode;
          this.itemCode = data.Table[0].ItemCode;
          this.itemCode = data.Table[0].ItemCode;
          return;
        } else{ 
          this.toastr.error('', this.translate.instant("OrderNotExistMessge"));
        }
      } 
      },
      error => {
        this.toastr.error('', error);
      },
    );

    this.binListSubs = this.productionService.GetBinsList().subscribe(  
      data => {
      if (data != undefined) { 
      if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
        this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
          this.translate.instant("CommonSessionExpireMsg"));
        return;
      }
      if (data != undefined && data != null && data!="") {
        this.binList = data;
        this.binNo = this.binList[0].BINNO;
        this.whsCode = this.binList[0].WHSCODE;
        return;
      } 
    } 
    },
    error => {
      this.toastr.error('', error);
    },);
    
  }
  ngOnDestroy() {
  if (this.orderNoListSubs != undefined)
    this.orderNoListSubs.unsubscribe();
  }

  onCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

}
 