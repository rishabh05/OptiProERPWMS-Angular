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
  rejectQty: any ;
  postedFGQTY: any;
  passedQty: any;
  printLbl: string = "";
  recRejectQty: any;
  ACCTDEFECTQTY: any;
  orignalActualQty: any ;
  refDocEntry: string = "";
  expDate:string = "";

  serialQty:any ="1";
  batchQty:any ="";

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
  shouldShowExpiryDate: boolean= true;
  acceptQty:any ;
  rjQty:any ;
  showAddMoreButton: boolean = false;
  showViewAcceptButton: boolean = false;
  showViewRejectButton: boolean = false;
  Transaction: string = "ProductionReceipt";
  ONLINEPOSTING: string = null;
  IsPalletExist:boolean = false;

  acceptItemsGrid:boolean = false;
  rejectItemsGrid:boolean = false;

  finalAcceptQty: any= 0;
  finalRejectQty: any= 0;

  // data variables for submit request
  Lots: any =[];
  Items: any=[];
  UDF: any=[];
  RejectItems: any=[];
  RejectLots: any=[];
  submitRecProdData: any ={};
  selectedRadio: string  = "PostToInv";
  model: any = { options: '1' };
  itemDataResponse:any ;

  dialogFor: string = "";
  dialogMsg: string = ""
  yesButtonText: string = "";
  noButtonText: string = "";
  showConfirmDialog: boolean;
  showLoader: boolean = false;
  @ViewChild('SerialQty') SerialQtyField: ElementRef;
  @ViewChild('BatchQty') BatchQtyField: ElementRef;
  @ViewChild('Qty') QtyField: ElementRef;
  dateFormat: string;
  pagable: boolean = false;
  pageSize:number = Commonservice.pageSize;

  constructor(private renderer: Renderer, private commonservice: Commonservice, private router: Router, private productionService: ProductionService,
    private toastr: ToastrService, private translate: TranslateService) { }

  ngOnInit() {
    this.enterQtyPlaceholder = Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
    this.enteredQty = Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
    this.acceptQty =  Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));//ye niche vali field jo calculation se dikhate hai.
    this.rjQty =  Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));//ye niche vali field jo calculation se dikhate hai.
    console.log("entered qty"+this.enteredQty);
    console.log("acceptQty qty"+this.acceptQty);
    this.dateFormat = localStorage.getItem("DATEFORMAT");
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

  public submitRecord() {

    // case when only single item is going to submit.
    if (this.Lots.length == 0 && this.RejectLots.length == 0) {
      // object is empty.
      console.log("object is empty");
      //means user comming first time and directly clicking on submit
      if (this.validateForm() == false) {
        return;
      }

      if (this.showRejectQtyField == true && this.model.options == '2') { // if user entered rejected qty.
        if (this.enteredQty > this.rejectQty) {
          this.toastr.error('', this.translate.instant("SelectedQtyGrater"));
          return false;
        }
        //add rejected lot.
        if (this.tracking == "N") { this.serialBatchNo = ""; }
        this.RejectLots.push({
          Bin: this.binNo,
          LineNo: 1, //for reject lot item. (crosscheck)
          LotNumber: this.serialBatchNo,
          LotQty: this.enteredQty,//need to check
          ExpiryDate: this.GetReceiptSubmitDateFormat(this.expDate)
        })
        this.RejectItems = this.prepareRejectItemData(this.enteredQty);
        this.UDF = [];
        this.Items = [];
        this.Lots = [];
        this.submitRecProdData = {
          Items: this.Items, Lots: this.Lots, UDF: this.UDF,
          RejectItems: this.RejectItems, RejectLots: this.RejectLots
        }
        // add rejected item.
        this.submitProductionReport(this.submitRecProdData);

      } else {
        if (this.enteredQty > this.orignalActualQty) {
          this.toastr.error('', this.translate.instant("SelectedQtyGrater"));
          return false;
        }
        // if not rejected item.
        if (this.tracking == "N") { this.serialBatchNo = ""; }
        this.Lots.push({
          Bin: this.binNo,
          LineNo: 0, //abhi k lea kea h need to check
          LotNumber: this.serialBatchNo,
          LotQty: this.enteredQty,//need to check
          ExpiryDate: this.GetReceiptSubmitDateFormat(this.expDate)
        })
        this.Items = this.prepareCommonItemData(this.enteredQty);
        this.UDF = [];
        this.RejectItems = [];
        this.RejectLots = [];
        this.submitRecProdData = { Items: this.Items, Lots: this.Lots, UDF: this.UDF, RejectItems: this.RejectItems, RejectLots: this.RejectLots }
        this.submitProductionReport(this.submitRecProdData);
      }
    } else {
      //case when already added items are there and user also want to add current record with add more items on submit click.
      if(this.tracking == "S" || this.tracking == "B" ){ //check in case of S or B because we have add more case in both of these cases.
         if(this.serialBatchNo !=null && this.serialBatchNo != undefined && this.serialBatchNo!=""){
           this.addMoreClick();//adding the current displaying item on add more then below submit data code will run.
         } 
      }
      // if multiple items are submitted.
      console.log("object is not empty");
      if (this.Lots.length > 0) {
        this.Items = this.prepareCommonItemData(this.acceptQty);
      }
      if (this.RejectLots.length > 0) {
        this.RejectItems = this.prepareRejectItemData(this.rjQty);
      }
      this.UDF = [];
      this.submitRecProdData = { Items: this.Items, Lots: this.Lots, UDF: this.UDF, RejectItems: this.RejectItems, RejectLots: this.RejectLots }
      this.submitProductionReport(this.submitRecProdData);
      //case when multiple items will be submitted then two cases if user adding new item with old items or
      // if user only submitting previous items which are stored in array.
      //then no need to validate we can submit directly using updated qty.
    }
  }

  submitProductionReport(requestData:any){
    this.showLoader = true;
    this.productionService.submitProductionRecepit(requestData).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          } 
          //check and update response for entered serial no.
          if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
            this.toastr.success( this.translate.instant("FGRSuccessMessage") +data[0].SuccessNo);
            this.resetAfterSubmit(); 
          }else{
            if (data[0].ErrorMsg != ""){
                   // show errro.
                   this.toastr.error('', data[0].ErrorMsg);
            }
          }
        }
      },
      error => {
        this.toastr.error('', error);
      },
    );
  }
  resetAfterSubmit() {
    this.showAddMoreButton = false;
    this.showViewAcceptButton = false;
    this.showViewRejectButton = false;
    this.shouldShowExpiryDate = true;
    this.displayFormAndSubmit = false;
    this.Lots = [];
    this.Items = [];
    this.UDF = [];
    this.RejectItems = [];
    this.RejectLots = [];
    this.submitRecProdData = {};
    this.orderNumber = "";
    this.expDate = "";
    this.enteredQty = "";
    this.serialBatchNo = "";
    this.model = { options: '1' };
    this.acceptQty =  Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));//ye niche vali field jo calculation se dikhate hai.
    this.rjQty =  Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));//ye niche vali field jo calculation se dikhate hai.
    this.showViewAcceptButton = false;
    this.showViewRejectButton = false;
    this.showAddMoreButton = false; 
  }
  resetOnSerchClick(){
    this.showViewAcceptButton = false;
    this.showViewRejectButton = false;

    this.Lots = [];
    this.Items = [];
    this.UDF = [];
    this.RejectItems = [];
    this.RejectLots = [];
    this.submitRecProdData = {};
    this.expDate = "";
    this.enteredQty = "";
    this.serialBatchNo = "";
    this.model = { options: '1' };
    this.acceptQty =  Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
    this.rjQty =  Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
  }

  public addMoreClick() { //case when serial or batch item.
    if (this.showRejectQtyField == true && this.model.options == '2') { // reject qty
      //means add in accept qty
      if (this.validateForm() == false) { return; }
      if(this.tracking == "N"){

      }else{
       //check case or check karna padega ki non tracked hai kya
       if (this.checkIfSerialBatchAlreadyExists(this.serialBatchNo) == true) {
       if (this.tracking == "B") { this.toastr.error('', this.translate.instant("BatchAlreadyExists")); }
       if (this.tracking == "S") { this.toastr.error('', this.translate.instant("SerialAlreadyExist")); }
       return;
       } else { }
      }
      
      this.calculateRejectQtyOnAddMore();
    } else {

      if (this.validateForm() == false) { return; }
      if (this.checkIfSerialBatchAlreadyExists(this.serialBatchNo) == true) {
        if (this.tracking == "B") { this.toastr.error('', this.translate.instant("BatchAlreadyExists")); }
        if (this.tracking == "S") { this.toastr.error('', this.translate.instant("SerialAlreadyExist")); }
        return;
      }
      this.calculateAcceptQtyOnAddMore();
    }
    //reset form variables.
    this.serialBatchNo = ""
    if (this.tracking == "S") {
      this.serialQty = Number(this.serialQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
      this.enteredQty = this.serialQty;
    } else {
      this.enteredQty = Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
    }
    //enable disable accept list and reject list buttons.
    this.showViewAcceptViewRejectButtons();
  } 
 
  checkIfSerialBatchAlreadyExists(serialBatch: string): any {
    var isExists: boolean = false;
    if (this.tracking == "S" || this.tracking == "B") {
      if (this.showRejectQtyField == true) {
        if (this.model.options == '2') {
          if (this.RejectLots.length > 0) {
            for (var i = 0; i < this.RejectLots.length; i++) {
              if (serialBatch == this.RejectLots[i].LotNumber) {
                isExists = true;
              }
            }
          }
        } else {
          if (this.Lots.length > 0) {
            for (var i = 0; i < this.Lots.length; i++) {
              if (serialBatch == this.Lots[i].LotNumber) {
                isExists = true;
              }
            }
          }
        }
      } else {
        if (this.Lots.length > 0) {
          for (var i = 0; i < this.Lots.length; i++) {
            if (serialBatch == this.Lots[i].LotNumber) {
              isExists = true;
            }
          }
        }
      }
    }
    return isExists;
  }
  showViewAcceptViewRejectButtons(){
    if(this.showRejectQtyField == true && this.model.options == '2'){
      if(this.RejectLots.length>0){
        this.showViewRejectButton = true;
      }
    }else{
      if(this.Lots.length>0){
        this.showViewAcceptButton = true;
      }
    }

  }
  calculateAcceptQtyOnAddMore() {
    //added in accept qty and open qty.
    let tempQty = 0; // logic to manage qty.
    for (var i = 0; i < this.Lots.length; i++) {
      tempQty = tempQty + this.Lots[i].LotQty;
    }
    tempQty = tempQty + Number(this.enteredQty);
    var orignalRejectQty = this.itemDataResponse.RejectQTY;// taken in a local variable for compairsion.
    var orignalActualQty = this.itemDataResponse.ORIGINALACTUALQUANTITY;
    if (tempQty > parseFloat(orignalActualQty)) {
      this.toastr.error('', this.translate.instant("SelectedQtyGrater"));
      this.enteredQty = Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
    } else {
      // add qty to Reject Lot list and update rejectQty and rjQty
      this.Lots.push({
        Bin: this.binNo,
        LineNo: 0, //for reject lot item. (crosscheck)
        LotNumber: this.serialBatchNo,
        LotQty: Number(this.enteredQty),//need to check 
        ExpiryDate: this.GetReceiptSubmitDateFormat(this.expDate)
      })
      //this.totalQtyToSubmit = tempQty; // at the end update totalQty with calculated qty.
      this.acceptQty = tempQty;
      var initialOrignalActualQty = this.itemDataResponse.ORIGINALACTUALQUANTITY;
      this.orignalActualQty = initialOrignalActualQty - tempQty;
    }
    if(this.Lots.length>this.pageSize){
      this.pagable = true;
    }else{
      this.pagable = false;
    }
  }  
 

  calculateRejectQtyOnAddMore() {
    let tempQty = 0; // logic to manage qty.
    for (var i = 0; i < this.RejectLots.length; i++) {
      tempQty = tempQty + this.RejectLots[i].LotQty;
    }
    tempQty = tempQty + Number(this.enteredQty);

    var orignalRejectQty = this.itemDataResponse.RejectQTY;// taken in a local variable for compairsion.
    if (tempQty > parseFloat(orignalRejectQty)) {
      this.toastr.error('', this.translate.instant("SelectedQtyGrater"));
      this.enteredQty = Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
    } else {
      // add qty to Reject Lot list and update rejectQty and rjQty
      this.RejectLots.push({
        Bin: this.binNo,
        LineNo: 1, //for reject lot item. (crosscheck)
        LotNumber: this.serialBatchNo,
        LotQty: Number(this.enteredQty),//need to check 
        ExpiryDate: this.GetReceiptSubmitDateFormat(this.expDate)
      })
     
      //this.totalQtyToSubmit = tempQty; // at the end update totalQty with calculated qty.
      this.rjQty = tempQty;
      var orignalRejectQty = this.itemDataResponse.RejectQTY;
      this.rejectQty = orignalRejectQty - tempQty;
     // console.log("total qty to submit:" + this.totalQtyToSubmit);
    }
    if(this.RejectLots.length>this.pageSize){
      this.pagable = true;
    }else{
      this.pagable = false;
    }
  }


  GetSubmitDateFormat(EXPDATE) {
    if (EXPDATE == "" || EXPDATE == null)
      return "";
    else {
      var d = new Date(EXPDATE);
      var day;

      if (d.getDate().toString().length < 2) {
        day = "0" + d.getDate();
      }
      else {
        day = d.getDate();
      }
      var mth;
      if ((d.getMonth() + 1).toString().length < 2) {
        mth = "0" + (d.getMonth() + 1).toString();
      }
      else {
        mth = d.getMonth() + 1;
      }
      // return day + ":" + mth + ":" + d.getFullYear();
      return mth + "/" + day + "/" + d.getFullYear();
    }
  }
  objectIsEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
  }
  prepareSubmitData(){
   this.Items = this.prepareCommonItemData(this.enteredQty);
   this.RejectItems =  this.prepareRejectItemData(this.enteredQty);
   this.Lots.push({
    Bin: this.binNo,
    LineNo: 0, //abhi k lea kea h need to check
    LotNumber:this.serialBatchNo,
    LotQty:this.enteredQty,//need to check
    ExpiryDate: this.GetReceiptSubmitDateFormat(this.expDate)
   })
   this.submitRecProdData = {Items:this.Items,Lots:this.Lots,UDF:this.UDF,RejectItems:this.RejectItems,RejectLots:this.RejectLots}
  }
 
  prepareCommonItemData(totalAcceptedRejectedQty: any):any{
    var itemsData: any =[];
    itemsData.push({ 
    DiServerToken: localStorage.getItem("Token"),
    CompanyDBId: localStorage.getItem("CompID"),
    Transaction:this.Transaction,
    RECUSERID: localStorage.getItem("UserId"),
    ONLINEPOSTING:this.ONLINEPOSTING,
    BATCHNO: this.orderNumber,
    LineNo:0,//abhi k lea kea h need to check
    RefDocEntry:this.refDocEntry,
    RejectQTY:this.itemDataResponse.RejectQTY,
    RecRjctedQty:this.recRejectQty,
    DOCENTRY:this.refDocEntry,
    Quantity: totalAcceptedRejectedQty,
    ItemCode: this.itemCode,
    POSTEDFGQTY: this.postedFGQTY,
    PASSEDQTY: this.passedQty, 
    AcctDefectQty: this.ACCTDEFECTQTY,
    FGQTYTOPOST: this.itemDataResponse.ORIGINALACTUALQUANTITY,//abhi k lea need to check
    WhsCode:this.whsCode,
    Tracking:this.tracking,
    IsPalletExist:this.IsPalletExist,
    LoginId:localStorage.getItem("UserId"),
    GUID: localStorage.getItem("GUID"),
    UsernameForLic: localStorage.getItem("UserId")
    });
    return itemsData;
  }

  public prepareRejectItemData(totalAcceptedRejectedQty: any): any{
    var rejectItemsData: any =[];
      rejectItemsData.push({
      DiServerToken: localStorage.getItem("Token"),
      CompanyDBId: localStorage.getItem("CompID"),
      Transaction:this.Transaction,
      RECUSERID: localStorage.getItem("UserId"),
      ONLINEPOSTING:this.ONLINEPOSTING,
      BATCHNO: this.orderNumber,
      LineNo:0,//abhi k lea kea h need to check
      RefDocEntry:this.refDocEntry,
      DOCENTRY:this.refDocEntry,
      ItemCode: this.itemCode,
      WhsCode:this.whsCode,
      POSTEDFGQTY: this.postedFGQTY,
      PASSEDQTY: this.passedQty,
      AcctDefectQty: this.ACCTDEFECTQTY,
      FGQTYTOPOST: this.itemDataResponse.ORIGINALACTUALQUANTITY,//abhi k lea need to check
      Tracking:this.tracking,
      IsPalletExist:this.IsPalletExist, 
      LoginId:localStorage.getItem("UserId"),
      RejectQTY:this.itemDataResponse.RejectQTY,
      RecRjctedQty:this.recRejectQty,
      Quantity: totalAcceptedRejectedQty,
      });
      return rejectItemsData;
  }
  public validateForm(): boolean {
    if (this.tracking === "S") {
     return this.validateSerialForm();
    }
    if (this.tracking === "B") {
      return this.validateBatchForm();
    }
    if (this.tracking === "N") {
      return this.validateNonTrackedForm();
    }
  }
  validateBatchForm() : boolean {
    if (this.orderNumber == null || this.orderNumber == undefined || this.orderNumber == "") {
      this.toastr.error('', this.translate.instant("OrderNoBlank"));
      return false ;
    }
    if (this.enteredQty == null || this.enteredQty == undefined || this.enteredQty == "" ||
      parseFloat(this.enteredQty).toFixed(4) == parseFloat("0").toFixed(4)) {
      this.toastr.error('', this.translate.instant("EnterLotQuantity"));
      return false ;
    }
    if (this.serialBatchNo == null || this.serialBatchNo == undefined || this.serialBatchNo == "") {
      this.toastr.error('', this.translate.instant("EnterBatchNo"));
      return false ;
    }
    if (this.binNo == null || this.binNo == undefined || this.binNo == "") {
      this.toastr.error('', this.translate.instant("EnterBinNo"));
      return false ;
    }
    if(parseFloat(this.enteredQty).toFixed(4) < parseFloat("0").toFixed(4)){
      this.toastr.error('', this.translate.instant("QtyGraterThenZero"));
      return false ;
    }
    // if(this.enteredQty>this.orignalActualQty){
    //   this.toastr.error('', this.translate.instant("SelectedQtyGrater"));
    //   return false;
    // }
    return true ;
  }
  validateSerialForm() : boolean{
    if(this.orderNumber== null || this.orderNumber==undefined || this.orderNumber == ""){
      this.toastr.error('', this.translate.instant("OrderNoBlank"));
      return false ;
     }
    if(this.serialBatchNo== null || this.serialBatchNo==undefined || this.serialBatchNo == ""){
      this.toastr.error('', this.translate.instant("EnterSerialNo"));
      return false ;
     }
     if(this.binNo== null || this.binNo==undefined || this.binNo == ""){
      this.toastr.error('', this.translate.instant("EnterBinNo"));
      return false ;
     }
    //  if(this.enteredQty>this.orignalActualQty){
    //   this.toastr.error('', this.translate.instant("SelectedQtyGrater"));
    //   return false;
    // }
     return true ;
  }
  validateNonTrackedForm(): boolean{
    if (this.orderNumber == null || this.orderNumber == undefined || this.orderNumber == "") {
      this.toastr.error('', this.translate.instant("OrderNoBlank"));
      return false ;
    }
    if (this.enteredQty == null || this.enteredQty == undefined || this.enteredQty == "" ||
      parseFloat(this.enteredQty).toFixed(4) == parseFloat("0").toFixed(4)) {
      this.toastr.error('', this.translate.instant("EnterQty"));
      return false ;
    }
    if (this.binNo == null || this.binNo == undefined || this.binNo == "") {
      this.toastr.error('', this.translate.instant("EnterBinNo"));
      return false ;
    }
    if(parseFloat(this.enteredQty).toFixed(4) < parseFloat("0").toFixed(4)){
      this.toastr.error('', this.translate.instant("QtyGraterThenZero"));
      return false ;
    }
    // if(this.enteredQty>this.orignalActualQty){
    //   this.toastr.error('', this.translate.instant("SelectedQtyGrater"));
    //   return false;
    // }
    return true ;
  }
  checkAndValidateSerial(){
    var type;
    if(this.model.options=='1') type = 0;
    if(this.model.options=='2') type = 1;
    this.checkValidateSerialSubs = this.productionService.isSerialExists(this.serialBatchNo,this.itemCode,type,this.tracking,this.orderNumber).subscribe(
      data => {
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          } 
          //check and update response for entered serial no.
          if (data== "1") { 
           //error message
           this.toastr.error('', this.translate.instant("SerialNoAlreadyUsed"));
           this.serialBatchNo = "";
            return;
          }else{
            // allow data
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
    this.showLoader = true;
    this.orderNoListSubs = this.productionService.getOrderNumberList(this.orderNumber).subscribe(
      data => {
        this.showLoader = false;
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
    this.resetOnSerchClick();
    this.orderNoListSubs = this.productionService.GetItemsDetailForProductionReceipt(this.orderNumber).subscribe(
      data => {
        this.displayFormAndSubmit = true; 
        if (data != undefined) { 
        if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
          this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
            this.translate.instant("CommonSessionExpireMsg"));
          return;
        }
        if (data.Table != undefined && data.Table != null && data.Table!="" && data.Table.length>0) { 
           this.showLookupLoader = false;
           this.itemDataResponse =  data.Table[0];
           this.shouldShowExpiryDate = true;
           if("N" == this.itemDataResponse.TRACKING){
            this.shouldShowExpiryDate = false;
           }
           this.setFormData(data.Table[0]);          
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
    this.showLoader = true;
    this.binListSubs = this.productionService.GetBinsList().subscribe(  
      data => {
        this.showLoader = false;
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
       this.serialQty =  Number(this.serialQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
       this.enteredQty = this.serialQty;
       this.disableSearialQty = true; 
       //set serial form data and hide other fields
       //serial qty, openqty and 
       this.showAddMoreButton = true;
     //  this.SerialQtyField.nativeElement.focus(); //set focus on serial qty field.
    }else if(this.tracking == "B"){
      //set batch form data and hide other fields    
      this.showAddMoreButton = true;
      this.enteredQty = Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
    //  this.BatchQtyField.nativeElement.focus(); //set focus on batch qty field.
    }else if(this.tracking == "N"){
      //set non form data and hide other fields 
      
      this.showAddMoreButton = false;   
      this.enteredQty = Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
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

    // show add more button incase of non track item if rejected items available.
    if(this.tracking == "N" && this.showRejectQtyField == true ){
      this.showAddMoreButton = true;    
    }

  }
  showMainLayoutItems: boolean = true;
  lotSerialHeading: any = this.translate.instant("BatchNo");

  showViewAcceptItems($event){
    this.showMainLayoutItems = false;
    this.acceptItemsGrid = true;
    this.rejectItemsGrid = false;
    if(this.tracking=="S"){
      this.lotSerialHeading = this.translate.instant("SerialNo");
    }else{
      this.lotSerialHeading = this.translate.instant("BatchNo");
    } 

  }
 
  
  showViewRejectItems($event){
    //show view reject items.
    this.showMainLayoutItems = false;
    this.acceptItemsGrid = false;
    this.rejectItemsGrid = true;
    if(this.tracking=="S"){
      this.lotSerialHeading = this.translate.instant("SerialNo");
    }else{
      this.lotSerialHeading = this.translate.instant("BatchNo");
    }
  }

  viewAcceptOkClick($event){
    //set variable to hide grid and show the form.
    this.showMainLayoutItems = true;
    this.acceptItemsGrid = false;
    this.rejectItemsGrid = false;

  }
  viewAcceptDeleteAll(){
    // clear all items from array after alert.
    // ckeck if after delete
    this.Lots = [];
    this.orignalActualQty = this.itemDataResponse.ORIGINALACTUALQUANTITY;
    this.acceptQty =  Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));//ye niche vali field jo calculation se dikhate hai.
    if(this.tracking=="S"){
      this.serialQty =  Number(this.serialQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
    }
  } 

  viewAcceptDeleteItem($event,rowIndex){
    //splice item from Array. and update grid.
    console.log("event at delete click:"+JSON.stringify($event));
    var itemToDelete = this.Lots[rowIndex];
    this.acceptQty = this.acceptQty - itemToDelete.LotQty;
    if(this.acceptQty==0){ // if after substracting accpet qty become 0 then show 0.0000
      this.acceptQty =  Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));//ye niche vali field jo calculation se dikhate hai.
    }
    this.orignalActualQty = this.orignalActualQty +  itemToDelete.LotQty;
    this.Lots.splice(rowIndex,1); 
  }

  
  viewRejectOkClick(){
    //set variable to hide grid and show the form.
   this.showMainLayoutItems = true;
   this.acceptItemsGrid = false;
   this.rejectItemsGrid = false;
  }
  viewRejectDeleteAll(){
    // clear all items from array after alert.
    // ckeck if after delete
    // ckeck if after delete
    this.RejectLots = [];
    this.rejectQty = this.itemDataResponse.RejectQTY;
    this.rjQty =  Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));//ye niche vali field jo calculation se dikhate hai.

  }

  viewRejectDeleteItem($event,rowIndex){
    //splice item from Array. and update grid.
    console.log("event at delete click:"+JSON.stringify($event));
    var itemToDelete = this.RejectLots[rowIndex];
    this.rjQty = this.rjQty - itemToDelete.LotQty;
    if(this.rjQty==0){ // if after substracting accpet qty become 0 then show 0.0000
      this.rjQty =  Number(this.defaultQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));//ye niche vali field jo calculation se dikhate hai.
    }
    this.rejectQty = this.rejectQty +  itemToDelete.LotQty;
    this.RejectLots.splice(rowIndex,1); 
  }
  ngOnDestroy() { 
  if (this.orderNoListSubs != undefined)
    this.orderNoListSubs.unsubscribe();
  }

  public confirmDialogForDeleteAllRejectItems() {
    this.dialogFor = "deleteAllRejectItems";
    this.dialogMsg = this.translate.instant("DeleteAllLines");
    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    this.showConfirmDialog = true;
  }
  public confirmDialogForDeleteAllAcceptItems() {
    this.dialogFor = "deleteAllAcceptItems";
    this.dialogMsg = this.translate.instant("DeleteAllLines");
    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    this.showConfirmDialog = true;
  }

  public confirmDialogForDeleteAcceptItem($event,rowIndex) {
    this.rowIndexForDelete = rowIndex;
    this.dialogFor = "deleteAcceptItem";
    this.dialogMsg = this.translate.instant("DeleteRecordsMsg");
    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    this.showConfirmDialog = true;
  }
  public confirmDialogForDeleteRejectItem($event,rowIndex) {
    this.rowIndexForDelete = rowIndex;
    this.dialogFor = "deleteRejectItem";
    this.dialogMsg = this.translate.instant("DeleteRecordsMsg");
    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    this.showConfirmDialog = true;
  }
  

  rowIndexForDelete:any;
  getConfirmDialogValue($event, ) {
    this.showConfirmDialog = false;
    if ($event.Status == "yes") {
      switch ($event.From) {
        case ("deleteAcceptItem"):
          this.viewAcceptDeleteItem($event, this.rowIndexForDelete);
          break;
        case ("deleteRejectItem"):
          this.viewRejectDeleteItem($event, this.rowIndexForDelete);
          break;
        case ("deleteAllAcceptItems"):
          this.viewAcceptDeleteAll();
          break;
        case ("deleteAllRejectItems"):
          this.viewRejectDeleteAll();
          break;
      }
    }else{
      //nothing to do.
    }
  }

  onCancelClick() {
    this.router.navigate(['home/dashboard']);
  }


  GetReceiptSubmitDateFormat(EXPDATE) {
    if (EXPDATE == "" || EXPDATE == null)
      return "";
    else {
      var d = new Date(EXPDATE);
      var day;

      if (d.getDate().toString().length < 2) {
        day = "0" + d.getDate();
      }
      else {
        day = d.getDate();
      }
      var mth;
      if ((d.getMonth() + 1).toString().length < 2) {
        mth = "0" + (d.getMonth() + 1).toString();
      }
      else {
        mth = d.getMonth() + 1;
      }
       return day + ":" + mth + ":" + d.getFullYear();
      //return mth + "/" + day + "/" + d.getFullYear();
    }
  }

}
 