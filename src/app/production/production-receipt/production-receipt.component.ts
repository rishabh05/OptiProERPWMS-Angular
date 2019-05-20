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
  checkValidateSerialSubs: ISubscription;
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
  ACCTDEFECTQTY: string = "";
  orignalActualQty: string = "";
  refDocEntry: string = "";
  expDate:string = "";

  serialQty:string ="";
  batchQty:string ="";

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
  showViewAcceptButton: boolean = false;
  Transaction: string = "ProductionReceipt";
  ONLINEPOSTING: string = null;
  IsPalletExist:boolean = false;

  acceptItemsGrid:boolean = false;
  rejectItemsGrid:boolean = false;

  // data variables for submit request
  Lots: any =[];
  Items: any=[];
  UDF: any=[];
  RejectItems: any=[];
  RejectLots: any=[];
  selectedRadio: any;
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
    this.prepareSubmitData();

  }
  public addMoreClick(){
    if(this.tracking =="S" || this.tracking=="B"){
        
    }else{

    }
    // validate the form data and then add in local storage if already there then add item in item 
    //array or lot in lot array
  }

  prepareSubmitData(){
   var submitRecProdData: any ={};
   var itemsData: any =[];
   var UDF: any = [];
   var RejectItems: any = [];
   var RejectLots: any = [];
   var Lots: any = [];
   itemsData.push({
    DiServerToken: localStorage.getItem("Token"),
    CompanyDBId: localStorage.getItem("CompID"),
    Transaction:this.Transaction,
    RECUSERID: localStorage.getItem("UserId"),
    ONLINEPOSTING:this.ONLINEPOSTING,
    BATCHNO: this.orderNumber,
    LineNo:0,
    RefDocEntry:this.refDocEntry,
    RejectQTY:this.rejectQty,
    RecRjctedQty:this.recRejectQty,
    DOCENTRY:this.refDocEntry,
    Quantity: this.enteredQty,
    ItemCode: this.itemCode,
    POSTEDFGQTY: this.postedFGQTY,
    PASSEDQTY: this.passedQty,
    AcctDefectQty: this.ACCTDEFECTQTY,
    FGQTYTOPOST: this.orignalActualQty,//abhi k lea need to check
    WhsCode:this.whsCode,
    Tracking:this.tracking,
    IsPalletExist:this.IsPalletExist,
    LoginId:localStorage.getItem("UserId"),
    GUID: localStorage.getItem("GUID"),
    UsernameForLic: localStorage.getItem("UserId")
   });
   Lots.push({
    Bin: this.binNo,
    LineNo: 0,
    LotNumber:this.serialBatchNo,
    LotQty:this.enteredQty,//need to check
    ExpiryDate: this.expDate
   })
   submitRecProdData={Items:itemsData,Lots:Lots,UDF:UDF,RejectItems:RejectItems,RejectLots:RejectLots}
  }
  prepareCommonItemData(rejQty:string,quantity: string):any{
    var itemsData: any =[];
    itemsData.push({
    DiServerToken: localStorage.getItem("Token"),
    CompanyDBId: localStorage.getItem("CompID"),
    Transaction:this.Transaction,
    RECUSERID: localStorage.getItem("UserId"),
    ONLINEPOSTING:this.ONLINEPOSTING,
    BATCHNO: this.orderNumber,
    LineNo:0,
    RefDocEntry:this.refDocEntry,
    RejectQTY:rejQty,
    RecRjctedQty:this.recRejectQty,
    DOCENTRY:this.refDocEntry,
    Quantity: quantity,
    ItemCode: this.itemCode,
    POSTEDFGQTY: this.postedFGQTY,
    PASSEDQTY: this.passedQty,
    AcctDefectQty: this.ACCTDEFECTQTY,
    FGQTYTOPOST: this.orignalActualQty,//abhi k lea need to check
    WhsCode:this.whsCode,
    Tracking:this.tracking,
    IsPalletExist:this.IsPalletExist,
    LoginId:localStorage.getItem("UserId"),
    GUID: localStorage.getItem("GUID"),
    UsernameForLic: localStorage.getItem("UserId")
    });
    return itemsData;
  }

  public prepareRejectItemData(rejQty:string,quantity: string): any{
    var rejectItemsData: any =[];
    rejectItemsData.push({
      DiServerToken: localStorage.getItem("Token"),
      CompanyDBId: localStorage.getItem("CompID"),
      Transaction:this.Transaction,
      RECUSERID: localStorage.getItem("UserId"),
      ONLINEPOSTING:this.ONLINEPOSTING,
      BATCHNO: this.orderNumber,
      LineNo:0,
      RefDocEntry:this.refDocEntry,
      DOCENTRY:this.refDocEntry,
      ItemCode: this.itemCode,
      WhsCode:this.whsCode,
      POSTEDFGQTY: this.postedFGQTY,
      PASSEDQTY: this.passedQty,
      AcctDefectQty: this.ACCTDEFECTQTY,
      FGQTYTOPOST: this.orignalActualQty,//abhi k lea need to check
      Tracking:this.tracking,
      IsPalletExist:this.IsPalletExist,
      LoginId:localStorage.getItem("UserId"),
      RejectQTY:rejQty,
      RecRjctedQty:this.recRejectQty,
      Quantity: quantity,
      });
      return rejectItemsData;
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
    this.toastr.error('', this.translate.instant("OrderNoBlank"));
      if (this.orderNumber == null || this.orderNumber == undefined || this.orderNumber == "") {
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
    if(parseFloat(this.enteredQty).toFixed(4) < parseFloat("0").toFixed(4)){
      this.toastr.error('', this.translate.instant("QtyGraterThenZero"));
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
    if(parseFloat(this.enteredQty).toFixed(4) < parseFloat("0").toFixed(4)){
      this.toastr.error('', this.translate.instant("QtyGraterThenZero"));
      return;
    }
  }
  checkAndValidateSerial(){
    this.checkValidateSerialSubs = this.productionService.isSerialExists(this.serialBatchNo,this.itemCode).subscribe(
      data => {
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          } 
          //check and update response for entered serial no.
          if (data.Table != undefined && data.Table != null && data.Table != "") {
           
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
    this.ACCTDEFECTQTY = response.ACCTDEFECTQTY;
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
  showViewAcceptItems(){
    //manage variables for showing grid and ok delete button seperate div section of View accept items.
  }
  showViewRejetItems(){
    //show view reject items.
  }

  viewAcceptOkClick(){
    //set variable to hide grid and show the form.

  }
  viewAcceptDeleteAll(){
    // clear all items from array after alert.
    // ckeck if after delete
  }

  viewAcceptDeleteItem(){
    //splice item from Array. and update grid.
  }

  
  viewRejectOkClick(){
    //set variable to hide grid and show the form.

  }
  viewRejectDeleteAll(){
    // clear all items from array after alert.
    // ckeck if after delete
  }

  viewRejectDeleteItem(){
    //splice item from Array. and update grid.
  }
  ngOnDestroy() { 
  if (this.orderNoListSubs != undefined)
    this.orderNoListSubs.unsubscribe();
  }
  dialogFor: string = "";
  dialogMsg: string = ""
  yesButtonText: string = "";
  noButtonText: string = "";
  showConfirmDialog: boolean;
  public confirmDialogForDeleteAll(gridData: any) {
    this.dialogFor = "deleteAll";
    this.dialogMsg = this.translate.instant("DoYouWantToDelete");
    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    this.showConfirmDialog = true;
  }

  
  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;
    if ($event.Status == "yes") {
      switch ($event.From) {
        case ("deleteAll"):
        //  this.deleteAllClick();
          break;
        case ("delete"):
          //call method to delete item or remove its data from array
          break;
      
      }
    } else {
      if ($event.Status == "cancel") {
        // when user click on cross button nothing to do.
      } else{
        // nothing to do.
      }
    }
  }

  onCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

}
 