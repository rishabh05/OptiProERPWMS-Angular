import { Component, OnInit, ViewChild, ComponentFactory, Output, Input, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { InboundMasterComponent } from 'src/app/inbound/inbound-master.component';
import { Router } from '../../../../node_modules/@angular/router';
import { InboundService } from 'src/app/services/inbound.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { TranslateService, LangChangeEvent } from '../../../../node_modules/@ngx-translate/core';
import { UOM } from 'src/app/models/Inbound/UOM';
import { OpenPOLinesModel } from 'src/app/models/Inbound/OpenPOLinesModel';
import { RecvingQuantityBin } from 'src/app/models/Inbound/RecvingQuantityBin';
import { AutoLot } from 'src/app/models/Inbound/AutoLot';
import { ISubscription } from 'rxjs/Subscription';
import { ProductionService } from 'src/app/services/production.service';
import { PalletOperationType } from 'src/app/enums/PalletEnums';




@Component({
  selector: 'app-inbound-grpo',
  templateUrl: './inbound-grpo.component.html',
  styleUrls: ['./inbound-grpo.component.scss']
})
export class InboundGRPOComponent implements OnInit, AfterViewInit {

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
  qty: number = undefined;
  showButton: boolean = false;
  showRecButton: boolean = false;
  recvingQuantityBinArray: RecvingQuantityBin[] = [];
  defaultRecvBin: boolean = false;
  lookupEnable: boolean = false;
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
  @ViewChild('Quantity') QuantityField;
  serialBatchNo: string = "";

  //receipt production variables.
  receiptData: any;
  fromReceiptProduction: boolean = false;
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
  newCreatedPalletNo: string;
  constructor(private inboundService: InboundService, private commonservice: Commonservice,
    private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent, private productionService: ProductionService) {
    // let userLang = navigator.language.split('-')[0];
    // userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    // translate.use(userLang);
    // translate.onLangChange.subscribe((event: LangChangeEvent) => {
    // });
  }
  ngAfterViewInit(): void {
    //console.log('view after init');
    // this.RecBinVal.nativeElement.focus();
    // this.itemCodeInput.nativeElement.focus();
  }

  ngOnInit() {
    if (localStorage.getItem("AutoPalletIdGenerationChecked") == "True") {
      this.autoGeneratePalletEnable = true;
    }

    if (localStorage.getItem("PalletizationEnabled") == "True" && localStorage.getItem("PalletizationEnabledForItem") == "True") {
      this.isPalletizationEnable = true;
    } else {
      this.isPalletizationEnable = false;
    }

    if (localStorage.getItem('FromReceiptProd') == 'true') {
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
      this.availableRejQty = parseInt(localStorage.getItem("AvailableRejectQty"));


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
      let autoLots = JSON.parse(localStorage.getItem("primaryAutoLots"));
      // if (autoLots != null && autoLots != undefined && autoLots.length > 0 && autoLots[0].AUTOLOT == "Y") {
      //   this.isDisabledScanInput = true;
      // } else {
      //   this.isDisabledScanInput = false;
      // }

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
      this.getUOMList();
      this.LastSerialNumber = [];
      this.LineId = [];

      if (this.openPOLineModel != undefined && this.openPOLineModel != null) {
        this.Ponumber = this.openPOLineModel[0].DocNum;
        this.DocEntry = this.openPOLineModel[0].DOCENTRY;
        this.tracking = this.openPOLineModel[0].TRACKING;
        this.OpenQty = this.openPOLineModel[0].OPENQTY;
        this.ItemCode = this.openPOLineModel[0].ITEMCODE;
      }
      this.showSavedDataToGrid();
    }


    this.dateFormat = localStorage.getItem("DATEFORMAT");
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


      if (localStorage.getItem('FromReceiptProd') == 'true') {
        this.showScanInput = false;
        if (this.receiptData.status == "Accept"){
          if (this.RecvbBinvalue == "") {
            this.defaultRecvBin = true;
            // this.getDefaultFromBin();
            this.getScrapBin(this.receiptData.status);
            
          }
          this.lookupEnable = false;
        }else{
          this.getScrapBin(this.receiptData.status);
          this.lookupEnable = true;
        }
      } else {
        if (this.RecvbBinvalue == "") {
          this.defaultRecvBin = true;
          this.ShowBins();
        }
      }
    }
  }

  getScrapBin(status) {
    this.commonservice.GetDefaultBinOrBinWithQtyForProduction(this.ItemCode,
      localStorage.getItem("whseId"), status).subscribe(
        data => {
          if (data != null) {

            if(status == "Accept"){
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
            }else{
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

  getDefaultFromBin() {
    this.commonservice.GetDefaultBinOrBinWithQty(this.ItemCode,
      localStorage.getItem("whseId")).subscribe(
        data => {
          if (data != null) {

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
            // this.formatTransferNumbers();
            // this.formatOnHandQty();
            // let resultI = data.find(element => element.BINTYPE == 'I');
            // if (resultI != undefined) {
            //   this.fromBin = resultI.BINNO;
            //   return;
            // }
            // let resultQ = data.find(element => element.BINTYPE == 'Q');
            // if (resultQ != undefined) {
            //   this.fromBin = resultQ.BINNO;
            //   return;
            // }
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

    if (localStorage.getItem('FromReceiptProd') == 'true') {
      this.GetTargetBins();
    } else {
      this.targetBinClick = false;
      this.showLoader = true;
      this.inboundService.getRevBins(this.openPOLineModel[0].QCREQUIRED, this.openPOLineModel[0].ITEMCODE).subscribe(
        (data: any) => {
          this.showLoader = false;
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


  OnBinChange() {



    if (this.RecvbBinvalue == "") {
      return;
    }
    this.showLoader = true;
    this.inboundService.binChange(localStorage.getItem("whseId"), this.RecvbBinvalue).subscribe(
      (data: any) => {
        this.showLoader = false;
        //console.log(data);
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("INVALIDBIN"));
              this.RecvbBinvalue = "";
              return;
            }
            else {
              this.RecvbBinvalue = data[0].ID;
              // oCurrentController.isReCeivingBinExist();
            }
          }
        }
        else {
          this.toastr.error('', this.translate.instant("INVALIDBIN"));
          this.RecvbBinvalue = "";
          return;
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
      }
    );
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
  /**
   * Method to get list of uoms from server.
  */
  public getUOMList() {
    this.showLoader = true;
    this.inboundService.getUOMs(this.openPOLineModel[0].ITEMCODE).subscribe(
      (data: any) => {
        this.showLoader = false;
        //  console.log("UOM data response:", data);
        this.openPOLineModel[0].UOMList = data;
        if (this.openPOLineModel[0].UOMList.length > 0) {
          this.uomSelectedVal = this.openPOLineModel[0].UOMList[0];
          this.getUOMVal(this.UOMentry);
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
      this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantityValid"));
      this.qty = undefined;
      return false;
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
      this.toastr.error('', this.translate.instant("Inbound_NoOpenQuantityValid"));
      this.qty = undefined;
      return false;
    } else {
      return true;
    }
  }

  updateVendorLot(lotTemplateVar, value, rowindex) {
    value = value.trim();


    if (localStorage.getItem('FromReceiptProd') == 'true' && this.isPalletizationEnable) {
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

  updateLotNumber(lotTemplateVar,value, rowindex, gridData: any) {

    value = value.trim();


    if (localStorage.getItem('FromReceiptProd') == 'true') {
      this.checkAndValidateSerial(lotTemplateVar,value, rowindex);
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

  addQuantity() {
    if (this.qty == 0 || this.qty == undefined) {
      this.toastr.error('', this.translate.instant("Inbound_EnterQuantityErrMsg"));
      return;
    }
    if (!Number.isInteger(this.qty)) {
      this.toastr.error('', this.translate.instant("DecimalQuantity"));
      this.QuantityField.nativeElement.focus();
      return;
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
    if (!this.validateQuantity()) {
      return;
    }
    this.LastSerialNumber = [];
    this.LineId = [];
    if (this.isNonTrack) {
      this.addNonTrackQty(this.qty);
    } else {
      if (this.radioSelected == 0) {
        this.MfrSerial = this.ScanInputs;
      } else if (this.radioSelected == 1) {
        this.searlNo = this.ScanInputs;
      }
      let autoLots = JSON.parse(localStorage.getItem("primaryAutoLots"));
      if (this.isSerial) {
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
                if(this.isPalletizationEnable){
                  this.MfrSerial = this.searlNo;
                }
              }
              var autLotFlag = "false";
              // if (autoLots[0].AUTOLOT == "Y") {
              //   autLotFlag = "true";
              // }
              // if (autoLots != null && autoLots != undefined && autoLots.length > 0 && autoLots[0].AUTOLOT == "Y") {
              //   autLotFlag = "true";
              //   this.isDisabledScanInput = true;
              // } else {
              //   this.isDisabledScanInput = false;
              // }

              this.recvingQuantityBinArray.push(new RecvingQuantityBin(this.MfrSerial,
                this.searlNo, 1, this.RecvbBinvalue, this.expiryDate, plt, autLotFlag));
              this.qty = this.qty - 1;
            }
          } else {
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
    if (!Number.isInteger(this.qty)) {
      this.toastr.error('', this.translate.instant("DecimalQuantity"));
      this.QuantityField.nativeElement.focus();
      return;
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
    //quantitySum = 0;//this.openPOLineModel[0].RPTQTY;
    for (var i = 0; i < this.recvingQuantityBinArray.length; i++) {
      quantitySum += Number(this.recvingQuantityBinArray[i].LotQty);
    }
    if (this.openPOLineModel != null && this.openPOLineModel.length > 0) {
      this.openPOLineModel[0].RPTQTY = quantitySum;
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
          if(this.isPalletizationEnable){
            this.MfrSerial = this.searlNo;
          }
        }

        var autLotFlag = "false";
        // if (autoLots[0].AUTOLOT == "Y") {
        //   autLotFlag = "true";
        // }
        // if (autoLots != null && autoLots != undefined && autoLots.length > 0 && autoLots[0].AUTOLOT == "Y") {
        //   autLotFlag = "true";
        //   this.isDisabledScanInput = true;
        // } else {
        //   this.isDisabledScanInput = false;
        // }

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
        if (this.recvingQuantityBinArray.length > 0) {
          var finalString = this.getAutoLotStringOPR2(autoLots[i].STRING);
          autoLots[i].STRING = finalString;
          this.searlNo = this.searlNo + finalString;
          this.LastSerialNumber.push(this.getAutoLotStringOPR2(finalString))
          this.LineId.push(autoLots[i].LINEID);

        } else {
          var finalString = autoLots[i].STRING;
          this.searlNo = this.searlNo + finalString;
          this.LastSerialNumber.push(this.getAutoLotStringOPR2(finalString));
          this.LineId.push(autoLots[i].LINEID);
        }
      }
      if (autoLots[i].OPRTYPE == "2" && autoLots[i].OPERATION == "3") {
        if (this.recvingQuantityBinArray.length > 0) {
          var finalString = this.getAutoLotStringOPR3(autoLots[i].STRING);
          this.searlNo = this.searlNo + finalString;
          autoLots[i].STRING = finalString;
          this.LastSerialNumber.push(this.getAutoLotStringOPR3(autoLots[i].STRING));
          this.LineId.push(autoLots[i].LINEID);
        } else {
          var finalString = autoLots[i].STRING;
          this.searlNo = this.searlNo + finalString;
          this.LastSerialNumber.push(this.getAutoLotStringOPR3(autoLots[i].STRING));
          this.LineId.push(autoLots[i].LINEID);
        }
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
          // show pdf dialog
          this.yesButtonText = this.translate.instant("yes");
          this.noButtonText = this.translate.instant("no");
          this.dialogFor = "receiveMultiplePDFDialog";
          this.dialogMsg = this.translate.instant("Inbound_PrintAllLabelsAfterSubmit");
          this.operationType = "All";
          this.showConfirmDialog = true; // show dialog
          this.showPDF = true;
          break;
        case ("receiveSinglePDFDialog"):
          //do something. //yes mean all click
          this.submitCurrentGRPO();
          this.showPDF = true;
          break;
        case ("receiveMultiplePDFDialog"):
          // if pdf dialog yes click for multiple recevie.
          this.prepareAllData();
          break;
      }
    } else {
      if ($event.Status == "cancel") {
        // when user click on cross button nothing to do.
      } else {
        //means user click on negative button
        if ($event.From == "recCurrentOrAll") {
          //this.submitCurrentGRPO();
          this.yesButtonText = this.translate.instant("yes");
          this.noButtonText = this.translate.instant("no");
          this.dialogFor = "receiveSinglePDFDialog";
          this.dialogMsg = this.translate.instant("Inbound_PrintAllLabelsAfterSubmit");
          this.operationType = "Current";
          this.showConfirmDialog = true; // show dialog
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

  submitCurrentGRPO() {
    var oSubmitPOLotsObj: any = {};
    oSubmitPOLotsObj.Header = [];
    oSubmitPOLotsObj.POReceiptLots = [];
    oSubmitPOLotsObj.POReceiptLotDetails = [];
    oSubmitPOLotsObj.UDF = [];
    oSubmitPOLotsObj.LastSerialNumber = [];
    var oSubmitPOLotsObj = this.prepareSubmitPurchaseOrder(oSubmitPOLotsObj); // current data only.
    this.SubmitGoodsReceiptPO(oSubmitPOLotsObj);
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

  save() {
    if (this.IsQCRequired && (this.targetBin == null || this.targetBin == undefined || this.targetBin == "")) {
      this.toastr.error('', "Target Warehouse cannot be blank");
      return;
    } else if (this.IsQCRequired && (this.targetWhse == null || this.targetWhse == undefined || this.targetWhse == "")) {
      this.toastr.error('', "Target Bin cannot be blank");
      return;
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
    }

    if (this.fromReceiptProduction) {
      //prepare model for receipt from production

      this.saveReceiptProdData(this.receiptData.status);
      this.screenBackEvent.emit('save');
    } else {
      this.prepareCommonData();
      localStorage.setItem("PONumber", this.Ponumber);
      this.inboundMasterComponent.inboundComponent = 2;
    }
  }

  saveReceiptProdData(type: string) {
    var saveRecProdData: any = {};
    var dataModel = localStorage.getItem("GoodsReceiptModel");
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
            PalletCode: saveRecProdData.RejectLots[j].PalletCode,
            ActualLotNo: saveRecProdData.RejectLots[j].ActualLotNo
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
    localStorage.setItem("GoodsReceiptModel", JSON.stringify(saveRecProdData));
  }


  submitProductionReport(requestData: any) {
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
            // this.toastr.success( this.translate.instant("FGRSuccessMessage") +data[0].SuccessNo);
            this.toastr.success('', this.translate.instant("ProdReceipt_FGRSuccessMessage") + " " + data[0].SuccessNo);
            //  this.resetAfterSubmit();
          } else {
            if (data[0].ErrorMsg != "") {
              // show errro.
              this.toastr.error('', data[0].ErrorMsg);
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

  prepareAllData() {
    var oSubmitPOLotsObj: any = {};
    var dataModel = localStorage.getItem("AddToGRPO");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      oSubmitPOLotsObj.Header = [];
      oSubmitPOLotsObj.POReceiptLots = [];
      oSubmitPOLotsObj.POReceiptLotDetails = [];
      oSubmitPOLotsObj.UDF = [];
      oSubmitPOLotsObj.LastSerialNumber = [];
    } else {
      oSubmitPOLotsObj = JSON.parse(dataModel);
    }
    oSubmitPOLotsObj = this.prepareSubmitPurchaseOrder(oSubmitPOLotsObj);
    // localStorage.setItem("GRPOReceieveData", JSON.stringify(oSubmitPOLotsObj));
    // var dataModel = localStorage.getItem("AddToGRPO");
    // if (dataModel != null && dataModel != undefined && dataModel != "") {
    this.SubmitGoodsReceiptPO(oSubmitPOLotsObj);
    // }
  }

  showSavedDataToGrid() {
    this.openPOLineModel[0] = this.inboundMasterComponent.openPOmodel;
    if (this.openPOLineModel != undefined && this.openPOLineModel != null) {

    }
    var oSubmitPOLots: any = {};
    var dataModel = localStorage.getItem("GRPOReceieveData");
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
          this.getUOMVal(this.UOMentry)
          for (var j = 0; j < oSubmitPOLots.POReceiptLotDetails.length; j++) {
            if (oSubmitPOLots.POReceiptLotDetails[j].ParentLineNo == oSubmitPOLots.POReceiptLots[i].Line) {
              this.recvingQuantityBinArray.push(oSubmitPOLots.POReceiptLotDetails[j]);
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
            for (var m1 = 0; m1 < oSubmitPOLots.UDF.length; m1++) {
              if (oSubmitPOLots.UDF[m1].LineNo == oSubmitPOLots.POReceiptLots[i].Line) {
                this.targetWhse = oSubmitPOLots.UDF[m1].Value;
                this.targetBin = oSubmitPOLots.UDF[m1 + 1].Value;
                break;
              }
            }
          }
        }
      }
      // this.updateReceiveQty();
      this.openPOLineModel[0].RPTQTY = this.previousReceivedQty;

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
    var dataModel = localStorage.getItem("GoodsReceiptModel");
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
          //d this.UOMentry = oSubmitPOLots.POReceiptLots[i].UOM;
          for (var j = 0; j < submitRecProdData.Lots.length; j++) {
            //if (submitRecProdData.Lots[j].Bin == submitRecProdData.POReceiptLots[i].Line) {
            var obj: any = {
              LotNumber: submitRecProdData.Lots[j].LotNumber,
              LotQty: submitRecProdData.Lots[j].LotQty,
              LineNo: submitRecProdData.Lots[j].LineNo,
              Bin: submitRecProdData.Lots[j].Bin,
              ExpireDate: submitRecProdData.Lots[j].ExpiryDate
            }
            this.recvingQuantityBinArray.push(obj);
            this.previousReceivedQty = Number(this.previousReceivedQty) + Number(submitRecProdData
              .Lots[j].LotQty);
            this.openPOLineModel[0].RPTQTY = this.previousReceivedQty;
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
          //d this.UOMentry = oSubmitPOLots.POReceiptLots[i].UOM;
          for (var j = 0; j < submitRecProdData.RejectLots.length; j++) {
            //if (submitRecProdData.Lots[j].Bin == submitRecProdData.POReceiptLots[i].Line) {
            var obj: any = {
              LotNumber: submitRecProdData.RejectLots[j].LotNumber,
              LotQty: submitRecProdData.RejectLots[j].LotQty,
              LineNo: submitRecProdData.RejectLots[j].LineNo,
              Bin: submitRecProdData.RejectLots[j].Bin,
              ExpireDate: submitRecProdData.RejectLots[j].ExpiryDate
            }
            this.recvingQuantityBinArray.push(obj);
            this.previousReceivedQty = Number(this.previousReceivedQty) + Number(
              submitRecProdData.RejectLots[j].LotQty);
            this.openPOLineModel[0].RPTQTY = this.previousReceivedQty;
          }
          //d for (var m = 0; m < submitRecProdData.LastSerialNumber.length; m++) {
          //   this.LastSerialNumber.push(submitRecProdData.LastSerialNumber[m].LastSerialNumber);
          //   this.LineId.push(submitRecProdData.LastSerialNumber[m].LineId);
          // }
          // }
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


  manageRecords(oSubmitPOLotsObj: any): any {
    var size = oSubmitPOLotsObj.POReceiptLots.length;
    for (var i = 0; i < oSubmitPOLotsObj.POReceiptLots.length; i++) {
      if (oSubmitPOLotsObj.POReceiptLots[i].PONumber == this.Ponumber &&
        oSubmitPOLotsObj.POReceiptLots[i].ItemCode == this.openPOLineModel[0].ITEMCODE &&
        oSubmitPOLotsObj.POReceiptLots[i].LineNo == this.openPOLineModel[0].LINENUM) {
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

  receive(e) {
    //validating grid start.
    if (this.IsQCRequired && (this.targetBin == null || this.targetBin == undefined ||
      this.targetBin == "")) {
      this.toastr.error('', "Target Warehouse cannot be blank");
      return;
    } else if (this.IsQCRequired && (this.targetWhse == null || this.targetWhse == undefined || this.targetWhse == "")) {
      this.toastr.error('', "Target Bin cannot be blank");
      return;
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
    }
    //validating grid end.

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

      var dataModel: any = localStorage.getItem("GRPOReceieveData");
      if (dataModel == null || dataModel == undefined || dataModel == "") {
        //this.submitCurrentGRPO();
        // show print dialog here and onclick its handling.
        this.yesButtonText = this.translate.instant("yes");
        this.noButtonText = this.translate.instant("no");
        this.dialogFor = "receiveSinglePDFDialog";
        this.dialogMsg = this.translate.instant("Inbound_PrintAllLabelsAfterSubmit");
        this.showConfirmDialog = true; // show dialog

      } else {
        dataModel = this.manageRecords(JSON.parse(dataModel));
        if (dataModel == null || dataModel == undefined || dataModel == "" ||
          dataModel.POReceiptLots.length < 1) {
          this.yesButtonText = this.translate.instant("yes");
          this.noButtonText = this.translate.instant("no");
          this.dialogFor = "receiveSinglePDFDialog";
          this.dialogMsg = this.translate.instant("Inbound_PrintAllLabelsAfterSubmit");
          this.showConfirmDialog = true; // show dialog
          //this.submitCurrentGRPO();

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

  prepareSubmitPurchaseOrder(oSubmitPOLotsObj: any): any {
    oSubmitPOLotsObj = this.manageRecords(oSubmitPOLotsObj);
    if (localStorage.getItem("Line") == null || localStorage.getItem("Line") == undefined ||
      localStorage.getItem("Line") == "") {
      localStorage.setItem("Line", "0");
    }


    oSubmitPOLotsObj.POReceiptLots.push({
      DiServerToken: localStorage.getItem("Token"),
      PONumber: this.Ponumber,
      DocEntry: this.DocEntry,
      CompanyDBId: localStorage.getItem("CompID"),
      LineNo: this.openPOLineModel[0].LINENUM,
      ShipQty: this.openPOLineModel[0].RPTQTY.toString(),
      OpenQty: this.openPOLineModel[0].OPENQTY.toString(),
      WhsCode: localStorage.getItem("whseId"),
      Tracking: this.openPOLineModel[0].TRACKING,
      ItemCode: this.openPOLineModel[0].ITEMCODE,
      LastSerialNumber: 0,
      Line: Number(localStorage.getItem("Line")),
      GUID: localStorage.getItem("GUID"),
      UOM: this.uomSelectedVal.UomEntry,
      UsernameForLic: localStorage.getItem("UserId")

      //------end Of parameter For License----
    });
    // oSubmitPOLotsObj.UDF = [];
    oSubmitPOLotsObj.UDF.push({
      Key: "OPTM_TARGETWHS",//UDF[iIndex].Key,
      Value: this.targetWhse,
      //LotNo: UDF[iIndex].LotNo,
      Flag: 'D', // D = Line, H= Header, L = Lots
      LineNo: Number(localStorage.getItem("Line"))
    });
    oSubmitPOLotsObj.UDF.push({
      Key: "OPTM_TARGETBIN",//UDF[iIndex].Key,
      Value: this.targetBin,
      //LotNo: UDF[iIndex].LotNo,
      Flag: 'D', // D = Line, H= Header, L = Lots
      LineNo: Number(localStorage.getItem("Line"))
    });


    for (var iBtchIndex = 0; iBtchIndex < this.recvingQuantityBinArray.length; iBtchIndex++) {
      oSubmitPOLotsObj.POReceiptLotDetails.push({
        // POItemCode: this.Ponumber+this.openPOLineModel[0].ITEMCODE,
        Bin: this.recvingQuantityBinArray[iBtchIndex].Bin,
        LineNo: this.openPOLineModel[0].LINENUM,
        LotNumber: this.recvingQuantityBinArray[iBtchIndex].LotNumber, //getUpperTableData.GoodsReceiptLineRow[iBtchIndex].SysSerNo,
        LotQty: this.recvingQuantityBinArray[iBtchIndex].LotQty,
        SysSerial: "0",
        ExpireDate: this.GetSubmitDateFormat(this.expiryDate),//GetSubmitDateFormat(getUpperTableData.GoodsReceiptLineRow[iBtchIndex].EXPDATE), // oCurrentController.GetSubmitDateFormat(oActualGRPOModel.PoDetails[iIndex].ExpireDate),//oActualGRPOModel.PoDetails[iIndex].ExpireDate,
        VendorLot: this.recvingQuantityBinArray[iBtchIndex].VendorLot,
        //NoOfLabels: oActualGRPOModel.PoDetails[iIndex].NoOfLabels,
        //Containers: piContainers,
        SuppSerial: this.recvingQuantityBinArray[iBtchIndex].VendorLot,
        ParentLineNo: Number(localStorage.getItem("Line")),
        LotSteelRollId: "",
        ItemCode: this.openPOLineModel[0].ITEMCODE,
        PalletCode: this.recvingQuantityBinArray[iBtchIndex].PalletCode
      });
    }

    for (var iLastIndexNumber = 0; iLastIndexNumber < this.LastSerialNumber.length; iLastIndexNumber++) {
      oSubmitPOLotsObj.LastSerialNumber.push({
        LastSerialNumber: this.LastSerialNumber[iLastIndexNumber],
        LineId: this.LineId[iLastIndexNumber],
        ItemCode: this.openPOLineModel[0].ITEMCODE
      });
    }
    localStorage.setItem("Line", "" + (Number(localStorage.getItem("Line")) + 1));

    oSubmitPOLotsObj.Header.push({
      NumAtCard: localStorage.getItem("VendRefNo")
    });
    return oSubmitPOLotsObj;
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




  removePODetailData() {
    var inboundData = JSON.parse(localStorage.getItem("AddToGRPO"));
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

          for (var k = 0; k < inboundData.UDF.length; k++) {
            if (inboundData.UDF[k].Key == "OPTM_TARGETWHS" &&
              inboundData.UDF[k].LineNo == inboundData.POReceiptLots[i].Line) {
              inboundData.UDF.splice(k, 1);
            }

            if (inboundData.UDF[k].Key == "OPTM_TARGETBIN" &&
              inboundData.UDF[k].LineNo == inboundData.POReceiptLots[i].Line) {
              inboundData.UDF.splice(k, 1);
            }
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
      localStorage.setItem("AddToGRPO", JSON.stringify(inboundData));
    }



    var GRPOReceieveData = JSON.parse(localStorage.getItem("GRPOReceieveData"));
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

          for (var m = 0; m < GRPOReceieveData.LastSerialNumber.length; m++) {
            if (GRPOReceieveData.LastSerialNumber[m].ItemCode == GRPOReceieveData.POReceiptLots[i].ItemCode) {
              GRPOReceieveData.LastSerialNumber.splice(m, 1);
              m = -1;
            }
          }

          GRPOReceieveData.POReceiptLots.splice(i, 1);
        }
      }
      localStorage.setItem("GRPOReceieveData", JSON.stringify(GRPOReceieveData));
    }

  }



  SubmitGoodsReceiptPO(oSubmitPOLotsObj: any) {
    this.showLoader = true;
    this.inboundService.SubmitGoodsReceiptPO(oSubmitPOLotsObj).subscribe(
      (data: any) => {
        this.showLoader = false;
        //console.log(data);
        if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {

          if (this.operationType == "All") {
            localStorage.setItem("Line", "0");
            localStorage.setItem("GRPOReceieveData", "");
            localStorage.setItem("AddToGRPO", "");
            localStorage.setItem("addToGRPOPONumbers", "");
          } else if (this.operationType == "Current") {
            this.removePODetailData();
          } else {
            localStorage.setItem("Line", "0");
            localStorage.setItem("GRPOReceieveData", "");
            localStorage.setItem("AddToGRPO", "");
            localStorage.setItem("addToGRPOPONumbers", "");
          }


          this.toastr.success('', this.translate.instant("Inbound_GRPOSuccessMessage") + " " + data[0].SuccessNo);

          if (this.showPDF) {
            //show pdf
            this.displayPDF(data[0].DocEntry);
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
    if (localStorage.getItem('FromReceiptProd') == 'true') {
      this.screenBackEvent.emit('back');
      // this.productionReceiptItemListComponent.prodReceiptComponent = 1;
      //if we want to store something in local storage.
    } else {
      localStorage.setItem("PONumber", this.Ponumber);
      this.inboundMasterComponent.inboundComponent = 2;
    }

  }

  DeleteRowClick(rowindex, gridData: any) {
    if (this.recvingQuantityBinArray.length > 0) {
      var qtyForRemove = this.recvingQuantityBinArray[rowindex].LotQty;
      if (this.openPOLineModel[0].RPTQTY >= qtyForRemove) {
        this.openPOLineModel[0].RPTQTY = this.openPOLineModel[0].RPTQTY - qtyForRemove;
      }
    }
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
    this.inboundService.GetTargetBins('N', localStorage.getItem("whseId")).subscribe(
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

      }
      else if (this.lookupfor == "toWhsList") {
        // console.log("value of lots" + $event);
        //console.log("value of lots" + $event.LOTNO);
        this.targetWhse = $event[0];
        //this.itemCode = $event[2];
        this.targetBin = "";

      } else if (this.lookupfor == "PalletList") {
        this.palletValue = $event[0];
      }
    }
  }
  OnTargetBinChange() {
    if (this.targetBin == "") {
      return;
    }
    this.showLoader = true;
    this.inboundService.binChange(this.targetWhse, this.targetBin).subscribe(
      (data: any) => {
        this.showLoader = false;
        // console.log(data);
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("INVALIDBIN"));
              this.targetBin = "";
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
  onGS1ItemScan() {


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
    this.inboundService.checkAndScanCode(this.openPOLineModel[0].CardCode, this.ScanInputs).subscribe(
      (data: any) => {
        //  alert("check and scan code api call response data:"+JSON.stringify(data));

        //console.log("responseData: " + JSON.stringify(data));
        if (data != null) {
          if (data[0].Error != null) {
            if (data[0].Error == "Invalidcodescan") {
              piManualOrSingleDimentionBarcode = 1
              this.toastr.error('', this.translate.instant("InvalidScanCode"));
              // nothing is done in old code.
            } else {
              // some message is handle in else section in old code
              //return;
            }
            return;
          }
          //console.log("Inapi call section openPoline::", JSON.stringify(this.openPOLineModel));
          // now check if the  code is for avilable item or not other wise invalid item error.
          var itemCode = this.openPOLineModel[0].ITEMCODE.toUpperCase()
          if (piManualOrSingleDimentionBarcode == 0) {
            if (data[0] != null && data[0].Value != null && (data[0].Value.toUpperCase() != itemCode.toUpperCase())) {
              this.toastr.error('', this.translate.instant("InvalidItemCode"));
              this.ScanInputs = "";
              return;
            }

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
          let autoLots = JSON.parse(localStorage.getItem("primaryAutoLots"));
          if ((autoLots[0].AUTOLOT == "Y" || autoLots[0].AUTOLOT == "N" || autoLots[0].AUTOLOT == null)
            && selectedMode === "WMS" && tracking == "S" && this.ScanInputs != "") {
            //oAddserial.setValue("1");  I think not needed to set value because we are already setting in above code.
            this.QuantityField.nativeElement.disabled = true;
          }
          else {
            //oAddserial.setValue("");
            this.QuantityField.nativeElement.disabled = false;
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
      });
  }

  public displayPDF(dNo: string) {
    this.showLoader = true;
    this.inboundService.printingServiceForSubmitGRPO(dNo).subscribe(
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
    this.receiptData = JSON.parse(localStorage.getItem("ProdReceptItem"));
    this.Ponumber = this.receiptData.OrderNo;
    this.tracking = this.receiptData.TRACKING;
    this.OpenQty = this.receiptData.OPENQTY;
    this.ItemCode = this.receiptData.ITEMCODE;
    var obj = {
      CardCode: this.receiptData.ITEMCODE + "", DOCENTRY: this.receiptData.RefDocEntry, DocNum: this.receiptData.RefDocEntry,
      FACTOR: 0, ITEMCODE: this.receiptData.ITEMCODE, ITEMNAME: this.receiptData.ITEMNAME, LINENUM: 0, OPENQTY: this.receiptData.OPENQTY,
      QCREQUIRED: this.receiptData.QCREQUIRED, ROWNUM: 0, RPTQTY: 0, SHIPDATE: new Date().toDateString(),
      TOTALQTYINVUOM: 0, TRACKING: this.receiptData.TRACKING, TargetBin: "", TargetWhs: "", UOM: "",
      UOMList: [], WHSE: this.receiptData.WhsCode, PalletCode: ""
    }
    this.openPOLineModel[0] = obj;

  }

  public getPalletList() {
    this.showLoader = true;
    this.commonservice.getPalletList(PalletOperationType.None, this.openPOLineModel[0].ITEMCODE).subscribe(
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

  OnPalletChange() {



    if (this.palletValue == "" || this.palletValue == undefined) {
      return;
    }

    this.showLoader = true;
    this.commonservice.isPalletValid(this.palletValue).subscribe(
      (data: any) => {
        this.showLoader = false;
        // console.log(data);
        if (data != null) {
          if (data.length > 0) {
            this.palletValue = data[0].Code;
          } else {
            this.toastr.error('', this.translate.instant("InValidPalletNo"));
            this.palletValue = "";
            return;
          }
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          this.palletValue = "";
          return;
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
      }
    );
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
        DiServerToken: localStorage.getItem("Token"),
        CompanyDBId: localStorage.getItem("CompID"),
        Transaction: this.Transaction,
        RECUSERID: localStorage.getItem("UserId"),
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
        LoginId: localStorage.getItem("UserId"),
        GUID: localStorage.getItem("GUID"),
        UsernameForLic: localStorage.getItem("UserId"),
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
        DiServerToken: localStorage.getItem("Token"),
        CompanyDBId: localStorage.getItem("CompID"),
        Transaction: this.Transaction,
        RECUSERID: localStorage.getItem("UserId"),
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
        LoginId: localStorage.getItem("UserId"),
        RejectQTY: this.receiptData.OPENQTY,
        RecRjctedQty: "Y",
        Quantity: totalAcceptedRejectedQty,
        WONO: this.receiptData.OrderNo
      });
    }
    return rejectItemsData;
  }

  onCheckChange() {
    // this.showNewPallet = !this.showNewPallet;
    this.newCreatedPalletNo = "";
    // if (this.showNewPallet) {

    if (localStorage.getItem('FromReceiptProd') == 'true') {
      this.showInputDialog("", this.translate.instant("Done"), this.translate.instant("Cancel"),
        this.translate.instant("Plt_CreateNewPallet"));
    } else {
      this.showInputDialog("NewPallet_GRPO", this.translate.instant("Done"), this.translate.instant("Cancel"),
        this.translate.instant("Plt_CreateNewPallet"));
    }


    // }
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

  checkAndValidateSerial(lotTemplateVar,serialBatchNo, i) {
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
              this.recvingQuantityBinArray[i].VendorLot = "";
              this.recvingQuantityBinArray[i].LotNumber = "";
              lotTemplateVar.value = ""; 
              //       return;




              
            } else if (data == "2") {
              this.toastr.error('', this.translate.instant("ProdReceipt_InvalidBatchSerial"));
              this.serialBatchNo = "";
              this.recvingQuantityBinArray[i].VendorLot = "";
              this.recvingQuantityBinArray[i].LotNumber = "";
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
}
