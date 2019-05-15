import { Component, OnInit, Renderer, ViewChild, ElementRef } from '@angular/core';
import { Commonservice } from '../../services/commonservice.service';
import { Router } from '@angular/router';
import { ProductionService } from '../../services/production.service';
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
  disableSearialQty:boolean = false;
  disableOpenQty:boolean = false;
  disableAcceptQty:boolean = false;
  disableDefRejQty: boolean = false;
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
  tracking: string="N"; 
  rejectQty: string = "";
  postedFGQTY: string = "";
  passedQty: string = "";
  printLbl: string = "";
  recRejectQty: string = "";
  acctDefectQty: string = "";
  orignalActualQty: string = "";
  refDocEntry: string = "";
  expDate:string = "";

  serialQty:string ="";
  batchQty:string ="";
  qty:string = "";
  serialNo:string = "";
  batchNo: string = "";
  serialBatchNo: string = "";
  binList: any[];
  binNo: string = "";
  whsCode: string = "";
  showRejectQtyField = false;
  type ="N"; //S for serial, B for Batch, N for non tracked.
  showColon: boolean = false;
  defaultQty:any = "0";
  enteredQty:any = "0";
  enterQtyPlaceholder:any;
  displayFormAndSubmit: boolean= false;

  acceptQty:string = "";
  rjQty:string = "";
  showAddMoreButton: boolean = false;

  @ViewChild('SerialQty') SerialQtyField: ElementRef;
  @ViewChild('BatchQty') BatchQtyField: ElementRef;
  @ViewChild('Qty') QtyField: ElementRef;
  constructor(private renderer: Renderer, private commonservice: Commonservice, private router: Router, private productionService: ProductionService,
    private toastr: ToastrService, private translate: TranslateService) { }

  ngOnInit() {
    this.enterQtyPlaceholder = Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
    this.enteredQty = Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
    this.acceptQty =  Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
    this.rjQty =  Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
    console.log("entered qty"+this.enteredQty);
    console.log("acceptQty qty"+this.acceptQty);
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

  OnBinValueChange() {
    if (this.binNo == "") {
      return;
    }
    this.productionService.isBinExists(this.binNo).subscribe(
      (data: any) => {
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("INVALIDBIN"));
              this.binNo = "";
              return;
            }
            else {
              this.binNo = data[0].ID;
              // oCurrentController.isReCeivingBinExist();
            }
          }
        }
        else {
          this.toastr.error('', this.translate.instant("INVALIDBIN"));
          this.binNo = "";
          return;
        }
      },
      error => {
        console.log("Error: ", error);
        this.binNo = "";
      }
    );
  }

  public submitRecord(){
    this.validateForm();

  }

  prepareSubmitData(){
   var submitRecProdData: any ={};
   var itemsData: any =[];
  }
  public validateForm() {
    if (this.tracking === "S") {
      this.validateSerialForm();
    }
    if (this.tracking === "B") {
      this.validateBatchForm();
    }
    if (this.tracking === "N") {
      this.validateNonTrackedForm();
    }
  }
  validateBatchForm() {
    if (this.orderNumber == null || this.orderNumber == undefined || this.orderNumber == "") {
      this.toastr.error('', this.translate.instant("OrderNoBlank"));
      return;
    }
    if (this.enteredQty == null || this.enteredQty == undefined || this.enteredQty == "" ||
      parseFloat(this.enteredQty).toFixed(4) == parseFloat("0").toFixed(4)) {
      this.toastr.error('', this.translate.instant("EnterLotQuantity"));
      return;
    }
    if (this.serialBatchNo == null || this.serialBatchNo == undefined || this.serialBatchNo == "") {
      this.toastr.error('', this.translate.instant("EnterBatchNo"));
      return;
    }
    if (this.binNo == null || this.binNo == undefined || this.binNo == "") {
      this.toastr.error('', this.translate.instant("EnterBinNo"));
      return;
    }
  }
  validateSerialForm() {
    if(this.orderNumber== null || this.orderNumber==undefined || this.orderNumber == ""){
      this.toastr.error('', this.translate.instant("OrderNoBlank"));
      return ;
     }
    if(this.serialBatchNo== null || this.serialBatchNo==undefined || this.serialBatchNo == ""){
      this.toastr.error('', this.translate.instant("EnterSerialNo"));
      return;
     }
     if(this.binNo== null || this.binNo==undefined || this.binNo == ""){
      this.toastr.error('', this.translate.instant("EnterBinNo"));
      return;
     }
  }
  validateNonTrackedForm(){
    if (this.orderNumber == null || this.orderNumber == undefined || this.orderNumber == "") {
      this.toastr.error('', this.translate.instant("OrderNoBlank"));
      return;
    }
    if (this.enteredQty == null || this.enteredQty == undefined || this.enteredQty == "" ||
      parseFloat(this.enteredQty).toFixed(4) == parseFloat("0").toFixed(4)) {
      this.toastr.error('', this.translate.instant("EnterQty"));
      return;
    }
    if (this.binNo == null || this.binNo == undefined || this.binNo == "") {
      this.toastr.error('', this.translate.instant("EnterBinNo"));
      return;
    }
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
    } else if (this.lookupfor == "ToBinList") {
      this.binNo = $event[0];
      this.whsCode = $event[1];
    }

  }


  getProductionDetail(){
    if(this.orderNumber == ""){
      this.toastr.error('', this.translate.instant("OrderNoBlank"));
      return;
    }
    this.orderNoListSubs = this.productionService.GetItemsDetailForProductionReceipt(this.orderNumber).subscribe(
      data => {
        this.displayFormAndSubmit = true; 
        if (data != undefined) { 
        if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
          this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
            this.translate.instant("CommonSessionExpireMsg"));
          return;
        }
        if (data.Table != undefined && data.Table != null && data.Table!="" && data.Table.length>0) {          this.showLookupLoader = false;
           this.setFormData(data.Table[0])
          return;
        } else{ 
          this.toastr.error('', this.translate.instant("OrderNotExistMessge"));
          this.orderNumber = "";
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

  
  getBinList(){
    this.binListSubs = this.productionService.GetBinsList().subscribe(  
      data => {
      if (data != undefined) { 
      if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
        this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
          this.translate.instant("CommonSessionExpireMsg"));
        return;
      }
      if (data != undefined && data != null && data!="") {

        this.showLookupLoader = false;
        this.serviceData = data;
        this.lookupfor = "ToBinList";
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
    
    if(this.itemCode !=null && this.itemCode!=undefined && this.itemCode !=""
     && this.itemName!=null && this.itemName!=undefined && this.itemName!= ""){
      this.showColon = true;
     }
    if(this.tracking == "S")
    {
       //this.serialQty = "1.0000";
       this.serialQty = Number(1)+  Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
       this.enteredQty = this.serialQty;
       this.disableSearialQty = true; 
       //set serial form data and hide other fields
       //serial qty, openqty and 
       this.showAddMoreButton = true;
     //  this.SerialQtyField.nativeElement.focus(); //set focus on serial qty field.
    }else if(this.tracking == "B"){
      //set batch form data and hide other fields    
      this.showAddMoreButton = true;
    //  this.BatchQtyField.nativeElement.focus(); //set focus on batch qty field.
    }else if(this.tracking == "N"){
      //set non form data and hide other fields 
      
      this.showAddMoreButton = false;   
    //  console.log('--this.SerialQtyField.nativeElement---',this.QtyField.nativeElement);
      // this.QtyField.nativeElement.focus(); //set focus on non qty field.
      
    }
    //this two fields will be disable in all three cases.
    this.disableOpenQty = true;
    this.disableAcceptQty = true;
    
    
    // manage reject qty fields.
     if (this.recRejectQty == "N" || parseFloat(this.rejectQty).toFixed(4) == parseFloat("0").toFixed(4)) {
      this.showRejectQtyField = false;
    }else{
      if(parseFloat(this.rejectQty).toFixed(4)> parseFloat("0").toFixed(4)){
        this.showRejectQtyField = true;
      }
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
 