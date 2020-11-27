import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { InboundService } from '../../services/inbound.service';
import { Commonservice } from '../../services/commonservice.service';
import { InboundMasterComponent } from '../inbound-master.component';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AutoLot } from '../../models/Inbound/AutoLot';
import { RowClassArgs, GridComponent } from '@progress/kendo-angular-grid';
import { InventoryTransferService } from 'src/app/services/inventory-transfer.service';
import { StatePersistingServiceService } from 'src/app/services/state-persisting-service.service';
import { GridSettings } from 'src/app/interface/grid-settings.interface';
import { ColumnSettings } from 'src/app/interface/column-settings.interface';
import { process } from '@progress/kendo-data-query';
import { IUIComponentTemplate } from 'src/app/common/ui-component.interface';
@Component({
  selector: 'app-inbound-polist',
  templateUrl: './inbound-polist.component.html',
  styleUrls: ['./inbound-polist.component.scss']
})
export class InboundPolistComponent implements OnInit {
  RecvbBinvalue: string;
  futurepo: boolean = false;
  poCode: string = ""; 
  showLookupLoader: boolean = true;
  serviceData: any[];
  lookupfor: string;
  itemCode: string = "";
  Name: string;
  // NonItemsDetail: any[];
  // BatchItemsDetail: any[]; 
  // SerialItemsDetail: any[];
  showSerialTrackItem: boolean = false;
  showBatchTrackItem: boolean = false;
  showNonTrackItem: boolean = false;
  autoLot: any[];
  openPOLineModel: any;
  openPOLinesModel: any[] = [];
  unmatchedPOLinesModel: any[];
  viewLines: any[];
  public oSavedPOLotsArray: any = {};
  public addToGRPOArray: any = {};
  addToGRPOPONumbers: any = {};
  showGRPOButton: boolean = false;
  selectedVendor: string = "";
  disablePO: boolean = false;
  @ViewChild('poScanInputField') poScanInputField: ElementRef;
  showLoader: boolean = false;
  pagable: boolean = false;
  pageSize: number = Commonservice.pageSize;
  showConfirmDialog = false;
  defaultPageSize: number = 10;
  @ViewChild('scanItemCode') scanItemCode;

  // caption related labels.
  PONo:any;
  future_PO_Invoice:any;
  IsUDFEnabled = "N";
  inboundFromWhere: any = false;


  public gridSettings: GridSettings = {
    state: {
      skip: 0,
      take: this.defaultPageSize,

      // Initial filter descriptor
      filter: {
        logic: 'and',
        filters: []
      }
    },
    columnsConfig: [
    ],
    gridData: { "data": [], "total": 0 }
  };

  public get savedStateExists(): boolean {
    return !!this.persistingService.get('gridSettings');
  }

  constructor(private inboundService: InboundService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent, private inventoryTransferService: InventoryTransferService,
    private persistingService: StatePersistingServiceService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }
   
  ngOnInit() {
    this.inboundFromWhere = sessionStorage.getItem("inboundOptionType");
    this.IsUDFEnabled = sessionStorage.getItem("ISUDFEnabled");
    if(this.inboundFromWhere==1){
      this.PONo =  this.translate.instant("Inbound_PO#");
      this.future_PO_Invoice = this.translate.instant("Inbound_FuturePOs");
      // change captions and api calling according to normal inbound.
    }else if(this.inboundFromWhere==2){
      
      this.PONo =  this.translate.instant("Inbound_InvoiceNo");
      this.future_PO_Invoice = this.translate.instant("Inbound_FutureInvoices");
        // change captions and api calling according to normal inbound.
    }

    // set future po to check if already checked.
    if(sessionStorage.getItem("isFuturePOChecked")== "true"){
      this.futurepo = true;
    }else{
      this.futurepo = false;
    }

    var ponumber = sessionStorage.getItem("PONumber");
    if (ponumber != undefined && ponumber != null && ponumber != "") {
      this.poCode = ponumber;
      this.OnPOChange();
    }
    this.selectedVendor = this.inboundMasterComponent.selectedVernder;
    this.showGRPOButton = false;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      var selectedPO = sessionStorage.getItem("selectedPO");
      if (selectedPO != undefined && selectedPO != null && selectedPO != "") {
        this.poCode = selectedPO;
        this.disablePO = true;
        this.openPOLines();
      } else {
        this.disablePO = false;
      }
      this.poScanInputField.nativeElement.focus();
    }, 100);

  }

  onPOlookupClick() {
    // this.openConfirmationDialog();
    this.showLoader = true;
    this.inboundService.getPOList(this.futurepo,
      this.inboundMasterComponent.selectedVernder, this.itemCode,this.inboundFromWhere).subscribe(
        (data: any) => {
          this.showLoader = false;
          //  console.log("get polist response:");
          if (data != undefined) {
            if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
              this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                this.translate.instant("CommonSessionExpireMsg"));
              return;
            }
            this.showLookupLoader = false;
            this.serviceData = data.Table;
            //    console.log("get polist response serviceData:", this.serviceData);
          var ibFromWhere:any = sessionStorage.getItem("inboundOptionType");
          if(ibFromWhere==1){
            this.lookupfor = "POList";
          }else{
            this.lookupfor = "POListForInvoice";
          }
          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
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
  //future po change.
  toggleVisibility(e) {
    console.log("checkuncheck:",this.futurepo);
    sessionStorage.setItem("isFuturePOChecked", JSON.stringify(this.futurepo));
  }
  onItemlookupClick() {
    //console.log("item lookup click :");
    this.showLoader = true;
    this.inboundService.getItemList(this.futurepo, this.inboundMasterComponent.selectedVernder,
      this.poCode,this.inboundFromWhere).subscribe(
        (data: any) => {
          this.showLoader = false;
          // console.log(data);
          if (data != undefined) {
            if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
              this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                this.translate.instant("CommonSessionExpireMsg"));
              return;
            }
            this.showLookupLoader = false;
            this.serviceData = data.Table;
            this.lookupfor = "POItemList";
          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
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

  openPOLines() {
    if (this.poCode == "") {
      this.toastr.error('', this.translate.instant("POValidation"));
      return;
    }
    //console.log("search click : in open poline method :openPOLines()");
    this.showLoader = true;
    this.inboundService.GetOpenPOLines(this.futurepo, this.itemCode,
      this.poCode,this.inboundFromWhere).subscribe(
        (data: any) => {
          this.showLoader = false;
          this.showNonTrackItem = false;
          this.showBatchTrackItem = false;
          this.showSerialTrackItem = false;
          if (data.Table != undefined && data.Table != null) {
            this.openPOLinesModel = [];
            if (data.Table.length == 0) {
              this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
              return;
            }

            this.openPOLinesModel = data.Table;
            if (this.savedStateExists) {
              this.gridSettings = this.mapGridSettings(this.persistingService.get('gridSettings'))
            } else {
             this.gridSettings.gridData = process(this.openPOLinesModel, {
               skip: 0,
               take: this.defaultPageSize
             });
            }

            this.updateReceivedQtyForSavedItems();
            if (this.openPOLinesModel.length > 0) {
              this.showSerialTrackItem = true;
              // this.pagable = true;
            }
            if (this.openPOLinesModel.length > this.pageSize) {
              this.pagable = true;
            }

            if (this.itemCode != "" && this.itemCode != undefined
              && this.poCode != "" && this.poCode != undefined) {
              const poline = this.openPOLinesModel[0];
              this.openPOLineModel = poline;
              // this.openPOLineModel.RPTQTY = poline.OPENQTY;
              this.openPOLineModel.DocNum = this.poCode;
              this.inboundMasterComponent.setClickedItemDetail(this.openPOLineModel);              
              this.getAutoLot(this.openPOLineModel.ITEMCODE);
            }
          } else if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          //  console.log("api call resonse section end of if :openPOLines()");
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

  OnPOChangeBlur(){
    if(this.isValidateCalled){
      return;
    }
    this.OnPOChange();
  }

  async OnPOChange() {
    if (this.poCode == "" || this.poCode == undefined) {
      return;
    }

    this.showLoader = true;
    var result = false;
    await this.inboundService.IsPOExists(this.poCode, "",this.inboundFromWhere).then(
      data => {
        this.showLoader = false;
        if (data != null) {
          if (data.length > 0) {
            this.openPOLines();
            result = true;
          }
          else {
            this.poCode = "";
            this.toastr.error('', this.translate.instant("Inbound_POExistMessage"));
            this.poScanInputField.nativeElement.focus()
            result = false;
          }
        } else {
          this.poCode = "";
          this.toastr.error('', this.translate.instant("Inbound_POExistMessage"));
          this.poScanInputField.nativeElement.focus()
          result = false;
        }
      },
      error => {
        this.showLoader = false;
        this.toastr.error('', error);
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
        result = false;
      }
    );
    return result
  }

  getLookupValue($event) {
    if ($event != null && $event != undefined && $event == "close") {
      //nothing to do
      return;
    }
    else {
      if (this.lookupfor == "POList" || this.lookupfor == "POListForInvoice") {
        this.poCode = $event[0];
        this.Name = $event[1];
        this.openPOLines()
        //reset grid setting to null
        this.persistingService.set('gridSettings', null);
        this.scanItemCode.nativeElement.focus();
      }
      else if (this.lookupfor == "POItemList") {
        this.itemCode = $event[0];
        this.openPOLines();
      }
    }
  }

  OnItemCodeChangeBlur(){
    if(this.isValidateCalled){
      return;
    }
    this.OnItemCodeChange();
  }

  async OnItemCodeChange() {
    if (this.itemCode == "" || this.itemCode == undefined) {
      return;
    }
    this.showLoader = true;
    var result = false;
    await this.inventoryTransferService.GetItemCode(this.itemCode).then(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.itemCode = data[0].ItemCode;
          if (this.itemCode != null && this.itemCode != undefined && this.itemCode != '') {
            this.openPOLines();
          }
          result = true;
        } else {
          this.toastr.error('', this.translate.instant("InvalidItemCode"));
          this.itemCode = "";
          this.scanItemCode.nativeElement.focus()
          result = false;
        }
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
        result = false;
      }
    );
    return result
  }

  onClickOpenPOLineRowOpenAutoLot(poline, grid: GridComponent) {    
    this.openPOLineModel = poline;
    this.openPOLineModel.DocNum = this.poCode;
    this.inboundMasterComponent.setClickedItemDetail(this.openPOLineModel);
    if (this.openPOLineModel.TRACKING == 'N') {
      this.getAutoLotForN(poline.ITEMCODE);
    } else {
      this.getAutoLot(poline.ITEMCODE);
    }
    this.saveGridSettings(grid);
  }

  getAutoLotForN(itemCode: string) {
    this.inboundService.getAutoLot(itemCode, this.openPOLineModel.TRACKING, 0).subscribe(
      (data: any) => {
        //console.log(data);
        if (data.Table != undefined) {
          this.autoLot = data.Table;
          // console.log("autolot value from polist:" + this.autoLot);
        } else if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
          this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
            this.translate.instant("CommonSessionExpireMsg"));
          return;
        }
        if (this.autoLot.length > 0) {
        }
        else {
          this.autoLot.push(new AutoLot("N", itemCode, "", "", "", ""));
        }
        if(!this.checkIfMandatoryUDFFilled()){
          return;
        }
        sessionStorage.setItem("primaryAutoLots", JSON.stringify(this.autoLot));
        if (this.openPOLineModel != null) {
          sessionStorage.setItem("PalletizationEnabledForItem", "True");
          this.inboundMasterComponent.inboundComponent = 3;
        }
      },
      error => {
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

  getAutoLot(itemCode: string) {
    this.inboundService.getAutoLot(itemCode, this.openPOLineModel.TRACKING, 0).subscribe(
      (data: any) => {
        console.log(data);
        if (data.Table != undefined) {
          this.autoLot = data.Table;
          //console.log("autolot value from polist:" + this.autoLot);
        } else if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
          this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
            this.translate.instant("CommonSessionExpireMsg"));
          return;
        }
        if (this.autoLot.length > 0) {
        }
        else {
          this.autoLot.push(new AutoLot("N", itemCode, "", "", "", ""));
        }
        if(!this.checkIfMandatoryUDFFilled()){
          return;
        }
        sessionStorage.setItem("primaryAutoLots", JSON.stringify(this.autoLot));
        if (this.openPOLinesModel != null && this.openPOLinesModel.length > 0) {
          if (this.openPOLineModel.TRACKING == 'N') {
            this.ShowBins(itemCode);
          } else {
            sessionStorage.setItem("PalletizationEnabledForItem", "True");
            this.inboundMasterComponent.inboundComponent = 3;
          }
        }
      },
      error => {
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

  updateReceivedQtyForSavedItems() {
    // var  unmatchedPOLinesModel = array;
    if (sessionStorage.getItem("GRPOReceieveData") != undefined && sessionStorage.getItem("GRPOReceieveData") != null && sessionStorage.getItem("GRPOReceieveData") != "") {
      this.oSavedPOLotsArray = JSON.parse(sessionStorage.getItem("GRPOReceieveData"));
    } else {
      this.oSavedPOLotsArray = undefined;
    }

    for (var k = 0; k < this.openPOLinesModel.length; k++) {
      this.openPOLinesModel[k].RPTQTY = 0;
    }
    if (this.oSavedPOLotsArray != undefined && this.oSavedPOLotsArray != null &&
      this.oSavedPOLotsArray.POReceiptLots != undefined && this.oSavedPOLotsArray.POReceiptLots != null &&
      this.oSavedPOLotsArray.POReceiptLots.length > 0 &&
      this.openPOLinesModel != undefined && this.openPOLinesModel != null &&
      this.openPOLinesModel.length > 0) {
      for (var i = 0; i < this.openPOLinesModel.length; i++) {
        for (var j = 0; j < this.oSavedPOLotsArray.POReceiptLots.length; j++) {
          if (this.oSavedPOLotsArray.POReceiptLots[j].PONumber == this.poCode &&
            this.oSavedPOLotsArray.POReceiptLots[j].ItemCode == this.openPOLinesModel[i].ITEMCODE &&
            this.oSavedPOLotsArray.POReceiptLots[j].LineNo == this.openPOLinesModel[i].LINENUM) {
            this.openPOLinesModel[i].RPTQTY = this.oSavedPOLotsArray.POReceiptLots[j].ShipQty;
            this.showGRPOButton = true;
          }
        }
      }
    }
  }

  copyRemaingItemtoMainArray(unmatchedPOLinesModel: any[]) {
    for (var i = 0; i < this.openPOLinesModel.length; i++) {
      for (var j = 0; j < this.unmatchedPOLinesModel.length; j++) {
        if (this.unmatchedPOLinesModel[j].POReceiptLots != null &&
          this.unmatchedPOLinesModel[j].POReceiptLots != undefined &&
          this.unmatchedPOLinesModel[j].POReceiptLots.length > 0 &&
          this.unmatchedPOLinesModel[j].POReceiptLots[0].PONumber == this.poCode &&
          this.unmatchedPOLinesModel[j].POReceiptLots[0].ItemCode == this.openPOLinesModel[i].ITEMCODE) {
          this.openPOLinesModel[i].RPTQTY = 0;
          //this.openPOLinesModel.splice(i,1); 
        }
      }
    }
  }

  onCancelClick() {
    // if(this.checkDataDiff()){
    //   this.openConfirmationDialog();
    // }else{
    this.inboundMasterComponent.inboundComponent = 1;
    sessionStorage.setItem("PONumber", "");
    // }
  }

  // checkDataDiff(): boolean {
  //   let addToGRPOArrayCount = 0, oSavedPOLotsArrayCount = 0;
  //   if (sessionStorage.getItem("AddToGRPO") != "") {
  //     this.addToGRPOArray = JSON.parse(sessionStorage.getItem("AddToGRPO"));
  //     addToGRPOArrayCount = this.addToGRPOArray.POReceiptLots.length;
  //   }
  //   if (sessionStorage.getItem("GRPOReceieveData") != "") {
  //     this.oSavedPOLotsArray = JSON.parse(sessionStorage.getItem("GRPOReceieveData"));
  //     oSavedPOLotsArrayCount = this.oSavedPOLotsArray.POReceiptLots.length;
  //   }

  //   if (addToGRPOArrayCount != oSavedPOLotsArrayCount) {
  //     return true
  //   }
  //   return false;
  // }


  async onAddtoGRPOClick() {
    await this.validateBeforeSubmit();

    this.oSavedPOLotsArray = JSON.parse(sessionStorage.getItem("GRPOReceieveData"));
    if (this.oSavedPOLotsArray != undefined && this.oSavedPOLotsArray != null && this.oSavedPOLotsArray != "") {
      if (sessionStorage.getItem("AddToGRPO") != "") {
        this.addToGRPOArray = JSON.parse(sessionStorage.getItem("AddToGRPO"));
        this.manageGRPOData();
      } else {
        this.addToGRPOArray.Header = [];
        this.addToGRPOArray.POReceiptLots = [];
        this.addToGRPOArray.POReceiptLotDetails = [];
        this.addToGRPOArray.UDF = [];
        this.addToGRPOArray.LastSerialNumber = [];
      }
      if (sessionStorage.getItem("addToGRPOPONumbers") != "") {
        this.addToGRPOPONumbers = JSON.parse(sessionStorage.getItem("addToGRPOPONumbers"));
        // this.managePONumberListData();
      } else {
        this.addToGRPOPONumbers.PONumbers = [];
      }
      var addpo = true;
      for (var i = 0; i < this.oSavedPOLotsArray.POReceiptLots.length; i++) {
        if (this.oSavedPOLotsArray.POReceiptLots[i].PONumber == this.poCode) {
          if (addpo) {
            let isExist = false;
            for (var c = 0; c < this.addToGRPOPONumbers.PONumbers.length; c++) {
              if (this.addToGRPOPONumbers.PONumbers[c].PONumber == this.poCode) {
                // this.addToGRPOPONumbers.PONumbers.splice(c, 1);
                this.addToGRPOPONumbers.PONumbers[c].PONumber = this.oSavedPOLotsArray.POReceiptLots[i].PONumber;
                isExist = true;
              }
            }

            if (!isExist) {
              this.addToGRPOPONumbers.PONumbers.push({
                PONumber: this.oSavedPOLotsArray.POReceiptLots[i].PONumber
              });
            }
            addpo = false;
          }
   
          this.addToGRPOArray.POReceiptLots.push({
            OPTM_TYPE:this.oSavedPOLotsArray.POReceiptLots[i].OPTM_TYPE,
            DiServerToken: sessionStorage.getItem("Token"),
            PONumber: this.oSavedPOLotsArray.POReceiptLots[i].PONumber,
            DocEntry: this.oSavedPOLotsArray.POReceiptLots[i].DocEntry,
            CompanyDBId: sessionStorage.getItem("CompID"),
            LineNo: this.oSavedPOLotsArray.POReceiptLots[i].LineNo,
            ShipQty: this.oSavedPOLotsArray.POReceiptLots[i].ShipQty,
            OpenQty: this.oSavedPOLotsArray.POReceiptLots[i].OpenQty,
            WhsCode: sessionStorage.getItem("whseId"),
            Tracking: this.oSavedPOLotsArray.POReceiptLots[i].Tracking,
            ItemCode: this.oSavedPOLotsArray.POReceiptLots[i].ItemCode,
            LastSerialNumber: 0,
            Line: this.oSavedPOLotsArray.POReceiptLots[i].Line,
            GUID: sessionStorage.getItem("GUID"),
            UOM: this.oSavedPOLotsArray.POReceiptLots[i].UOM,
            UsernameForLic: sessionStorage.getItem("UserId")
          });

          for (var j = 0; j < this.oSavedPOLotsArray.POReceiptLotDetails.length; j++) {
            if (this.oSavedPOLotsArray.POReceiptLotDetails[j].ParentLineNo == this.oSavedPOLotsArray.POReceiptLots[i].Line) {
              this.addToGRPOArray.POReceiptLotDetails.push({
                Bin: this.oSavedPOLotsArray.POReceiptLotDetails[j].Bin,
                LineNo: this.oSavedPOLotsArray.POReceiptLotDetails[j].LineNo,
                LotNumber: this.oSavedPOLotsArray.POReceiptLotDetails[j].LotNumber,
                LotQty: this.oSavedPOLotsArray.POReceiptLotDetails[j].LotQty,
                SysSerial: "0",
                ExpireDate: this.oSavedPOLotsArray.POReceiptLotDetails[j].ExpireDate,
                VendorLot: this.oSavedPOLotsArray.POReceiptLotDetails[j].VendorLot,
                SuppSerial: this.oSavedPOLotsArray.POReceiptLotDetails[j].SuppSerial,
                ParentLineNo: this.oSavedPOLotsArray.POReceiptLotDetails[j].ParentLineNo,
                PalletCode: this.oSavedPOLotsArray.POReceiptLotDetails[j].PalletCode,
                ItemCode: this.oSavedPOLotsArray.POReceiptLotDetails[j].ItemCode,
                LotSteelRollId: ""
              });
            }
          }

          this.addToGRPOArray.UDF = this.oSavedPOLotsArray.UDF;
          // for (var k = 0; k < this.oSavedPOLotsArray.UDF.length; k++) {
          //   if (this.oSavedPOLotsArray.UDF[k].Key == "OPTM_TARGETWHS" &&
          //     this.oSavedPOLotsArray.UDF[k].LineNo == this.oSavedPOLotsArray.POReceiptLots[i].Line) {
          //     this.addToGRPOArray.UDF.push({
          //       Key: "OPTM_TARGETWHS",//UDF[iIndex].Key,
          //       Value: this.oSavedPOLotsArray.UDF[k].Value,
          //       Flag: 'D',
          //       LineNo: this.oSavedPOLotsArray.UDF[k].LineNo
          //     });
          //   }

          //   if (this.oSavedPOLotsArray.UDF[k].Key == "OPTM_TARGETBIN" &&
          //     this.oSavedPOLotsArray.UDF[k].LineNo == this.oSavedPOLotsArray.POReceiptLots[i].Line) {
          //     this.addToGRPOArray.UDF.push({
          //       Key: "OPTM_TARGETBIN",
          //       Value: this.oSavedPOLotsArray.UDF[k].Value,
          //       Flag: 'D',
          //       LineNo: this.oSavedPOLotsArray.UDF[k].LineNo
          //     });
          //   }
          // }

          for (var m = 0; m < this.oSavedPOLotsArray.LastSerialNumber.length; m++) {
            if (this.oSavedPOLotsArray.LastSerialNumber[m].ItemCode == this.oSavedPOLotsArray.POReceiptLots[i].ItemCode) {
              this.addToGRPOArray.LastSerialNumber.push({
                LastSerialNumber: this.oSavedPOLotsArray.LastSerialNumber[m].LastSerialNumber,
                LineId: this.oSavedPOLotsArray.LastSerialNumber[m].LineId,
                ItemCode: this.oSavedPOLotsArray.LastSerialNumber[m].ItemCode
              });
            }
          }
          this.addToGRPOArray.Header = [];
          this.addToGRPOArray.Header.push({
            NumAtCard: sessionStorage.getItem("VendRefNo")
          });
        }
      }
      sessionStorage.setItem("AddToGRPO", JSON.stringify(this.addToGRPOArray));
      sessionStorage.setItem("addToGRPOPONumbers", JSON.stringify(this.addToGRPOPONumbers));
    }
    sessionStorage.setItem("PONumber", "");
    this.inboundMasterComponent.inboundComponent = 1;
  }

  managePONumberListData() {
    for (var i = 0; i < this.addToGRPOPONumbers.PONumbers.length; i++) {
      if (this.addToGRPOPONumbers.PONumbers[i].PONumber == this.poCode) {
        this.addToGRPOPONumbers.PONumbers.splice(i, 1);
      }
    }
  }

  manageGRPOData() {
    for (var i = 0; i < this.addToGRPOArray.POReceiptLots.length; i++) {
      if (this.addToGRPOArray.POReceiptLots[i].PONumber == this.poCode) {
        for (var j = 0; j < this.addToGRPOArray.POReceiptLotDetails.length; j++) {
          if (this.addToGRPOArray.POReceiptLotDetails[j].ParentLineNo == this.addToGRPOArray.POReceiptLots[i].Line) {
            this.addToGRPOArray.POReceiptLotDetails.splice(j, 1);
            j = -1;
          }
        }

        while(this.addToGRPOArray.UDF.length > 0){
          let index = this.addToGRPOArray.UDF.findIndex(e => e.LineNo == this.addToGRPOArray.POReceiptLots[i].Line)
          if(index == -1){
            break;
          }
          this.addToGRPOArray.UDF.splice(index, 1);
        }

        for (var m = 0; m < this.addToGRPOArray.LastSerialNumber.length; m++) {
          if (this.addToGRPOArray.LastSerialNumber[m].ItemCode == this.addToGRPOArray.POReceiptLots[i].ItemCode) {
            this.addToGRPOArray.LastSerialNumber.splice(m, 1);
            m = -1;
          }
        }
        this.addToGRPOArray.POReceiptLots.splice(i, 1);
        i = -1;
      }
    }
  }

  onInboundScan() {
    // alert("scan click");
  }



  onItemHiddenScanClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('InboundPO_ItemCodeScanInputField')).value;
    if (inputValue.length > 0) {
      this.itemCode = inputValue;
    }
    this.OnItemCodeChange();
  }

  onHiddenPOScanClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('inboundPOScanPOInputField')).value;
    if (inputValue.length > 0) {
      this.poCode = inputValue;
    }
    this.OnPOChange();
  }


  onGS1ItemScan1() {
    var inputValue = (<HTMLInputElement>document.getElementById('inboundScanInputField')).value;
    if (inputValue.length > 0) {
      this.itemCode = inputValue;
    }
  }

  dialogFor: string = "";
  dialogMsg: string = ""
  yesButtonText: string = "";
  noButtonText: string = "";

  public openConfirmationDialog() {
    this.dialogFor = "Confirmation";
    this.dialogMsg = this.translate.instant("Inbound_AddToGRPOMsg");
    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    this.showConfirmDialog = true;
  }

  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;
    if ($event.Status == "yes") {
      switch ($event.From) {
        case ("Confirmation"):
          this.onAddtoGRPOClick();
          break;
      }
    } else {
      switch ($event.From) {
        case ("Confirmation"):
          this.inboundMasterComponent.inboundComponent = 1;
          sessionStorage.setItem("PONumber", "");
          break;

      }
    }
  }

  // prepareCommonData() {
  //   var oSubmitPOLotsObj: any = {};
  //   var dataModel = sessionStorage.getItem("GRPOReceieveData");
  //   if (dataModel == null || dataModel == undefined || dataModel == "") {
  //     oSubmitPOLotsObj.Header = [];
  //     oSubmitPOLotsObj.POReceiptLots = [];
  //     oSubmitPOLotsObj.POReceiptLotDetails = [];
  //     oSubmitPOLotsObj.UDF = [];
  //     oSubmitPOLotsObj.LastSerialNumber = [];
  //   } else {
  //     oSubmitPOLotsObj = JSON.parse(dataModel);
  //   }
  //   var oSubmitPOLotsObj = this.prepareSubmitPurchaseOrder(oSubmitPOLotsObj);
  //   sessionStorage.setItem("GRPOReceieveData", JSON.stringify(oSubmitPOLotsObj));
  // }

  public ShowBins(itemCode) {
    this.inboundService.getRevBins(this.openPOLinesModel[0].QCREQUIRED, itemCode).subscribe(
      (data: any) => {
        this.showLoader = false;
        // console.log(data);
        if (data != null) {
          if (data.length > 0) {
            if (this.openPOLinesModel[0].QCREQUIRED == "Y") {
              this.RecvbBinvalue = data[0].BINNO;
            } else if (data[0].DefaultBin == undefined || data[0].DefaultBin == null || data[0].DefaultBin == "") {
              this.RecvbBinvalue = data[0].BINNO;
            } else {
              this.RecvbBinvalue = data[0].DefaultBin;
            }
          }

          for (var i = 0; i < this.openPOLinesModel.length; i++) {
            if (Number(this.openPOLinesModel[i].RPTQTY) != Number(this.openPOLinesModel[i].OPENQTY)) {
              this.openPOLinesModel[i].RPTQTY = this.openPOLinesModel[i].OPENQTY;
              this.openPOLineModel = this.openPOLinesModel[i];
              // this.prepareCommonData();
              this.inboundMasterComponent.prepareCommonData(this.inboundFromWhere, this.poCode, this.openPOLineModel.DOCENTRY, null, null, "", JSON.parse(sessionStorage.getItem("GRPOHdrUDF")), this.RecvbBinvalue);
            }
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

  // getDefaultFromBin() {
  //   this.inventoryTransferService.GetDefaultBinOrBinWithQty(this.itemCode,
  //     sessionStorage.getItem("towhseId")).subscribe(
  //       data => {
  //         // this.getDefaultBinFlag = true;
  //         if (data != null) {
  //           let resultV = data.find(element => element.BINTYPE == 'V');
  //           if (resultV != undefined) {
  //             this.RecvbBinvalue = resultV.BINNO;
  //           }
  //           let resultD = data.find(element => element.BINTYPE == 'D');
  //           if (resultD != undefined) {
  //             this.RecvbBinvalue = resultD.BINNO;
  //           }
  //           let resultQ = data.find(element => element.BINTYPE == 'Q');
  //           if (resultQ != undefined) {
  //             this.RecvbBinvalue = resultQ.BINNO;
  //           }
  //           this.prepareCommonData();
  //           return;
  //         }

  //       },
  //       error => {
  //         if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
  //           this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
  //         }
  //         else {
  //           this.toastr.error('', error);
  //         }
  //       }
  //     );
  // }


  manageRecords(oSubmitPOLotsObj: any): any {
    var size = oSubmitPOLotsObj.POReceiptLots.length;
    for (var i = 0; i < oSubmitPOLotsObj.POReceiptLots.length; i++) {
      if (oSubmitPOLotsObj.POReceiptLots[i].PONumber == this.poCode &&
        oSubmitPOLotsObj.POReceiptLots[i].ItemCode == this.openPOLineModel.ITEMCODE &&
        oSubmitPOLotsObj.POReceiptLots[i].LineNo == this.openPOLineModel.LINENUM) {
        var s = oSubmitPOLotsObj.POReceiptLotDetails.length;
        for (var j = 0; j < oSubmitPOLotsObj.POReceiptLotDetails.length; j++) {
          if (oSubmitPOLotsObj.POReceiptLotDetails[j].ParentLineNo == oSubmitPOLotsObj.POReceiptLots[i].Line) {
            oSubmitPOLotsObj.POReceiptLotDetails.splice(j, 1);
            j = -1;
          }
        }

        for (var k = 0; k < oSubmitPOLotsObj.UDF.length; k++) {
          if (oSubmitPOLotsObj.UDF[k].Key == "OPTM_TARGETWHS" &&
            oSubmitPOLotsObj.UDF[k].LineNo == oSubmitPOLotsObj.POReceiptLots[i].Line) {
            oSubmitPOLotsObj.UDF.splice(k, 1);
          }

          if (oSubmitPOLotsObj.UDF[k].Key == "OPTM_TARGETBIN" &&
            oSubmitPOLotsObj.UDF[k].LineNo == oSubmitPOLotsObj.POReceiptLots[i].Line) {
            oSubmitPOLotsObj.UDF.splice(k, 1);
          }
        }

        // oSubmitPOLotsObj.UDF.splice(i, 1);
        for (var m = 0; m < oSubmitPOLotsObj.LastSerialNumber.length; m++) {
          if (oSubmitPOLotsObj.LastSerialNumber[m].ItemCode == oSubmitPOLotsObj.POReceiptLots[i].ItemCode) {
            oSubmitPOLotsObj.LastSerialNumber.splice(m, 1);
            m = -1;
          }
        }
        // oSubmitPOLotsObj.LastSerialNumber.splice(i, 1);
        oSubmitPOLotsObj.POReceiptLots.splice(i, 1);
      }
    }
    return oSubmitPOLotsObj;
  }


  // prepareSubmitPurchaseOrder(oSubmitPOLotsObj: any): any {
  //   oSubmitPOLotsObj = this.manageRecords(oSubmitPOLotsObj);
  //   if (sessionStorage.getItem("Line") == null || sessionStorage.getItem("Line") == undefined ||
  //     sessionStorage.getItem("Line") == "") {
  //     sessionStorage.setItem("Line", "0");
  //   }   

  //   oSubmitPOLotsObj.POReceiptLots.push({
  //     DiServerToken: sessionStorage.getItem("Token"),
  //     PONumber: this.poCode,
  //     DocEntry: this.openPOLineModel.DOCENTRY,
  //     CompanyDBId: sessionStorage.getItem("CompID"),
  //     LineNo: this.openPOLineModel.LINENUM,
  //     ShipQty: this.openPOLineModel.RPTQTY.toString(),
  //     OpenQty: this.openPOLineModel.OPENQTY.toString(),
  //     WhsCode: sessionStorage.getItem("whseId"),
  //     Tracking: this.openPOLineModel.TRACKING,
  //     ItemCode: this.openPOLineModel.ITEMCODE,
  //     LastSerialNumber: 0,
  //     Line: Number(sessionStorage.getItem("Line")),
  //     GUID: sessionStorage.getItem("GUID"),
  //     UOM: "",
  //     UsernameForLic: sessionStorage.getItem("UserId")
  //   });

  //   oSubmitPOLotsObj.UDF = this.UDF;

  //   oSubmitPOLotsObj.POReceiptLotDetails.push({
  //     Bin: this.RecvbBinvalue,
  //     LineNo: this.openPOLineModel.LINENUM,
  //     LotNumber: "", 
  //     LotQty: this.openPOLineModel.RPTQTY.toString(),
  //     SysSerial: "0",
  //     ExpireDate: "",
  //     VendorLot: "",
  //     SuppSerial: "",
  //     ParentLineNo: Number(sessionStorage.getItem("Line")),
  //     LotSteelRollId: "",
  //     ItemCode: this.openPOLineModel.ITEMCODE,
  //     PalletCode: ""
  //   });
  //   sessionStorage.setItem("Line", "" + (Number(sessionStorage.getItem("Line")) + 1));
  //   oSubmitPOLotsObj.Header.push({
  //     NumAtCard: sessionStorage.getItem("VendRefNo")
  //   });
  //   return oSubmitPOLotsObj;
  // }

  dataStateChange(state) {
    this.gridSettings.state = state;
    this.gridSettings.gridData = process(this.openPOLinesModel, state);
  }

  public saveGridSettings(grid: GridComponent): void {
    const columns = grid.columns;
    const gridConfig = {
      state: this.gridSettings.state,
      columnsConfig: columns.toArray().map(item => {
        return Object.keys(item)
          .filter(propName => !propName.toLowerCase()
            .includes('template'))
          .reduce((acc, curr) => ({ ...acc, ...{ [curr]: item[curr] } }), <ColumnSettings>{});
      })
    };
    this.persistingService.set('gridSettings', gridConfig);
  }

  public mapGridSettings(gridSettings: GridSettings): GridSettings {

    const state = gridSettings.state;


    return {
      state,
      columnsConfig: gridSettings.columnsConfig.sort((a, b) => a.orderIndex - b.orderIndex),
      gridData: process(this.openPOLinesModel, state)
    };
  }
  private mapDateFilter = (descriptor: any) => {
    const filters = descriptor.filters || [];

    filters.forEach(filter => {
      if (filter.filters) {
        this.mapDateFilter(filter);
      } else if (filter.field === 'FirstOrderedOn' && filter.value) {
        filter.value = new Date(filter.value);
      }
    });
  }

  isValidateCalled: boolean = false;
  async validateBeforeSubmit():Promise<any>{
    this.isValidateCalled = true;
    var currentFocus = document.activeElement.id;
    console.log("validateBeforeSubmit current focus: "+currentFocus);
    
    if(currentFocus != undefined){
      if(currentFocus == "inboundPOScanPOInputField"){
        return this.OnPOChangeBlur();
      } else if(currentFocus == "InboundPO_ItemCodeScanInputField"){
        return this.OnItemCodeChangeBlur();
      }
    }
  }


  showUDF = false;
  UDFComponentData: IUIComponentTemplate[] = [];
  itUDFComponents: IUIComponentTemplate = <IUIComponentTemplate>{};
  templates = [];
  displayArea = "Header";

  ShowUDF(displayArea, UDFButtonClicked, dataItem?): boolean {
    if(dataItem != undefined){
      this.openPOLineModel = dataItem;
    }
    let UDF = this.inboundMasterComponent.getUDF()
    let subarray = [];
    UDF.forEach(e => {
      if (e.LineNo == this.openPOLineModel.LINENUM && e.DocEntry == this.openPOLineModel.DOCENTRY) {
        subarray.push(e);
      }
    });    
    // let index = this.UDF.findIndex(e => e.LineNo == lineNum);
    // if (index == -1) {
    this.displayArea = displayArea;
    let UDFStatus = this.commonservice.loadUDF(displayArea, this.commonservice.getUDFData(), subarray);
    if (!UDFButtonClicked) {
      if (UDFStatus != "MANDATORY_AVL") {
        return false;
      }
    }
    this.templates = this.commonservice.getTemplateArray();
    this.UDFComponentData = this.commonservice.getUDFComponentDataArray();
    this.showUDF = true;
    return true;
  }

  onUDFDialogClose() {
    this.showUDF = false;
    this.UDFComponentData = [];
    this.templates = [];

  }

  getUDFSelectedItem(itUDFComponentData) {
    this.onUDFDialogClose();
    if (itUDFComponentData == null) {
      return;
    }

    if (this.displayArea == "Detail") {
      let UDF = this.inboundMasterComponent.getUDF()
      while (UDF.length > 0) {
        let index = UDF.findIndex(e => e.LineNo == this.openPOLineModel.LINENUM && e.DocEntry == this.openPOLineModel.DOCENTRY)
        if (index == -1) {
          break;
        }
        UDF.splice(index, 1);
      }
      if (itUDFComponentData.length > 0) {
        for (var i = 0; i < itUDFComponentData.length; i++) {
          let value = "";
          if (itUDFComponentData[i].istextbox) {
            value = itUDFComponentData[i].textBox;
          } else {
            value = itUDFComponentData[i].dropDown.FldValue;
          }
          UDF.push({
            Flag: "D",
            LineNo: this.openPOLineModel.LINENUM,
            Value: value,
            Key: itUDFComponentData[i].AliasID,
            DocEntry: this.openPOLineModel.DOCENTRY
          });
        }
        this.inboundMasterComponent.updateUDF(UDF);
      }
    }
    this.templates = [];
  }

  checkIfMandatoryUDFFilled(): boolean{
    if (this.IsUDFEnabled == 'Y') {
      if (sessionStorage.getItem("GRPOHdrUDF") == undefined || sessionStorage.getItem("GRPOHdrUDF") == "") {
        if (this.ShowUDF('Header', false)) {
          return false;
        }        
      }
      let UDF = this.inboundMasterComponent.getUDF()
      let indx = -1;
      if (UDF.length > 0) {
        indx = UDF.findIndex(e => e.LineNo == this.openPOLineModel.LINENUM && e.DocEntry == this.openPOLineModel.DOCENTRY)
      }
      if (indx == -1) {
        if (this.ShowUDF('Detail', false)) {
          return false;
        }
      }      
    }
    return true;
  }
}
