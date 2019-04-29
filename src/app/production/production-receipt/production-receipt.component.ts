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
  printLbl: string = "";
  recRejectQty: string = "";
  acctDefectQty: string = "";
  orignalActualQty: string = "";
  refDocEntry: string = "";
  expDate:string = "";

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
          if (data.Table != undefined && data.Table != null && data.Table != "") {
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
        if (data.Table != undefined && data.Table != null && data.Table!="" && data.Table.length()>0) {
          this.showLookupLoader = false;
           this.setFormData(data.Table[0])
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
  setFormData(response:any){
    this.itemCode = response.ItemCode;
    this.itemName = response.ItemName;
    this.acctDefectQty = response.ACCTDEFECTQTY;
    this.orignalActualQty = response.ORIGINALACTUALQUANTITY;
    this.orderNumber = response.OrderNo;
    this.orderQty = response.OrderQty;
    this.passedQty = response.PASSEDQTY;
    this.postedFGQTY = response.POSTEDFGQTY;
    this.printLbl = response.PRINTLBL;
    this.recRejectQty = response.RecRjctedQty;
    this.refDocEntry = response.RefDocEntry; 
    this.rejectQty = response.RejectQTY;
    this.tracking = response.TRACKING;
    this.whsCode = response.WhsCode;
    if(this.tracking == "S")
    {
       //set serial form data and hide other fields
       //serial qty, openqty and 
    }else if(this.tracking == "B"){
      //set batch form data and hide other fields    
    }else if(this.tracking == "N"){
      //set non form data and hide other fields    
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
 