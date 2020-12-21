import { Component, OnInit, ViewChild, ComponentFactory, Output, Input, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { InboundMasterComponent } from '../inbound-master.component';
import { Router } from '@angular/router';
import { InboundService } from '../../services/inbound.service';
import { Commonservice } from '../../services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { UOM } from '../../models/Inbound/UOM';
import { OpenPOLinesModel } from '../../models/Inbound/OpenPOLinesModel';
import { RecvingQuantityBin } from '../../models/Inbound/RecvingQuantityBin';
import { AutoLot } from '../../models/Inbound/AutoLot';
import { ISubscription } from 'rxjs/Subscription';
import { ProductionService } from '../../services/production.service';
import { PalletOperationType } from '../../enums/PalletEnums';
import { IUIComponentTemplate } from 'src/app/common/ui-component.interface';
import { ModuleIds, ScreenIds, ControlIds } from '../../enums/enums';
import { GridComponent } from '../../../../node_modules/@progress/kendo-angular-grid';
import { ColumnChooserComponent } from '../../../../node_modules/@progress/kendo-angular-grid/dist/es2015/column-menu/column-chooser.component';

@Component({
  selector: 'app-inbound-grpo',
  templateUrl: './inbound-grpo.component.html',
  styleUrls: ['./inbound-grpo.component.scss']
})
export class InboundGRPOComponent implements OnInit, AfterViewInit {
  showUserPreference: boolean = false;
  dialogMsg: string = ""
  yesButtonText: string = "";
  noButtonText: string = "";
  openPOLineModel: OpenPOLinesModel[] = [];
  Ponumber: any;
  DocEntry: any;
  ItemCode: any;
  OpenQty: number;
  tracking: string = "";
  RecvbBinvalue: any = "";
  uomSelectedVal: UOM;
  UOMList: UOM[];
  showLoader: boolean = false;
  qty: any = undefined;
  showButton: boolean = false;
  showRecButton: boolean = false;
  recvingQuantityBinArray: RecvingQuantityBin[] = [];
  defaultRecvBin: boolean = false;
  serviceData: any[];
  lookupfor: string;
  showLookupLoader = true;
  viewLines: any[];
  operationType: string = "";
  public defaultDateValue: any = "";
  searlNo: any = "";
  MfrSerial: any = "";
  expiryDate: string = ""; isNonTrack: boolean = false;
  isSerial: boolean = false;
  dialogFor: string = "";
  //locale string variables
  serialNoTitle: string = "";
  mfrRadioText: string = "";
  sysRadioText: string = "";
  scanInputPlaceholder: string = "";
  mfrGridColumnText: string = "";
  SRBatchColumnText: string = "";
  public oSubmitPOLotsArray: any[] = [];
  isAutoLotEnabled: boolean;
  isDisabledScanInput: boolean = false;
  isDisabledLotNoField: boolean = false;
  ScanSerial: string = "";
  ScanInputs: any = "";
  targetBin: string = "";
  targetWhse: string = "";
  IsQCRequired: boolean;
  targetBinSubs: ISubscription;
  targetWhseSubs: ISubscription;
  showScanInput: boolean = true;
  showUOM: boolean = true;
  showScanAndInputRadio: boolean = true;
  targetBinClick: boolean = false;
  public primaryAutoLots: AutoLot[];
  radioSelected: any = 1;
  LastSerialNumber: any[];
  LineId: any[];
  previousReceivedQty: number = 0;
  dateFormat: string;
  showConfirmDialog: boolean;
  rowindexForDelete: any;
  gridDataAfterDelete: any[];

  showPDF: boolean = false;
  displayPDF1: boolean = false;
  base64String: string = "";
  fileName: string = "";
  UOMentry: any = "";
  @Input() fromWhere;
  @Output() screenBackEvent = new EventEmitter();
  isPalletizationEnable: boolean = false;
  palletValue: any = "";
  inboundNewPallet: string;
  ActualSRBatchColumnText: string = "";
  showNewPallet: boolean = false;
  pageSize: number = Commonservice.pageSize;
  IsUDFEnabled: string = "N"
  serialBatchNo: string = "";
  newCreatedPalletNo: string;
  //receipt production variables.
  receiptData: any;
  fromReceiptProduction: boolean = false;
  lookupDisable: boolean = false;
  availableRejQty: number = 0;
  Lots: any = [];
  RejectLots: any = [];
  ItemsData: any = [];
  RejItemsData: any = [];
  UDF: any = [];
  itemsData: any = [];
  autoGeneratePalletEnable: boolean = false;
  checkValidateSerialSubs: ISubscription;
  @ViewChild('RecBinVal') RecBinVal: ElementRef;
  @ViewChild('scanPallet') scanPallet: ElementRef;
  @ViewChild('scanTargetWhse') scanTargetWhse: ElementRef;
  @ViewChild('scanTargetBin') scanTargetBin: ElementRef;
  @ViewChild('scanBatchSerial') scanBatchSerial: ElementRef;
  @ViewChild('scanQty') scanQty;

  // caption related labels.
  Inbound_ReceiveForPO: any;
  inboundFromWhere: any = false;
  screentitle: any = ''
  @ViewChild('scanQty') scanQtyRef: ElementRef;

  isGenealogyApplicable: boolean;
  constructor(private inboundService: InboundService, private commonservice: Commonservice,
    private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent, private productionService: ProductionService) {
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.RecBinVal.nativeElement.focus();
    }, 100);
    // this.itemCodeInput.nativeElement.focus();
  }
  formatVal = ''
  qtyFieldBlurFire: boolean = false;
  async onQtyBlur(scanQty, fromHtml: boolean = false): Promise<any> {
    //  this.qty = scanQty.value;

    this.qty = this.qty.toFixed(Number(sessionStorage.getItem("DecimalPrecision")))
    console.log("blur format", this.qty);
    return '';
  }
  onQtyChange(scanQty) {
    this.qty = scanQty.value
  }
  async ngOnInit() {
    this.IsGeneologyApplicable()
    this.UDFlineNo = -1;
    var precision = sessionStorage.getItem("DecimalPrecision");
    this.formatVal = 'n' + precision;
    console.log("decimal precision" + this.formatVal);
    this.IsUDFEnabled = sessionStorage.getItem("ISUDFEnabled");
    this.inboundFromWhere = sessionStorage.getItem("inboundOptionType");
    if (this.inboundFromWhere == 1) {
      this.Inbound_ReceiveForPO = this.translate.instant("Inbound_ReceiveForPO");
      // change captions and api calling according to normal inbound.
    } else if (this.inboundFromWhere == 2) {
      this.Inbound_ReceiveForPO = this.translate.instant("InboundReceiveInvoice");
      // change captions and api calling according to normal inbound.
    }

    if (sessionStorage.getItem("AutoPalletIdGenerationChecked") == "True") {
      this.autoGeneratePalletEnable = true;
    }

    if (sessionStorage.getItem("PalletizationEnabled") == "True" && sessionStorage.getItem("PalletizationEnabledForItem") == "True") {
      this.isPalletizationEnable = true;
    } else {
      this.isPalletizationEnable = false;
    }

    if (sessionStorage.getItem('FromReceiptProd') == 'true') {
      this.fromReceiptProduction = true;
      this.initModelDataFromReceipt();
      this.showUOM = false;
      this.showScanAndInputRadio = false;
      if (this.openPOLineModel != undefined && this.openPOLineModel != null) {
        this.Ponumber = this.receiptData.OrderNo;
        this.DocEntry = this.receiptData.OrderNo;
        this.tracking = this.openPOLineModel[0].TRACKING;
        this.OpenQty = this.openPOLineModel[0].OPENQTY;
        this.ItemCode = this.openPOLineModel[0].ITEMCODE;
      }
      this.showSavedReceiptProductionData();
      this.availableRejQty = parseInt(sessionStorage.getItem("AvailableRejectQty"));

      if (!this.isPalletizationEnable) {
        this.isDisabledLotNoField = false;
        this.isDisabledScanInput = false;
      } else {
        this.isDisabledLotNoField = true;
        this.isDisabledScanInput = false;
      }
    } else {
      this.fromReceiptProduction = false;
      this.openPOLineModel[0] = this.inboundMasterComponent.openPOmodel;
      let autoLots = JSON.parse(sessionStorage.getItem("primaryAutoLots"));
      if (!this.isPalletizationEnable) {
        if (autoLots != null && autoLots != undefined && autoLots.length > 0 && autoLots[0].AUTOLOT == "Y") {
          this.isDisabledLotNoField = true;
          this.isDisabledScanInput = false;
        } else {
          this.isDisabledLotNoField = false;
          this.isDisabledScanInput = false;
        }
      } else {
        this.isDisabledLotNoField = true;
        if (autoLots != null && autoLots != undefined && autoLots.length > 0 && autoLots[0].AUTOLOT == "Y") {
          this.isDisabledScanInput = true;
        } else {
          this.isDisabledScanInput = false;
        }
      }
      this.showScanAndInputRadio = true;
      this.showUOM = true;
      if (!this.fromReceiptProduction) {
        this.getUOMList();
      }

      this.LastSerialNumber = [];
      this.LineId = [];

      if (this.openPOLineModel != undefined && this.openPOLineModel != null) {
        this.Ponumber = this.openPOLineModel[0].DocNum;
        this.DocEntry = this.openPOLineModel[0].DOCENTRY;
        this.tracking = this.openPOLineModel[0].TRACKING;
        this.OpenQty = this.openPOLineModel[0].OPENQTY;
        this.ItemCode = this.openPOLineModel[0].ITEMCODE;
      }
      if (this.fromReceiptProduction) {
        this.showSavedDataToGrid();
      }
    }


    this.dateFormat = sessionStorage.getItem("DATEFORMAT");
    //update below variable with local storage data
    this.operationType = "";
    // also update this.openPOLineModel[0].RPTQTY with local storage value
    if (this.openPOLineModel != undefined && this.openPOLineModel != null) {
      this.showScanInput = true;
      if (this.tracking == "S") {
        this.isSerial = true;
        this.setLocalStringForSerial();
      } else if (this.tracking == "N") {
        this.isNonTrack = true;
        this.showScanInput = false;
        this.showScanAndInputRadio = false;
      } else if (this.tracking == "B") {
        this.isSerial = false;
        this.isNonTrack = false;
        this.setLocalStringForBatch();
      }

      if (this.openPOLineModel[0].QCREQUIRED == "Y") {
        this.IsQCRequired = true;
      } else {
        this.IsQCRequired = false;
      }

      if (sessionStorage.getItem('FromReceiptProd') == 'true') {
        this.showScanInput = false;
        if (this.RecvbBinvalue == "") {
          this.defaultRecvBin = true;
          this.GetDefaultBinOrBinWithQtyForProduction();
        }
      } else {
        this.defaultRecvBin = true;
        this.ShowBins();
      }
    }

    if (this.fromReceiptProduction) {
      // await this.commonservice.getComponentVisibilityList(ModuleIds.POReceipt, ScreenIds.GRPO, ControlIds.GRPO_GRID1);
      let ItemDetailArr = this.commonservice.getComponentVisibility2();
      this.setItemDetailColumnVisibility(ItemDetailArr);

      await this.commonservice.getComponentVisibilityList2(ModuleIds.ProdReceipt, ScreenIds.ProdRecScreen, ControlIds.PRODREC_GRID2);
      let ColumnArry = this.commonservice.getComponentVisibility2();
      this.setBtchSerGridVisibility(ColumnArry);//, this.gridItemBtchSer);
    } else {
      // await this.commonservice.getComponentVisibilityList(ModuleIds.POReceipt, ScreenIds.GRPO, ControlIds.GRPO_GRID1);
      let ItemDetailArr = this.inboundMasterComponent.InboundUserPreference.filter(e => e.OPTM_SCREENID == ScreenIds.GRPO && e.OPTM_CONTROLID == ControlIds.GRPO_GRID1);
      console.log(ItemDetailArr.length);
      this.setItemDetailColumnVisibility(ItemDetailArr);

      let ColumnArry = this.inboundMasterComponent.InboundUserPreference.filter(e => e.OPTM_SCREENID == ScreenIds.GRPO && e.OPTM_CONTROLID == ControlIds.GRPO_GRID2);
      this.setBtchSerGridVisibility(ColumnArry);//, this.gridItemBtchSer);
    }
  }

  // @ViewChild("chooser")
  // public chooser: ColumnChooserComponent;

  // @ViewChild('gridItemBtchSer') gridItemBtchSer: ElementRef;
  // @ViewChild("gridItemBtchSer")
  // public gridItemBtchSer: GridComponent;

  // public gridData: any[] = products;
  choosenColumns: any[] = [];
  show = true;

  // Use this function to console.log currently visible columns.
  public logVisible = (gridItemBtchSer) => {
    if (this.choosenColumns.length == 0) {
      this.choosenColumns = gridItemBtchSer.columnList.columns._results
        .filter(f => !f.isVisible)
        .map(s => s.field);
    }
    console.log('Please log the currently visible columns.', this.choosenColumns);
  }

  public loadFromArray = () => {
    // const testCols: string[] = ['ID', 'Name', 'Discontinued'];
    console.log('Please show only the columns in the above array.', this.choosenColumns);
    // this.gridItemBtchSer.columnList.columns._results.forEach(c => {
    //   if (this.choosenColumns.includes(c.field)) {
    //     //c.isVisible = true;
    //     c.hidden = true;
    //     console.log(c.field, c.hidden);
    //   }
    // }
    // )
  }

  gridColumnVisibilityArry: any = {};
  setBtchSerGridVisibility(ColumnArry) {
    // gridItemBtchSer.columnList.columns._results.forEach(c => {
    //   let index = ColumnArry.findIndex(e => e.OPTM_FIELDID == c.field)
    //   if (index != -1) { //(this.choosenColumns.includes(c.field)) {
    //     //c.isVisible = true;
    //     c.hidden = true;
    //     console.log(c.field, c.hidden);
    //   }
    // })

    this.gridColumnVisibilityArry.VendorLot = ColumnArry.find(e => e.OPTM_FIELDID == "VendorLot") != undefined ? ColumnArry.find(e => e.OPTM_FIELDID == "VendorLot").OPTM_VISIBILITYSTATUS : ""
    this.gridColumnVisibilityArry.LotNumber = ColumnArry.find(e => e.OPTM_FIELDID == "LotNumber") != undefined ? ColumnArry.find(e => e.OPTM_FIELDID == "LotNumber").OPTM_VISIBILITYSTATUS : ""
    this.gridColumnVisibilityArry.PalletCode = ColumnArry.find(e => e.OPTM_FIELDID == "PalletCode") != undefined ? ColumnArry.find(e => e.OPTM_FIELDID == "PalletCode").OPTM_VISIBILITYSTATUS : ""
    this.gridColumnVisibilityArry.Bin = ColumnArry.find(e => e.OPTM_FIELDID == "Bin") != undefined ? ColumnArry.find(e => e.OPTM_FIELDID == "Bin").OPTM_VISIBILITYSTATUS : ""
    this.gridColumnVisibilityArry.LotQty = ColumnArry.find(e => e.OPTM_FIELDID == "LotQty") != undefined ? ColumnArry.find(e => e.OPTM_FIELDID == "LotQty").OPTM_VISIBILITYSTATUS : ""
    this.gridColumnVisibilityArry.expiryDate = ColumnArry.find(e => e.OPTM_FIELDID == "expiryDate") != undefined ? ColumnArry.find(e => e.OPTM_FIELDID == "expiryDate").OPTM_VISIBILITYSTATUS : ""
    this.gridColumnVisibilityArry.UDF = ColumnArry.find(e => e.OPTM_FIELDID == "UDF") != undefined ? ColumnArry.find(e => e.OPTM_FIELDID == "UDF").OPTM_VISIBILITYSTATUS : ""
  }

  setItemDetailColumnVisibility(ColumnArry) {
    this.gridColumnVisibilityArry.ITEMCODE = ColumnArry.find(e => e.OPTM_FIELDID == "ITEMCODE") != undefined ? ColumnArry.find(e => e.OPTM_FIELDID == "ITEMCODE").OPTM_VISIBILITYSTATUS : ""
    this.gridColumnVisibilityArry.ITEMNAME = ColumnArry.find(e => e.OPTM_FIELDID == "ITEMNAME") != undefined ? ColumnArry.find(e => e.OPTM_FIELDID == "ITEMNAME").OPTM_VISIBILITYSTATUS : ""
    this.gridColumnVisibilityArry.OPENQTY = ColumnArry.find(e => e.OPTM_FIELDID == "OPENQTY") != undefined ? ColumnArry.find(e => e.OPTM_FIELDID == "OPENQTY").OPTM_VISIBILITYSTATUS : ""
    this.gridColumnVisibilityArry.INVOPENQTY = ColumnArry.find(e => e.OPTM_FIELDID == "INVOPENQTY") != undefined ? ColumnArry.find(e => e.OPTM_FIELDID == "INVOPENQTY").OPTM_VISIBILITYSTATUS : ""
    this.gridColumnVisibilityArry.RPTQTY = ColumnArry.find(e => e.OPTM_FIELDID == "RPTQTY") != undefined ? ColumnArry.find(e => e.OPTM_FIELDID == "RPTQTY").OPTM_VISIBILITYSTATUS : ""
    this.gridColumnVisibilityArry.UOM = ColumnArry.find(e => e.OPTM_FIELDID == "UOM") != undefined ? ColumnArry.find(e => e.OPTM_FIELDID == "UOM").OPTM_VISIBILITYSTATUS : ""
  }

  GetDefaultBinOrBinWithQtyForProduction() {
    this.commonservice.GetDefaultBinOrBinWithQtyForProduction(this.ItemCode,
      sessionStorage.getItem("whseId"), this.receiptData.status).subscribe(
        data => {
          if (data != null) {

            if (this.receiptData.status == 'Accept') {
              this.lookupDisable = false;
              let resultV = data.find(element => element.BINTYPE == '1');
              if (resultV != undefined) {
                this.RecvbBinvalue = resultV.BINNO;
                return;
              }
              let resultD = data.find(element => element.BINTYPE == '2');
              if (resultD != undefined) {
                this.RecvbBinvalue = resultD.BINNO;
                return;
              }
            } else {
              this.lookupDisable = true;
              let resultV = data.find(element => element.BINTYPE == '1');
              if (resultV != undefined) {
                this.RecvbBinvalue = resultV.BINNO;
                this.receiptData.WhsCode = resultV.WHSCODE;
                return;
              }
              let resultD = data.find(element => element.BINTYPE == '2');
              if (resultD != undefined) {
                this.RecvbBinvalue = resultD.BINNO;
                this.receiptData.WhsCode = resultD.WHSCODE;
                return;
              }
            }
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

  onInboundScan() {
    // alert("scan click");
  }

  setLocalStringForBatch() {
    this.serialNoTitle = this.translate.instant("SerialNo");
    this.mfrRadioText = this.translate.instant("Inbound_MfrBatchNo");
    this.sysRadioText = this.translate.instant("Inbound_SysBatch");
    this.scanInputPlaceholder = this.translate.instant("ScanBatch");
    this.mfrGridColumnText = this.translate.instant("Inbound_MfrBatchNo");
    this.SRBatchColumnText = this.translate.instant("BatchNo");
    this.ActualSRBatchColumnText = this.translate.instant("Inbound_ActualBatchNo");
    if (this.isPalletizationEnable) {
      this.mfrGridColumnText = this.translate.instant("Inbound_ActualBatchNo");
      this.mfrRadioText = this.translate.instant("Inbound_ActualBatchNo");
    }
  }
  setLocalStringForSerial() {
    this.serialNoTitle = this.translate.instant("SerialNo");
    this.mfrRadioText = this.translate.instant("MfrSerialNo");
    this.sysRadioText = this.translate.instant("SysSerial");
    this.scanInputPlaceholder = this.translate.instant("ScanSerial");
    this.mfrGridColumnText = this.translate.instant("MfrSerialNo");
    this.SRBatchColumnText = this.translate.instant("SerialNo");
    this.ActualSRBatchColumnText = this.translate.instant("Inbound_ActualSerialNo");
    if (this.isPalletizationEnable) {
      this.mfrRadioText = this.translate.instant("Inbound_ActualSerialNo");
      this.mfrGridColumnText = this.translate.instant("Inbound_ActualSerialNo");
    }
  }

  /**
    * Method to get list of inquries from server.
   */
  public ShowBins() {

    if (sessionStorage.getItem('FromReceiptProd') == 'true') {
      this.GetTargetBins();
    } else {
      this.targetBinClick = false;
      // this.showLoader = true;
      this.inboundService.getRevBins(this.openPOLineModel[0].QCREQUIRED, this.openPOLineModel[0].ITEMCODE).subscribe(
        (data: any) => {
          // this.showLoader = false;
          // console.log(data);
          if (data != null) {
            if (data.length > 0) {
              if (data[0].ErrorMsg == "7001") {
                this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                  this.translate.instant("CommonSessionExpireMsg"));
                return;
              }
              if (this.defaultRecvBin == true) {
                if (this.openPOLineModel[0].QCREQUIRED == "Y") {
                  this.RecvbBinvalue = data[0].BINNO;
                } else if (data[0].DefaultBin == undefined || data[0].DefaultBin == null || data[0].DefaultBin == "") {
                  this.RecvbBinvalue = data[0].BINNO;
                } else {
                  this.RecvbBinvalue = data[0].DefaultBin;
                }
                this.defaultRecvBin = false
              }
              else {
                // console.log(data);
                this.showLookupLoader = false;
                this.serviceData = data;
                this.lookupfor = "RecvBinList";
                return;
              }
            } else {
              this.toastr.error('', this.translate.instant("Inbound_NoBinsAvailableMsg"));
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
  }

  OnBinChangeBlur() {
    if (this.isValidateCalled) {
      return;
    }
    this.OnBinChange();
  }

  async OnBinChange(): Promise<any> {
    if (this.RecvbBinvalue == "") {
      return;
    }
    // this.showLoader = true;
    var result = false;
    if (sessionStorage.getItem('FromReceiptProd') == 'true') {
      await this.inboundService.isBinExistForProduction(sessionStorage.getItem("whseId"), this.RecvbBinvalue, this.receiptData.status).then(
        (data: any) => {
          // this.showLoader = false;
          console.log("inside inboundService.isBinExistForProduction");
          if (data != null) {
            if (data.length > 0) {
              // if (data[0].Result == "0") {
              //   this.toastr.error('', this.translate.instant("INVALIDBIN"));
              //   this.RecvbBinvalue = "";
              //   this.RecBinVal.nativeElement.focus()
              //   return;
              // }
              // else {
              this.RecvbBinvalue = data[0].BinNo;
              if (this.receiptData.status == "Accept") {
              } else {
                this.receiptData.WhsCode = data[0].WhsCode;
              }
              // oCurrentController.isReCeivingBinExist();
              // }
              result = true
            } else {
              this.toastr.error('', this.translate.instant("INVALIDBIN"));
              this.RecvbBinvalue = "";
              this.RecBinVal.nativeElement.focus()
              result = false;
            }
          }
          else {
            this.toastr.error('', this.translate.instant("INVALIDBIN"));
            this.RecvbBinvalue = "";
            this.RecBinVal.nativeElement.focus()
            result = false;
          }
        },
        error => {
          this.showLoader = false;
          console.log("Error: ", error);
          this.RecvbBinvalue = "";
          if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
            this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
          }
          else {
            this.toastr.error('', error);
          }
          result = false;
        }
      );
    } else {
      await this.inboundService.binChange(sessionStorage.getItem("whseId"), this.RecvbBinvalue).then(
        (data: any) => {
          console.log("inside binChange");
          // this.showLoader = false;
          //console.log(data);
          if (data != null) {
            if (data.length > 0) {
              if (data[0].Result == "0") {
                this.toastr.error('', this.translate.instant("INVALIDBIN"));
                this.RecvbBinvalue = "";
                this.RecBinVal.nativeElement.focus()
                result = false;
              }
              else {
                this.RecvbBinvalue = data[0].ID;
                // oCurrentController.isReCeivingBinExist();
                result = true;
              }
            }
          }
          else {
            this.toastr.error('', this.translate.instant("INVALIDBIN"));
            this.RecvbBinvalue = "";
            this.RecBinVal.nativeElement.focus()
            result = false;
          }
        },
        error => {
          this.showLoader = false;
          console.log("Error: ", error);
          this.RecvbBinvalue = "";
          if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
            this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
          }
          else {
            this.toastr.error('', error);
          }
          result = false;
        }
      );
    }
    return result;
  }

  onScanInputChange() {
    //  alert("scan change event")
  }
  /**
   * Method to validate entered scan code .
  */
  onScanCodeChange() {

    this.onGS1ItemScan()
  }

  onUoMChange(event, gridItem) {
    this.uomSelectedVal = this.openPOLineModel[0].UOMList.find(e => e.UomCode == event.UomCode);
    this.openPOLineModel[0].INVOPENQTY = this.openPOLineModel[0].OPENQTY * this.uomSelectedVal.BaseQty;
    this.openPOLineModel[0].INVRPTQTY = this.openPOLineModel[0].RPTQTY * this.uomSelectedVal.BaseQty;
    this.openPOLineModel[0].INVOPENQTY = Number(this.openPOLineModel[0].INVOPENQTY).toFixed(Number(sessionStorage.getItem("DecimalPrecision")));
    this.openPOLineModel[0].INVRPTQTY = Number(this.openPOLineModel[0].INVRPTQTY).toFixed(Number(sessionStorage.getItem("DecimalPrecision")));
    this.updateReceiveQty();
    // gridItem.data = this.openPOLineModel[0];
  }

  /**
   * Method to get list of uoms from server.
  */
  public getUOMList() {
    this.showLoader = true;
    let podocentry = 0, invdocentry = 0;
    let polinenum = 0, invlinenum = 0;
    if (this.inboundFromWhere == 1) {
      podocentry = this.openPOLineModel[0].DOCENTRY;
      polinenum = this.openPOLineModel[0].LINENUM;
    } else if (this.inboundFromWhere == 2) {
      invdocentry = this.openPOLineModel[0].DOCENTRY;
      invlinenum = this.openPOLineModel[0].LINENUM;
    }

    this.inboundService.getUOMs(this.openPOLineModel[0].ITEMCODE, podocentry, polinenum, invdocentry, invlinenum).subscribe(
      (data: any) => {
        this.showLoader = false;
        //getUOM Entry from saved model
        this.getUomEntryFromSaveRecords();
        this.openPOLineModel[0].UOMList = data;
        if (this.openPOLineModel[0].UOMList.length > 0) {
          if (this.inboundFromWhere == 2) {
            this.openPOLineModel[0].UOMList = this.openPOLineModel[0].UOMList.filter(e => e.UomCode == this.openPOLineModel[0].UOM);
          }
          this.uomSelectedVal = this.openPOLineModel[0].UOMList[0];
          if (this.UOMentry == "") {
            this.uomSelectedVal = this.openPOLineModel[0].UOMList.find(e => e.UomCode == this.openPOLineModel[0].UOM)
          } else {
            this.getUOMVal(this.UOMentry);
          }
          if (this.tracking == 'S') {
            this.openPOLineModel[0].INVOPENQTY = this.openPOLineModel[0].OPENQTY * this.uomSelectedVal.BaseQty;
            this.openPOLineModel[0].INVRPTQTY = this.openPOLineModel[0].RPTQTY * this.uomSelectedVal.BaseQty;
          } else {
            this.openPOLineModel[0].INVOPENQTY = this.openPOLineModel[0].OPENQTY * this.uomSelectedVal.BaseQty;
            this.openPOLineModel[0].INVRPTQTY = this.openPOLineModel[0].RPTQTY * this.uomSelectedVal.BaseQty;
          }
          this.openPOLineModel[0].INVOPENQTY = Number(this.openPOLineModel[0].INVOPENQTY).toFixed(Number(sessionStorage.getItem("DecimalPrecision")));
          this.openPOLineModel[0].INVRPTQTY = Number(this.openPOLineModel[0].INVRPTQTY).toFixed(Number(sessionStorage.getItem("DecimalPrecision")));
        }
        this.showSavedDataToGrid();
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

  handleCheckChange($event) {
    if ($event.currentTarget.id == "InventoryEnquiryOptions1") {
      // mfr serial radio selected.
      this.radioSelected = 0;
    }
    if ($event.currentTarget.id == "InventoryEnquiryOptions2") {
      // mfr serial radio selected.
      this.radioSelected = 1;
    }
  }

  validateUpdateQuantity(): boolean {
    let quantitySum: number = 0;
    for (var i = 0; i < this.recvingQuantityBinArray.length; i++) {
      if (this.recvingQuantityBinArray[i].Bin == this.RecvbBinvalue) {
        quantitySum += Number(this.qty);
      } else {
        quantitySum += Number(this.recvingQuantityBinArray[i].LotQty);
      }
    }
    // quantitySum = quantitySum + Number(this.qty);

    if (Number(this.OpenQty) == 0) {
      this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantity"));
      this.qty = undefined;
      return false;
    } else if (quantitySum > Number(this.OpenQty)) {
      if (sessionStorage.getItem('FromReceiptProd') == 'true') {
        this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantityValid"));
        this.qty = undefined;
        return false;
      } else if (sessionStorage.getItem("IsGreaterQuantityAllowedThanOrder") != "Y") {
        this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantityValid"));
        this.qty = undefined;
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  validateQuantity(): boolean {
    let quantitySum: number = 0;
    for (var i = 0; i < this.recvingQuantityBinArray.length; i++) {
      quantitySum += Number(this.recvingQuantityBinArray[i].LotQty);
    }
    quantitySum = quantitySum + Number(this.qty);

    if (Number(this.OpenQty) == 0) {
      this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantity"));
      this.qty = undefined;
      return false;
    } else if (quantitySum > Number(this.OpenQty)) {
      if (sessionStorage.getItem('FromReceiptProd') == 'true') {
        this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantityValid"));
        this.qty = undefined;
        return false;
      } else if (sessionStorage.getItem("IsGreaterQuantityAllowedThanOrder") != "Y") {
        this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantityValid"));
        this.qty = undefined;
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  ValidateSerialInCaseOfUOM() {
    if (!Number.isInteger(this.openPOLineModel[0].RPTQTY)) {
      this.toastr.error('', this.translate.instant("Receive quantity is not valid, please pick more Serials"));
      return;
    }
    return true;
  }

  updateVendorLot(lotTemplateVar, value, rowindex) {
    value = value.trim();
    if (sessionStorage.getItem('FromReceiptProd') == 'true') {
      this.checkAndValidateSerial(lotTemplateVar, value, rowindex);
    } else {
      for (let i = 0; i < this.recvingQuantityBinArray.length; ++i) {
        if (i === rowindex) {
          this.recvingQuantityBinArray[i].VendorLot = value;
          if (this.isPalletizationEnable) {
            if (this.recvingQuantityBinArray[i].PalletCode == "") {
              this.recvingQuantityBinArray[i].palletSBNo = value;
            } else {
              this.recvingQuantityBinArray[i].palletSBNo = value + "-" + this.recvingQuantityBinArray[i].PalletCode;
            }

            if (this.recvingQuantityBinArray[i].PalletCode == "") {
              this.recvingQuantityBinArray[i].LotNumber = value;
            } else {
              this.recvingQuantityBinArray[i].LotNumber = value + "-" + this.recvingQuantityBinArray[i].PalletCode;
            }
          } else {
            // this.recvingQuantityBinArray[i].LotNumber = value;
            // this.recvingQuantityBinArray[i].palletSBNo = value;
          }
        }
      }
    }
  }

  updateLotNumber(lotTemplateVar, value, rowindex, gridData: any) {
    value = value.trim();
    if (sessionStorage.getItem('FromReceiptProd') == 'true') {
      if (this.isGenelogyEnabled == "Y") {
        this.checkAndValidateSerial(lotTemplateVar, value, rowindex);
      }
    } else {
      let result = this.recvingQuantityBinArray.find(element => element.LotNumber == value);
      if (result != undefined) {
        if (this.openPOLineModel[0].TRACKING != "N") {
          if (this.openPOLineModel[0].TRACKING == "S") {
            this.toastr.error('', this.translate.instant("Inbound_SerialCanNotbeSame"));
          } else {
            this.toastr.error('', this.translate.instant("Inbound_BatchCanNotbeSame"));
          }
        }
        //this.recvingQuantityBinArray[rowindex].LotNumber = "";
        for (let i = 0; i < this.recvingQuantityBinArray.length; ++i) {
          if (i === rowindex) {
            this.recvingQuantityBinArray[i].LotNumber = "";
            if (this.isPalletizationEnable) {
              this.recvingQuantityBinArray[i].palletSBNo = "";
            }
          }
        }
        //gridData.data = this.recvingQuantityBinArray;
        //  return;
      } else {
        for (let i = 0; i < this.recvingQuantityBinArray.length; ++i) {
          if (i === rowindex) {
            this.recvingQuantityBinArray[i].LotNumber = value;
          }
        }
      }
    }
  }

  getAutoLot(itemCode: string, qty: any) {
    this.inboundService.getAutoLot(itemCode, this.tracking, qty).subscribe(
      (data: any) => {
        console.log(data);
        if (data.Table != undefined) {
          data.Table = data.Table;
        } else if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
          this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
            this.translate.instant("CommonSessionExpireMsg"));
          return;
        }
        this.AddUpdateBatSerNo(data.Table);
        // if (data.Table.length > 0) {
        //   this.AddUpdateBatSerNo(data.Table);
        // }
        // else {

        // }
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

  IsGeneologyApplicable() {
    this.inboundService.IsGenealogyApplicable().subscribe(
      (data: any) => {
        console.log(data);
        if (data != undefined) {
          this.isGenelogyEnabled = data;
        } else if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
          this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
            this.translate.instant("CommonSessionExpireMsg"));
          return;
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

  btchserQty: number = 0;
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
    // if (this.ScanInputs == null || this.ScanInputs == undefined || this.ScanInputs == "") {
    //   return;
    // }
    if (this.openPOLineModel[0].TRACKING == "S") {
      var numQty = Number(this.qty)
      if (numQty % 1 != 0) {
        this.toastr.error('', this.translate.instant("DecimalQuantity"));
        this.scanQty.nativeElement.focus();
        return;
      }
    }
    if (this.RecvbBinvalue == "" || this.RecvbBinvalue == undefined) {
      this.toastr.error('', this.translate.instant("INVALIDBIN"));
      return;
    }
    if (this.isPalletizationEnable && (this.palletValue == "" || this.palletValue == undefined)
      && this.openPOLineModel[0].TRACKING != "N") {
      this.toastr.error('', this.translate.instant("Plt_PalletRequired"));
      return;
    }

    if (this.fromReceiptProduction) {
      if (this.openPOLineModel[0].TRACKING == "B") {
        if (Number(this.qty) > this.btchserQty) {
          this.toastr.error('', this.translate.instant("Quantity is more than batch quantity."))
          this.qty = undefined;
          return;
        } else if (Number(this.qty) <= 0) {
          this.toastr.error('', this.translate.instant("Batch quantity can not be less than or equal to 0."))
          this.qty = undefined;
          return;
        }
      } else if (this.openPOLineModel[0].TRACKING == "S") {
        let l = 0;
        if (this.recvingQuantityBinArray != undefined) {
          l = this.recvingQuantityBinArray.length
        }
        if (Number(this.qty) + l > this.BtchSerData.length) {
          this.toastr.error('', this.translate.instant("Quantity taken is more than available serials."))
          this.qty = undefined;
          return;
        }
      }
    }

    if (!this.validateQuantity()) {
      return;
    }
    this.LastSerialNumber = [];
    this.LineId = [];
    if (this.isNonTrack) {
      this.addNonTrackQty(this.qty);
      this.scanQtyRef.nativeElement.value = undefined
      this.qty = undefined;
      this.ScanInputs = "";
      if (this.recvingQuantityBinArray.length > 0) {
        if (!this.fromReceiptProduction) {
          this.showButton = true;
          this.showRecButton = true;
        } else {
          this.showButton = true;
          this.showRecButton = false;
        }
      } else {
        this.showButton = false;
        this.showRecButton = false;
      }
      this.updateReceiveQty();
    } else {
      if (!this.fromReceiptProduction) {
        this.getAutoLot(this.openPOLineModel[0].ITEMCODE, this.qty);
      } else {
        if (this.isGenelogyEnabled != "Y") {
          this.getAutoLot(this.openPOLineModel[0].ITEMCODE, this.qty);
        } else {
          this.AddUpdateBatSerNo(null);
        }
      }
    }
  }
  isGenelogyEnabled: any = "N";
  AddUpdateBatSerNo(autoLots: any[]) {
    this.MfrSerial = this.searlNo = "";
    if (this.radioSelected == 0) {
      this.MfrSerial = this.ScanInputs;
      this.searlNo = this.ScanInputs;
    } else if (this.radioSelected == 1) {
      if (this.isPalletizationEnable) {
        this.MfrSerial = this.ScanInputs;
      }
      this.searlNo = this.ScanInputs;
    }
    if (this.isSerial) {
      let index = -1;
      while (this.qty > 0 && this.qty != 0) {
        if (autoLots != null && autoLots != null && autoLots.length > 0 && autoLots[0].AUTOLOT == "Y") {
          this.LastSerialNumber = [];
          this.LineId = [];
          this.addBatchSerialQty(autoLots, this.qty);
          let result = this.recvingQuantityBinArray.find(element => element.LotNumber == this.searlNo);
          if (result == undefined) {
            this.searlNo = (this.searlNo == "null" || this.searlNo == null) ? "" : this.searlNo;
            var plt = (this.palletValue == "Loose") ? "" : this.palletValue;
            if (this.searlNo != '' && this.searlNo != undefined && plt != '') {
              this.MfrSerial = this.searlNo;
              this.searlNo = this.searlNo + "-" + plt;
            } else {
              if (this.isPalletizationEnable) {
                this.MfrSerial = this.searlNo;
              }
            }
            var autLotFlag = "false";
            this.recvingQuantityBinArray.push(new RecvingQuantityBin(this.MfrSerial,
              this.searlNo, 1, this.RecvbBinvalue, this.expiryDate, plt, autLotFlag));
            this.qty = this.qty - 1;
          }
        } else {
          if (this.fromReceiptProduction) {
            if (index == -1) {
              index = this.BtchSerData.findIndex(e => e.OPTM_BTCHSERNO == this.ScanInputs);
              this.MfrSerial = this.ScanInputs;
              this.searlNo = this.ScanInputs;
            } else {
              index = index + 1;
              if (index >= this.BtchSerData.length) {
                index = 0;
              }
              this.MfrSerial = this.BtchSerData[index].OPTM_BTCHSERNO;
              this.searlNo = this.MfrSerial;
            }
          }
          this.searlNo = (this.searlNo == "null" || this.searlNo == null) ? "" : this.searlNo;
          var plt = (this.palletValue == "Loose") ? "" : this.palletValue;
          if (this.searlNo != '' && this.searlNo != undefined && plt != '') {
            this.searlNo = this.searlNo + "-" + plt;
          }

          this.recvingQuantityBinArray.push(new RecvingQuantityBin(this.MfrSerial,
            this.searlNo, 1, this.RecvbBinvalue, this.expiryDate, plt, "false"));
          this.qty = this.qty - 1;
        }
      }
    } else {
      this.batchCalculation(autoLots, this.qty);
    }
    this.qty = undefined;
    this.ScanInputs = "";
    if (this.recvingQuantityBinArray.length > 0) {
      if (!this.fromReceiptProduction) {
        this.showButton = true;
        this.showRecButton = true;
      } else {
        this.showButton = true;
        this.showRecButton = false;
      }
    } else {
      this.showButton = false;
      this.showRecButton = false;
    }
    this.updateReceiveQty();
  }

  updateQuantity() {
    if (this.qty == 0 || this.qty == undefined) {
      this.toastr.error('', this.translate.instant("Inbound_EnterQuantityErrMsg"));
      return;
    }
    if (this.openPOLineModel[0].TRACKING == "S") {
      if (!Number.isInteger(this.qty)) {
        this.toastr.error('', this.translate.instant("DecimalQuantity"));
        this.scanQty.nativeElement.focus();
        return;
      }
    }
    if (this.RecvbBinvalue == "" || this.RecvbBinvalue == undefined) {
      this.toastr.error('', this.translate.instant("INVALIDBIN"));
      return;
    }
    if (this.isPalletizationEnable && (this.palletValue == "" || this.palletValue == undefined)
      && this.openPOLineModel[0].TRACKING != "N") {
      this.toastr.error('', this.translate.instant("Plt_PalletRequired"));
      return;
    }
    if (!this.validateUpdateQuantity()) {
      return;
    }
    this.LastSerialNumber = [];
    this.LineId = [];
    if (this.isNonTrack) {
      this.UpdateNonTrackQty(this.qty);
    }

    this.qty = undefined;
    this.ScanInputs = "";
    if (this.recvingQuantityBinArray.length > 0) {
      if (!this.fromReceiptProduction) {
        this.showButton = true;
        this.showRecButton = true;
      } else {
        this.showButton = true;
        this.showRecButton = false;
      }

    } else {
      this.showButton = false;
      this.showRecButton = false;
    }
    this.updateReceiveQty();
  }


  updateReceiveQty() {
    let quantitySum: number = 0;
    for (var i = 0; i < this.recvingQuantityBinArray.length; i++) {
      quantitySum += Number(this.recvingQuantityBinArray[i].LotQty);
    }
    if (this.openPOLineModel != null && this.openPOLineModel.length > 0) {
      this.updateQtytoHeader(quantitySum);
    }
  }

  updateQtytoHeader(quantitySum) {
    if (this.fromReceiptProduction) {
      this.openPOLineModel[0].RPTQTY = quantitySum;
    } else {
      if (this.tracking == 'S') {
        this.openPOLineModel[0].RPTQTY = quantitySum * this.uomSelectedVal.AltQty;
        this.openPOLineModel[0].INVRPTQTY = this.openPOLineModel[0].RPTQTY * this.uomSelectedVal.BaseQty;
      } else {
        this.openPOLineModel[0].RPTQTY = quantitySum;
        this.openPOLineModel[0].INVRPTQTY = this.openPOLineModel[0].RPTQTY * this.uomSelectedVal.BaseQty;
      }
      this.openPOLineModel[0].INVRPTQTY = Number(this.openPOLineModel[0].INVRPTQTY).toFixed(Number(sessionStorage.getItem("DecimalPrecision")));
      this.openPOLineModel[0].RPTQTY = Number(this.openPOLineModel[0].RPTQTY).toFixed(Number(sessionStorage.getItem("DecimalPrecision")));
    }
  }

  batchCalculation(autoLots: AutoLot[], qty: any) {
    if (autoLots != null && autoLots.length > 0 && autoLots[0].AUTOLOT == "Y") {
      this.addBatchSerialQty(autoLots, this.qty);
      let result = this.recvingQuantityBinArray.find(element => element.LotNumber == this.searlNo);
      if (result == undefined) {
        this.searlNo = (this.searlNo == "null" || this.searlNo == null) ? "" : this.searlNo;
        var plt = (this.palletValue == "Loose") ? "" : this.palletValue;
        if (this.searlNo != '' && this.searlNo != undefined && plt != '') {
          this.MfrSerial = this.searlNo;
          this.searlNo = this.searlNo + "-" + plt;
        } else {
          if (this.isPalletizationEnable) {
            this.MfrSerial = this.searlNo;
          }
        }

        var autLotFlag = "false";
        this.recvingQuantityBinArray.push(new RecvingQuantityBin(this.MfrSerial,
          this.searlNo, qty, this.RecvbBinvalue, this.expiryDate, plt, autLotFlag));
      } else {
        this.batchCalculation(autoLots, this.qty);
      }
    } else {
      this.searlNo = (this.searlNo == "null" || this.searlNo == null) ? "" : this.searlNo;
      var plt = (this.palletValue == "Loose") ? "" : this.palletValue;
      if (this.searlNo != '' && this.searlNo != undefined && plt != '') {
        this.searlNo = this.searlNo + "-" + plt;
      }

      this.recvingQuantityBinArray.push(new RecvingQuantityBin(this.MfrSerial,
        this.searlNo, qty, this.RecvbBinvalue, this.expiryDate, plt, "false"));
    }
  }

  UpdateNonTrackQty(qty: any) {
    // let sum;
    let result = this.recvingQuantityBinArray.find(element => element.Bin == this.RecvbBinvalue);
    if (result == undefined) {
      this.recvingQuantityBinArray.push(new RecvingQuantityBin("", "", qty, this.RecvbBinvalue, this.expiryDate, this.palletValue, "false"));
      if (!this.fromReceiptProduction) {
        this.showButton = true;
        this.showRecButton = true;
      } else {
        this.showButton = true;
        this.showRecButton = false;
      }
    } else {
      // result.LotQty = result.LotQty + qty;
      for (var i = 0; i < this.recvingQuantityBinArray.length; i++) {
        if (this.recvingQuantityBinArray[i].Bin == this.RecvbBinvalue) {
          this.recvingQuantityBinArray[i].LotQty = qty;
        }
      }
    }
  }

  addNonTrackQty(qty: any) {
    // let sum;
    let result = this.recvingQuantityBinArray.find(element => element.Bin == this.RecvbBinvalue);
    if (result == undefined) {
      this.recvingQuantityBinArray.push(new RecvingQuantityBin("", "", qty, this.RecvbBinvalue, this.expiryDate, this.palletValue, "false"));
      if (!this.fromReceiptProduction) {
        this.showButton = true;
        this.showRecButton = true;
      } else {
        this.showButton = true;
        this.showRecButton = false;
      }
    } else {
      result.LotQty = result.LotQty + qty;
      for (var i = 0; i < this.recvingQuantityBinArray.length; i++) {
        if (this.recvingQuantityBinArray[i].Bin == this.RecvbBinvalue) {
          this.recvingQuantityBinArray[i].LotQty = result.LotQty;
        }
      }
    }
  }
  /**
   * method to create logic for autolot for serial batch qty.
   * @param autoLots
   * @param qty
   */
  addBatchSerialQty(autoLots: AutoLot[], qty: any) {
    this.searlNo = "";
    for (var i = 0; i < autoLots.length; i++) {
      if (autoLots[i].OPRTYPE == "1") {
        this.searlNo = this.searlNo + autoLots[i].STRING
      }
      if (autoLots[i].OPRTYPE === "2" && autoLots[i].OPERATION == "2") {
        //  if (this.recvingQuantityBinArray.length > 0) {
        var finalString = this.getAutoLotStringOPR2(autoLots[i].STRING);
        autoLots[i].STRING = finalString;
        this.searlNo = this.searlNo + finalString;
        this.LastSerialNumber.push(this.getAutoLotStringOPR2(finalString))
        this.LineId.push(autoLots[i].LINEID);

        // } else {
        //   var finalString = autoLots[i].STRING;//(parseInt(autoLots[i].STRING)+1).toString();
        //   this.searlNo = this.searlNo + finalString;
        //   this.LastSerialNumber.push(this.getAutoLotStringOPR2(finalString));
        //   this.LineId.push(autoLots[i].LINEID);
        // }
      }
      if (autoLots[i].OPRTYPE == "2" && autoLots[i].OPERATION == "3") {
        // if (this.recvingQuantityBinArray.length > 0) {
        var finalString = this.getAutoLotStringOPR3(autoLots[i].STRING);
        this.searlNo = this.searlNo + finalString;
        autoLots[i].STRING = finalString;
        this.LastSerialNumber.push(this.getAutoLotStringOPR3(autoLots[i].STRING));
        this.LineId.push(autoLots[i].LINEID);
        // } else {
        //   var finalString = autoLots[i].STRING;
        //   this.searlNo = this.searlNo + finalString;
        //   this.LastSerialNumber.push(this.getAutoLotStringOPR3(autoLots[i].STRING));
        //   this.LineId.push(autoLots[i].LINEID);
        // }
      }
    }
  }

  getAutoLotStringOPR2(autolotString: string): string {
    var strlength = autolotString.length;
    var numberLength = (parseInt(autolotString)).toString().length;
    var finlNumber = parseInt(autolotString) + 1
    var finalString = this.forwardZero(finlNumber, strlength - numberLength);
    return finalString;
  }

  getAutoLotStringOPR3(autolotString: string): string {
    var strlength = autolotString.length;
    var numberLength = (parseInt(autolotString)).toString().length;
    var finlNumber = parseInt(autolotString) - 1
    var finalString = this.forwardZero(finlNumber, strlength - numberLength);
    return finalString;
  }

  public openConfirmForDelete(rowindex, gridData: any) {
    this.dialogFor = "deleteRow";
    this.dialogMsg = this.translate.instant("Inbound_DoYouWantToDelete");
    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    this.rowindexForDelete = rowindex;
    this.gridDataAfterDelete = gridData;
    this.showConfirmDialog = true;
  }


  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;
    if ($event.Status == "yes") {
      switch ($event.From) {
        case ("deleteRow"):
          this.DeleteRowClick(this.rowindexForDelete, this.gridDataAfterDelete);
          break;
        case ("recCurrentOrAll"):

          if (sessionStorage.getItem("GRPOPrintReport") == "Y") {
            // show pdf dialog
            this.yesButtonText = this.translate.instant("yes");
            this.noButtonText = this.translate.instant("no");
            this.dialogFor = "receiveMultiplePDFDialog";
            this.dialogMsg = this.translate.instant("Inbound_PrintAllLabelsAfterSubmit");
            this.operationType = "All";
            this.showConfirmDialog = true; // show dialog
            this.showPDF = true;
          } else {
            this.prepareAllData();
            this.showPDF = false;
          }
          break;
        case ("receiveSinglePDFDialog"):
          //do something. //yes mean all click
          this.submitCurrentGRPO($event.NoOfCopies);
          this.showPDF = true;
          break;
        case ("receiveMultiplePDFDialog"):
          //$event.NoOfCopies
          // if pdf dialog yes click for multiple recevie.
          this.prepareAllData($event.NoOfCopies);
          break;
      }
    } else {
      if ($event.Status == "cancel") {
        // when user click on cross button nothing to do.
      } else {
        //means user click on negative button
        if ($event.From == "recCurrentOrAll") {
          if (sessionStorage.getItem("GRPOPrintReport") == "Y") {
            this.showPrintDialog();
            this.operationType = "Current";
          } else {
            this.submitCurrentGRPO();
            this.showPDF = false;
          }
        }
        else if ($event.From == "receiveSinglePDFDialog") {
          this.submitCurrentGRPO();
          this.showPDF = false;
        }
        else if ($event.From == "receiveMultiplePDFDialog") {
          this.prepareAllData();
          this.showPDF = false;
        }
      }
    }
  }

  submitCurrentGRPO(NoOfCopies?) {
    var oSubmitPOLotsObj: any = {};
    oSubmitPOLotsObj.Header = [];
    oSubmitPOLotsObj.POReceiptLots = [];
    oSubmitPOLotsObj.POReceiptLotDetails = [];
    oSubmitPOLotsObj.UDF = [];
    oSubmitPOLotsObj.LastSerialNumber = [];
    var oSubmitPOLotsObj = this.inboundMasterComponent.prepareSubmitPurchaseOrder(oSubmitPOLotsObj, this.inboundFromWhere, this.Ponumber, this.DocEntry, this.uomSelectedVal, this.recvingQuantityBinArray, this.expiryDate, this.UDF); // current data only.
    this.SubmitGoodsReceiptPO(oSubmitPOLotsObj, NoOfCopies);
  }

  forwardZero(num: number, size: number): string {
    let s = num + "";
    let sign = "";
    if (s.length > 0 && s[0] == "-") {
      s = s.substring(1, s.length);
      sign = "-";
    }
    size = size + s.length;
    while (s.length < size) s = "0" + s;
    s = sign + s;
    return s;
  }

  async save() {
    // if (!this.fromReceiptProduction) {
    // if (this.tracking == "S" && !this.ValidateSerialInCaseOfUOM()) {
    // return;
    // }
    // }
    var result = await this.validateBeforeSubmit();
    this.isValidateCalled = false;
    console.log("validate result: " + result);
    if (result != undefined && result == false) {
      return;
    }

    if (this.IsQCRequired) {
      if (this.IsQCRequired && (this.targetBin == null || this.targetBin == undefined || this.targetBin == "")) {
        this.toastr.error('', "Target Warehouse cannot be blank");
        return;
      } else if (this.IsQCRequired && (this.targetWhse == null || this.targetWhse == undefined || this.targetWhse == "")) {
        this.toastr.error('', "Target Bin cannot be blank");
        return;
      }

      let UDF;
      if (this.fromReceiptProduction) {
        UDF = JSON.parse(sessionStorage.getItem("GRPOHdrUDF"));
      } else {
        UDF = this.inboundMasterComponent.getUDF()
      }
      let lineno = 0;
      if (this.fromReceiptProduction) {
        lineno = this.receiptData.status == "Accept" ? 0 : 1
      } else {
        lineno = this.openPOLineModel[0].LINENUM;
      }

      while (UDF.length > 0) {
        let index = UDF.findIndex(e => e.LineNo == lineno && e.DocEntry == this.openPOLineModel[0].DOCENTRY && e.Flag == "D" && e.Key == "OPTM_TARGETWHS")
        if (index == -1) {
          break;
        }
        UDF.splice(index, 1);
      }

      while (UDF.length > 0) {
        let index = UDF.findIndex(e => e.LineNo == lineno && e.DocEntry == this.openPOLineModel[0].DOCENTRY && e.Flag == "D" && e.Key == "OPTM_TARGETBIN")
        if (index == -1) {
          break;
        }
        UDF.splice(index, 1);
      }

      UDF.push({
        Key: "OPTM_TARGETWHS",//UDF[iIndex].Key,
        Value: this.targetWhse,
        Flag: 'D', // D = Line, H= Header, L = Lots
        // LineNo: Number(localStorage.getItem("Line")),
        LineNo: lineno,
        DocEntry: this.openPOLineModel[0].DOCENTRY,
      });
      UDF.push({
        Key: "OPTM_TARGETBIN",//UDF[iIndex].Key,
        Value: this.targetBin,
        Flag: 'D', // D = Line, H= Header, L = Lots
        // LineNo: Number(localStorage.getItem("Line")),
        LineNo: lineno,
        DocEntry: this.openPOLineModel[0].DOCENTRY,
      });
      if (this.fromReceiptProduction) {
        sessionStorage.setItem("GRPOHdrUDF", JSON.stringify(UDF));
      } else {
        this.inboundMasterComponent.updateUDF(UDF);
      }
    }

    if (this.openPOLineModel[0].TRACKING != "N") {
      let result = this.recvingQuantityBinArray.find(element => element.LotNumber == "");
      if (result != undefined) {
        if (this.openPOLineModel[0].TRACKING == "S") {
          this.toastr.error('', this.translate.instant("Inbound_SerialNotBlank"));
        } else {
          this.toastr.error('', this.translate.instant("Inbound_BatchNotBlank"));
        }
        return;
      }

      //check if detail udf exists or not
      if (!this.checkandOpenDetailUDF()) {
        return;
      }
    }


    if (this.fromReceiptProduction) {
      // if (!this.checkandOpenDetailUDF()) {
      //   return;
      // }
      //prepare model for receipt from production
      this.saveReceiptProdData(this.receiptData.status);
      this.screenBackEvent.emit('save');
    } else {
      this.inboundMasterComponent.prepareCommonData(this.inboundFromWhere, this.Ponumber, this.DocEntry, this.uomSelectedVal, this.recvingQuantityBinArray, this.expiryDate, this.UDF);
      sessionStorage.setItem("PONumber", this.Ponumber);
      this.inboundMasterComponent.inboundComponent = 2;
    }
  }

  saveReceiptProdData(type: string) {
    var saveRecProdData: any = {};
    var dataModel = sessionStorage.getItem("GoodsReceiptModel");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      //this.oSubmitPOLotsArray = [];
      saveRecProdData = {};
    } else {
      saveRecProdData = JSON.parse(dataModel);
    }
    var acceptLots: any = [];
    var rejLots: any = [];
    var itmData: any = [];
    var rejItmData: any = [];
    //adding previously stored items.
    if (type === "Accept") {
      //add arrays items other then this.
      if (saveRecProdData != null && saveRecProdData != undefined && saveRecProdData.RejectLots != null &&
        saveRecProdData.RejectLots != undefined && saveRecProdData.RejectLots != ""
        && saveRecProdData.RejectLots.length > 0) {

        for (var j = 0; j < saveRecProdData.RejectLots.length; j++) {
          rejLots.push({
            Bin: saveRecProdData.RejectLots[j].Bin,
            LineNo: saveRecProdData.RejectLots[j].LineNo, //abhi k lea kea h need to check
            LotNumber: saveRecProdData.RejectLots[j].LotNumber,
            LotQty: saveRecProdData.RejectLots[j].LotQty,//need to check
            ExpiryDate: saveRecProdData.RejectLots[j].ExpiryDate,
            PalletCode: saveRecProdData.RejectLots[j].PalletCode,
            ActualLotNo: saveRecProdData.RejectLots[j].ActualLotNo,
            UIexpiryDate: saveRecProdData.RejectLots[j].UIexpiryDate
          })
        }
        rejItmData = saveRecProdData.RejectItems;
      }
      else {
        rejLots = [];
        rejItmData = [];
      }
    } else {
      if (saveRecProdData != null && saveRecProdData != undefined && saveRecProdData.Lots != null &&
        saveRecProdData.Lots != undefined && saveRecProdData.Lots != ""
        && saveRecProdData.Lots.length > 0) {
        for (var i = 0; i < saveRecProdData.Lots.length; i++) {
          acceptLots.push({
            Bin: saveRecProdData.Lots[i].Bin,
            LineNo: saveRecProdData.Lots[i].LineNo,
            LotNumber: saveRecProdData.Lots[i].LotNumber,
            LotQty: saveRecProdData.Lots[i].LotQty,
            ExpiryDate: saveRecProdData.Lots[i].ExpiryDate,
            PalletCode: saveRecProdData.Lots[i].PalletCode,
            ActualLotNo: saveRecProdData.Lots[i].ActualLotNo,
            UIexpiryDate: saveRecProdData.Lots[i].UIexpiryDate
          })
        }
        itmData = saveRecProdData.Items;
      }
      else {
        acceptLots = [];
        itmData = [];
      }
    }
    //adding currently added items.
    let totalReceivedQty: number = this.openPOLineModel[0].RPTQTY;
    if (type == "Accept") {
      this.ItemsData = this.prepareCommonReceiptItemData(totalReceivedQty);
      this.Lots = this.prepareLotData(this.recvingQuantityBinArray);
      this.RejectLots = rejLots;
      this.RejItemsData = rejItmData;
      this.UDF = [];
    } else {
      this.RejItemsData = this.prepareCommonReceiptRejectItemData(totalReceivedQty);
      this.RejectLots = this.prepareRejectLotData(this.recvingQuantityBinArray);
      this.Lots = acceptLots;
      this.ItemsData = itmData;
      this.UDF = [];
    }

    saveRecProdData = {
      Items: this.ItemsData, Lots: this.Lots, UDF: this.UDF,
      RejectItems: this.RejItemsData, RejectLots: this.RejectLots
    }
    sessionStorage.setItem("GoodsReceiptModel", JSON.stringify(saveRecProdData));
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

  prepareAllData(NoOfCopies?) {
    var oSubmitPOLotsObj: any = {};

    var dataModel = sessionStorage.getItem("GRPOReceieveData");  // for submit all data on all clic
    // I have have replaced the array name.
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      oSubmitPOLotsObj.Header = [];
      oSubmitPOLotsObj.POReceiptLots = [];
      oSubmitPOLotsObj.POReceiptLotDetails = [];
      oSubmitPOLotsObj.UDF = [];
      oSubmitPOLotsObj.LastSerialNumber = [];
    } else {
      oSubmitPOLotsObj = JSON.parse(dataModel);
    }
    oSubmitPOLotsObj = this.inboundMasterComponent.prepareSubmitPurchaseOrder(oSubmitPOLotsObj, this.inboundFromWhere, this.Ponumber, this.DocEntry, this.uomSelectedVal, this.recvingQuantityBinArray, this.expiryDate, this.UDF);
    // sessionStorage.setItem("GRPOReceieveData", JSON.stringify(oSubmitPOLotsObj));
    // var dataModel = sessionStorage.getItem("AddToGRPO");
    // if (dataModel != null && dataModel != undefined && dataModel != "") {
    this.SubmitGoodsReceiptPO(oSubmitPOLotsObj, NoOfCopies);
    // }
  }

  getUomEntryFromSaveRecords() {
    var oSubmitPOLots: any = {};
    var dataModel = sessionStorage.getItem("GRPOReceieveData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      //this.oSubmitPOLotsArray = [];
      oSubmitPOLots = {};
    } else {
      oSubmitPOLots = JSON.parse(dataModel);
    }
    if (oSubmitPOLots != null && oSubmitPOLots != undefined && oSubmitPOLots.POReceiptLots != null &&
      oSubmitPOLots.POReceiptLots != undefined && oSubmitPOLots.POReceiptLots != ""
      && oSubmitPOLots.POReceiptLots.length > 0) {
      for (var i = 0; i < oSubmitPOLots.POReceiptLots.length; i++) {
        if (oSubmitPOLots.POReceiptLots[i].PONumber == this.Ponumber &&
          oSubmitPOLots.POReceiptLots[i].ItemCode == this.ItemCode &&
          oSubmitPOLots.POReceiptLots[i].LineNo == this.openPOLineModel[0].LINENUM &&
          oSubmitPOLots.POReceiptLots[i].Tracking == this.tracking) {
          this.UOMentry = oSubmitPOLots.POReceiptLots[i].UOM;
        }
      }
    }
  }

  UDFlineNo: number;
  showSavedDataToGrid() {
    this.openPOLineModel[0] = this.inboundMasterComponent.openPOmodel;
    if (this.openPOLineModel != undefined && this.openPOLineModel != null) {

    }
    var oSubmitPOLots: any = {};
    var dataModel = sessionStorage.getItem("GRPOReceieveData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      //this.oSubmitPOLotsArray = [];
      oSubmitPOLots = {};
    } else {
      oSubmitPOLots = JSON.parse(dataModel);
    }
    this.UDFlineNo = -1;
    if (oSubmitPOLots != null && oSubmitPOLots != undefined && oSubmitPOLots.POReceiptLots != null &&
      oSubmitPOLots.POReceiptLots != undefined && oSubmitPOLots.POReceiptLots != ""
      && oSubmitPOLots.POReceiptLots.length > 0) {
      for (var i = 0; i < oSubmitPOLots.POReceiptLots.length; i++) {
        if (oSubmitPOLots.POReceiptLots[i].PONumber == this.Ponumber &&
          oSubmitPOLots.POReceiptLots[i].ItemCode == this.ItemCode &&
          oSubmitPOLots.POReceiptLots[i].LineNo == this.openPOLineModel[0].LINENUM &&
          oSubmitPOLots.POReceiptLots[i].Tracking == this.tracking) {
          this.UOMentry = oSubmitPOLots.POReceiptLots[i].UOM;
          this.UDFlineNo = oSubmitPOLots.POReceiptLots[i].Line;
          this.getUOMVal(this.UOMentry)
          for (var j = 0; j < oSubmitPOLots.POReceiptLotDetails.length; j++) {
            if (oSubmitPOLots.POReceiptLotDetails[j].ParentLineNo == oSubmitPOLots.POReceiptLots[i].Line) {
              if (!this.fromReceiptProduction) {
                if (this.tracking == 'S') {
                  oSubmitPOLots.POReceiptLotDetails[j].LotQty = oSubmitPOLots.POReceiptLotDetails[j].LotQty;
                } else {
                  oSubmitPOLots.POReceiptLotDetails[j].LotQty = oSubmitPOLots.POReceiptLotDetails[j].LotQty / this.uomSelectedVal.BaseQty;
                }
              }
              oSubmitPOLots.POReceiptLotDetails[j].LotQty = Number(oSubmitPOLots.POReceiptLotDetails[j].LotQty).toFixed(Number(sessionStorage.getItem("DecimalPrecision")))
              this.recvingQuantityBinArray.push(oSubmitPOLots.POReceiptLotDetails[j]);
              this.recvingQuantityBinArray[this.recvingQuantityBinArray.length - 1].expiryDate = oSubmitPOLots.POReceiptLotDetails[j].ExpireDate;
              this.previousReceivedQty = Number(this.previousReceivedQty) + Number(oSubmitPOLots
                .POReceiptLotDetails[j].LotQty);
            }
          }
          // this.LastSerialNumber = oSubmitPOLotsObj.LastSerialNumber;
          // this.LineId = oSubmitPOLotsObj.LastSerialNumber;
          for (var m = 0; m < oSubmitPOLots.LastSerialNumber.length; m++) {
            this.LastSerialNumber.push(oSubmitPOLots.LastSerialNumber[m].LastSerialNumber);
            this.LineId.push(oSubmitPOLots.LastSerialNumber[m].LineId);
          }

          if (oSubmitPOLots.UDF != undefined && oSubmitPOLots.UDF != null && oSubmitPOLots.UDF.length > 0) {
            // for (var m1 = 0; m1 < oSubmitPOLots.UDF.length; m1++) {
            //   if (oSubmitPOLots.UDF[m1].LineNo == oSubmitPOLots.POReceiptLots[i].Line) {
            //     this.targetWhse = oSubmitPOLots.UDF[m1].Value;
            //     this.targetBin = oSubmitPOLots.UDF[m1 + 1].Value;
            //     break;
            //   }
            // }
            this.UDF = oSubmitPOLots.UDF
            this.targetWhse = oSubmitPOLots.UDF.find(e => e.Key == "OPTM_TARGETWHS" &&
              e.LineNo == this.openPOLineModel[0].LINENUM && e.DocEntry == this.openPOLineModel[0].DOCENTRY).Value;
            this.targetBin = oSubmitPOLots.UDF.find(e => e.Key == "OPTM_TARGETBIN" &&
              e.LineNo == this.openPOLineModel[0].LINENUM && e.DocEntry == this.openPOLineModel[0].DOCENTRY).Value;
          }
        }
      }
      this.updateQtytoHeader(this.previousReceivedQty);
    }
    if (this.tracking == "S") {
      this.isNonTrack = false;
    } else if (this.tracking == "N") {
      this.isNonTrack = true;

    } else if (this.tracking == "B") {

      this.isNonTrack = false;

    }
    //enable disable buttons.
    if (this.recvingQuantityBinArray.length > 0) {
      if (!this.fromReceiptProduction) {
        this.showButton = true;
        this.showRecButton = true;
      } else {
        this.showRecButton = false;
        this.showButton = true;
      }
    } else {
      this.showButton = false;
      this.showRecButton = false;
    }

    if (this.tracking == 'N' && this.recvingQuantityBinArray.length > 0) {
      this.RecvbBinvalue = this.recvingQuantityBinArray[0].Bin;
      this.qty = this.recvingQuantityBinArray[0].LotQty;
    }
  }

  showSavedReceiptProductionData() {
    this.setRecQtyArrayDataForReceipt(this.receiptData.status);
  }

  setRecQtyArrayDataForReceipt(type: string) {
    var submitRecProdData: any = {};
    var dataModel = sessionStorage.getItem("GoodsReceiptModel");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      //this.oSubmitPOLotsArray = [];
      submitRecProdData = {};
    } else {
      submitRecProdData = JSON.parse(dataModel);
    }
    if (type == "Accept") {
      if (submitRecProdData != null && submitRecProdData != undefined && submitRecProdData.Lots != null &&
        submitRecProdData.Lots != undefined && submitRecProdData.Lots != ""
        && submitRecProdData.Lots.length > 0) {
        //for (var i = 0; i < submitRecProdData.Lots.length; i++) {
        if (submitRecProdData.Items[0].BATCHNO == this.Ponumber &&
          submitRecProdData.Items[0].ItemCode == this.ItemCode && submitRecProdData.Items[0].Tracking == this.tracking) {
          this.UDFlineNo = 0
          for (var j = 0; j < submitRecProdData.Lots.length; j++) {
            //if (submitRecProdData.Lots[j].Bin == submitRecProdData.POReceiptLots[i].Line) {
            var obj: any = {
              LotNumber: submitRecProdData.Lots[j].LotNumber,
              LotQty: submitRecProdData.Lots[j].LotQty,
              LineNo: submitRecProdData.Lots[j].LineNo,
              Bin: submitRecProdData.Lots[j].Bin,
              ExpireDate: submitRecProdData.Lots[j].ExpiryDate,
              VendorLot: submitRecProdData.Lots[j].ActualLotNo,
              PalletCode: submitRecProdData.Lots[j].PalletCode,
              expiryDate: submitRecProdData.Lots[j].UIexpiryDate
            }
            this.recvingQuantityBinArray.push(obj);
            this.previousReceivedQty = Number(this.previousReceivedQty) + Number(submitRecProdData
              .Lots[j].LotQty);
            this.updateQtytoHeader(this.previousReceivedQty)
            // this.openPOLineModel[0].RPTQTY = this.previousReceivedQty;
            // this.openPOLineModel[0].INVRPTQTY = this.previousReceivedQty * this.uomSelectedVal.BaseQty;
          }
        }
      }
    }
    else {
      if (submitRecProdData != null && submitRecProdData != undefined && submitRecProdData.RejectLots != null &&
        submitRecProdData.RejectLots != undefined && submitRecProdData.RejectLots != "" && submitRecProdData.RejectLots.length > 0) {
        //  for (var i = 0; i < submitRecProdData.Lots.length; i++) {
        if (submitRecProdData.RejectItems[0].BATCHNO == this.Ponumber &&
          submitRecProdData.RejectItems[0].ItemCode == this.ItemCode && submitRecProdData.RejectItems[0].Tracking == this.tracking) {
          this.UDFlineNo = 1;
          for (var j = 0; j < submitRecProdData.RejectLots.length; j++) {
            //if (submitRecProdData.Lots[j].Bin == submitRecProdData.POReceiptLots[i].Line) {
            var obj: any = {
              LotNumber: submitRecProdData.RejectLots[j].LotNumber,
              LotQty: submitRecProdData.RejectLots[j].LotQty,
              LineNo: submitRecProdData.RejectLots[j].LineNo,
              Bin: submitRecProdData.RejectLots[j].Bin,
              ExpireDate: submitRecProdData.RejectLots[j].ExpiryDate,
              VendorLot: submitRecProdData.RejectLots[j].ActualLotNo,
              PalletCode: submitRecProdData.RejectLots[j].PalletCode,
              expiryDate: submitRecProdData.RejectLots[j].UIexpiryDate
            }
            this.recvingQuantityBinArray.push(obj);
            this.previousReceivedQty = Number(this.previousReceivedQty) + Number(
              submitRecProdData.RejectLots[j].LotQty);
            this.updateQtytoHeader(this.previousReceivedQty)
            // this.openPOLineModel[0].RPTQTY = this.previousReceivedQty;
            // this.openPOLineModel[0].INVRPTQTY = this.previousReceivedQty * this.uomSelectedVal.BaseQty;
          }
        }
      }
    }
    //enable disable buttons.
    if (this.recvingQuantityBinArray.length > 0) {
      if (!this.fromReceiptProduction) {
        this.showButton = true;
        this.showRecButton = true;
      } else {
        this.showRecButton = false;
        this.showButton = true;
      }
    } else {
      this.showButton = false;
      this.showRecButton = false;
    }
  }

  getUOMVal(UomEntry: number) {
    if (this.openPOLineModel[0].UOMList != undefined) {
      for (var i = 0; i < this.openPOLineModel[0].UOMList.length; i++) {
        if (this.openPOLineModel[0].UOMList[i].UomEntry == UomEntry) {
          this.uomSelectedVal = this.openPOLineModel[0].UOMList[i];
        }
      }
    }
  }


  // manageRecords(oSubmitPOLotsObj: any): any {
  //   var size = oSubmitPOLotsObj.POReceiptLots.length;
  //   for (var i = 0; i < oSubmitPOLotsObj.POReceiptLots.length; i++) {
  //     if (oSubmitPOLotsObj.POReceiptLots[i].PONumber == this.Ponumber &&
  //       oSubmitPOLotsObj.POReceiptLots[i].ItemCode == this.openPOLineModel[0].ITEMCODE &&
  //       oSubmitPOLotsObj.POReceiptLots[i].LineNo == this.openPOLineModel[0].LINENUM) {
  //       var s = oSubmitPOLotsObj.POReceiptLotDetails.length;
  //       for (var j = 0; j < oSubmitPOLotsObj.POReceiptLotDetails.length; j++) {
  //         if (oSubmitPOLotsObj.POReceiptLotDetails[j].ParentLineNo == oSubmitPOLotsObj.POReceiptLots[i].Line) {
  //           oSubmitPOLotsObj.POReceiptLotDetails.splice(j, 1);
  //           j = -1;
  //         }
  //       }

  //       for (var k = 0; k < oSubmitPOLotsObj.UDF.length; k++) {
  //         if (oSubmitPOLotsObj.UDF[k].Key == "OPTM_TARGETWHS" &&
  //           oSubmitPOLotsObj.UDF[k].LineNo == oSubmitPOLotsObj.POReceiptLots[i].Line) {
  //           oSubmitPOLotsObj.UDF.splice(k, 1);
  //         }

  //         if (oSubmitPOLotsObj.UDF[k].Key == "OPTM_TARGETBIN" &&
  //           oSubmitPOLotsObj.UDF[k].LineNo == oSubmitPOLotsObj.POReceiptLots[i].Line) {
  //           oSubmitPOLotsObj.UDF.splice(k, 1);
  //         }
  //       }

  //       // oSubmitPOLotsObj.UDF.splice(i, 1);
  //       for (var m = 0; m < oSubmitPOLotsObj.LastSerialNumber.length; m++) {
  //         if (oSubmitPOLotsObj.LastSerialNumber[m].ItemCode == oSubmitPOLotsObj.POReceiptLots[i].ItemCode) {
  //           oSubmitPOLotsObj.LastSerialNumber.splice(m, 1);
  //           m = -1;
  //         }
  //       }
  //       // oSubmitPOLotsObj.LastSerialNumber.splice(i, 1);
  //       oSubmitPOLotsObj.POReceiptLots.splice(i, 1);
  //     }
  //   }
  //   return oSubmitPOLotsObj;
  // }

  receive(e) {
    //if (!this.fromReceiptProduction) {
    //if (this.tracking == "S" && !this.ValidateSerialInCaseOfUOM()) {
    //return;
    // }
    // }
    //validating grid start.
    if (this.IsQCRequired) {
      if (this.IsQCRequired && (this.targetBin == null || this.targetBin == undefined || this.targetBin == "")) {
        this.toastr.error('', "Target Warehouse cannot be blank");
        return;
      } else if (this.IsQCRequired && (this.targetWhse == null || this.targetWhse == undefined || this.targetWhse == "")) {
        this.toastr.error('', "Target Bin cannot be blank");
        return;
      }

      let UDF;
      if (this.fromReceiptProduction) {
        UDF = JSON.parse(sessionStorage.getItem("GRPOHdrUDF"));
      } else {
        UDF = this.inboundMasterComponent.getUDF()
      }
      let lineno = 0;
      if (this.fromReceiptProduction) {
        lineno = this.receiptData.status == "Accept" ? 0 : 1
      } else {
        lineno = this.openPOLineModel[0].LINENUM;
      }

      while (UDF.length > 0) {
        let index = UDF.findIndex(e => e.LineNo == lineno && e.DocEntry == this.openPOLineModel[0].DOCENTRY && e.Flag == "D" && e.Key == "OPTM_TARGETWHS")
        if (index == -1) {
          break;
        }
        UDF.splice(index, 1);
      }

      while (UDF.length > 0) {
        let index = UDF.findIndex(e => e.LineNo == lineno && e.DocEntry == this.openPOLineModel[0].DOCENTRY && e.Flag == "D" && e.Key == "OPTM_TARGETBIN")
        if (index == -1) {
          break;
        }
        UDF.splice(index, 1);
      }

      UDF.push({
        Key: "OPTM_TARGETWHS",//UDF[iIndex].Key,
        Value: this.targetWhse,
        Flag: 'D', // D = Line, H= Header, L = Lots
        // LineNo: Number(localStorage.getItem("Line")),
        LineNo: lineno,
        DocEntry: this.openPOLineModel[0].DOCENTRY,
      });
      UDF.push({
        Key: "OPTM_TARGETBIN",//UDF[iIndex].Key,
        Value: this.targetBin,
        Flag: 'D', // D = Line, H= Header, L = Lots
        // LineNo: Number(localStorage.getItem("Line")),
        LineNo: lineno,
        DocEntry: this.openPOLineModel[0].DOCENTRY,
      });
      if (this.fromReceiptProduction) {
        sessionStorage.setItem("GRPOHdrUDF", JSON.stringify(UDF));
      } else {
        this.inboundMasterComponent.updateUDF(UDF);
      }
    }

    if (this.openPOLineModel[0].TRACKING != "N") {
      let result = this.recvingQuantityBinArray.find(element => element.LotNumber == "");
      if (result != undefined) {
        if (this.openPOLineModel[0].TRACKING == "S") {
          this.toastr.error('', this.translate.instant("Inbound_SerialNotBlank"));
        } else {
          this.toastr.error('', this.translate.instant("Inbound_BatchNotBlank"));
        }
        return;
      }
      //validating grid end.
      if (!this.checkandOpenDetailUDF()) {
        return;
      }
    }

    if (this.fromReceiptProduction) {
      //prepare model for receipt from production
      // console.log("receive qty bin array" + this.recvingQuantityBinArray);
      // this.prepareLotData(this.recvingQuantityBinArray);
      // console.log("lots array:" + this.Lots);
      // if (this.receiptData.status == "Accept") {
      //   this.prepareCommonReceiptItemData(this.openPOLineModel[0].RPTQTY);
      // } else {
      //   this.prepareCommonReceiptRejectItemData(this.openPOLineModel[0].RPTQTY);
      // }

    } else {
      //check if detail udf exists or not
      // if (!this.checkandOpenDetailUDF()) {
      //   return;
      // }
      var dataModel: any = sessionStorage.getItem("GRPOReceieveData");
      if (dataModel == null || dataModel == undefined || dataModel == "") {
        if (sessionStorage.getItem("GRPOPrintReport") == "Y") {
          this.showPrintDialog();
        } else {
          this.submitCurrentGRPO();
          this.showPDF = false;
        }
      } else {
        dataModel = this.inboundMasterComponent.manageRecords(JSON.parse(dataModel), this.Ponumber);
        if (dataModel == null || dataModel == undefined || dataModel == "" ||
          dataModel.POReceiptLots.length < 1) {
          if (sessionStorage.getItem("GRPOPrintReport") == "Y") {
            this.showPrintDialog();
          } else {
            this.submitCurrentGRPO();
            this.showPDF = false;
          }
          return;
        } else {
          this.yesButtonText = this.translate.instant("All");
          this.noButtonText = this.translate.instant("Current");
          this.dialogFor = "recCurrentOrAll";
          this.dialogMsg = this.translate.instant("Inbound_ReceiveCurrentOrAll")
          this.showConfirmDialog = true; // show dialog
        }
      }
    }
  }

  checkandOpenDetailUDF() {
    if (this.IsUDFEnabled == "N") {
      return true
    }
    let UDF = [];
    if (this.fromReceiptProduction) {
      UDF = sessionStorage.getItem("GRPOHdrUDF") != "" ? JSON.parse(sessionStorage.getItem("GRPOHdrUDF")) : [];
    } else {
      UDF = this.inboundMasterComponent.getUDF()
    }
    let lineno = 0;
    if (this.fromReceiptProduction) {
      lineno = this.receiptData.status == "Accept" ? 0 : 1
    } else {
      lineno = this.openPOLineModel[0].LINENUM;
    }
    if (this.recvingQuantityBinArray.length > 0) {
      // [iBtchIndex].LotNumber)
      for (var i = 0; i < this.recvingQuantityBinArray.length; i++) {
        let index = UDF.findIndex(e => e.LineNo == lineno && e.DocEntry ==
          this.openPOLineModel[0].DOCENTRY && e.Flag == "L" && e.LotNo == this.recvingQuantityBinArray[i].LotNumber)
        if (index == -1) {
          if (this.ShowUDF('Lot', false, i)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  showPrintDialog() {
    // show print dialog here and onclick its handling.
    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    this.dialogFor = "receiveSinglePDFDialog";
    this.dialogMsg = this.translate.instant("Inbound_PrintAllLabelsAfterSubmit");
    this.showConfirmDialog = true; // show dialog
  }

  // prepareSubmitPurchaseOrder(oSubmitPOLotsObj: any): any {
  //   oSubmitPOLotsObj = this.manageRecords(oSubmitPOLotsObj);
  //   if (sessionStorage.getItem("Line") == null || sessionStorage.getItem("Line") == undefined ||
  //     sessionStorage.getItem("Line") == "") {
  //     sessionStorage.setItem("Line", "0");
  //   }


  //   oSubmitPOLotsObj.POReceiptLots.push({
  //     OPTM_TYPE: this.inboundFromWhere,
  //     DiServerToken: sessionStorage.getItem("Token"),
  //     PONumber: this.Ponumber,
  //     DocEntry: this.DocEntry,
  //     CompanyDBId: sessionStorage.getItem("CompID"),
  //     LineNo: this.openPOLineModel[0].LINENUM,
  //     ShipQty: this.openPOLineModel[0].RPTQTY.toString(),
  //     OpenQty: this.openPOLineModel[0].OPENQTY.toString(),
  //     WhsCode: sessionStorage.getItem("whseId"),
  //     Tracking: this.openPOLineModel[0].TRACKING,
  //     ItemCode: this.openPOLineModel[0].ITEMCODE,
  //     LastSerialNumber: 0,
  //     Line: Number(sessionStorage.getItem("Line")),
  //     GUID: sessionStorage.getItem("GUID"),
  //     UOM: this.uomSelectedVal.UomEntry,
  //     UsernameForLic: sessionStorage.getItem("UserId")

  //     //------end Of parameter For License----
  //   });
  //   oSubmitPOLotsObj.UDF = this.UDF;
  //   // oSubmitPOLotsObj.UDF.push({
  //   //   Key: "OPTM_TARGETWHS",//UDF[iIndex].Key,
  //   //   Value: this.targetWhse,
  //   //   //LotNo: UDF[iIndex].LotNo,
  //   //   Flag: 'D', // D = Line, H= Header, L = Lots
  //   //   LineNo: Number(sessionStorage.getItem("Line"))
  //   // });
  //   // oSubmitPOLotsObj.UDF.push({
  //   //   Key: "OPTM_TARGETBIN",//UDF[iIndex].Key,
  //   //   Value: this.targetBin,
  //   //   //LotNo: UDF[iIndex].LotNo,
  //   //   Flag: 'D', // D = Line, H= Header, L = Lots
  //   //   LineNo: Number(sessionStorage.getItem("Line"))
  //   // });

  //   for (var iBtchIndex = 0; iBtchIndex < this.recvingQuantityBinArray.length; iBtchIndex++) {
  //     //  let qty = Number(this.recvingQuantityBinArray[iBtchIndex].LotQty).toFixed(Number(sessionStorage.getItem("DecimalPrecision")))
  //     if (this.tracking == 'S') {
  //       oSubmitPOLotsObj.POReceiptLotDetails.push({
  //         // POItemCode: this.Ponumber+this.openPOLineModel[0].ITEMCODE,
  //         Bin: this.recvingQuantityBinArray[iBtchIndex].Bin,
  //         LineNo: this.openPOLineModel[0].LINENUM,
  //         LotNumber: this.recvingQuantityBinArray[iBtchIndex].LotNumber, //getUpperTableData.GoodsReceiptLineRow[iBtchIndex].SysSerNo,
  //         LotQty: this.recvingQuantityBinArray[iBtchIndex].LotQty.toString(),
  //         SysSerial: "0",
  //         ExpireDate: this.GetSubmitDateFormat(this.expiryDate),//GetSubmitDateFormat(getUpperTableData.GoodsReceiptLineRow[iBtchIndex].EXPDATE), // oCurrentController.GetSubmitDateFormat(oActualGRPOModel.PoDetails[iIndex].ExpireDate),//oActualGRPOModel.PoDetails[iIndex].ExpireDate,
  //         VendorLot: this.recvingQuantityBinArray[iBtchIndex].VendorLot,
  //         //NoOfLabels: oActualGRPOModel.PoDetails[iIndex].NoOfLabels,
  //         //Containers: piContainers,
  //         SuppSerial: this.recvingQuantityBinArray[iBtchIndex].VendorLot,
  //         ParentLineNo: Number(sessionStorage.getItem("Line")),
  //         LotSteelRollId: "",
  //         ItemCode: this.openPOLineModel[0].ITEMCODE,
  //         PalletCode: this.recvingQuantityBinArray[iBtchIndex].PalletCode
  //       });
  //     } else {
  //       oSubmitPOLotsObj.POReceiptLotDetails.push({
  //         // POItemCode: this.Ponumber+this.openPOLineModel[0].ITEMCODE,
  //         Bin: this.recvingQuantityBinArray[iBtchIndex].Bin,
  //         LineNo: this.openPOLineModel[0].LINENUM,
  //         LotNumber: this.recvingQuantityBinArray[iBtchIndex].LotNumber, //getUpperTableData.GoodsReceiptLineRow[iBtchIndex].SysSerNo,
  //         LotQty: (this.recvingQuantityBinArray[iBtchIndex].LotQty * this.uomSelectedVal.BaseQty).toFixed(Number(sessionStorage.getItem("DecimalPrecision"))),
  //         SysSerial: "0",
  //         ExpireDate: this.GetSubmitDateFormat(this.expiryDate),//GetSubmitDateFormat(getUpperTableData.GoodsReceiptLineRow[iBtchIndex].EXPDATE), // oCurrentController.GetSubmitDateFormat(oActualGRPOModel.PoDetails[iIndex].ExpireDate),//oActualGRPOModel.PoDetails[iIndex].ExpireDate,
  //         VendorLot: this.recvingQuantityBinArray[iBtchIndex].VendorLot,
  //         //NoOfLabels: oActualGRPOModel.PoDetails[iIndex].NoOfLabels,
  //         //Containers: piContainers,
  //         SuppSerial: this.recvingQuantityBinArray[iBtchIndex].VendorLot,
  //         ParentLineNo: Number(sessionStorage.getItem("Line")),
  //         LotSteelRollId: "",
  //         ItemCode: this.openPOLineModel[0].ITEMCODE,
  //         PalletCode: this.recvingQuantityBinArray[iBtchIndex].PalletCode
  //       });
  //     }

  //   }

  //   // for (var iLastIndexNumber = 0; iLastIndexNumber < this.LastSerialNumber.length; iLastIndexNumber++) {
  //   //   oSubmitPOLotsObj.LastSerialNumber.push({
  //   //     LastSerialNumber: this.LastSerialNumber[iLastIndexNumber],
  //   //     LineId: this.LineId[iLastIndexNumber],
  //   //     ItemCode: this.openPOLineModel[0].ITEMCODE
  //   //   });
  //   // }
  //   sessionStorage.setItem("Line", "" + (Number(sessionStorage.getItem("Line")) + 1));
  //   oSubmitPOLotsObj.Header = []
  //   oSubmitPOLotsObj.Header.push({
  //     NumAtCard: sessionStorage.getItem("VendRefNo")
  //   });
  //   return oSubmitPOLotsObj;
  // }


  // GetSubmitDateFormat(EXPDATE) {
  //   if (EXPDATE == "" || EXPDATE == null)
  //     return "";
  //   else {
  //     var d = new Date(EXPDATE);
  //     var day;

  //     if (d.getDate().toString().length < 2) {
  //       day = "0" + d.getDate();
  //     }
  //     else {
  //       day = d.getDate();
  //     }
  //     var mth;
  //     if ((d.getMonth() + 1).toString().length < 2) {
  //       mth = "0" + (d.getMonth() + 1).toString();
  //     }
  //     else {
  //       mth = d.getMonth() + 1;
  //     }
  //     // return day + ":" + mth + ":" + d.getFullYear();
  //     return mth + "/" + day + "/" + d.getFullYear();
  //   }
  // }




  removePODetailData() {
    var inboundData = JSON.parse(sessionStorage.getItem("AddToGRPO"));
    if (inboundData != undefined && inboundData != null && inboundData != "") {
      for (var i = 0; i < inboundData.POReceiptLots.length; i++) {
        if (inboundData.POReceiptLots[i].PONumber == this.Ponumber &&
          inboundData.POReceiptLots[i].ItemCode == this.openPOLineModel[0].ITEMCODE &&
          inboundData.POReceiptLots[i].LineNo == this.openPOLineModel[0].LINENUM) {

          for (var j = 0; j < inboundData.POReceiptLotDetails.length; j++) {
            if (inboundData.POReceiptLotDetails[j].ParentLineNo == inboundData.POReceiptLots[i].Line) {
              inboundData.POReceiptLotDetails.splice(j, 1);
              j = -1;
            }
          }

          while (inboundData.UDF.length > 0) {
            let index = inboundData.UDF.findIndex(e => e.LineNo == inboundData.POReceiptLots[i].Line)
            if (index == -1) {
              break;
            }
            inboundData.UDF.splice(index, 1);
          }

          for (var m = 0; m < inboundData.LastSerialNumber.length; m++) {
            if (inboundData.LastSerialNumber[m].ItemCode == inboundData.POReceiptLots[i].ItemCode) {
              inboundData.LastSerialNumber.splice(m, 1);
              m = -1;
            }
          }

          inboundData.POReceiptLots.splice(i, 1);
        }
      }
      sessionStorage.setItem("AddToGRPO", JSON.stringify(inboundData));
    }

    var GRPOReceieveData = JSON.parse(sessionStorage.getItem("GRPOReceieveData"));
    if (GRPOReceieveData != undefined && GRPOReceieveData != null && GRPOReceieveData != "") {
      for (var i = 0; i < GRPOReceieveData.POReceiptLots.length; i++) {
        if (inboundData.POReceiptLots[i].PONumber == this.Ponumber &&
          inboundData.POReceiptLots[i].ItemCode == this.openPOLineModel[0].ITEMCODE &&
          inboundData.POReceiptLots[i].LineNo == this.openPOLineModel[0].LINENUM) {

          for (var j = 0; j < GRPOReceieveData.POReceiptLotDetails.length; j++) {
            if (GRPOReceieveData.POReceiptLotDetails[j].ParentLineNo == GRPOReceieveData.POReceiptLots[i].Line) {
              GRPOReceieveData.POReceiptLotDetails.splice(j, 1);
              j = -1;
            }
          }

          for (var k = 0; k < GRPOReceieveData.UDF.length; k++) {
            if (GRPOReceieveData.UDF[k].Key == "OPTM_TARGETWHS" &&
              GRPOReceieveData.UDF[k].LineNo == GRPOReceieveData.POReceiptLots[i].Line) {
              GRPOReceieveData.UDF.splice(k, 1);
            }

            if (GRPOReceieveData.UDF[k].Key == "OPTM_TARGETBIN" &&
              GRPOReceieveData.UDF[k].LineNo == GRPOReceieveData.POReceiptLots[i].Line) {
              GRPOReceieveData.UDF.splice(k, 1);
            }
          }

          while (GRPOReceieveData.UDF.length > 0) {
            let index = GRPOReceieveData.UDF.findIndex(e => e.LineNo == GRPOReceieveData.POReceiptLots[i].Line)
            if (index == -1) {
              break;
            }
            GRPOReceieveData.UDF.splice(index, 1);
          }

          for (var m = 0; m < GRPOReceieveData.LastSerialNumber.length; m++) {
            if (GRPOReceieveData.LastSerialNumber[m].ItemCode == GRPOReceieveData.POReceiptLots[i].ItemCode) {
              GRPOReceieveData.LastSerialNumber.splice(m, 1);
              m = -1;
            }
          }

          GRPOReceieveData.POReceiptLots.splice(i, 1);
        }
      }
      sessionStorage.setItem("GRPOReceieveData", JSON.stringify(GRPOReceieveData));
    }

  }



  SubmitGoodsReceiptPO(oSubmitPOLotsObj: any, noOfCopy) {
    this.showLoader = true;
    this.inboundService.SubmitGoodsReceiptPO(oSubmitPOLotsObj).subscribe(
      (data: any) => {
        this.showLoader = false;
        //console.log(data);
        if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {

          sessionStorage.setItem("GRPOHdrUDF", "");
          this.inboundMasterComponent.clearUDF();
          // if (this.operationType == "All") {
          //   sessionStorage.setItem("Line", "0");
          //   sessionStorage.setItem("GRPOReceieveData", "");
          //   sessionStorage.setItem("AddToGRPO", "");
          //   sessionStorage.setItem("addToGRPOPONumbers", "");
          // } else 
          if (this.operationType == "Current") {
            this.removePODetailData();
          } else {
            sessionStorage.setItem("Line", "0");
            sessionStorage.setItem("GRPOReceieveData", "");
            sessionStorage.setItem("AddToGRPO", "");
            sessionStorage.setItem("addToGRPOPONumbers", "");
            sessionStorage.setItem("GRPOHdrUDF", "");
          }
          console.log(noOfCopy);
          this.toastr.success('', this.translate.instant("Inbound_GRPOSuccessMessage") + " " + data[0].SuccessNo);

          if (this.showPDF) {
            //show pdf
            this.displayPDF(data[0].DocEntry, noOfCopy);
            this.showPDF = false;
          } else {
            // no need to display pdf
            this.inboundMasterComponent.inboundComponent = 1;
          }

        } else if (data[0].ErrorMsg == "7001") {
          this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
            this.translate.instant("CommonSessionExpireMsg"));
          return;
        }
        else {
          // alert(data[0].ErrorMsg);
          this.toastr.error('', data[0].ErrorMsg);
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

  cancel() {
    if (sessionStorage.getItem('FromReceiptProd') == 'true') {
      this.screenBackEvent.emit('back');
      // this.productionReceiptItemListComponent.prodReceiptComponent = 1;
      //if we want to store something in local storage.
    } else {
      sessionStorage.setItem("PONumber", this.Ponumber);
      this.inboundMasterComponent.inboundComponent = 2;
    }

  }

  DeleteRowClick(rowindex, gridData: any) {
    if (this.recvingQuantityBinArray.length > 0) {
      var qtyForRemove = this.recvingQuantityBinArray[rowindex].LotQty;
      if (!this.fromReceiptProduction && this.tracking == 'S') {
        if (this.openPOLineModel[0].INVRPTQTY >= qtyForRemove) {
          this.updateQtytoHeader(this.openPOLineModel[0].INVRPTQTY - qtyForRemove)
        }
      } else {
        if (this.openPOLineModel[0].RPTQTY >= qtyForRemove) {
          this.updateQtytoHeader(this.openPOLineModel[0].RPTQTY - qtyForRemove)
          // this.openPOLineModel[0].RPTQTY = this.openPOLineModel[0].RPTQTY - qtyForRemove;
          // this.openPOLineModel[0].INVRPTQTY = this.openPOLineModel[0].RPTQTY * this.uomSelectedVal.BaseQty;
        }
      }
    }
    //////////////////////delete lot udf////////////////////
    let UDF;
    if (this.fromReceiptProduction) {
      UDF = JSON.parse(sessionStorage.getItem("GRPOHdrUDF"));
    } else {
      UDF = this.inboundMasterComponent.getUDF()
    }
    while (UDF.length > 0) {
      let index = UDF.findIndex(e => e.LineNo == this.openPOLineModel[0].LINENUM && e.DocEntry == this.openPOLineModel[0].DOCENTRY && e.Flag == "L" && e.LotNo == this.recvingQuantityBinArray[rowindex].LotNumber)
      if (index == -1) {
        break;
      }
      UDF.splice(index, 1);
    }
    this.inboundMasterComponent.updateUDF(UDF);
    //////////////////////delete lot udf////////////////////
    this.recvingQuantityBinArray.splice(rowindex, 1);
    gridData.data = this.recvingQuantityBinArray;
    if (this.recvingQuantityBinArray.length >= 0) {
      if (!this.fromReceiptProduction) {
        this.showButton = true;
        this.showRecButton = true;
      } else {
        this.showButton = true;
        this.showRecButton = false;
      }
    } else {
      this.showButton = false;
      this.showRecButton = false;
    }
  }


  // item section.
  /**
  * Method to get list of inquries from server.
  */
  public getTargetWhseList() {
    this.showLoader = true;
    this.targetWhseSubs = this.inboundService.getQCTargetWhse().subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          this.serviceData = data;
          this.lookupfor = "toWhsList";

        }
        else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
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
      },
    );
  }


  // item section.
  /**
  * Method to get list of inquries from server.
  */
  public getTargetBinList() {
    this.targetBinClick = true;
    //this.showLoader = true; this.getPIlistSubs =
    this.showLoader = true;
    this.targetBinSubs = this.inboundService.GetTargetBins("N", this.targetWhse).subscribe(
      (data: any) => {
        this.showLoader = false;
        //console.log(data);
        if (data != null) {

          if (data.length > 0) {
            if (data[0].ErrorMsg == "7001") {
              this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                this.translate.instant("CommonSessionExpireMsg"));
              return;
            } else {
              // console.log(data);
              this.showLookupLoader = false;
              this.serviceData = data;
              this.lookupfor = "RecvBinList";
            }
            return;
          }
          else {
            this.toastr.error('', this.translate.instant("Inbound_NoBinsAvailableMsg"));
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


  public GetTargetBins() {
    this.targetBinClick = false;
    this.showLoader = true;
    this.inboundService.GetTargetBins('N', sessionStorage.getItem("whseId")).subscribe(
      (data: any) => {
        this.showLoader = false;
        // console.log(data);
        if (data != null) {
          if (data.length > 0) {
            //   if (this.defaultRecvBin == true) {
            // //    this.RecvbBinvalue = data[0].BINNO;
            //     this.defaultRecvBin = false
            //   }
            //   else {
            //  console.log(data);
            this.showLookupLoader = false;
            this.serviceData = data;
            this.lookupfor = "RecvBinList";
            return;
            // }
          } else {
            this.toastr.error('', this.translate.instant("Inbound_NoBinsAvailableMsg"));
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

  /**
  * @param $event this will return the value on row click of lookup grid.
  */
  getLookupValue($event) {
    if ($event != null && $event == "close") {
      //nothing to do
      return;
    }
    else {
      if (this.lookupfor == "RecvBinList") {
        //this.itemCode = $event[0];
        if (this.targetBinClick) {
          this.targetBin = $event[0];
          this.targetBinClick = false;
        } else {
          this.RecvbBinvalue = $event[0];
        }
        if (this.tracking == "N") {
          this.scanQty.nativeElement.focus();
        } else {
          if (sessionStorage.getItem('FromReceiptProd') == 'true') {
            this.scanPallet.nativeElement.focus();
          } else {
            this.scanBatchSerial.nativeElement.focus();
          }
        }
      }
      else if (this.lookupfor == "toWhsList") {
        // console.log("value of lots" + $event);
        //console.log("value of lots" + $event.LOTNO);
        this.targetWhse = $event[0];
        //this.itemCode = $event[2];
        this.targetBin = "";
        this.scanTargetBin.nativeElement.focus();
      } else if (this.lookupfor == "PalletList") {
        this.palletValue = $event[0];
        if (this.scanQty != undefined && this.scanQty != null) {
          this.scanQty.nativeElement.focus();
        }
      } else if (this.lookupfor == "GetBatSerProdRec") {
        this.ScanInputs = $event[0];
        this.qty = $event[1];
        this.btchserQty = $event[1];
      }
    }
  }

  OnTargetBinChangeBlu() {

  }

  async OnTargetBinChange() {
    if (this.targetBin == "") {
      return;
    }
    this.showLoader = true;
    await this.inboundService.binChange(this.targetWhse, this.targetBin).then(
      (data: any) => {
        this.showLoader = false;
        // console.log(data);
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("INVALIDBIN"));
              this.targetBin = "";
              this.scanTargetBin.nativeElement.focus()
              return;
            }
            else {
              this.targetBin = data[0].ID;
              // oCurrentController.isReCeivingBinExist();
            }
          }
        }
        else {
          this.toastr.error('', this.translate.instant("INVALIDBIN"));
          this.targetBin = "";
          this.scanTargetBin.nativeElement.focus()
          return;
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
        this.targetBin = "";
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
    return
  }

  onQCWHSChange() {
    if (this.targetWhse == "") {
      return;
    }
    this.showLoader = true;
    this.inboundService.isWHSExists(this.targetWhse).subscribe(
      (data: any) => {
        this.showLoader = false;
        //console.log(data);
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("InvalidWhsErrorMsg"));
              this.targetWhse = "";
              this.targetBin = "";
              this.scanTargetWhse.nativeElement.focus()
              return;
            }
            else {
              this.targetWhse = data[0].ID;
              this.targetBin = "";
              // oCurrentController.isReCeivingBinExist();
            }
          }
        }
        else {
          this.toastr.error('', this.translate.instant("InvalidWhsErrorMsg"));
          this.targetWhse = "";
          this.scanTargetWhse.nativeElement.focus()
          return;
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
        this.targetWhse = "";
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  onHiddenRecBinClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('inboundGrpoRecBinInput')).value;
    if (inputValue.length > 0) {
      this.RecvbBinvalue = inputValue;
    }
    this.OnBinChange();
  }


  onHiddenScanClick() {

    var inputValue = (<HTMLInputElement>document.getElementById('inboundScanInputField')).value;
    if (inputValue.length > 0) {
      this.ScanInputs = inputValue;
    }
    this.onGS1ItemScan();
  }

  onHiddenPalletClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('inboundGRPOPalletNo')).value;
    if (inputValue.length > 0) {
      this.palletValue = inputValue;
    }
    this.OnPalletChange();
  }

  onGS1ItemScanBlur() {
    if (this.isValidateCalled) {
      return;
    }
    this.onGS1ItemScan();
  }
  async onGS1ItemScan(): Promise<any> {
    if (this.ScanInputs != null && this.ScanInputs != undefined &&
      this.ScanInputs != "" && this.ScanInputs != "error decoding QR Code") {

    } else {
      // if any message is required to show then show.
      this.ScanInputs = "";
      return;
    }
    this.openPOLineModel;
    let piManualOrSingleDimentionBarcode = 0;
    // alert("check and scan code api call")
    var result = false;
    await this.commonservice.checkAndScanCode(this.openPOLineModel[0].CardCode, this.ScanInputs, this.ItemCode, this.tracking, "GRPO").subscribe(
      (data: any) => {
        //  alert("check and scan code api call response data:"+JSON.stringify(data));
        console.log("insie checkAndScanCode");
        if (data != null) {
          if (data[0].Error != null) {
            if (data[0].Error == "Invalidcodescan") {
              piManualOrSingleDimentionBarcode = 1
              this.ScanInputs = "";
              this.toastr.error('', this.translate.instant("InvalidScanCode"));
              // nothing is done in old code.
              result = false;
              return result
            } else if (data[0].Error == "SerialNotExists" || data[0].Error == "BatchNotExists") {
              result = false;
              return result
            } else if (data[0].Error == "SerialAlreadyExists") {
              piManualOrSingleDimentionBarcode = 1
              this.ScanInputs = "";
              this.toastr.error('', this.translate.instant("Serial already exists"));
              // nothing is done in old code.
              result = false;
              return result
            }
          }
          //console.log("Inapi call section openPoline::", JSON.stringify(this.openPOLineModel));
          // now check if the  code is for avilable item or not other wise invalid item error.
          var itemCode = this.openPOLineModel[0].ITEMCODE.toUpperCase()
          if (piManualOrSingleDimentionBarcode == 0) {
            if (data[0] != null && data[0].Value != null && (data[0].Value.toUpperCase() != itemCode.toUpperCase())) {
              this.toastr.error('', this.translate.instant("InvalidItemCode"));
              this.ScanInputs = "";
              result = false;
              return result;
            }
            result = true;
            var piExpDateExist = 0;
            //var oGetExpDate = oTextExpiryDate.getValue();
            var tracking = this.openPOLineModel[0].TRACKING;
            for (var i = 0; i < data.length; i++) {
              if (data[i].Key == '10' || data[i].Key == '21' || data[i].Key == '23') {
                this.ScanInputs = data[i].Value;
                // make sure ScanInputs variable me puri string aati hai.. to uski value change karne
                // se kuch affect na kare.
                //scan input field par set karna hai.. ye value 10,21,23 k case me.
              }
              if (data[i].Key == '15' || data[i].Key == '17') {
                var d = data[i].Value.split('/');
                var oepxpdt = d[0] + '/' + d[1] + '/' + d[2];
                // set value to date field
                this.expiryDate = oepxpdt;
                piExpDateExist = 1; //taken this variable for date purpose check if later used.
              }

              if (data[i].Key == '30' || data[i].Key == '310' ||
                data[i].Key == '315' || data[i].Key == '316' || data[i].Key == '320') {
                if (tracking == "S") {
                  //oAddserial.setValue("1");
                  this.qty = 1;
                }
                else {
                  this.qty = data[i].Value;
                }
                this.addQuantity();
              }
            }
          }

          var index = 0;
          var selectedMode = "WMS"; // I dont know why we are setting it to wms.
          let autoLots = JSON.parse(sessionStorage.getItem("primaryAutoLots"));
          if ((autoLots[0].AUTOLOT == "Y" || autoLots[0].AUTOLOT == "N" || autoLots[0].AUTOLOT == null)
            && selectedMode === "WMS" && tracking == "S" && this.ScanInputs != "") {
            //oAddserial.setValue("1");  I think not needed to set value because we are already setting in above code.
            this.scanQty.nativeElement.disabled = true;
          }
          else {
            //oAddserial.setValue("");
            this.scanQty.nativeElement.disabled = false;
          }

        }
      },
      error => {
        console.log("Error: ", error);
        this.targetWhse = "";
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
        result = false;
      });
    return result;
  }

  public displayPDF(dNo: string, noOfCopy) {
    this.showLoader = true;
    this.inboundService.printingServiceForSubmitGRPO(dNo, 6, noOfCopy).subscribe(
      (data: any) => {
        this.showLoader = false;
        if (data != undefined) {
          // console.log("" + data);
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }

          if (data.Detail != null && data.Detail != undefined && data.Detail[0] != null && data.Detail[0] != undefined) {
            this.fileName = data.Detail[0].FileName;
            this.base64String = data.Detail[0].Base64String;
          }


          if (this.base64String != null && this.base64String != "") {
            // this.showPdf(); // this function is used to display pdf in new tab.
            this.base64String = 'data:application/pdf;base64,' + this.base64String;
            this.displayPDF1 = true;
            //this.commonservice.refreshDisplyPDF(true);

          } else {
            // no data available then redirect to first screen.
            this.inboundMasterComponent.inboundComponent = 1;
          }
          //  console.log("filename:" + this.fileName);
          // console.log("filename:" + this.base64String);
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
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

  closePDF() {
    //close current screen and redirect to first screen.
    this.inboundMasterComponent.inboundComponent = 1;
    //console.log("PDF dialog is closed");
  }


  initModelDataFromReceipt() {
    this.receiptData = JSON.parse(sessionStorage.getItem("ProdReceptItem"));
    this.Ponumber = this.receiptData.OrderNo;
    this.tracking = this.receiptData.TRACKING;
    this.OpenQty = this.receiptData.OPENQTY;
    this.ItemCode = this.receiptData.ITEMCODE;
    var obj = {
      CardCode: this.receiptData.ITEMCODE + "", DOCENTRY: this.receiptData.RefDocEntry, DocNum: this.receiptData.RefDocEntry,
      FACTOR: 0, ITEMCODE: this.receiptData.ITEMCODE, ITEMNAME: this.receiptData.ITEMNAME, LINENUM: 0, OPENQTY: this.receiptData.OPENQTY,
      QCREQUIRED: this.receiptData.QCREQUIRED, ROWNUM: 0, RPTQTY: 0, SHIPDATE: new Date().toDateString(),
      TOTALQTYINVUOM: 0, TRACKING: this.receiptData.TRACKING, TargetBin: "", TargetWhs: "", UOM: "",
      UOMList: [], WHSE: this.receiptData.WhsCode, PalletCode: "", INVOPENQTY: 0, INVRPTQTY: 0
    }
    this.openPOLineModel[0] = obj;

  }

  public GetPalletListsForGRPO() {
    this.showLoader = true;
    this.inboundService.GetPalletListsForGRPO(PalletOperationType.None, this.openPOLineModel[0].ITEMCODE, this.RecvbBinvalue).subscribe(
      (data: any) => {
        this.showLoader = false;
        // console.log(data);
        if (data != null) {
          if (data.length > 0) {
            //console.log(data);
            this.showLookupLoader = false;
            this.serviceData = data;
            this.recreatePalletList();
            //this.palletValue = this.serviceData[0].Code;
            this.lookupfor = "PalletList";
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

  recreatePalletList() {
    var looseObj;
    var tempArr: any = [];
    for (let i = 0; i < this.serviceData.length; i++) {
      if (this.serviceData[i].Code == "Loose") {
        looseObj = this.serviceData[i];
        break;
      }
    }

    tempArr.push(looseObj);
    for (let i = 0; i < this.serviceData.length; i++) {
      if (this.serviceData[i].Code != "Loose") {
        tempArr.push(this.serviceData[i]);
      }
    }
    this.serviceData = tempArr;
  }

  onPalletScan() {
    // alert("scan click");
  }

  enableNewwPallet() {
    this.showNewPallet = true;
  }

  OnPalletChangeBlur() {
    if (this.isValidateCalled) {
      return;
    }
    this.OnPalletChange();
  }

  async OnPalletChange(): Promise<any> {
    if (this.palletValue == "" || this.palletValue == undefined) {
      return;
    }

    this.showLoader = true;
    var result = false;
    await this.inboundService.IsPalletValidForGRPO(this.palletValue, this.openPOLineModel[0].ITEMCODE, this.RecvbBinvalue).then(
      (data: any) => {
        console.log("inside inboundService.IsPalletValidForGRPO");
        this.showLoader = false;
        // console.log(data);
        if (data != null) {
          if (data.length > 0) {
            this.palletValue = data[0].Code;
            result = true;
          } else {
            this.toastr.error('', this.translate.instant("InValidPalletNo"));
            this.palletValue = "";
            this.scanPallet.nativeElement.focus()
            result = false;
          }
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          this.palletValue = "";
          this.scanPallet.nativeElement.focus()
          result = false;
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
        //this.toastr.error('', this.translate.instant("InValidPalletNo"));
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
        }
        result = false;
      }
    );
    return result
  }


  prepareLotData(receiveingQuantityBinArray): any {
    var Lots: any = [];
    if (receiveingQuantityBinArray != null && receiveingQuantityBinArray.length > 0) {
      for (let i = 0; i < receiveingQuantityBinArray.length; i++) {
        var palCode = "";
        var ActualLotNumber = "";
        if (receiveingQuantityBinArray[i].PalletCode != null && receiveingQuantityBinArray[i].PalletCode != undefined) {
          palCode = receiveingQuantityBinArray[i].PalletCode
        } else {
          palCode = ""
        }

        if (receiveingQuantityBinArray[i].PalletCode != null && receiveingQuantityBinArray[i].PalletCode != undefined) {
          ActualLotNumber = receiveingQuantityBinArray[i].VendorLot
        } else {
          ActualLotNumber = ""
        }
        Lots.push({
          Bin: receiveingQuantityBinArray[i].Bin,
          LineNo: 0, //abhi k lea kea h need to check
          LotNumber: receiveingQuantityBinArray[i].LotNumber,
          LotQty: receiveingQuantityBinArray[i].LotQty,//need to check
          ExpiryDate: this.GetReceiptSubmitDateFormat(receiveingQuantityBinArray[i].expiryDate),
          UIexpiryDate: receiveingQuantityBinArray[i].expiryDate,
          PalletCode: palCode,
          ActualLotNo: ActualLotNumber,
        });
      }
    } else {
      //nothing to do
    }
    return Lots;
  }
  prepareRejectLotData(receiveingQuantityBinArray): any {
    var RejectLots: any = [];
    if (receiveingQuantityBinArray != null && receiveingQuantityBinArray.length > 0) {
      for (let i = 0; i < receiveingQuantityBinArray.length; i++) {
        var palCode = "";
        var ActualLotNumber = "";
        if (receiveingQuantityBinArray[i].PalletCode != null && receiveingQuantityBinArray[i].PalletCode != undefined) {
          palCode = receiveingQuantityBinArray[i].PalletCode
        } else {
          palCode = ""
        }

        if (receiveingQuantityBinArray[i].PalletCode != null && receiveingQuantityBinArray[i].PalletCode != undefined) {
          ActualLotNumber = receiveingQuantityBinArray[i].VendorLot
        } else {
          ActualLotNumber = ""
        }

        RejectLots.push({
          Bin: receiveingQuantityBinArray[i].Bin,
          LineNo: 1, //for reject lot item. (crosscheck)
          LotNumber: receiveingQuantityBinArray[i].LotNumber,
          LotQty: receiveingQuantityBinArray[i].LotQty,
          ExpiryDate: this.GetReceiptSubmitDateFormat(receiveingQuantityBinArray[i].expiryDate),
          UIexpiryDate: receiveingQuantityBinArray[i].expiryDate,
          PalletCode: palCode,
          ActualLotNo: ActualLotNumber,
        })
      }
    } else {
    }
    return RejectLots;
  }
  Transaction: string = "ProductionReceipt";
  ONLINEPOSTING: string = null;
  prepareCommonReceiptItemData(totalAcceptedRejectedQty: any): any {
    var itemsData: any = [];
    if (totalAcceptedRejectedQty == 0) {
      // nothing to do.
    } else {
      itemsData.push({
        DiServerToken: sessionStorage.getItem("Token"),
        CompanyDBId: sessionStorage.getItem("CompID"),
        Transaction: this.Transaction,
        RECUSERID: sessionStorage.getItem("UserId"),
        ONLINEPOSTING: this.ONLINEPOSTING,
        BATCHNO: this.receiptData.OrderNo,
        LineNo: 0,//abhi k lea kea h need to check
        RefDocEntry: this.receiptData.RefDocEntry,
        RejectQTY: this.availableRejQty,// ckeck shayad sari reject qty ya fir added qty bhajna h
        RecRjctedQty: "Y",
        DOCENTRY: this.receiptData.RefDocEntry,
        Quantity: totalAcceptedRejectedQty,
        ItemCode: this.receiptData.ITEMCODE,
        POSTEDFGQTY: this.receiptData.POSTEDFGQTY,
        PASSEDQTY: this.receiptData.PASSEDQTY,
        AcctDefectQty: this.receiptData.ACCTDEFECTQTY,
        FGQTYTOPOST: this.receiptData.ORIGINALACTUALQUANTITY,//abhi k lea need to check
        WhsCode: this.receiptData.WhsCode,
        Tracking: this.receiptData.TRACKING,
        IsPalletExist: this.isPalletizationEnable,
        LoginId: sessionStorage.getItem("UserId"),
        GUID: sessionStorage.getItem("GUID"),
        UsernameForLic: sessionStorage.getItem("UserId"),
        WONO: this.receiptData.OrderNo
      });
    }
    return itemsData;
  }

  public prepareCommonReceiptRejectItemData(totalAcceptedRejectedQty: any): any {
    var rejectItemsData: any = [];
    if (totalAcceptedRejectedQty == 0) {
      // will return empty array
    } else {
      rejectItemsData.push({
        DiServerToken: sessionStorage.getItem("Token"),
        CompanyDBId: sessionStorage.getItem("CompID"),
        Transaction: this.Transaction,
        RECUSERID: sessionStorage.getItem("UserId"),
        UsernameForLic: sessionStorage.getItem("UserId"),
        ONLINEPOSTING: this.ONLINEPOSTING,
        BATCHNO: this.receiptData.OrderNo,
        LineNo: 1,//abhi k lea kea h need to check
        RefDocEntry: this.receiptData.RefDocEntry,
        DOCENTRY: this.receiptData.RefDocEntry,
        ItemCode: this.receiptData.ITEMCODE,
        WhsCode: this.receiptData.WhsCode,
        POSTEDFGQTY: this.receiptData.POSTEDFGQTY,
        PASSEDQTY: this.receiptData.PASSEDQTY,
        AcctDefectQty: this.receiptData.ACCTDEFECTQTY,
        FGQTYTOPOST: this.receiptData.ORIGINALACTUALQUANTITY,//abhi k lea need to check
        Tracking: this.receiptData.TRACKING,
        IsPalletExist: this.isPalletizationEnable,
        LoginId: sessionStorage.getItem("UserId"),
        RejectQTY: this.receiptData.OPENQTY,
        RecRjctedQty: "Y",
        Quantity: totalAcceptedRejectedQty,
        WONO: this.receiptData.OrderNo
      });
    }
    return rejectItemsData;
  }

  onCheckChange() {
    this.newCreatedPalletNo = "";
    if (sessionStorage.getItem('FromReceiptProd') == 'true') {
      this.showInputDialog("NewPallet_GRPO", this.translate.instant("Done"), this.translate.instant("Cancel"),
        this.translate.instant("Plt_CreateNewPallet"));
    } else {
      this.showInputDialog("NewPallet_GRPO", this.translate.instant("Done"), this.translate.instant("Cancel"),
        this.translate.instant("Plt_CreateNewPallet"));
    }
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
            this.palletValue = this.newCreatedPalletNo;
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

  checkAndValidateSerial(lotTemplateVar, serialBatchNo, i) {
    var type = 0;
    var itemcode = ""
    var orderNo = "";
    if (this.fromReceiptProduction) {
      orderNo = this.receiptData.OrderNo;
      itemcode = this.receiptData.ITEMCODE;
      if (this.receiptData.status == "Accept")
        type = 0;
      else
        type = 1;
    }
    this.checkValidateSerialSubs = this.productionService.isSerialExists(serialBatchNo,
      itemcode, type, this.tracking, orderNo,
      this.fromReceiptProduction).subscribe(
        data => {
          if (data != undefined) {
            if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
              this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                this.translate.instant("CommonSessionExpireMsg"));
              return;
            }
            //check and update response for entered serial no.
            if (data == "1") {
              //error message
              this.toastr.error('', this.translate.instant("ProdReceipt_SerialNoAlreadyUsed"));
              this.serialBatchNo = "";
              //   this.recvingQuantityBinArray[i].VendorLot = "";
              //  this.recvingQuantityBinArray[i].LotNumber = "";
              //       return;
              lotTemplateVar.value = "";
            } else if (data == "2") {
              this.toastr.error('', this.translate.instant("ProdReceipt_InvalidBatchSerial"));
              this.serialBatchNo = "";
              // this.recvingQuantityBinArray[i].VendorLot = "";
              // this.recvingQuantityBinArray[i].LotNumber = "";
              lotTemplateVar.value = "";
              //  return;
            } else {
              // allow data
              this.recvingQuantityBinArray[i].VendorLot = serialBatchNo;
              this.serialBatchNo = serialBatchNo;
              // this.isDisabledScanInput = true;
              this.recvingQuantityBinArray[i].LotNumber = serialBatchNo;
              var plt = (this.palletValue == "Loose") ? "" : this.palletValue;
              if (serialBatchNo != '' && serialBatchNo != undefined && plt != '') {
                this.recvingQuantityBinArray[i].LotNumber = serialBatchNo + "-" + plt;
              }
            }
          }
        },
        error => {
          if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
            this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
          }
          else {
            this.toastr.error('', error);
          }
        },
    );
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

  clearPalletItems(item) {
    //console.log(this.palletValue);
    for (var i = 0; i < this.recvingQuantityBinArray.length; i++) {
      if (this.palletValue == this.recvingQuantityBinArray[i].PalletCode) {
        this.recvingQuantityBinArray.splice(i)
        break;
      }
    }

    //enable disable buttons.
    if (this.recvingQuantityBinArray.length > 0) {
      if (!this.fromReceiptProduction) {
        this.showButton = true;
        this.showRecButton = true;
      } else {
        this.showRecButton = false;
        this.showButton = true;
      }
    } else {
      this.showButton = false;
      this.showRecButton = false;
    }
  }

  inputDialogFor: any;
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
        case ("NewPallet_GRPO"):
          this.createNewPallet($event.PalletNo, $event.BinNo);
          break
      }
    }
  }

  onHiddenTargetWhseClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('inbound_grpo_targetWhseInput')).value;
    if (inputValue.length > 0) {
      this.targetWhse = inputValue;
    }
    this.onQCWHSChange();
  }
  onHiddenTargetBinClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('inbound_grpo_targetBinInput')).value;
    if (inputValue.length > 0) {
      this.targetBin = inputValue;
    }
    this.OnTargetBinChange();
  }

  isValidateCalled: boolean = false;
  async validateBeforeSubmit(): Promise<any> {
    this.isValidateCalled = true;
    var currentFocus = document.activeElement.id;
    console.log("validateBeforeSubmit current focus: " + currentFocus);

    if (currentFocus != undefined) {
      if (currentFocus == "inboundGrpoRecBinInput") {
        return this.OnBinChange();
      }
      else if (currentFocus == "inboundGRPOPalletNo") {
        return this.OnPalletChange();
      }
      else if (currentFocus == "inboundScanInputField") {
        return this.onGS1ItemScan();
      }
    }
  }

  //--this code not required but we need to check proper then will remove it----------------------
  // oSavedPOLotsArray: any = [];
  // addToGRPOArray: any = [];
  // addToGRPOPONumbers: any = {};
  // poCode: any = {};

  // async  onAddtoGRPOClick() {
  //   this.poCode = this.Ponumber
  //   // await this.validateBeforeSubmit();

  //   this.oSavedPOLotsArray = JSON.parse(sessionStorage.getItem("GRPOReceieveData"));
  //   if (this.oSavedPOLotsArray != undefined && this.oSavedPOLotsArray != null && this.oSavedPOLotsArray != "") {
  //     if (sessionStorage.getItem("AddToGRPO") != "") {
  //       this.addToGRPOArray = JSON.parse(sessionStorage.getItem("AddToGRPO"));
  //       this.manageGRPOData();
  //     } else {
  //       this.addToGRPOArray.Header = [];
  //       this.addToGRPOArray.POReceiptLots = [];
  //       this.addToGRPOArray.POReceiptLotDetails = [];
  //       this.addToGRPOArray.UDF = [];
  //       this.addToGRPOArray.LastSerialNumber = [];
  //     }
  //     if (sessionStorage.getItem("addToGRPOPONumbers") != "") {
  //       this.addToGRPOPONumbers = JSON.parse(sessionStorage.getItem("addToGRPOPONumbers"));
  //       // this.managePONumberListData();
  //     } else {
  //       this.addToGRPOPONumbers.PONumbers = [];
  //     }
  //     var addpo = true;
  //     for (var i = 0; i < this.oSavedPOLotsArray.POReceiptLots.length; i++) {
  //       if (this.oSavedPOLotsArray.POReceiptLots[i].PONumber == this.poCode) {
  //         if (addpo) {

  //           let isExist = false;
  //           for (var c = 0; c < this.addToGRPOPONumbers.PONumbers.length; c++) {
  //             if (this.addToGRPOPONumbers.PONumbers[c].PONumber == this.poCode) {
  //               // this.addToGRPOPONumbers.PONumbers.splice(c, 1);
  //               this.addToGRPOPONumbers.PONumbers[c].PONumber = this.oSavedPOLotsArray.POReceiptLots[i].PONumber;
  //               isExist = true;
  //             }
  //           }

  //           if (!isExist) {
  //             this.addToGRPOPONumbers.PONumbers.push({
  //               PONumber: this.oSavedPOLotsArray.POReceiptLots[i].PONumber
  //             });
  //           }

  //           addpo = false;
  //         }

  //         this.addToGRPOArray.POReceiptLots.push({
  //           OPTM_TYPE: this.oSavedPOLotsArray.POReceiptLots[i].OPTM_TYPE,
  //           DiServerToken: sessionStorage.getItem("Token"),
  //           PONumber: this.oSavedPOLotsArray.POReceiptLots[i].PONumber,
  //           DocEntry: this.oSavedPOLotsArray.POReceiptLots[i].DocEntry,
  //           CompanyDBId: sessionStorage.getItem("CompID"),
  //           LineNo: this.oSavedPOLotsArray.POReceiptLots[i].LineNo,
  //           ShipQty: this.oSavedPOLotsArray.POReceiptLots[i].ShipQty,
  //           OpenQty: this.oSavedPOLotsArray.POReceiptLots[i].OpenQty,
  //           WhsCode: sessionStorage.getItem("whseId"),
  //           Tracking: this.oSavedPOLotsArray.POReceiptLots[i].Tracking,
  //           ItemCode: this.oSavedPOLotsArray.POReceiptLots[i].ItemCode,
  //           LastSerialNumber: 0,
  //           Line: this.oSavedPOLotsArray.POReceiptLots[i].Line,
  //           GUID: sessionStorage.getItem("GUID"),
  //           UOM: this.oSavedPOLotsArray.POReceiptLots[i].UOM,
  //           UsernameForLic: sessionStorage.getItem("UserId")
  //         });

  //         for (var j = 0; j < this.oSavedPOLotsArray.POReceiptLotDetails.length; j++) {
  //           if (this.oSavedPOLotsArray.POReceiptLotDetails[j].ParentLineNo == this.oSavedPOLotsArray.POReceiptLots[i].Line) {
  //             this.addToGRPOArray.POReceiptLotDetails.push({
  //               Bin: this.oSavedPOLotsArray.POReceiptLotDetails[j].Bin,
  //               LineNo: this.oSavedPOLotsArray.POReceiptLotDetails[j].LineNo,
  //               LotNumber: this.oSavedPOLotsArray.POReceiptLotDetails[j].LotNumber,
  //               LotQty: this.oSavedPOLotsArray.POReceiptLotDetails[j].LotQty,
  //               SysSerial: "0",
  //               ExpireDate: this.oSavedPOLotsArray.POReceiptLotDetails[j].ExpireDate,
  //               VendorLot: this.oSavedPOLotsArray.POReceiptLotDetails[j].VendorLot,
  //               SuppSerial: this.oSavedPOLotsArray.POReceiptLotDetails[j].SuppSerial,
  //               ParentLineNo: this.oSavedPOLotsArray.POReceiptLotDetails[j].ParentLineNo,
  //               PalletCode: this.oSavedPOLotsArray.POReceiptLotDetails[j].PalletCode,
  //               ItemCode: this.oSavedPOLotsArray.POReceiptLotDetails[j].ItemCode,
  //               LotSteelRollId: ""
  //             });
  //           }
  //         }

  //         for (var k = 0; k < this.oSavedPOLotsArray.UDF.length; k++) {
  //           if (this.oSavedPOLotsArray.UDF[k].Key == "OPTM_TARGETWHS" &&
  //             this.oSavedPOLotsArray.UDF[k].LineNo == this.oSavedPOLotsArray.POReceiptLots[i].Line) {
  //             this.addToGRPOArray.UDF.push({
  //               Key: "OPTM_TARGETWHS",//UDF[iIndex].Key,
  //               Value: this.oSavedPOLotsArray.UDF[k].Value,
  //               Flag: 'D',
  //               LineNo: this.oSavedPOLotsArray.UDF[k].LineNo
  //             });
  //           }

  //           if (this.oSavedPOLotsArray.UDF[k].Key == "OPTM_TARGETBIN" &&
  //             this.oSavedPOLotsArray.UDF[k].LineNo == this.oSavedPOLotsArray.POReceiptLots[i].Line) {
  //             this.addToGRPOArray.UDF.push({
  //               Key: "OPTM_TARGETBIN",
  //               Value: this.oSavedPOLotsArray.UDF[k].Value,
  //               Flag: 'D',
  //               LineNo: this.oSavedPOLotsArray.UDF[k].LineNo
  //             });
  //           }
  //         }

  //         for (var m = 0; m < this.oSavedPOLotsArray.LastSerialNumber.length; m++) {
  //           if (this.oSavedPOLotsArray.LastSerialNumber[m].ItemCode == this.oSavedPOLotsArray.POReceiptLots[i].ItemCode) {
  //             this.addToGRPOArray.LastSerialNumber.push({
  //               LastSerialNumber: this.oSavedPOLotsArray.LastSerialNumber[m].LastSerialNumber,
  //               LineId: this.oSavedPOLotsArray.LastSerialNumber[m].LineId,
  //               ItemCode: this.oSavedPOLotsArray.LastSerialNumber[m].ItemCode
  //             });
  //           }
  //         }
  //         this.addToGRPOArray.Header = [];
  //         this.addToGRPOArray.Header.push({
  //           NumAtCard: sessionStorage.getItem("VendRefNo")
  //         });
  //       }
  //     }
  //     sessionStorage.setItem("AddToGRPO", JSON.stringify(this.addToGRPOArray));
  //     sessionStorage.setItem("addToGRPOPONumbers", JSON.stringify(this.addToGRPOPONumbers));
  //   }
  //   sessionStorage.setItem("PONumber", "");
  //   // this.inboundMasterComponent.inboundComponent = 1;
  // }

  // manageGRPODatamanageGRPOData() {
  //   for (var i = 0; i < this.addToGRPOArray.POReceiptLots.length; i++) {
  //     if (this.addToGRPOArray.POReceiptLots[i].PONumber == this.poCode) {
  //       for (var j = 0; j < this.addToGRPOArray.POReceiptLotDetails.length; j++) {
  //         if (this.addToGRPOArray.POReceiptLotDetails[j].ParentLineNo == this.addToGRPOArray.POReceiptLots[i].Line) {
  //           this.addToGRPOArray.POReceiptLotDetails.splice(j, 1);
  //           j = -1;
  //         }
  //       }

  //       for (var k = 0; k < this.addToGRPOArray.UDF.length; k++) {
  //         if (this.addToGRPOArray.UDF[k].Key == "OPTM_TARGETWHS" &&
  //           this.addToGRPOArray.UDF[k].LineNo == this.addToGRPOArray.POReceiptLots[i].Line) {
  //           this.addToGRPOArray.UDF.splice(k, 1);
  //         }

  //         if (this.addToGRPOArray.UDF[k].Key == "OPTM_TARGETBIN" &&
  //           this.addToGRPOArray.UDF[k].LineNo == this.addToGRPOArray.POReceiptLots[i].Line) {
  //           this.addToGRPOArray.UDF.splice(k, 1);
  //         }
  //       }

  //       for (var m = 0; m < this.addToGRPOArray.LastSerialNumber.length; m++) {
  //         if (this.addToGRPOArray.LastSerialNumber[m].ItemCode == this.addToGRPOArray.POReceiptLots[i].ItemCode) {
  //           this.addToGRPOArray.LastSerialNumber.splice(m, 1);
  //           m = -1;
  //         }
  //       }
  //       this.addToGRPOArray.POReceiptLots.splice(i, 1);
  //       i = -1;
  //     }
  //   }
  // }

  //--this code not required but we need to check proper then will remove it----------------------

  showUDF = false;
  UDFComponentData: IUIComponentTemplate[] = [];
  itUDFComponents: IUIComponentTemplate = <IUIComponentTemplate>{};
  templates = [];
  displayArea = "Header";
  btchIndex = 0;

  ShowUDF(displayArea, UDFButtonClicked, rowIndex?): boolean {
    if (displayArea == "Lot" && this.recvingQuantityBinArray[rowIndex].LotNumber == "") {
      if (this.openPOLineModel[0].TRACKING == "B") {
        this.toastr.error('', this.translate.instant("Inbound_BatchNotBlank"))
      } else {
        this.toastr.error('', this.translate.instant("Inbound_SerialNotBlank"))
      }
      return;
    }
    let UDF;
    if (this.fromReceiptProduction) {
      UDF = JSON.parse(sessionStorage.getItem("GRPOHdrUDF"));
    } else {
      UDF = this.inboundMasterComponent.getUDF()
    }
    let subarray = [];
    let lineno = 0;
    if (this.fromReceiptProduction) {
      lineno = this.receiptData.status == "Accept" ? 0 : 1
    } else {
      lineno = this.openPOLineModel[0].LINENUM;
    }
    UDF.forEach(e => {
      if (e.LineNo == lineno && e.DocEntry == this.openPOLineModel[0].DOCENTRY && e.Flag == "L" && e.LotNo == this.recvingQuantityBinArray[rowIndex].LotNumber) {
        subarray.push(e);
      }
    });
    // let index = this.UDF.findIndex(e => e.LineNo == lineNum);
    // if (index == -1) {
    this.btchIndex = rowIndex;
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
    return true
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
      let lineNum = this.UDFlineNo
      if (this.UDFlineNo == -1) {
        lineNum = Number(sessionStorage.getItem("Line"))
      }
      while (this.UDF.length > 0) {
        let index = this.UDF.findIndex(e => e.LineNo == lineNum);
        if (index == -1) {
          break;
        }
        this.UDF.splice(index, 1);
      }
      if (itUDFComponentData.length > 0) {
        if (sessionStorage.getItem("Line") == null || sessionStorage.getItem("Line") == undefined ||
          sessionStorage.getItem("Line") == "") {
          sessionStorage.setItem("Line", "0");
        }
        for (var i = 0; i < itUDFComponentData.length; i++) {
          // oWhsTransAddLot.UDF = itUDFComponentData;
          let value = "";
          if (itUDFComponentData[i].istextbox) {
            value = itUDFComponentData[i].textBox;
          } else {
            value = itUDFComponentData[i].dropDown.FldValue;
          }
          this.UDF.push({
            Flag: "D",
            LineNo: lineNum,
            Value: value,
            Key: itUDFComponentData[i].AliasID,

          });
        }
      }
    } else if (this.displayArea == "Lot") {
      let UDF;
      if (this.fromReceiptProduction) {
        UDF = JSON.parse(sessionStorage.getItem("GRPOHdrUDF"));
      } else {
        UDF = this.inboundMasterComponent.getUDF()
      }
      let lineno = 0;
      if (this.fromReceiptProduction) {
        lineno = this.receiptData.status == "Accept" ? 0 : 1
      } else {
        lineno = this.openPOLineModel[0].LINENUM;
      }
      while (UDF.length > 0) {
        let index = UDF.findIndex(e => e.LineNo == lineno && e.DocEntry == this.openPOLineModel[0].DOCENTRY && e.Flag == "L" && e.LotNo == this.recvingQuantityBinArray[this.btchIndex].LotNumber)
        if (index == -1) {
          break;
        }
        UDF.splice(index, 1);
      }
      for (var i = 0; i < itUDFComponentData.length; i++) {
        // oWhsTransAddLot.UDF = itUDFComponentData;
        let value = "";
        if (itUDFComponentData[i].istextbox) {
          value = itUDFComponentData[i].textBox;
        } else {
          value = itUDFComponentData[i].dropDown.FldValue;
        }
        UDF.push({
          Flag: "L",
          LineNo: lineno,
          Value: value,
          Key: itUDFComponentData[i].AliasID,
          DocEntry: this.openPOLineModel[0].DOCENTRY,
          LotNo: this.recvingQuantityBinArray[this.btchIndex].LotNumber,
          Bin: this.recvingQuantityBinArray[this.btchIndex].Bin
        });
      }

      if (this.fromReceiptProduction) {
        sessionStorage.setItem("GRPOHdrUDF", JSON.stringify(UDF));
      } else {
        this.inboundMasterComponent.updateUDF(UDF);
      }
    }
    this.templates = [];
  }

  onBtchSerChange() {

  }

  ScanBtchSerInputs = "";
  BtchSerData = [];
  GetBatchSerialForProdReceipt(event) {
    let btchser = "";
    if (event == 'blur') {
      btchser = this.ScanInputs
    }
    // this.showLookupLoader = true;
    // this.showLookup = false;
    this.productionService.GetBatchSerialForProdReceipt(this.Ponumber, this.receiptData.status, btchser).subscribe(
      (data: any) => {
        if (data != null) {
          if (data.length > 0) {
            if (event == 'blur') {
              let result = data.find(e=>e.OPTM_BTCHSERNO == this.ScanInputs);
              if(result == undefined){
                this.ScanInputs = "";
                this.toastr.error('', this.translate.instant("ProdReceipt_InvalidBatchSerial"));
                return;
              }
              this.BtchSerData = data;
              this.ScanInputs = result.OPTM_BTCHSERNO;
              this.qty = result.OPTM_QUANTITY;
              this.btchserQty = result.OPTM_QUANTITY;
            } else {
              this.serviceData = data;
              this.BtchSerData = data;
              this.showLookupLoader = false;
              this.lookupfor = "GetBatSerProdRec";
            }
          }
          else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
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
}
