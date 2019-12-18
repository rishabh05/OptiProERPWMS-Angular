import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { InboundService } from '../../services/inbound.service';
import { Commonservice } from '../../services/commonservice.service';
import { InboundMasterComponent } from '../inbound-master.component';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AutoLot } from '../../models/Inbound/AutoLot';
import { RowClassArgs, GridComponent } from '@progress/kendo-angular-grid';
import { bypassSanitizationTrustResourceUrl } from '@angular/core/src/sanitization/bypass';
import { InventoryTransferService } from 'src/app/services/inventory-transfer.service';
import { StatePersistingServiceService } from 'src/app/services/state-persisting-service.service';
import { GridSettings } from 'src/app/interface/grid-settings.interface';
import { ColumnSettings } from 'src/app/interface/column-settings.interface';
import { process } from '@progress/kendo-data-query';

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
  defaultPageSize:number = 10;




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
   gridData:{ "data":[], "total":0}
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

    var ponumber = localStorage.getItem("PONumber");
    if (ponumber != undefined && ponumber != null && ponumber != "") {
      this.poCode = ponumber;
      // this.openPOLines();
      this.OnPOChange();
    }
    this.selectedVendor = this.inboundMasterComponent.selectedVernder;
    this.showGRPOButton = false;

    if(this.savedStateExists){
      //console.log("default setting","grid settings available");
      this.gridSettings = this.mapGridSettings(this.persistingService.get('gridSettings'))
    }else{
      //console.log("default setting","grid settings not available");
      //load with default settings.s
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      //  this.poScanInputField.nativeElement.focus();
      var selectedPO = localStorage.getItem("selectedPO");
      if (selectedPO != undefined && selectedPO != null && selectedPO != "") {
        this.poCode = selectedPO;
        this.disablePO = true;
        this.openPOLines();
      } else {
        this.disablePO = false;
      }
    }, 100);

  }
    
  onPOlookupClick() { 
   // this.openConfirmationDialog();
    this.showLoader = true;
    this.inboundService.getPOList(this.futurepo,
      this.inboundMasterComponent.selectedVernder, this.itemCode).subscribe(
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
            this.lookupfor = "POList";
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
  toggleVisibility(e){
    //console.log("checkuncheck:",this.futurepo);

  }
  onItemlookupClick() {
    //console.log("item lookup click :");
    this.showLoader = true;
    this.inboundService.getItemList(this.futurepo, this.inboundMasterComponent.selectedVernder,
      this.poCode).subscribe(
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
      this.poCode).subscribe(
        (data: any) => {
          this.showLoader = false;
         // console.log("api call resonse section :openPOLines()");
         // console.log(data);
          this.showNonTrackItem = false;
          this.showBatchTrackItem = false;
          this.showSerialTrackItem = false;
          if (data.Table != undefined && data.Table != null) {
            this.openPOLinesModel = [];
            // this.BatchItemsDetail = [];
            // this.NonItemsDetail = [];
            // this.SerialItemsDetail = [];

            if (data.Table.length == 0) {
              this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
              return;
            }

            this.openPOLinesModel = data.Table;
            this.gridSettings.gridData = process(this.openPOLinesModel, {
              skip: 0,
              take: this.defaultPageSize
              // Initial filter descriptor 
            });

            // var  unmatchedPOLinesModel = data.Table;
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

  OnPOChange() {
   
    if (this.poCode == "" || this.poCode == undefined) {
      return;
    }
     
    this.showLoader = true;
    this.inboundService.IsPOExists(this.poCode, "").subscribe(
      data => {
        this.showLoader = false;
        if (data != null) {
          if (data.length > 0) {
            this.openPOLines();
          }
          else {
            this.poCode = "";
            this.toastr.error('', this.translate.instant("Inbound_POExistMessage"));

            return;
          }
        } else {
          this.poCode = "";
          this.toastr.error('', this.translate.instant("Inbound_POExistMessage"));
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
      }
    );
  }

  getLookupValue($event) {
    if ($event != null && $event != undefined && $event == "close") {
      //nothing to do
      return;
    }
    else {
      if (this.lookupfor == "POList") {
        this.poCode = $event[0];
        this.Name = $event[1];
        this.openPOLines()
        //reset grid setting to null
        this.persistingService.set('gridSettings',null);

      }
      else if (this.lookupfor == "POItemList") {
        this.itemCode = $event[0];
        this.openPOLines();
      }
    }
  }

  OnItemCodeChange() {
   
    if (this.itemCode == "" || this.itemCode == undefined) {
      return;
    }
    this.showLoader = true;
    this.inventoryTransferService.GetItemCode(this.itemCode).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
         // console.log("" + data);
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.itemCode = data[0].ItemCode;
          if (this.itemCode != null && this.itemCode != undefined && this.itemCode != '') {
            this.openPOLines();
          }

        } else {
          this.toastr.error('', this.translate.instant("InvalidItemCode"));
          this.itemCode = "";
        }
      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  onClickOpenPOLineRowOpenAutoLot(selection,grid: GridComponent) {
    const poline = selection.selectedRows[0].dataItem;
    this.openPOLineModel = poline;
    // this.openPOLineModel.RPTQTY = 0;
    this.openPOLineModel.DocNum = this.poCode;
    this.inboundMasterComponent.setClickedItemDetail(this.openPOLineModel);
    if (this.openPOLineModel.TRACKING == 'N') {
      // localStorage.setItem("PalletizationEnabledForItem", "True");
      // this.inboundMasterComponent.inboundComponent = 3;
      this.getAutoLotForN(poline.ITEMCODE);
    } else {
      this.getAutoLot(poline.ITEMCODE);
    }
    this.saveGridSettings(grid); 
  }

  getAutoLotForN(itemCode: string) {
    this.inboundService.getAutoLot(itemCode).subscribe(
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

        //this.inboundMasterComponent.setAutoLots(this.autoLot);
        localStorage.setItem("primaryAutoLots", JSON.stringify(this.autoLot));
        // this.openPOLineModel = this.openPOLinesModel.find(e => e.ITEMCODE == itemCode);
        if (this.openPOLineModel != null) {
          localStorage.setItem("PalletizationEnabledForItem", "True");
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
    this.inboundService.getAutoLot(itemCode).subscribe(
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

        //this.inboundMasterComponent.setAutoLots(this.autoLot);
        localStorage.setItem("primaryAutoLots", JSON.stringify(this.autoLot));
        // this.openPOLineModel = this.openPOLinesModel.find(e => e.ITEMCODE == itemCode);
        if (this.openPOLinesModel != null && this.openPOLinesModel.length > 0) {
          if (this.openPOLineModel.TRACKING == 'N') {
            // for(var i=0; i<this.openPOLinesModel.length; i++){
            //   if(Number(this.openPOLinesModel[i].RPTQTY) != Number(this.openPOLinesModel[i].OPENQTY)){
            //     this.openPOLinesModel[i].RPTQTY = this.openPOLinesModel[i].OPENQTY;
            //     this.ShowBins();
            //   }
            // }
            this.ShowBins(itemCode);
          } else {
            localStorage.setItem("PalletizationEnabledForItem", "True");
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
    if (localStorage.getItem("GRPOReceieveData") != undefined && localStorage.getItem("GRPOReceieveData") != null && localStorage.getItem("GRPOReceieveData") != "") {
      this.oSavedPOLotsArray = JSON.parse(localStorage.getItem("GRPOReceieveData"));
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
   // console.log("OpenPOlines items size:", this.openPOLinesModel.length);
    //console.log("OpenPOlines items :", JSON.stringify(this.openPOLinesModel));
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
    localStorage.setItem("PONumber", "");
    // }
  }

  checkDataDiff(): boolean {
    let addToGRPOArrayCount = 0, oSavedPOLotsArrayCount = 0;
    if (localStorage.getItem("AddToGRPO") != "") {
      this.addToGRPOArray = JSON.parse(localStorage.getItem("AddToGRPO"));
      addToGRPOArrayCount = this.addToGRPOArray.POReceiptLots.length;
    }
    if (localStorage.getItem("GRPOReceieveData") != "") {
      this.oSavedPOLotsArray = JSON.parse(localStorage.getItem("GRPOReceieveData"));
      oSavedPOLotsArrayCount = this.oSavedPOLotsArray.POReceiptLots.length;
    }

    if (addToGRPOArrayCount != oSavedPOLotsArrayCount) {
      return true
    }
    return false;
  }


  onAddtoGRPOClick() {
    this.oSavedPOLotsArray = JSON.parse(localStorage.getItem("GRPOReceieveData"));
    if (this.oSavedPOLotsArray != undefined && this.oSavedPOLotsArray != null && this.oSavedPOLotsArray != "") {
      if (localStorage.getItem("AddToGRPO") != "") {
        this.addToGRPOArray = JSON.parse(localStorage.getItem("AddToGRPO"));
        this.manageGRPOData();
      } else {
        this.addToGRPOArray.Header = [];
        this.addToGRPOArray.POReceiptLots = [];
        this.addToGRPOArray.POReceiptLotDetails = [];
        this.addToGRPOArray.UDF = [];
        this.addToGRPOArray.LastSerialNumber = [];
      }
      if (localStorage.getItem("addToGRPOPONumbers") != "") {
        this.addToGRPOPONumbers = JSON.parse(localStorage.getItem("addToGRPOPONumbers"));
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
            DiServerToken: localStorage.getItem("Token"),
            PONumber: this.oSavedPOLotsArray.POReceiptLots[i].PONumber,
            DocEntry: this.oSavedPOLotsArray.POReceiptLots[i].DocEntry,
            CompanyDBId: localStorage.getItem("CompID"),
            LineNo: this.oSavedPOLotsArray.POReceiptLots[i].LineNo,
            ShipQty: this.oSavedPOLotsArray.POReceiptLots[i].ShipQty,
            OpenQty: this.oSavedPOLotsArray.POReceiptLots[i].OpenQty,
            WhsCode: localStorage.getItem("whseId"),
            Tracking: this.oSavedPOLotsArray.POReceiptLots[i].Tracking,
            ItemCode: this.oSavedPOLotsArray.POReceiptLots[i].ItemCode,
            LastSerialNumber: 0,
            Line: this.oSavedPOLotsArray.POReceiptLots[i].Line,
            GUID: localStorage.getItem("GUID"),
            UOM: this.oSavedPOLotsArray.POReceiptLots[i].UOM,
            UsernameForLic: localStorage.getItem("UserId")
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

          for (var k = 0; k < this.oSavedPOLotsArray.UDF.length; k++) {
            if (this.oSavedPOLotsArray.UDF[k].Key == "OPTM_TARGETWHS" &&
              this.oSavedPOLotsArray.UDF[k].LineNo == this.oSavedPOLotsArray.POReceiptLots[i].Line) {
              this.addToGRPOArray.UDF.push({
                Key: "OPTM_TARGETWHS",//UDF[iIndex].Key,
                Value: this.oSavedPOLotsArray.UDF[k].Value,
                Flag: 'D',
                LineNo: this.oSavedPOLotsArray.UDF[k].LineNo
              });
            }

            if (this.oSavedPOLotsArray.UDF[k].Key == "OPTM_TARGETBIN" &&
              this.oSavedPOLotsArray.UDF[k].LineNo == this.oSavedPOLotsArray.POReceiptLots[i].Line) {
              this.addToGRPOArray.UDF.push({
                Key: "OPTM_TARGETBIN",
                Value: this.oSavedPOLotsArray.UDF[k].Value,
                Flag: 'D',
                LineNo: this.oSavedPOLotsArray.UDF[k].LineNo
              });
            }
          }

          for (var m = 0; m < this.oSavedPOLotsArray.LastSerialNumber.length; m++) {
            if (this.oSavedPOLotsArray.LastSerialNumber[m].ItemCode == this.oSavedPOLotsArray.POReceiptLots[i].ItemCode) {
              this.addToGRPOArray.LastSerialNumber.push({
                LastSerialNumber: this.oSavedPOLotsArray.LastSerialNumber[m].LastSerialNumber,
                LineId: this.oSavedPOLotsArray.LastSerialNumber[m].LineId,
                ItemCode: this.oSavedPOLotsArray.LastSerialNumber[m].ItemCode
              });
            }
          }

          this.addToGRPOArray.Header.push({
            NumAtCard: localStorage.getItem("VendRefNo")
          });
        }
      }
      localStorage.setItem("AddToGRPO", JSON.stringify(this.addToGRPOArray));
      localStorage.setItem("addToGRPOPONumbers", JSON.stringify(this.addToGRPOPONumbers));
    }
    localStorage.setItem("PONumber", "");
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

        for (var k = 0; k < this.addToGRPOArray.UDF.length; k++) {
          if (this.addToGRPOArray.UDF[k].Key == "OPTM_TARGETWHS" &&
            this.addToGRPOArray.UDF[k].LineNo == this.addToGRPOArray.POReceiptLots[i].Line) {
            this.addToGRPOArray.UDF.splice(k, 1);
          }

          if (this.addToGRPOArray.UDF[k].Key == "OPTM_TARGETBIN" &&
            this.addToGRPOArray.UDF[k].LineNo == this.addToGRPOArray.POReceiptLots[i].Line) {
            this.addToGRPOArray.UDF.splice(k, 1);
          }
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

  

  onItemHiddenScanClick(){
    var inputValue = (<HTMLInputElement>document.getElementById('InboundPO_ItemCodeScanInputField')).value;
    if (inputValue.length > 0) {
      this.itemCode = inputValue;
    }
    this.OnItemCodeChange();
  }

  onHiddenPOScanClick(){
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
          localStorage.setItem("PONumber", "");
          break;

      }
    }
  }

  prepareCommonData() {
    var oSubmitPOLotsObj: any = {};
    var dataModel = localStorage.getItem("GRPOReceieveData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      oSubmitPOLotsObj.Header = [];
      oSubmitPOLotsObj.POReceiptLots = [];
      oSubmitPOLotsObj.POReceiptLotDetails = [];
      oSubmitPOLotsObj.UDF = [];
      oSubmitPOLotsObj.LastSerialNumber = [];
    } else {
      oSubmitPOLotsObj = JSON.parse(dataModel);
    }
    var oSubmitPOLotsObj = this.prepareSubmitPurchaseOrder(oSubmitPOLotsObj);
    localStorage.setItem("GRPOReceieveData", JSON.stringify(oSubmitPOLotsObj));
  }


  public ShowBins(itemCode) {
    this.inboundService.getRevBins(this.openPOLinesModel[0].QCREQUIRED, itemCode).subscribe(
      (data: any) => {
        this.showLoader = false;
       // console.log(data);
        if (data != null) {
          if (data.length > 0) {
            this.RecvbBinvalue = data[0].DefaultBin;
          }

          // if(this.openPOLinesModel[0].QCREQUIRED == 'Y'){

          // }else{
            for(var i=0; i<this.openPOLinesModel.length; i++){
              if(Number(this.openPOLinesModel[i].RPTQTY) != Number(this.openPOLinesModel[i].OPENQTY)){
                this.openPOLinesModel[i].RPTQTY = this.openPOLinesModel[i].OPENQTY;
                this.openPOLineModel = this.openPOLinesModel[i];
                this.prepareCommonData();
              }
            }
          // }
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

  getDefaultFromBin() {
    this.inventoryTransferService.GetDefaultBinOrBinWithQty(this.itemCode, 
      localStorage.getItem("towhseId")).subscribe(
      data => {
       // this.getDefaultBinFlag = true;
        if (data != null) {
          let resultV = data.find(element => element.BINTYPE == 'V');
          if (resultV != undefined) {
            this.RecvbBinvalue = resultV.BINNO;
          }
          let resultD = data.find(element => element.BINTYPE == 'D');
          if (resultD != undefined) {
            this.RecvbBinvalue = resultD.BINNO;
          }
          let resultQ = data.find(element => element.BINTYPE == 'Q');
          if (resultQ != undefined) {
            this.RecvbBinvalue = resultQ.BINNO;
          }
          this.prepareCommonData();
          return;
        }

      },
      error => {
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }


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


  prepareSubmitPurchaseOrder(oSubmitPOLotsObj: any): any {
    oSubmitPOLotsObj = this.manageRecords(oSubmitPOLotsObj);
    if (localStorage.getItem("Line") == null || localStorage.getItem("Line") == undefined ||
      localStorage.getItem("Line") == "") {
      localStorage.setItem("Line", "0");
    }

    oSubmitPOLotsObj.POReceiptLots.push({
      DiServerToken: localStorage.getItem("Token"),
      PONumber: this.poCode,
      DocEntry: this.openPOLineModel.DOCENTRY,
      CompanyDBId: localStorage.getItem("CompID"),
      LineNo: this.openPOLineModel.LINENUM,
      ShipQty: this.openPOLineModel.RPTQTY.toString(),
      OpenQty: this.openPOLineModel.OPENQTY.toString(),
      WhsCode: localStorage.getItem("whseId"),
      Tracking: this.openPOLineModel.TRACKING,
      ItemCode: this.openPOLineModel.ITEMCODE,
      LastSerialNumber: 0,
      Line: Number(localStorage.getItem("Line")),
      GUID: localStorage.getItem("GUID"),
      UOM: "",
      UsernameForLic: localStorage.getItem("UserId")

      //------end Of parameter For License----
    });
    // oSubmitPOLotsObj.UDF = [];
    oSubmitPOLotsObj.UDF.push({
      Key: "OPTM_TARGETWHS",//UDF[iIndex].Key,
      Value: "",
      //LotNo: UDF[iIndex].LotNo,
      Flag: 'D', // D = Line, H= Header, L = Lots
      LineNo: Number(localStorage.getItem("Line"))
    });
    oSubmitPOLotsObj.UDF.push({
      Key: "OPTM_TARGETBIN",//UDF[iIndex].Key,
      Value: "",
      //LotNo: UDF[iIndex].LotNo,
      Flag: 'D', // D = Line, H= Header, L = Lots
      LineNo: Number(localStorage.getItem("Line"))
    });


    // for (var iBtchIndex = 0; iBtchIndex < this.recvingQuantityBinArray.length; iBtchIndex++) {
    oSubmitPOLotsObj.POReceiptLotDetails.push({
      // POItemCode: this.Ponumber+this.openPOLineModel.ITEMCODE,
      Bin: this.RecvbBinvalue,
      LineNo: this.openPOLineModel.LINENUM,
      LotNumber: "", //getUpperTableData.GoodsReceiptLineRow[iBtchIndex].SysSerNo,
      LotQty: this.openPOLineModel.RPTQTY.toString(),
      SysSerial: "0",
      ExpireDate: "",//GetSubmitDateFormat(getUpperTableData.GoodsReceiptLineRow[iBtchIndex].EXPDATE), // oCurrentController.GetSubmitDateFormat(oActualGRPOModel.PoDetails[iIndex].ExpireDate),//oActualGRPOModel.PoDetails[iIndex].ExpireDate,
      VendorLot: "",
      //NoOfLabels: oActualGRPOModel.PoDetails[iIndex].NoOfLabels,
      //Containers: piContainers,
      SuppSerial: "",
      ParentLineNo: Number(localStorage.getItem("Line")),
      LotSteelRollId: "",
      ItemCode: this.openPOLineModel.ITEMCODE,
      PalletCode: ""
    });
    //  }

    // for (var iLastIndexNumber = 0; iLastIndexNumber < this.LastSerialNumber.length; iLastIndexNumber++) {
    //   oSubmitPOLotsObj.LastSerialNumber.push({
    //     LastSerialNumber: this.LastSerialNumber[iLastIndexNumber],
    //     LineId: this.LineId[iLastIndexNumber],
    //     ItemCode: this.openPOLineModel.ITEMCODE
    //   });
    // }
    localStorage.setItem("Line", "" + (Number(localStorage.getItem("Line")) + 1));

    oSubmitPOLotsObj.Header.push({
      NumAtCard: localStorage.getItem("VendRefNo")
    });
    return oSubmitPOLotsObj;
  }
  
  dataStateChange(state){
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
            .reduce((acc, curr) => ({...acc, ...{[curr]: item[curr]}}), <ColumnSettings> {});
      })
    };

    this.persistingService.set('gridSettings',gridConfig);
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

}
