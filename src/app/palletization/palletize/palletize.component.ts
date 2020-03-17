import { Component, OnInit, ViewChild } from '@angular/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Pallet } from 'src/app/models/Inbound/Pallet';
import { PalletOperationType } from 'src/app/enums/PalletEnums';
import { LabelPrintReportsService } from 'src/app/services/label-print-reports.service';

@Component({
  selector: 'app-palletize',
  templateUrl: './palletize.component.html',
  styleUrls: ['./palletize.component.scss']
})
export class PalletizeComponent implements OnInit {
  //showGridBtn: boolean 
  showGrid: boolean = false;
  showLoader: boolean = false;
  showLookup: boolean = false;
  lookupFor: any = "";
  savedPalletsArray: any = Array<Pallet>();
  public serviceData: any;
  autoGeneratePalletEnable: boolean = false;
  palletNo: string = "";
  showNewPallet: boolean = false;
  newCreatedPalletNo: string = "";
  itemCode: string = "";
  itemsList: any;
  showHideGridToggle: boolean = false;
  showHideBtnTxt: string;
  batchSerialNo: string = "";
  qty: number = 0;
  openQty: number;
  expDate: string;
  toBin: string;
  toWhse: string;
  fromWhse: string;
  fromBinNo: string;
  sumOfQty: number = 0;
  itemType: string = "";
  isSerailTrackedItem: boolean = false;
  @ViewChild('scanItemCode') scanItemCode
  @ViewChild('BatchNoInput') BatchNoInput
  @ViewChild('scanToPallet') scanToPallet
  @ViewChild('scanQuantity') scanQuantity

  constructor(private commonservice: Commonservice,
    private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private labelPrintReportsService: LabelPrintReportsService) {
    this.showHideBtnTxt = this.translate.instant("showGrid");

  }

  ngOnInit() {
    if (localStorage.getItem("AutoPalletIdGenerationChecked") == "True") {
      this.autoGeneratePalletEnable = true;
    }
  }

  ngAfterViewInit(): void{
    this.scanItemCode.nativeElement.focus()
   setTimeout(()=>{
    this.showHideBtnTxt = this.translate.instant("showGrid");
   },500)
  }

  public getPalletList(from: string) {
    if (this.itemCode == '' || this.itemCode == undefined) {
      this.toastr.error('', this.translate.instant("SelectItemCode"));
      return
    }

    this.showLoader = true;
    this.commonservice.getPalletList(1, this.itemCode).subscribe(
      (data: any) => {
        this.showLoader = false;
      //  console.log(data);
        if (data != null) {
          if (data.length > 0) {
           // console.log(data);
            this.showLoader = false;
            this.serviceData = data;
            this.showLookup = true;
            this.lookupFor = "PalletList";
            return;
          } else {
            this.showLookup = false;
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        }
      },
      error => {
        this.showLoader = false;
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  onPalletScan() {
    // alert("scan click");
  }

  onPalletChangeBlur(){
    if(this.isValidateCalled){
      return;
    }
    this.onPalletChange();
  } 

  async onPalletChange(): Promise<any>{
    if (this.palletNo == '' || this.palletNo == undefined) {
      return
    }
    this.showLoader = true;
    var result = false
    await this.commonservice.isPalletValid(this.palletNo).then(
      (data: any) => {
        this.showLoader = false;
        console.log("inside isPalletValid")
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("InValidPalletNo"));
              this.palletNo = "";
              this.scanToPallet.nativeElement.focus()
              result = false
            } else {
              this.palletNo = data[0].Code;
              this.showHideBtnTxt = this.translate.instant("showGrid");
              result = true
            }
          } else {
            this.palletNo = "";
            this.toastr.error('', this.translate.instant("InValidPalletNo"));
            this.scanToPallet.nativeElement.focus()
            result = false
          }
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          this.palletNo = "";
          this.scanToPallet.nativeElement.focus()
          result = false
        }
      },
      error => {
        this.showLoader = false;
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
        result = false
      }
    );
    return result
  }

  getLookupValue(lookupValue: any) {
    this.showLoader = false;
    if (this.lookupFor == "PalletList") {
      this.palletNo = lookupValue.Code;
      this.toWhse = lookupValue.U_OPTM_WAREHOUSE_LOC;
      this.toBin = lookupValue.U_OPTM_BIN;
      this.showHideBtnTxt = this.translate.instant("showGrid");
      this.scanQuantity.nativeElement.focus()
    } else if (this.lookupFor == "ItemsList") {
      this.itemCode = lookupValue.ITEMCODE;
      this.itemType = lookupValue.ITEMTYPE;
      if (this.itemType == "S") {
        this.isSerailTrackedItem = true;
      } else {
        this.isSerailTrackedItem = false;
      }
      //Reset fields when change itemcode
      this.resetVariablesOnItemSelect();
      this.BatchNoInput.nativeElement.focus()
    } else if (this.lookupFor == "ShowBatachSerList") {
      this.batchSerialNo = lookupValue.LOTNO;
      this.expDate = lookupValue.EXPDATE;
      this.fromWhse = lookupValue.WHSCODE;
      this.fromBinNo = lookupValue.BINNO;
      this.openQty = Number.parseInt(lookupValue.TOTALQTY);
      this.validateRemainigQuantity();
      this.scanToPallet.nativeElement.focus()
    }
  }

  back(fromwhereval: number) {
    this.router.navigate(['home/dashboard', { skipLocationChange: true }]);
  }

  manageEyeIcon: boolean = true;
  clickShowHideGrid() {

    this.showHideGridToggle = !this.showHideGridToggle;
    if (this.showHideGridToggle) {
      this.showHideBtnTxt = this.translate.instant("hideGrid");
      this.manageEyeIcon = false;
    } else {
      this.showHideBtnTxt = this.translate.instant("showGrid");
      this.manageEyeIcon = true;
    }
  }

  onCheckChange() {
    this.newCreatedPalletNo = "";
    this.showInputDialog("NewPallet_Palletize", this.translate.instant("Done"), this.translate.instant("Cancel"),
    this.translate.instant("Plt_CreateNewPallet"));
  }

  OnItemCodeLookupClick() {
    this.showLoader = true;
    this.commonservice.getItemsToPalletize().subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
         // console.log("getItemsToPalletize - " + JSON.stringify(data));
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookup = true;
          this.serviceData = data;
          this.lookupFor = "ItemsList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.showLoader = false;
          this.toastr.error('', error);
        }
      }
    );
  }

  OnItemCodeChangeBlur(){
    if(this.isValidateCalled){
      return
    }
    this.OnItemCodeChange();
  }

  async OnItemCodeChange(): Promise<any>{
    if (this.itemCode == "" || this.itemCode == undefined) {
      this.savedPalletsArray = [];
      return;
    }
    this.showLoader = true;
    var result = false
    await this.commonservice.getItemInfo(this.itemCode).then(
      data => {
        console.log("inside OnItemCodeChange");
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.itemCode = data[0].ITEMCODE;
          this.itemType = data[0].TRACKING;
          this.savedPalletsArray = [];
          this.resetVariablesOnItemSelect();

          if (this.itemType == "S") {
            this.isSerailTrackedItem = true;
          } else {
            this.isSerailTrackedItem = false;
          }
          result = true
        } else {
          this.savedPalletsArray = [];
          this.resetVariablesOnItemSelect();
          this.toastr.error('', this.translate.instant("InvalidItemCode"));
          this.itemCode = ''
          this.scanItemCode.nativeElement.focus()
          result = false
        }
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
        result = false
      }
    );
    return result;
  }

  // clickShowHideGrid() {
  //   this.showHideGridToggle = !this.showHideGridToggle;
  //   if (this.showHideGridToggle) {
  //     this.showHideBtnTxt = this.translate.instant("hideGrid");
  //   } else {
  //     this.showHideBtnTxt = this.translate.instant("showGrid");
  //   }
  // }

  showHideGridBtn() {
    if ((this.itemCode != "" && this.itemCode != undefined)
      && (this.batchSerialNo != "" && this.batchSerialNo != undefined)
      && (this.palletNo != "" && this.palletNo != undefined)) {
      return true;
    }
    return false;
  }

  OnBatchSerialLookupClick() {
    if (this.itemCode == '' || this.itemCode == undefined) {
      this.toastr.error('', this.translate.instant("SelectItemCode"));
      return;
    }

    this.showLoader = true;
    this.commonservice.getBatchSerialForItem(this.itemCode).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          //console.log("getItemsToPalletize - " + JSON.stringify(data));
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookup = true;
          this.serviceData = data;
          this.lookupFor = "ShowBatachSerList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.showLoader = false;
          this.toastr.error('', error);
        }
      }
    );
  }

  OnLotsChangeBlur(){
    if(this.isValidateCalled){
      return;
    }
    this.OnLotsChange();
  }

  async OnLotsChange() : Promise<any>{
    if (this.batchSerialNo == '' || this.batchSerialNo == undefined) {
      return;
    }

    if (this.itemCode == '' || this.itemCode == undefined) {
      this.toastr.error('', this.translate.instant("SelectItemCode"));
      this.batchSerialNo = "";
      return;
    }

    this.showLoader = true;
    var result = false
    await this.labelPrintReportsService.getLotScanListWithoutWhseBinAndItemWisePromise(this.itemCode, this.batchSerialNo).then(
      (data: any) => {
        console.log("inside OnLotsChange")
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data == "0" || data[0] == "0") {
            this.toastr.error('', this.translate.instant("InvalidBatch"));
            this.batchSerialNo = "";
            this.BatchNoInput.nativeElement.focus()
            result = false
            return result;
          }
          this.batchSerialNo = data[0].LOTNO; //check this code.
          this.expDate = data[0].EXPDATE;
          this.fromWhse = data[0].WHSCODE;
          this.fromBinNo = data[0].BINNO;
          this.openQty = Number.parseInt(data[0].TOTALQTY);
          this.validateRemainigQuantity();
          result = true
        } else {
          this.toastr.error('', this.translate.instant("InvalidBatch"));
          this.batchSerialNo = "";
          this.BatchNoInput.nativeElement.focus()
          result = false
        }
      },
      error => {
        this.toastr.error('', error);
        this.batchSerialNo = "";
        this.showLoader = false;
        result = false
      }
    );
    return result;
  }


  async addQuantity() {
    var result = await this.validateBeforeSubmit();
    this.isValidateCalled = false;
    console.log("validate result: " + result);
    if (result != undefined && result == false) {
      return;
    }

    if (this.qty == 0 || this.qty == undefined) {
      this.toastr.error('', this.translate.instant("Inbound_EnterQuantityErrMsg"));
      return;
    }
    if (!Number.isInteger(this.qty)) {
      this.toastr.error('', this.translate.instant("DecimalQuantity"));
      return;
    }
    if (this.itemCode == "" || this.itemCode == undefined) {
      this.toastr.error('', this.translate.instant("SelectItemCode"));
      return;
    }
    if (this.batchSerialNo == "" || this.batchSerialNo == undefined) {
      this.toastr.error('', this.translate.instant("SelectBatchSerial"));
      return;
    }
    if (this.palletNo == "" || this.palletNo == undefined) {
      this.toastr.error('', this.translate.instant("Plt_PalletRequired"));
      return;
    }

    if (this.qty < 0) {
      this.toastr.error('', this.translate.instant("ProdReceipt_QtyGraterThenZero"));
      return;
    }

    if (!this.validateQuantity()) {
      return;
    }

    var object = {
      ItemCode: this.itemCode,
      LotNo: this.batchSerialNo,
      FinalLotNo: this.batchSerialNo + "-" + this.palletNo,
      PalletCode: this.palletNo,
      Quantity: this.qty,
      FromBinNo: this.fromBinNo,
      ToBinNo: this.toBin,
      FromWhse: this.fromWhse,
      ToWhse: this.toWhse,
      ExpiryDate: this.expDate
    }
    this.savedPalletsArray.push(object);
    this.resetVariablesOnItemSelect();
  }

  validateQuantity() {
    this.sumOfQty = 0;
    for (let i = 0; i < this.savedPalletsArray.length; i++) {
      var savedItem = this.savedPalletsArray[i].ItemCode;
      var savedLotNo = this.savedPalletsArray[i].LotNo;

      if (this.itemCode == savedItem && this.batchSerialNo == savedLotNo) {
        this.sumOfQty = this.sumOfQty + Number.parseInt(this.savedPalletsArray[i].Quantity);
      }
    }

    this.sumOfQty = this.sumOfQty + Number.parseInt("" + this.qty);

    if (this.sumOfQty > this.openQty) {
      this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantityValid"));
      this.qty = 0;
      return false;
    }
    // else if(this.sumOfQty > this.openQty && this.savedPalletsArray.length == 0) {
    //   this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantityValid"));
    //   this.qty = 0;
    //   return false;
    // } 
    else {
      return true;
    }
  }

  async palletize() {
    var result = await this.validateBeforeSubmit();
    this.isValidateCalled = false;
    if (result != undefined && result == false) {
      console.log("validate result: " + result);
      return;
    }

    this.showLoader = true;
    var oPalletReq: any = {};
    oPalletReq.Header = [];
    oPalletReq.Detail = [];
    oPalletReq.Header.push({
      COMPANYDBNAME: localStorage.getItem("CompID"),
      PALLETOPERATIONTYPE: PalletOperationType.Palletization,
      WhsCode: localStorage.getItem("whseId"),
      FromPalletCode: "",
      ToPalletCode: "",
      USERID: localStorage.getItem("UserId"),
      DIServerToken: localStorage.getItem("Token")
    }
    );

    for (var i = 0; i < this.savedPalletsArray.length; i++) {
      oPalletReq.Detail.push({
        ITEMCODE: this.savedPalletsArray[i].ItemCode,
        BATCHNO: this.savedPalletsArray[i].LotNo,
        FINALBATCHNO: this.savedPalletsArray[i].FinalLotNo,
        PALLETNO: this.savedPalletsArray[i].PalletCode,
        QTY: this.savedPalletsArray[i].Quantity,
        BIN: this.savedPalletsArray[i].FromBinNo,
        WHSE: this.savedPalletsArray[i].FromWhse,
        TOBIN: this.savedPalletsArray[i].ToBinNo,
        TOWHSE: this.savedPalletsArray[i].ToWhse,
        EXPIRYDATE: "" + this.savedPalletsArray[i].ExpiryDate,
      });
    }
    this.commonservice.palletize(oPalletReq).subscribe(
      (data: any) => {
        this.showLoader = false;
       // console.log(data);
        if (data != null && data != undefined && data.length > 0) {
          if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
            this.toastr.success('', this.translate.instant("Plt_PalletizedSuccess"));
            this.resetPageOnSuccess();
          } else if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          } else {
            this.toastr.error('', data[0].ErrorMsg);
          }
        } else {
          this.toastr.error('', this.translate.instant("Plt_PalletizeErrMsg"));
        }
      },
      error => {
        this.showLoader = false;
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  resetPageOnSuccess() {
    this.savedPalletsArray = [];
    this.batchSerialNo = '';
    this.palletNo = '';
    this.expDate = "";
    this.fromWhse = "";
    this.fromBinNo = "";
    this.openQty = 0;
    this.qty = 0;
    this.toBin = "";
    this.toWhse = "";
    this.itemCode = "";
  }

  openConfirmForDelete(index: any, item: any) {
   // console.log("index: " + index)
  //  console.log("item: " + item)
    this.savedPalletsArray.splice(index, 1);
  }

  resetVariablesOnItemSelect() {
    this.batchSerialNo = '';
    this.palletNo = '';
    this.expDate = "";
    this.fromWhse = "";
    this.fromBinNo = "";
    this.openQty = 0;
    this.qty = 0;
  }

  validateRemainigQuantity() {
    this.sumOfQty = 0;
    for (let i = 0; i < this.savedPalletsArray.length; i++) {
      var savedItem = this.savedPalletsArray[i].ItemCode;
      var savedLotNo = this.savedPalletsArray[i].LotNo;

      if (this.itemCode == savedItem && this.batchSerialNo == savedLotNo) {
        this.sumOfQty = this.sumOfQty + Number.parseInt(this.savedPalletsArray[i].Quantity);
      }
    }

    this.qty = this.openQty - this.sumOfQty;
  }
  ScanItemCodeField() {
    var inputValue = (<HTMLInputElement>document.getElementById('PalletizeItemCodeInput')).value;
    if (inputValue.length > 0) {
      this.itemCode = inputValue;
    }
    this.OnItemCodeChange();
  }
  ScanBatchSerialField() {
    var inputValue = (<HTMLInputElement>document.getElementById('PalletizeBatchSrNo')).value;
    if (inputValue.length > 0) {
      this.batchSerialNo = inputValue;
    }
    this.OnLotsChange();
  }
  ScanPalletField() {
    var inputValue = (<HTMLInputElement>document.getElementById('PalletizePalletNo')).value;
    if (inputValue.length > 0) {
      this.palletNo = inputValue;
    }
    this.onPalletChange();
  }

  public createNewPallet(palletNo: string, binNo: string) {
    this.showLoader = true;
    this.commonservice.createNewPallet(palletNo, binNo).subscribe(
      (data: any) => {
        this.showLoader = false;
       // console.log(data);
        if (data != null) {
          if (data.length > 0) {
            this.newCreatedPalletNo = data;
            this.palletNo = this.newCreatedPalletNo;
            return;
          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  inputDialogFor: any;
  yesButtonText: any;
  noButtonText: any;
  titleMessage: any;
  showInputDialogFlag: boolean = false;
  showInputDialog(dialogFor: string, yesbtn: string, nobtn: string, msg: string) {
    this.inputDialogFor = dialogFor;
    this.yesButtonText = yesbtn;
    this.noButtonText = nobtn;
    this.showInputDialogFlag = true;
    this.titleMessage = msg;
  }

  getInputDialogValue($event) {
   // console.log("getInputDialogValue " + event)
    this.showInputDialogFlag = false;
    if ($event.Status == "yes") {
      switch ($event.From) {
        case ("NewPallet_Palletize"):
          this.toBin = $event.BinNo;
          this.toWhse = localStorage.getItem("whseId");
          this.createNewPallet($event.PalletNo, $event.BinNo);
          break
      }
    }
  }

  isValidateCalled: boolean = false;
  async validateBeforeSubmit():Promise<any>{
    this.isValidateCalled = true;
    var currentFocus = document.activeElement.id;
    console.log("validateBeforeSubmit current focus: "+currentFocus);
    
    if(currentFocus != undefined){
      if(currentFocus == "PalletizePalletNo"){
        return this.onPalletChange();
      } else if(currentFocus == "PalletizeBatchSrNo"){
        return this.OnLotsChange();
      } else if(currentFocus == "PalletizeItemCodeInput") {
        return this.OnItemCodeChange();
      }
    }
  }
}
