import { Component, OnInit, Input, Output, EventEmitter, HostListener, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { UIHelper } from '../../helpers/ui.helpers';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { Commonservice } from '../../services/commonservice.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { InventoryTransferService } from '../../services/inventory-transfer.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { InboundService } from 'src/app/services/inbound.service';
import { IUIComponentTemplate } from 'src/app/common/ui-component.interface';
import { FieldAccessorPipe } from '../../../../node_modules/@progress/kendo-angular-grid/dist/es2015/rendering/common/field-accessor.pipe';
import { ModuleIds, ScreenIds, ControlIds } from '../../enums/enums';

@Component({
  selector: 'app-bin-transfer',
  templateUrl: './bin-transfer.component.html',
  styleUrls: ['./bin-transfer.component.scss']
})
export class BinTransferComponent implements OnInit {
  public gridData: any[];
  isMobile: boolean;
  gridHeight: number;
  showLoader: boolean = false;
  modalRef: BsModalRef;
  showLookupLoader: boolean = true;
  itemCode: string = "";
  lotValue: string = "";
  fromBin: string = "";
  transferQty: string = "0";
  itemName: string = "";
  ItemTracking: string = "";
  serviceData: any[];
  lookupfor: string;
  showItemName: boolean = false;
  showBatchNo: boolean = false;
  Remarks: string = "";
  onHandQty: any = "0";
  SysNumber: any;
  LotWhsCode: any;
  toBin: string = "";
  getDefaultBinFlag: boolean = false;
  isItemSerialTrack: boolean;
  editTransferQty: boolean;
  PageTitle: string;
  ModalContent: string;
  TransferedItemsDetail: any[] = [];
  UDF: any[] = [];
  respSuccssDocNo: any;
  @Input() fromScreen: any;
  @Output() cancelevent = new EventEmitter();
  batchNoPlaceholder: string = "";
  zero: string;
  showValidation: boolean = true;
  dialogFor: string;
  yesButtonText: string;
  noButtonText: string;
  showConfirmDialog = false;
  dialogMsg: string;

  pagable: boolean = false;
  pageSize: number = Commonservice.pageSize;
  operationType: string = "";
  itemIndex: number = -1;
  radioSelected: number = 0;
  palletNo: string = "";
  palletData: any = [];
  actualLotNo: any;
  public isPalletizationEnable: boolean;
  public isShipmentContainerEnable: boolean;
  dialogOpened: boolean = false;
  containerDialogOpened: boolean = false;
  selectedPallets: any = [];
  selectedContainers: any = [];
  checkChangeEvent: any;
  showBinFields: boolean = true;
  binOfSelectedPallet: any = "";
  binOfSelectedContainer: any = "";
  palletList: any = [];
  containerList: any = [];
  @ViewChild("scanItemCode") scanItemCode;
  @ViewChild("scanFromBin") scanFromBin;
  @ViewChild("scanToBin") scanToBin;
  @ViewChild("scanLotNo") scanLotNo;
  @ViewChild("scanPallet") scanPallet;
  @ViewChild("scanToBinOther") scanToBinOther;
  @ViewChild("scanTransQty") scanTransQty;
  @ViewChild("scanReason") scanReason;
  @ViewChild("scanReasonByPallet") scanReasonByPallet;

  // container variables;
  containerId: any = '';
  containerCode: any = '';
  containerData: any = [];
  IsUDFEnabled = "N";

  constructor(private commonservice: Commonservice, private activatedRoute: ActivatedRoute,
    private router: Router, private inventoryTransferService: InventoryTransferService, private inboundService: InboundService,
    private toastr: ToastrService, private translate: TranslateService,
    private modalService: BsModalService, private _location: Location, ) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  // Class variables
  public viewLines: boolean;

  // UI Section
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // apply grid height
    this.gridHeight = UIHelper.getMainContentHeight();

    // check mobile device
    this.isMobile = UIHelper.isMobile();

  }
  // End UI Section

  async ngOnInit() {
    this.batchNoPlaceholder = this.translate.instant("BatchNo");
    if (sessionStorage.getItem("PalletizationEnabled") == "True") {
      this.isPalletizationEnable = true;
    } else {
      this.isPalletizationEnable = false;
    }
    if (sessionStorage.getItem("isShipmentApplicable") == "True") {
      this.isShipmentContainerEnable = true;
    } else {
      this.isShipmentContainerEnable = false;
    }

    sessionStorage.setItem("radioSelection", "0");
    // apply grid height
    this.gridHeight = UIHelper.getMainContentHeight();

    // check mobile device
    this.isMobile = UIHelper.isMobile();

    //  this.getViewLineList();
    this.viewLines = false;

    this.showBinFields = true;
    if (sessionStorage.getItem("fromscreen") == "WhsTransfer") {
      this.PageTitle = this.translate.instant("WarehouseTransfer") + this.translate.instant("InvTransfer_From") + sessionStorage.getItem("fromwhseId") + this.translate.instant("InvTransfer_To") + sessionStorage.getItem("towhseId");
    } else if (sessionStorage.getItem("fromscreen") == "InventoryTransferRequest") {
      this.PageTitle = this.translate.instant("InventoryTransferRequest") + this.translate.instant("InvTransfer_From") + sessionStorage.getItem("fromwhseId") + this.translate.instant("InvTransfer_To") + sessionStorage.getItem("towhseId");
      this.showBinFields = false;
    } else {
      this.PageTitle = this.translate.instant("BinTransfer");
    }
    this.formatTransferNumbers();
    this.formatOnHandQty();
    this.zero = this.onHandQty;

    sessionStorage.setItem("LineNum", "0");
    this.IsUDFEnabled = sessionStorage.getItem("ISUDFEnabled");
    if (this.IsUDFEnabled == 'Y') {
      this.commonservice.GetWMSUDFBasedOnScreen("15108");
    }
    // await this.commonservice.getComponentVisibilityList(ModuleIds.WH_BIN_Transfer, ScreenIds.WH_BIN_Transfer, ControlIds.WH_BIN_View_Items_GRID);
    // let ItemDetailArr = this.commonservice.getComponentVisibility();
    // this.setAddedGridItemVisibility(ItemDetailArr);
  }

  gridColumnVisibilityArry: any = {};
  setAddedGridItemVisibility(ColumnArry){
    this.gridColumnVisibilityArry.ItemCode = ColumnArry.find(e=> e.OPTM_FIELDID == "ItemCode") != undefined? ColumnArry.find(e=> e.OPTM_FIELDID == "ItemCode").OPTM_VISIBILITYSTATUS:""
    this.gridColumnVisibilityArry.Qty = ColumnArry.find(e=> e.OPTM_FIELDID == "Qty") != undefined? ColumnArry.find(e=> e.OPTM_FIELDID == "Qty").OPTM_VISIBILITYSTATUS:""
    this.gridColumnVisibilityArry.LotNo = ColumnArry.find(e=> e.OPTM_FIELDID == "LotNo") != undefined? ColumnArry.find(e=> e.OPTM_FIELDID == "LotNo").OPTM_VISIBILITYSTATUS:""
    this.gridColumnVisibilityArry.BinNo = ColumnArry.find(e=> e.OPTM_FIELDID == "BinNo")!= undefined? ColumnArry.find(e=> e.OPTM_FIELDID == "BinNo").OPTM_VISIBILITYSTATUS:""
    this.gridColumnVisibilityArry.ToBin = ColumnArry.find(e=> e.OPTM_FIELDID == "ToBin")!= undefined? ColumnArry.find(e=> e.OPTM_FIELDID == "ToBin").OPTM_VISIBILITYSTATUS:""
  }

  ngAfterViewInit(): void {
    this.scanItemCode.nativeElement.focus();
    setTimeout(() => {
      if (sessionStorage.getItem("fromscreen") == "WhsTransfer") {
        this.PageTitle = this.translate.instant("WarehouseTransfer") + this.translate.instant("InvTransfer_From") + sessionStorage.getItem("fromwhseId") + this.translate.instant("InvTransfer_To") + sessionStorage.getItem("towhseId");
      } else if (sessionStorage.getItem("fromscreen") == "InventoryTransferRequest") {
        this.PageTitle = this.translate.instant("InventoryTransferRequest") + this.translate.instant("InvTransfer_From") + sessionStorage.getItem("fromwhseId") + this.translate.instant("InvTransfer_To") + sessionStorage.getItem("towhseId");
      } else {
        this.PageTitle = this.translate.instant("BinTransfer");
      }
    }, 500)
  }


  /** Simple method to toggle element visibility */
  public ShowSavedData(): void {
    console.log("TransferedItemsDetail length " + this.TransferedItemsDetail.length)
    console.log("TransferedItemsDetail " + JSON.stringify(this.TransferedItemsDetail))
    this.operationType = "viewlines";
    if (this.TransferedItemsDetail.length > 0) {
      this.viewLines = !this.viewLines;
    } else {
      this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
    }
  }

  public getViewLineList() {
    this.showLoader = true;
    setTimeout(() => {
      this.showLoader = false;
    }, 1000);
  }


  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'modal-dialog-centered' })
    );
  }
  @ViewChild('autoShownModal') autoShownModal: ModalDirective;
  @ViewChild('transferedItemsBtn') transferedItemsBtn: ElementRef;
  isModalShown: boolean = false;

  showModal(): void {
    this.isModalShown = true;
  }

  hideModal(): void {
    this.autoShownModal.hide();
  }

  onHidden(): void {
    this.isModalShown = false;
  }

  OnItemCodeLookupClick() {
    this.showLoader = true;
    this.inventoryTransferService.GetItemListForWhseTrnsfr().subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          // console.log("ItemList - " + data.toString());
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          this.serviceData = data;
          this.lookupfor = "ItemsList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
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

  OnItemCodeChangeBlur() {
    if (this.isValidateCalled) {
      return;
    }
    this.OnItemCodeChange();
  }

  async OnItemCodeChange(): Promise<any> {
    if (this.itemCode == "" || this.itemCode == undefined) {
      return;
    }
    this.showLoader = true;
    var result = false;
    await this.inventoryTransferService.GetItemCode(this.itemCode).then(
      data => {
        this.showLoader = false;
        console.log("inside item code validate");
        if (data != undefined && data.length > 0) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            result = false;
          }
          this.itemCode = data[0].ItemCode;
          if (this.itemCode != null && this.itemCode != undefined && this.itemCode != '') {
            this.getItemInfo();
          }
          result = true;
        } else {
          this.toastr.error('', this.translate.instant("InvalidItemCode"));
          this.itemCode = "";
          this.scanItemCode.nativeElement.focus();
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
    return result;
  }

  getItemInfo() {
    if (this.itemCode == "" || this.itemCode == undefined) {
      return;
    }
    this.showLoader = true;
    this.inventoryTransferService.getItemInfo(this.itemCode).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          // console.log("" + data);
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.itemCode = data[0].ITEMCODE;
          this.itemName = data[0].ITEMNAME;
          this.showItemName = true;
          this.ItemTracking = data[0].TRACKING;
          this.transferQty = "0.000";
          this.onHandQty = 0.000;
          this.CheckTrackingandVisiblity();
          this.formatOnHandQty();
          this.formatTransferNumbers();
          if (this.ItemTracking == 'N') {
            if ((sessionStorage.getItem("fromscreen") != "InventoryTransferRequest")) {
              this.getDefaultFromBin();
              this.scanFromBin.nativeElement.focus();
            }
          } else {
            this.getDefaultToBin();
            setTimeout(() => {
              this.scanLotNo.nativeElement.focus();
            }, 100);
          }
        } else {
          this.toastr.error('', this.translate.instant("InvalidItemCode"));
          this.showItemName = false;
          this.itemCode = "";
          this.fromBin = "";
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

  OnLotChangeBlur() {
    if (this.isValidateCalled) {
      return;
    }
    this.OnLotChange();
  }

  async OnLotChange(): Promise<any> {
    if (this.lotValue == "" || this.lotValue == undefined) {
      return;
    }
    this.showLoader = true;
    var result = false;
    await this.inventoryTransferService.getLotInfo(this.fromBin, this.itemCode, this.lotValue).then(
      data => {
        this.showLoader = false;
        if (data != null) {
          if (data.length == 0) {
            if (this.ItemTracking == "S") {
              this.toastr.error('', this.translate.instant("InvTransfer_InvalidSerial"));
            }
            else {
              this.toastr.error('', this.translate.instant("InvalidBatch"));
            }
            this.lotValue = "";
            this.onHandQty = 0;
            this.transferQty = "0";
            this.formatTransferNumbers();
            this.formatOnHandQty();
            this.fromBin = "";
            result = false;
          }
          else {
            this.lotValue = data[0].LOTNO;
            this.onHandQty = data[0].TOTALQTY;
            this.transferQty = this.onHandQty
            this.formatTransferNumbers();
            this.formatOnHandQty();
            this.SysNumber = data[0].SYSNUMBER;
            if (data.length > 1) {
              this.lookupfor = "BatchNoList2";
              this.serviceData = data;
              this.showLookupLoader = false;
            } else {
              this.fromBin = data[0].BINNO;
            }
            result = true;
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
        result = false;
      }
    );
    return result;
  }

  getDefaultFromBin() {
    this.inventoryTransferService.GetDefaultBinOrBinWithQty(this.itemCode,
      sessionStorage.getItem("fromwhseId")).subscribe(
        data => {
          if (data != null) {

            let resultV = data.find(element => element.BINTYPE == '1');
            if (resultV != undefined) {
              this.fromBin = resultV.BINNO;
              this.transferQty = resultV.TOTALQTY;
              this.onHandQty = resultV.TOTALQTY;
              this.formatTransferNumbers();
              this.formatOnHandQty();
              if (this.ItemTracking == 'N') {
                this.getDefaultToBin();
              }
              return;
            }
            let resultD = data.find(element => element.BINTYPE == '2');
            if (resultD != undefined) {
              this.fromBin = resultD.BINNO;
              this.transferQty = resultD.TOTALQTY;
              this.onHandQty = resultD.TOTALQTY;
              this.formatTransferNumbers();
              this.formatOnHandQty();
              if (this.ItemTracking == 'N') {
                this.getDefaultToBin();
              }
              return;
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

  getDefaultToBin() {
    this.inventoryTransferService.GetToBinForWhsTrnsfr(this.itemCode,
      sessionStorage.getItem("towhseId")).subscribe(
        data => {
          if (data != null) {
            let resultV = data.find(element => element.BINTYPE == '1');
            if (resultV != undefined) {
              if (this.fromBin === resultV.BinCode) {

              } else {
                this.toBin = resultV.BinCode;
                return;
              }
            }
            let resultD = data.find(element => element.BINTYPE == '2');
            if (resultD != undefined) {
              if (this.fromBin === resultD.BinCode) {

              } else {
                this.toBin = resultD.BinCode;
                return;
              }
            }
            let resultI = data.find(element => element.BINTYPE == '3');
            if (resultI != undefined) {
              if (this.fromBin === resultI.BinCode) {

              } else {
                this.toBin = resultI.BinCode;
                return;
              }
            }
            let resultQ = data.find(element => element.BINTYPE == '4');
            if (resultQ != undefined) {
              if (this.fromBin === resultQ.BinCode) {

              } else {
                this.toBin = resultQ.BinCode;
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


  getDefaultBin() {
    this.inventoryTransferService.getDefaultBin(this.itemCode, sessionStorage.getItem("towhseId")).subscribe(
      data => {
        this.getDefaultBinFlag = true;
        if (data != null) {
          if (data != this.fromBin) {
            this.toBin = data;
          }
          return;
        }
        else {
          this.ShowToBins();
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

  ShowLOTList() {
    this.showLoader = true;
    this.inventoryTransferService.getLotList(sessionStorage.getItem("whseId"), this.fromBin, this.itemCode, this.lotValue).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          // console.log("ItemList - " + data);
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          for (var i = 0; i < data.length; i++) {
            data[i].TOTALQTY = data[i].TOTALQTY.toFixed(Number(sessionStorage.getItem("DecimalPrecision")));
          }
          this.serviceData = data;
          this.lookupfor = "BatchNoList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
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


  ShowFromBins() {
    this.showLoader = true;
    this.inventoryTransferService.getFromBins(this.ItemTracking, "", this.itemCode, this.lotValue).subscribe(
      data => {
        this.showLoader = false;
        if (data != null) {
          if (data.length > 0) {
            this.showLookupLoader = false;
            if (this.ItemTracking != "N") {
              this.lookupfor = "SBTrackFromBin";
            }
            else {
              this.lookupfor = "NTrackFromBin";
              for (var i = 0; i < data.length; i++) {
                data[i].TOTALQTY = data[i].TOTALQTY.toFixed(Number(sessionStorage.getItem("DecimalPrecision")));
              }
            }
            this.serviceData = data;
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

  OnFromBinChangeBlur() {
    if (this.isValidateCalled) {
      return;
    }
    this.OnFromBinChange();
  }

  async OnFromBinChange(): Promise<any> {
    if (this.fromBin == "" || this.fromBin == undefined) {
      return;
    }
    this.showLoader = true;
    var result = false;
    await this.inventoryTransferService.isFromBinExists(this.ItemTracking, this.fromBin, this.itemCode, this.lotValue).then(
      data => {
        this.showLoader = false;
        console.log("inside isFromBinExists")
        if (data != null) {
          if (data.length > 0) {
            if (this.ItemTracking == "N") {
              this.fromBin = data[0].BINNO;
              this.onHandQty = data[0].TOTALQTY.toString();
              this.transferQty = data[0].TOTALQTY.toString();
              this.SysNumber = data[0].SYSNUMBER;
              this.LotWhsCode = data[0].WHSCODE;
              this.formatOnHandQty();
              this.formatTransferNumbers();
              result = true;
            }
            else {
              if (data[0].Result == "0") {
                this.toastr.error('', this.translate.instant("INVALIDBIN"));
                this.fromBin = "";
                result = false;
              }
              else {
                this.fromBin = data[0].ID;
                if (this.toBin == this.fromBin) {
                  this.toastr.error('', this.translate.instant("FrmNToBinCantSame"));
                  this.fromBin = "";
                  result = false;
                }
                result = true;
              }
            }
          }
          else {
            this.fromBin = "";
            this.toastr.error('', this.translate.instant("INVALIDBIN"));
            result = false;
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
        result = false;
      }
    );
    return result;
  }

  OnToBinChangeBlur() {
    if (this.isValidateCalled) {
      return;
    }
    this.OnToBinChange();
  }

  async OnToBinChange(): Promise<any> {
    if (this.toBin == "" || this.toBin == undefined) {
      return false;
    }
    var result = false;
    this.showLoader = true;
    await this.inventoryTransferService.isToBinExist(this.toBin, sessionStorage.getItem("towhseId")).then(
      data => {
        this.showLoader = false;
        console.log("inside isToBinExist")
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("INVALIDBIN"));
              this.toBin = "";
              result = false;
            }
            else {
              this.toBin = data[0].ID;
              if (this.toBin == this.fromBin) {
                this.toastr.error('', this.translate.instant("FrmNToBinCantSame"));
                this.toBin = "";
                result = false;
              }
              result = true;
            }
          }
          else {
            this.toBin = "";
            this.toastr.error('', this.translate.instant("INVALIDBIN"));
            result = false;
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
        result = false;
      }
    );
    return result;
  }

  ShowToBins() {
    this.showLoader = true;
    this.inventoryTransferService.getToBin(this.fromBin, sessionStorage.getItem("towhseId")).subscribe(
      data => {
        this.showLoader = false;
        if (data != null) {
          if (data.length > 0) {

            if (this.getDefaultBinFlag == false) {
              this.showLookupLoader = false;
              this.serviceData = data;
              this.lookupfor = "toBinsList";
            }
            else {
              if (data[0].BINNO != this.fromBin) {
                this.toBin = data[0].BINNO;
              }
              this.getDefaultBinFlag = false;
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

  IsInvTransferDetailLineExists(Item: string, LotNumber: string, Binno: string, ToBin: string, remarks: string, InvType: string): any {
    var sumLotQuantity = 0;
    for (var i = 0; i < this.TransferedItemsDetail.length; i++) {
      if (this.TransferedItemsDetail[i].ItemCode == Item &&
        this.TransferedItemsDetail[i].LotNo == LotNumber &&
        this.TransferedItemsDetail[i].BinNo == Binno &&
        this.TransferedItemsDetail[i].ToBin == ToBin &&
        this.TransferedItemsDetail[i].Remarks == remarks)
        return i;
    }
    return -1;
  }

  async AddLineLots(value: string) {
    if (value == "add") {
      //validateBeforeSubmit calling twice in case of submit.. so i commented it.
      var result = await this.validateBeforeSubmit();
      this.isValidateCalled = false;
      console.log("validate result: " + result);
      if (result != undefined && result == false) {
        return result;
      }
    }
    this.operationType = "add";

    if (sessionStorage.getItem("fromscreen") == "InventoryTransferRequest") {
      if (!this.ITRValidation()) {
        return;
      }
    } else {
      if (!this.CheckValidation()) {
        return;
      }
    }

    if (value != "submit") {
      if (sessionStorage.getItem("LineNum") == null || sessionStorage.getItem("LineNum") == undefined ||
        sessionStorage.getItem("LineNum") == "") {
        sessionStorage.setItem("LineNum", "0");
      }
      let lineNum = Number(sessionStorage.getItem("LineNum"))
      let index = this.UDF.findIndex(e => e.LineNo == lineNum);
      if (index == -1 && this.IsUDFEnabled == 'Y') {
        if (this.ShowUDF('Detail', false)) {
          return;
        }
      }
    }

    this.itemIndex = this.IsInvTransferDetailLineExists(this.itemCode,
      this.lotValue, this.fromBin, this.toBin, this.Remarks, "");
    if (this.itemIndex == -1) {
      this.TransferedItemsDetail.push({
        LineNum: Number(sessionStorage.getItem("LineNum")),
        LotNo: this.lotValue,
        ItemCode: this.itemCode,
        ItemName: this.itemName,
        Qty: "" + this.transferQty,
        SysNumber: this.SysNumber,
        BinNo: this.fromBin,
        ToBin: this.toBin,
        Tracking: this.ItemTracking,
        WhsCode: sessionStorage.getItem("towhseId"),
        OnHandQty: "" + this.onHandQty,
        Remarks: this.Remarks,
        PalletCode: this.palletNo,
        MfrNo: this.actualLotNo,
        BaseLine: ""
      });

      sessionStorage.setItem("LineNum", "" + (Number(sessionStorage.getItem("LineNum")) + 1));
      this.clearDataForAddMore();
    } else {
      if (this.ItemTracking == "S") {
        this.toastr.error('', this.translate.instant("SerialAlreadyExist"));
        return false;
      } else {
        this.showOverwriteConfirmDailog();
      }
    }

    if (this.TransferedItemsDetail.length > this.pageSize) {
      this.pagable = true;
    } else {
      this.pagable = false;
    }

    if (this.itemIndex == -1) {
      return true;
    } else {
      return false;
    }
  }

  async SubmitPutAway() {
    var result = await this.validateBeforeSubmit();
    this.isValidateCalled = false;
    console.log("validate result: " + result);
    if (result != undefined && result == false) {
      return;
    }
    console.log("radio selection: " + this.radioSelected);
    if (this.radioSelected == 1) { // radio selection == 1 for by pallet
      if (this.TransferedItemsDetail.length == 0) {
        this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        return;
      }
      this.SubmitFinally();
    } else {
      if (this.radioSelected == 2) { // code for container code.

        if (this.TransferedItemsDetail.length == 0) {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg")); // change the validation message here.
          return;
        }
        this.SubmitFinally();

      } else {
        // if its type 0 or bin transfer by item.
        this.showValidation = true;
        if (this.TransferedItemsDetail.length > 0) {
          this.showValidation = false;
        }

        if (sessionStorage.getItem("LineNum") == null || sessionStorage.getItem("LineNum") == undefined ||
          sessionStorage.getItem("LineNum") == "") {
          sessionStorage.setItem("LineNum", "0");
        }
        let lineNum = Number(sessionStorage.getItem("LineNum"))
        let indx = this.UDF.findIndex(e => e.LineNo == lineNum);
        if (indx == -1 && this.IsUDFEnabled == 'Y') {
          if (this.ShowUDF('Detail', false)) {
            return;
          }
        }

        this.operationType = "submit";
        var _is = this.AddLineLots("submit");

        if (_is != undefined && !_is) {
          return;
        }

        let index = this.UDF.findIndex(e => e.Flag == "H");
        if (index == -1 && this.IsUDFEnabled == 'Y') {
          if (this.ShowUDF('Header', false)) {
            return;
          }
        }

        this.SubmitFinally();
      }
    }
  }

  SubmitFinally() {
    var oWhsTransAddLot: any = {};
    oWhsTransAddLot.Header = [];
    oWhsTransAddLot.Detail = [];
    oWhsTransAddLot.UDF = [];

    if (this.TransferedItemsDetail == undefined || this.TransferedItemsDetail.length == 0) {
      return;
    }

    for (var i = 0; i < this.TransferedItemsDetail.length; i++) {
      this.TransferedItemsDetail[i].LineNum = i;
    }
    oWhsTransAddLot.Detail = this.TransferedItemsDetail;
    let type;

    if (sessionStorage.getItem("fromscreen") == "WhsTransfer") {
      type = "Items";
    } else if (sessionStorage.getItem("fromscreen") == "InventoryTransferRequest") {
      type = "Items";
    } else {
      type = "";
    }
    oWhsTransAddLot.Header.push({
      WhseCode: sessionStorage.getItem("fromwhseId"),
      ToWhsCode: sessionStorage.getItem("towhseId"), //oToWhs,
      Type: type,
      DiServerToken: sessionStorage.getItem("Token"), //companyDBObject.DIServerToken,
      CompanyDBId: sessionStorage.getItem("CompID"), //companyDBObject.CompanyDbName,
      TransType: "WHS",
      //--------------------Adding Parameters for the Licence--------------------------------------------
      GUID: sessionStorage.getItem("GUID"),
      UsernameForLic: sessionStorage.getItem("UserId"),
      BaseEntry: "",
      BaseType: "0"
      //------------------End for the Licence Parameter------------------------------------------------------
    });
    oWhsTransAddLot.UDF = this.UDF;

    this.showLoader = true;
    if (sessionStorage.getItem("fromscreen") == "InventoryTransferRequest") {
      this.inventoryTransferService.CreateITR(oWhsTransAddLot).subscribe(
        data => {
          this.showLoader = false;
          if (data != null) {
            if (data.length > 0) {
              //--------------------------------------Function to Check for the Licence---------------------------------------
              if (data[0].ErrorMsg != undefined) {
                if (data[0].ErrorMsg == "7001") {
                  this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                    this.translate.instant("CommonSessionExpireMsg"));
                  return;
                }
              }
              //-----------------------------------End for the Function Check for Licence--------------------------------
              if (data[0].ErrorMsg == "") {
                // var showGRPOREport =data[0].GRPOPrintReport
                var showITRReport = data[0].ITRPrintReport
                this.toastr.success('', this.translate.instant("InvTransfer_ItemsTranSuccessfully") + " " + data[0].SuccessNo);
                this.respSuccssDocNo = data[0].SuccessNo
                if (showITRReport == 'y' || showITRReport == 'Y') {
                  this.showPrintConfirmDialog();
                } else {

                }

                oWhsTransAddLot = {};
                oWhsTransAddLot.Header = [];
                oWhsTransAddLot.Detail = [];
                oWhsTransAddLot.UDF = [];
                this.TransferedItemsDetail = [];
                this.selectedPallets = [];
                this.selectedContainers = [];

                this.clearData();
              }
              else {
                this.toastr.error('', data[0].ErrorMsg);
              }
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
    } else {
      // if("something"){
      //     // code to submit container request.
      //   }else{
      //===================================
      this.inventoryTransferService.submitBinTransfer(oWhsTransAddLot).subscribe(
        data => {
          this.showLoader = false;
          if (data != null) {
            if (data.length > 0) {
              //--------------------------------------Function to Check for the Licence---------------------------------------
              if (data[0].ErrorMsg != undefined) {
                if (data[0].ErrorMsg == "7001") {
                  this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                    this.translate.instant("CommonSessionExpireMsg"));
                  return;
                }
              }
              //-----------------------------------End for the Function Check for Licence--------------------------------
              if (data[0].ErrorMsg == "") {
                this.toastr.success('', this.translate.instant("InvTransfer_ItemsTranSuccessfully") + " " + data[0].SuccessNo);
                this.respSuccssDocNo = data[0].SuccessNo
                var showITRReport = data[0].ITRPrintReport
                oWhsTransAddLot = {};
                oWhsTransAddLot.Header = [];
                oWhsTransAddLot.Detail = [];
                oWhsTransAddLot.UDF = [];
                this.TransferedItemsDetail = [];
                this.UDF = [];
                sessionStorage.setItem("LineNum", "0");
                this.selectedPallets = [];
                if (showITRReport == 'y' || showITRReport == 'Y') {
                  this.showPrintConfirmDialog();
                }
                this.clearData();
              }
              else {
                this.toastr.error('', data[0].ErrorMsg);
              }
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
  }

  showOverwriteConfirmDailog() {
    this.showDialog("overwriteQty", this.translate.instant("yes"), this.translate.instant("no"),
      this.translate.instant("InvTransfer_Overwrite"));
  }

  clearData() {
    this.itemCode = "";
    this.itemName = "";
    this.ItemTracking = "";
    this.lotValue = "";
    this.transferQty = "";
    this.toBin = "";
    this.fromBin = "";
    this.onHandQty = "";
    this.Remarks = "";
    this.actualLotNo = "";
    this.palletNo = "";
  }

  clearDataForAddMore() {
    //this.itemCode = "";
    // this.itemName = "";
    // this.ItemTracking = "";
    this.lotValue = "";
    this.transferQty = "";
    //this.toBin = "";
    this.fromBin = "";
    this.onHandQty = "";
    this.Remarks = "";
  }

  CheckValidation() {
    if (this.itemCode == "") {
      if (this.showValidation) {
        this.toastr.error('', this.translate.instant("ItemCannotbeBlank"));
      }
      return false;
    }
    if (this.ItemTracking == "B") {
      if (this.lotValue == "") {
        if (this.showValidation) {
          this.toastr.error('', this.translate.instant("PhyCount_SerialLotcannotbeblank"));
        }
        return false;
      }
    }
    if (this.ItemTracking == "S") {
      if (this.lotValue == "") {
        if (this.showValidation) {
          this.toastr.error('', this.translate.instant("InvTransfer_SerialNoCantBlank"));
        }
        return false;
      }

    }
    else {
      if (Number(this.transferQty) <= 0) {
        if (this.showValidation) {
          this.toastr.error('', this.translate.instant("InvTransfer_Enterquantitygreaterthanzero"));
        }
        return false;
      }
    }
    if (this.fromBin == "") {
      this.toastr.error('', this.translate.instant("InvTransfer_FromBinMsg"));
      return false;
    }
    if (this.toBin == "") {
      if (this.showValidation) {
        this.toastr.error('', this.translate.instant("InvTransfer_ToBinMsg"));
      }
      return false;
    }
    if (this.transferQty == "") {
      if (this.showValidation) {
        this.toastr.error('', this.translate.instant("EnterLotQuantity"));
      }
      return false;
    }
    return true;
  }

  ITRValidation() {
    if (this.itemCode == "") {
      if (this.showValidation) {
        this.toastr.error('', this.translate.instant("ItemCannotbeBlank"));
      }
      return false;
    }

    return true;
  }

  getlookupSelectedItem(event) {
    if (this.lookupfor == "SBTrackFromBin") {
      this.fromBin = event.BINNO;
      this.transferQty = event.TOTALQTY;
      this.onHandQty = event.TOTALQTY;
      this.scanToBin.nativeElement.focus();
    } else if (this.lookupfor == "NTrackFromBin") {
      this.fromBin = event.BINNO;
      this.transferQty = event.TOTALQTY;
      this.onHandQty = event.TOTALQTY;
      this.scanToBin.nativeElement.focus();
    }
  }

  getLookupValue($event) {
    if ($event != null && $event == "close") {
      if (this.lookupfor == "ItemsList") {
        this.scanItemCode.nativeElement.focus();
      } else if (this.lookupfor == "BatchNoList") {
        this.scanLotNo.nativeElement.focus();
      }
      else if (this.lookupfor == "BatchNoList2") {
        this.scanLotNo.nativeElement.focus();
      }
      else if (this.lookupfor == "SBTrackFromBin") {
        this.scanFromBin.nativeElement.focus();
      } else if (this.lookupfor == "NTrackFromBin") {
        this.scanFromBin.nativeElement.focus();
      } else if (this.lookupfor == "toBinsList") {
        if (this.radioSelected == 0) {
          this.scanToBin.nativeElement.focus();
        } else {
          this.scanToBinOther.nativeElement.focus();
          // other to bin field.
        }
      }
      return;
    }
    else if (this.lookupfor == "PalletList") {
      this.palletNo = $event[0];
      for (let i = 0; i < this.palletList.length; i++) {
        if (this.palletNo == this.palletList[i].Code) {
          this.binOfSelectedPallet = this.palletList[i].U_OPTM_BIN;
          break;
        }
      }
      this.scanToBinOther.nativeElement.focus();
    }
    else {
      if (this.lookupfor == "ItemsList") {
        this.itemCode = $event[0];
        this.itemName = $event[1];
        this.ItemTracking = $event[2];
        this.showItemName = true;
        this.transferQty = this.translate.instant("InvTransfer_zero");
        this.onHandQty = 0.000;
        if (this.ItemTracking == 'N') {
          this.getDefaultFromBin();
        } else {
          this.getDefaultToBin();
        }
        this.CheckTrackingandVisiblity();
        setTimeout(() => {
          if (this.ItemTracking == 'N') {
            this.scanFromBin.nativeElement.focus();
          } else {
            this.scanLotNo.nativeElement.focus();
          }
        }, 500);
      } else if (this.lookupfor == "BatchNoList") {
        this.lotValue = $event[0];
        this.fromBin = $event[6];
        this.transferQty = $event[7];
        this.onHandQty = $event[7];
        this.SysNumber = $event[9];
        this.palletNo = $event[12];
        this.actualLotNo = $event[13];
        this.scanFromBin.nativeElement.focus();
      }
      else if (this.lookupfor == "BatchNoList2") {
        this.lotValue = $event[0];
        this.fromBin = $event[5];
        this.transferQty = $event[7];
        this.onHandQty = $event[7];
        this.SysNumber = $event[9];
        this.palletNo = ""
        this.actualLotNo = $event[0];
        this.scanFromBin.nativeElement.focus();
      }

      else if (this.lookupfor == "toBinsList") {
        this.toBin = $event[0];
        //this.prepareByPalletData();
        if (this.radioSelected == 0) {
          this.scanTransQty.nativeElement.focus();
        } else {
          //other to bin Field
          this.scanReasonByPallet.nativeElement.focus();
        }
      } else if (this.lookupfor == "ContainerList") {
        this.containerId = $event[0];
        this.containerCode = $event[1];
        for (let i = 0; i < this.containerList.length; i++) {
          if (this.containerCode == this.containerList[i].OPTM_CONTCODE) {
            this.binOfSelectedContainer = this.containerList[i].OPTM_BIN;
            break;
          }
        }
      }
      this.formatTransferNumbers();
      this.formatOnHandQty();
    }
  }

  CheckTrackingandVisiblity() {
    if (this.ItemTracking == "B") {
      this.isItemSerialTrack = false;
      this.showBatchNo = true;
      this.editTransferQty = false;
      this.batchNoPlaceholder = this.translate.instant("BatchNo");
      // oTxtTransferQty.setEnabled(true);
    }
    else if (this.ItemTracking == "S") {
      this.isItemSerialTrack = true;
      this.showBatchNo = true;
      this.editTransferQty = true;
      this.batchNoPlaceholder = this.translate.instant("SerialNo");
    }
    else if (this.ItemTracking == "N") {
      this.isItemSerialTrack = false;
      this.showBatchNo = false;
      this.editTransferQty = false;
      // olbllotno.setText("")
    }
    this.fromBin = "";
    this.toBin = "";
    this.lotValue = "";
  }

  rowindex: any;
  gridDataRow: any;
  ViewLinesRowDeleteClick(rowindex, gridData: any) {
    this.showDialog("delete", this.translate.instant("yes"), this.translate.instant("no"),
      this.translate.instant("DeleteRecordsMsg"));
    this.rowindex = rowindex;
    this.gridDataRow = gridData;
  }

  OnOKClick() {
    var rs = sessionStorage.getItem("radioSelection");
    if (rs != undefined && rs.length > 0) {
      this.radioSelected = Number.parseInt(rs);
    }
    this.viewLines = false;
  }

  deleteAllOkClick() {
    var rs = sessionStorage.getItem("radioSelection");
    if (rs != undefined && rs.length > 0) {
      this.radioSelected = Number.parseInt(rs);
    }
    this.TransferedItemsDetail = [];
    this.selectedPallets = [];
    this.selectedContainers = [];
    this.clearData();
    document.getElementById("modalCloseBtn").click();
  }

  formatTransferNumbers() {
    this.transferQty = Number(this.transferQty).toFixed(Number(sessionStorage.getItem("DecimalPrecision")));
  }

  formatOnHandQty() {
    this.onHandQty = Number(this.onHandQty).toFixed(Number(sessionStorage.getItem("DecimalPrecision")));
  }

  goBack() {
    this.operationType = "back";

    if (sessionStorage.getItem("fromscreen") == "WhsTransfer") {
      this.cancelevent.emit(true);
    } else if (sessionStorage.getItem("fromscreen") == "InventoryTransferRequest") {
      this.cancelevent.emit(true);
    } else {
      this.router.navigate(['home/dashboard']);
    }
  }

  deleteAll() {
    this.showDialog("deleteAll", this.translate.instant("yes"), this.translate.instant("no"),
      this.translate.instant("DeleteAllLines"));
  }

  showDialog(dialogFor: string, yesbtn: string, nobtn: string, msg: string) {
    this.dialogFor = dialogFor;
    this.yesButtonText = yesbtn;
    this.noButtonText = nobtn;
    this.showConfirmDialog = true;
    this.dialogMsg = msg;
  }

  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;
    if ($event.Status == "yes") {
      switch ($event.From) {
        case ("delete"):
          let lineNum = this.TransferedItemsDetail[this.rowindex].lineNum;
          let udfDeleteArry = this.UDF.filter(e => e.LineNo == lineNum)
          for (var i = 0; i < udfDeleteArry.length; i++) {
            let indx = this.UDF.findIndex(e => e.LineNo == lineNum)
            this.UDF.splice(indx, 1);
          }
          this.TransferedItemsDetail.splice(this.rowindex, 1);
          this.gridDataRow.data = this.TransferedItemsDetail;
          console.log(this.TransferedItemsDetail.length);
          break;
        case ("DeletePallet"):
          var tempList: any = [];
          for (let i = 0; i < this.TransferedItemsDetail.length; i++) {
            if (this.selectedPallets[this.rowindex].Code != this.TransferedItemsDetail[i].PalletCode) {
              tempList.push(this.TransferedItemsDetail[i]);
            }
          }
          this.TransferedItemsDetail = tempList;
          this.selectedPallets.splice(this.rowindex, 1);
          break;

        case ("DeleteContainer"):
          var tempList: any = [];
          for (let i = 0; i < this.TransferedItemsDetail.length; i++) {
            if (this.selectedContainers[this.rowindex].Code != this.TransferedItemsDetail[i].PalletCode) {
              tempList.push(this.TransferedItemsDetail[i]);
            }
          }
          this.TransferedItemsDetail = tempList;
          this.selectedContainers.splice(this.rowindex, 1);
          break;
        case ("deleteAll"):
          this.deleteAllOkClick();
          break;
        case ("overwriteQty"):
          this.TransferedItemsDetail[this.itemIndex].Qty = this.transferQty;
          if (this.operationType == "submit") {
            this.SubmitFinally();
            this.clearData();
          } else if (this.operationType == "add") {
            this.clearDataForAddMore();
          }
          break;
        case ("RadioBtnChange"):
          this.manageCheckChange();
          this.checkChangeEvent.target.checked = true;
          this.TransferedItemsDetail = [];
          this.selectedPallets = [];
          this.clearData();
          setTimeout(() => {
            if (this.radioSelected == 0) {
              this.scanItemCode.nativeElement.focus();
            } else {
              this.scanPallet.nativeElement.focus();
            }
          }, 200)
          break;
        case ("showPDFReport"):
          // this.printDialog = true
          this.displayPDF(this.respSuccssDocNo, 14);
          break;
      }
    } else {
      if ($event.Status == "no") {
        switch ($event.From) {
          case ("delete"):
            break;
          case ("deleteAll"):
            break;
          case ("overwriteQty"):
            break;
          case ("showPDFReport"):
            break;
        }
      }
    }
  }

  onRadioMouseDown(id) {
    console.log("on radio mouse down");
    document.getElementById(id).click();
  }

  handleCheckChange(event) {
    console.log("on radio handleCheckChange");
    this.checkChangeEvent = event;
    console.log("check change:" + this.checkChangeEvent);
    console.log(this.checkChangeEvent);
    if (this.TransferedItemsDetail.length == 0) {
      this.selectedPallets = [];
      this.clearData();
      this.manageCheckChange();
      this.selectedContainers = [];
    } else {
      this.checkChangeEvent.preventDefault();
      this.showDialog("RadioBtnChange", this.translate.instant("yes"), this.translate.instant("no"),
        this.translate.instant("Plt_DataDeleteMsg"));
    }

    if (this.TransferedItemsDetail.length == 0) {
      if (event.toElement.name == "byPlt") {
        console.log("by element: plt")
        setTimeout(() => {
          this.scanPallet.nativeElement.focus();
        }, 100);
      } else if (event.toElement.name == "byItem") {
        console.log("by element: item")
        setTimeout(() => {
          this.scanItemCode.nativeElement.focus();
        }, 100);
      }
    }
  }

  manageCheckChange() {
    if (this.checkChangeEvent.target.id == "byItem") {
      // mfr serial radio selected.
      this.radioSelected = 0;
      sessionStorage.setItem("radioSelection", "0");
    }
    if (this.checkChangeEvent.target.id == "byPallet") {
      // mfr serial radio selected.
      this.radioSelected = 1;
      sessionStorage.setItem("radioSelection", "1");
    }
    if (this.checkChangeEvent.target.id == "ByContainer") {
      // mfr serial radio selected.
      this.radioSelected = 2;
      sessionStorage.setItem("radioSelection", "2");
    }
  }

  getContainerList() {
    this.showLoader = true;
    this.showLookupLoader = true;
    this.commonservice.GetContainerWithRowsPresent("").subscribe(
      (data: any) => {
        this.showLoader = false;
        this.showLookupLoader = false;
        // console.log(data);
        if (data != null) {
          if (data.length > 0) {
            this.serviceData = data;
            this.lookupfor = "ContainerList";
            this.containerList = this.serviceData;
            return;
          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        }
      },
      error => {
        this.showLoader = false;
        this.showLookupLoader = false;
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

  onContainerChange() {
    if (this.containerCode == undefined || this.containerCode == "") {
      return;
    }
    this.showLoader = true;
    this.commonservice.GetContainerWithRowsPresent(this.containerCode).subscribe(
      (data: any) => {
        this.showLoader = false;
        // console.log(data);
        if (data != null) {
          if (data.length > 0) {
            this.containerCode = data[0].Code;
            //this.selectedPallets.push(data[0]);
            //this.getPalletData();
          } else {
            this.toastr.error('', this.translate.instant("InValidPalletNo"));
            this.containerCode = "";
            this.scanPallet.nativeElement.focus();
            return;
          }
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          this.containerCode = "";
          this.scanPallet.nativeElement.focus();
          return;
        }
      },
      error => {
        this.showLoader = false;
        this.showLookupLoader = false;
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
  public getPalletList() {
    this.showLoader = true;
    this.showLookupLoader = true;
    this.commonservice.GetPalletsWithRowsPresent().subscribe(
      (data: any) => {
        this.showLoader = false;
        this.showLookupLoader = false;
        // console.log(data);
        if (data != null) {
          if (data.length > 0) {
            this.serviceData = data;
            this.lookupfor = "PalletList";
            this.palletList = this.serviceData;
            return;
          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        }
      },
      error => {
        this.showLoader = false;
        this.showLookupLoader = false;
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

  onPalletChangeBlur() {
    if (this.isValidateCalled) {
      return
    }
    this.onPalletChange();
  }

  async onPalletChange(): Promise<any> {
    if (this.palletNo == undefined || this.palletNo == "") {
      return;
    }
    this.showLoader = true;
    var result = false;
    await this.commonservice.isPalletValid(this.palletNo).then(
      (data: any) => {
        this.showLoader = false;
        console.log("inside isPalletValid");
        if (data != null) {
          if (data.length > 0) {
            this.palletNo = data[0].Code;
            result = true;
          } else {
            this.toastr.error('', this.translate.instant("InValidPalletNo"));
            this.palletNo = "";
            this.scanPallet.nativeElement.focus();
            result = false;
          }
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          this.palletNo = "";
          this.scanPallet.nativeElement.focus();
          result = false;
        }
      },
      error => {
        this.showLoader = false;
        this.showLookupLoader = false;
        console.log("Error: ", error);
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
        result = false;
      }
    );
    return result;
  }

  getPalletData() {
    this.showLoader = true;
    this.commonservice.GetPalletDataForWhseTrns(this.palletNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        // console.log(data);
        if (data != null) {
          this.palletData = data;
          this.prepareByPalletData();
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          return;
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

  prepareByPalletData() {
    if (this.radioSelected != 1) {
      return;
    }
    if (this.selectedPallets == undefined || this.selectedPallets == null || this.selectedPallets.length == 0) {
      return;
    }
    if (this.toBin == undefined || this.toBin == "") {
      return;
    }
    //Prepare transfer item details list by pallet
    for (let i = 0; i < this.palletData.length; i++) {
      this.TransferedItemsDetail.push({
        LineNum: '01',
        LotNo: this.palletData[i].SRLBATCH,
        MfrNo: this.palletData[i].ACTLOTNO,
        PalletCode: this.palletData[i].PALLETNO,
        ItemCode: this.palletData[i].ITEMID,
        ItemName: this.palletData[i].ITEMNAME,
        Qty: this.palletData[i].QTY,
        SysNumber: this.palletData[i].SYSNUMBER,
        BinNo: this.palletData[i].BINNO,
        ToBin: this.toBin,
        Tracking: this.palletData[i].ITEMTYPE,
        WhsCode: sessionStorage.getItem("towhseId"),
        OnHandQty: this.palletData[i].QTY,
        Remarks: this.Remarks,
        BaseLine: ""
      });
    }
    //this.SubmitFinally();
  }




  getContainerData() {
    this.showLoader = true;
    this.commonservice.GetContainerDataForWhseTrns(this.containerCode).subscribe(
      (data: any) => {
        this.showLoader = false;
        // console.log(data);
        if (data != null) {
          this.containerData = data;
          this.prepareByContainerData();
        }
        else {
          this.toastr.error('', this.translate.instant("InValidContainerCode"));
          return;
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

  prepareByContainerData() {
    if (this.radioSelected != 2) {
      return;
    }
    if (this.selectedContainers == undefined || this.selectedContainers == null || this.selectedContainers.length == 0) {
      return;
    }
    if (this.toBin == undefined || this.toBin == "") {
      return;
    }
    //Prepare transfer item details list by pallet
    for (let i = 0; i < this.containerData.length; i++) {
      this.TransferedItemsDetail.push({
        LineNum: '01',
        LotNo: this.containerData[i].SRLBATCH,
        MfrNo: this.containerData[i].ACTLOTNO,
        PalletCode: this.containerData[i].CONTAINERCODE,
        ItemCode: this.containerData[i].ITEMID,
        ItemName: this.containerData[i].ITEMNAME,
        Qty: this.containerData[i].QTY,
        SysNumber: this.containerData[i].SYSNUMBER,
        BinNo: this.containerData[i].BINNO,
        ToBin: this.toBin,
        Tracking: this.containerData[i].ITEMTYPE,
        WhsCode: sessionStorage.getItem("towhseId"),
        OnHandQty: this.containerData[i].QTY,
        Remarks: this.Remarks,
        BaseLine: ""
      });
    }
    //this.SubmitFinally();
  }
  showSelectedPallets() {
    this.dialogOpened = !this.dialogOpened;
  }

  showSelectedContainers() {
    this.containerDialogOpened = !this.containerDialogOpened;
  }

  public close(component) {
    this[component + 'Opened'] = false;
  }

  PalletDeleteClick(rowindex, gridData: any) {
    this.gridData = gridData;
    this.rowindex = rowindex;
    this.showDialog("DeletePallet", this.translate.instant("yes"), this.translate.instant("no"),
      this.translate.instant("DeleteRecordsMsg"));
  }
  ContainerDeleteClick(rowindex, gridData: any) {
    this.gridData = gridData;
    this.rowindex = rowindex;
    this.showDialog("DeleteContainer", this.translate.instant("yes"), this.translate.instant("no"),
      this.translate.instant("DeleteRecordsMsg"));
  }

  async onAddPalletClick() {
    await this.validateBeforeSubmit();
    this.isValidateCalled = false;

    if (this.palletNo == undefined || this.palletNo == "") {
      this.toastr.error('', this.translate.instant("Plt_PalletRequired"));
      return;
    }

    if (this.toBin == undefined || this.toBin == "") {
      this.toastr.error('', this.translate.instant("InvTransfer_ToBinMsg"));
      return;
    }

    if (this.binOfSelectedPallet == this.toBin) {
      this.toastr.error('', this.translate.instant("InvTransfer_SameBinMsg"));
      return;
    }

    for (let i = 0; i < this.selectedPallets.length; i++) {
      if (this.palletNo == this.selectedPallets[i].Code) {
        this.palletNo = "";
        this.toastr.error('', this.translate.instant("Plt_PalletAlreadySelected"));
        return
      }
    }
    this.getPalletData();
    var obj = {
      Code: this.palletNo
    }
    this.selectedPallets.push(obj);
    this.palletNo = "";
    // this.toBin = "";
  }



  onAddContainerClick() {
    if (this.containerCode == undefined || this.containerCode == "") {
      this.toastr.error('', this.translate.instant("ContainerRequired"));
      return;
    }

    if (this.toBin == undefined || this.toBin == "") {
      this.toastr.error('', this.translate.instant("InvTransfer_ToBinMsg"));
      return;
    }
    if (this.binOfSelectedContainer == this.toBin) {
      this.toastr.error('', this.translate.instant("InvTransfer_ContainerSameBinMsg"));
      return;
    }

    for (let i = 0; i < this.selectedContainers.length; i++) {
      if (this.containerCode == this.selectedContainers[i].Code) {
        this.containerCode = "";
        this.toastr.error('', this.translate.instant("ContainerAlreadySelected"));
        return
      }
    }
    this.getContainerData();
    var obj = {
      Code: this.containerCode
    }
    this.selectedContainers.push(obj);
    this.containerCode = "";
    // this.toBin = "";
  }

  onHiddenBinTransferItemCodeScanClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('binTransferScanItemCodeInput')).value;
    if (inputValue.length > 0) {
      this.itemCode = inputValue;
    }
    this.OnItemCodeChange();
  }


  onHiddenLotScanClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('binTransferLotInput')).value;
    if (inputValue.length > 0) {
      this.lotValue = inputValue;
    }
    this.OnLotChange();
  }

  onHiddenFromBinScanClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('binTransferFromBinInput')).value;
    if (inputValue.length > 0) {
      this.fromBin = inputValue;
    }
    this.OnFromBinChange();
  }

  onHiddenToBinScanClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('binTransferToBinInput')).value;
    if (inputValue.length > 0) {
      this.toBin = inputValue;
    }
    this.OnToBinChange();
  }

  onHiddenByPalPalNoScanClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('binTransferScanByPalletPalletNoInput')).value;
    if (inputValue.length > 0) {
      this.palletNo = inputValue;
    }
    this.onPalletChange();
  }

  onHiddenByPalToBinScanClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('binTransferToBinInput')).value;
    if (inputValue.length > 0) {
      this.toBin = inputValue;
    }

    this.OnToBinChange();
  }

  onHiddenByPalBatchNoScanClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('binTransferBatchNoInput')).value;
    if (inputValue.length > 0) {
      this.lotValue = inputValue;
    }
    this.OnLotChange();
  }

  isValidateCalled: boolean = false;
  lastFocussedField: any;
  async validateBeforeSubmit(): Promise<any> {
    this.isValidateCalled = true;
    var currentFocus = document.activeElement.id;
    console.log("validateBeforeSubmit current focus: " + currentFocus);

    if (currentFocus != undefined) {
      this.lastFocussedField = currentFocus;
      if (currentFocus == "binTransferItemCodeScan") {
        return this.OnItemCodeChange();
      } else if (currentFocus == "binTransferBatchNoInput") {
        return this.OnLotChange();
      } else if (currentFocus == "binTransferFromBinInput") {
        return this.OnFromBinChange();
      } else if (currentFocus == "binTransferToBinInput") {
        return this.OnToBinChange();
      } else if (currentFocus == "binTransferScanByPalletPalletNoInput") {
        return this.onPalletChange();
      } else if (currentFocus == "binTransferByPalletToBinNoInput") {
        return this.OnToBinChange();
      } else if (currentFocus == "transferQty") {
        this.transferQty = Number(this.transferQty).toFixed(Number(sessionStorage.getItem("DecimalPrecision")));
      }
    }
  }


  printDialog: boolean = false
  showPDF: boolean = false;
  base64String: string = "";
  fileName: string = "";
  displayPDF1: boolean = false;
  showPDFLoading: boolean = false;
  public displayPDF(dNo: string, value: any) {
    this.showPDFLoading = true;
    this.inboundService.printingServiceForSubmitGRPO(dNo, value, 1).subscribe(
      (data: any) => {
        this.showPDFLoading = false;
        // this.printDialog = false;
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
            this.base64String = 'data:application/pdf;base64,' + this.base64String;
            this.displayPDF1 = true;
          } else {

          }
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLookupLoader = false;
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }

  showPrintConfirmDialog() {
    this.yesButtonText = this.translate.instant("yes");
    this.noButtonText = this.translate.instant("no");
    this.dialogFor = "showPDFReport";
    this.dialogMsg = "Do you want to print report?";//this.translate.instant("Inbound_PrintAllLabelsAfterSubmit");
    this.showConfirmDialog = true; // show dialog 
  }

  printOptionsClick(event) {
    //need to pass id in display  pdf
    this.displayPDF("", event)
  }

  closePDF() {
    this.displayPDF1 = false;
    console.log("PDF dialog is closed");
  }
  closePrintDialog() {
    this.printDialog = false;
  }

  showUDF = false;
  UDFComponentData: IUIComponentTemplate[] = [];
  itUDFComponents: IUIComponentTemplate = <IUIComponentTemplate>{};
  templates = [];
  displayArea = "Header";
  UDFApiResponse: any;
  // ShowUDF(displayArea) {
  //   this.displayArea = displayArea;
  //   this.loadUDF(displayArea)
  //   this.showUDF = true;
  // }


  ShowUDF(displayArea, UDFButtonClicked): boolean {
    this.displayArea = displayArea;
    let tempUDF = [];
    if (displayArea == "Header") {
      this.UDF.forEach(element => {
        if (element.Flag == "H") {
          tempUDF.push(element);
        }
      });
    } else if (displayArea == "Detail") {
      this.UDF.forEach(element => {
        if (element.Flag == "D" && element.LineNo == Number(sessionStorage.getItem("LineNum"))) {
          tempUDF.push(element);
        }
      });
    } else {
      if (this.ItemTracking == "B") {
        if (this.lotValue == "") {
          this.toastr.error('', this.translate.instant("PhyCount_BatchLotcannotbeblank"));
          return;
        }
      }
      else if (this.ItemTracking == "S") {
        if (this.lotValue == "") {
          this.toastr.error('', this.translate.instant("InvTransfer_SerialNoCantBlank"));
          return;
        }  
      }
      if (this.fromBin == "") {
        this.toastr.error('', this.translate.instant("InvTransfer_FromBinMsg"));
        return;
      }
      this.UDF.forEach(element => {
        if (element.Flag == "L" && element.LineNo == Number(sessionStorage.getItem("LineNum"))) {
          tempUDF.push(element);
        }
      });
    }
    let UDFStatus = this.commonservice.loadUDF(displayArea, this.commonservice.getUDFData(), tempUDF);
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

  // addUDFdata(istextbox, isdropdown, DropdownArray, Field) {
  //   this.itUDFComponents = <IUIComponentTemplate>{};
  //   this.itUDFComponents.dropDown = "";
  //   this.itUDFComponents.textBox = "";
  //   this.itUDFComponents.ismandatory = Field.OPTM_ISMANDATORY == 1 ? true : false;
  //   this.itUDFComponents.LabelName = Field.Descr;
  //   this.itUDFComponents.istextbox = istextbox;
  //   this.itUDFComponents.isdropDown = isdropdown;
  //   this.itUDFComponents.OPTM_SEQ = Field.OPTM_SEQ;
  //   this.itUDFComponents.AliasID = Field.AliasID;
  //   this.itUDFComponents.Size = Field.SizeID;

  //   if (isdropdown) {
  //     this.itUDFComponents.DropdownArray = DropdownArray;
  //   } else {
  //     this.itUDFComponents.textType = Field.OPTM_FIELD_TYPE;
  //     this.itUDFComponents.textBox = Field.Dflt
  //   }
  //   this.templates.push(this.templates.length);
  //   this.UDFComponentData.push(this.itUDFComponents);
  // }

  getUDFSelectedItem(itUDFComponentData) {
    this.onUDFDialogClose();
    if (itUDFComponentData == null) {
      return;
    }
    if (this.displayArea == "Detail") {
      if (sessionStorage.getItem("LineNum") == null || sessionStorage.getItem("LineNum") == undefined ||
        sessionStorage.getItem("LineNum") == "") {
        sessionStorage.setItem("LineNum", "0");
      }
      if (itUDFComponentData.length > 0) {
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
            LineNo: Number(sessionStorage.getItem("LineNum")),
            Value: value,
            Key: itUDFComponentData[i].AliasID
          });
        }
      }
    } else if (this.displayArea == "Lot") {
      if (sessionStorage.getItem("LineNum") == null || sessionStorage.getItem("LineNum") == undefined ||
        sessionStorage.getItem("LineNum") == "") {
        sessionStorage.setItem("LineNum", "0");
      }
      if (itUDFComponentData.length > 0) {
        for (var i = 0; i < itUDFComponentData.length; i++) {
          let value = "";
          if (itUDFComponentData[i].istextbox) {
            value = itUDFComponentData[i].textBox;
          } else {
            value = itUDFComponentData[i].dropDown.FldValue;
          }
          this.UDF.push({
            Flag: "L",
            LineNo: Number(sessionStorage.getItem("LineNum")),
            Value: value,
            Key: itUDFComponentData[i].AliasID,
            LotNo: this.lotValue,
            Bin: this.fromBin
          });
        }
      }
    } else {
      if (itUDFComponentData.length > 0) {
        while (this.UDF.length > 0) {
          let index = this.UDF.findIndex(e => e.Flag == "H")
          if (index == -1) {
            break;
          }
          this.UDF.splice(index, 1);
        }
        for (var i = 0; i < itUDFComponentData.length; i++) {
          let value = "";
          if (itUDFComponentData[i].istextbox) {
            value = itUDFComponentData[i].textBox;
          } else {
            value = itUDFComponentData[i].dropDown.FldValue;
          }
          this.UDF.push({
            Flag: "H",
            LineNo: -1,
            Value: value,
            Key: itUDFComponentData[i].AliasID
          });
        }
      }
    }
    this.templates = [];
  }

  onUDFDialogClose() {
    this.showUDF = false;
    this.UDFComponentData = [];
    this.templates = [];
  }



  // loadUDF(displayArea) {
  //   this.onUDFDialogClose();
  //   let data = this.UDFApiResponse;

  //   let subarray = [];
  //   data.Fields.forEach(element => {
  //     if (element.OPTM_DISPLAYAREA == displayArea) {
  //       subarray.push(element);
  //     }
  //   });
  //   for (var i = 0; i < subarray.length; i++) {
  //     let DropdownArray = data.ValidValues.filter(e => e.OPTM_SEQ == subarray[i].OPTM_SEQ);
  //     let textboxType = subarray[i].OPTM_FIELD_TYPE;// == "A" ? "text":"number";
  //     if (DropdownArray.length == 0) {
  //       this.addUDFdata(true, false, DropdownArray, subarray[i]);
  //     } else {
  //       this.addUDFdata(false, true, DropdownArray, subarray[i]);
  //     }
  //   }
  // }
} 
