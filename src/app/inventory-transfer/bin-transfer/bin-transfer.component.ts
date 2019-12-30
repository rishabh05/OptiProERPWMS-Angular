import { Component, OnInit, Input, Output, EventEmitter, HostListener, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { viewLineContent } from '../../DemoData/sales-order';
import { UIHelper } from '../../helpers/ui.helpers';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { Commonservice } from '../../services/commonservice.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { InventoryTransferService } from '../../services/inventory-transfer.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Template } from '@angular/compiler/src/render3/r3_ast';
import { Location } from '@angular/common';

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
  dialogOpened: boolean = false;
  selectedPallets: any = [];
  checkChangeEvent: any;
  showBinFields: boolean = true;
  binOfSelectedPallet: any = "";
  palletList: any = [];
  @ViewChild("scanItemCode") scanItemCode;
  @ViewChild("scanFromBin") scanFromBin;
  @ViewChild("scanToBin") scanToBin;
  @ViewChild("scanLotNo") scanLotNo;
  @ViewChild("scanPallet") scanPallet;

  constructor(private commonservice: Commonservice, private activatedRoute: ActivatedRoute,
    private router: Router, private inventoryTransferService: InventoryTransferService,
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

  ngOnInit() {
    this.batchNoPlaceholder = this.translate.instant("BatchNo");
    if (localStorage.getItem("PalletizationEnabled") == "True") {
      this.isPalletizationEnable = true;
    } else {
      this.isPalletizationEnable = false;
    }
    localStorage.setItem("radioSelection", "0");
    // apply grid height
    this.gridHeight = UIHelper.getMainContentHeight();

    // check mobile device
    this.isMobile = UIHelper.isMobile();

    //  this.getViewLineList();
    this.viewLines = false;

    this.showBinFields = true;
    if (localStorage.getItem("fromscreen") == "WhsTransfer") {
      this.PageTitle = this.translate.instant("WarehouseTransfer") + this.translate.instant("InvTransfer_From") + localStorage.getItem("fromwhseId") + this.translate.instant("InvTransfer_To") + localStorage.getItem("towhseId");
    } else if (localStorage.getItem("fromscreen") == "InventoryTransferRequest") {
      this.PageTitle = this.translate.instant("InventoryTransferRequest") + this.translate.instant("InvTransfer_From") + localStorage.getItem("fromwhseId") + this.translate.instant("InvTransfer_To") + localStorage.getItem("towhseId");
      this.showBinFields = false;
    } else {
      this.PageTitle = this.translate.instant("BinTransfer");
    }



    // if (localStorage.getItem("towhseId") == localStorage.getItem("whseId")) {
    //   this.PageTitle = this.translate.instant("BinTransfer");
    // } else {
    //   this.PageTitle = this.translate.instant("WarehouseTransfer") + this.translate.instant("InvTransfer_From") + localStorage.getItem("whseId") + this.translate.instant("InvTransfer_To") + localStorage.getItem("towhseId");
    // }
    this.formatTransferNumbers();
    this.formatOnHandQty();
    this.zero = this.onHandQty;
    console.log("bin loaded")
  }

  ngAfterViewInit(): void {
    this.scanItemCode.nativeElement.focus();
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

  OnItemCodeChange() {
    if (this.itemCode == "" || this.itemCode == undefined) {
      return;
    }
    this.showLoader = true;
    this.inventoryTransferService.GetItemCode(this.itemCode).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          console.log("" + data);
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.itemCode = data[0].ItemCode;
          if (this.itemCode != null && this.itemCode != undefined && this.itemCode != '') {
            this.getItemInfo();
          }

        } else {
          this.toastr.error('', this.translate.instant("InvalidItemCode"));
          this.itemCode = "";
          this.scanItemCode.nativeElement.focus();
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

  getItemInfo() {
    if (this.itemCode == "" || this.itemCode == undefined) {
      return;
    }
    this.showLoader = true;
    this.inventoryTransferService.getItemInfo(this.itemCode).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          console.log("" + data);
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
          if (localStorage.getItem("fromscreen") == "WhsTransfer") {
            this.getDefaultBin();
          }
          this.formatOnHandQty();
          this.formatTransferNumbers();
          if (this.ItemTracking == 'N') {
            this.getDefaultFromBin();
            this.scanFromBin.nativeElement.focus();
          }else{

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

  OnLotChange() {



    if (this.lotValue == "" || this.lotValue == undefined) {
      return;
    }
    this.showLoader = true;
    this.inventoryTransferService.getLotInfo(this.fromBin, this.itemCode, this.lotValue).subscribe(
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
    this.inventoryTransferService.GetDefaultBinOrBinWithQty(this.itemCode,
      localStorage.getItem("towhseId")).subscribe(
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
      localStorage.getItem("towhseId")).subscribe(
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
    this.inventoryTransferService.getDefaultBin(this.itemCode, localStorage.getItem("towhseId")).subscribe(
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
    this.inventoryTransferService.getLotList(localStorage.getItem("whseId"), this.fromBin, this.itemCode, this.lotValue).subscribe(
      data => {
        this.showLoader = false;
        if (data != undefined && data.length > 0) {
          console.log("ItemList - " + data);
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          for (var i = 0; i < data.length; i++) {
            data[i].TOTALQTY = data[i].TOTALQTY.toFixed(Number(localStorage.getItem("DecimalPrecision")));
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
                data[i].TOTALQTY = data[i].TOTALQTY.toFixed(Number(localStorage.getItem("DecimalPrecision")));
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


  OnFromBinChange() {
    if (this.fromBin == "" || this.fromBin == undefined) {
      return;
    }
    this.showLoader = true;
    this.inventoryTransferService.isFromBinExists(this.ItemTracking, this.fromBin, this.itemCode, this.lotValue).subscribe(
      data => {
        this.showLoader = false;
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
            }
            else {
              if (data[0].Result == "0") {
                this.toastr.error('', this.translate.instant("INVALIDBIN"));
                return;
              }
              else {
                this.fromBin = data[0].ID;
                if (this.toBin == this.fromBin) {
                  this.toastr.error('', this.translate.instant("FrmNToBinCantSame"));
                  this.fromBin = "";
                  return;
                }
              }
            }
          }
          else {
            this.fromBin = "";
            this.toastr.error('', this.translate.instant("INVALIDBIN"));
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

  OnToBinChange() {


    if (this.toBin == "" || this.toBin == undefined) {
      return;
    }
    this.showLoader = true;
    this.inventoryTransferService.isToBinExist(this.toBin, localStorage.getItem("towhseId")).subscribe(
      data => {
        this.showLoader = false;
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("INVALIDBIN"));
              this.toBin = "";
              return;
            }
            else {
              this.toBin = data[0].ID;
              if (this.toBin == this.fromBin) {
                this.toastr.error('', this.translate.instant("FrmNToBinCantSame"));
                this.toBin = "";
                return;
              }
            }
          }
          else {
            this.toBin = "";
            this.toastr.error('', this.translate.instant("INVALIDBIN"));
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

  ShowToBins() {
    this.showLoader = true;
    this.inventoryTransferService.getToBin(this.fromBin, localStorage.getItem("towhseId")).subscribe(
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

  AddLineLots() {
    this.operationType = "add";

    if (localStorage.getItem("fromscreen") == "InventoryTransferRequest") {
      if (!this.ITRValidation()) {
        return;
      }
    } else {
      if (!this.CheckValidation()) {
        return;
      }
    }

    this.itemIndex = this.IsInvTransferDetailLineExists(this.itemCode,
      this.lotValue, this.fromBin, this.toBin, this.Remarks, "");
    if (this.itemIndex == -1) {
      this.TransferedItemsDetail.push({
        LineNum: '01',
        LotNo: this.lotValue,
        ItemCode: this.itemCode,
        ItemName: this.itemName,
        Qty: "" + this.transferQty,
        SysNumber: this.SysNumber,
        BinNo: this.fromBin,
        ToBin: this.toBin,
        Tracking: this.ItemTracking,
        WhsCode: localStorage.getItem("towhseId"),
        OnHandQty: "" + this.onHandQty,
        Remarks: this.Remarks,
        PalletCode: this.palletNo,
        MfrNo: this.actualLotNo,
        BaseLine: ""
      });
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

  SubmitPutAway() {
    console.log("radio selection: " + this.radioSelected);
    if (this.radioSelected == 1) { // radio selection == 1 for by pallet
      if (this.TransferedItemsDetail.length == 0) {
        this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        return;
      }
      this.SubmitFinally();
    } else {
      this.showValidation = true;
      if (this.TransferedItemsDetail.length > 0) {
        this.showValidation = false;
      }

      var _is = this.AddLineLots();
      this.operationType = "submit";

      if (_is != undefined && !_is) {
        return;
      }
      this.SubmitFinally();
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

    if (localStorage.getItem("fromscreen") == "WhsTransfer") {
      type = "Items";
    } else if (localStorage.getItem("fromscreen") == "InventoryTransferRequest") {
      type = "Items";
    } else {
      type = "";
    }
    oWhsTransAddLot.Header.push({
      WhseCode: localStorage.getItem("fromwhseId"),
      ToWhsCode: localStorage.getItem("towhseId"), //oToWhs,
      Type: type,
      DiServerToken: localStorage.getItem("Token"), //companyDBObject.DIServerToken,
      CompanyDBId: localStorage.getItem("CompID"), //companyDBObject.CompanyDbName,
      TransType: "WHS",
      //--------------------Adding Parameters for the Licence--------------------------------------------
      GUID: localStorage.getItem("GUID"),
      UsernameForLic: localStorage.getItem("UserId"),
      BaseEntry: "",
      BaseType: "0"
      //------------------End for the Licence Parameter------------------------------------------------------
    });


    this.showLoader = true;
    if (localStorage.getItem("fromscreen") == "InventoryTransferRequest") {
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
                this.toastr.success('', this.translate.instant("InvTransfer_ItemsTranSuccessfully") + " " + data[0].SuccessNo);
                oWhsTransAddLot = {};
                oWhsTransAddLot.Header = [];
                oWhsTransAddLot.Detail = [];
                oWhsTransAddLot.UDF = [];
                this.TransferedItemsDetail = [];
                this.selectedPallets = [];
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
                oWhsTransAddLot = {};
                oWhsTransAddLot.Header = [];
                oWhsTransAddLot.Detail = [];
                oWhsTransAddLot.UDF = [];
                this.TransferedItemsDetail = [];
                this.selectedPallets = [];
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
          this.toastr.error('', this.translate.instant("Lotcannotbeblank"));
        }
        return false;
      }
    }
    if (this.ItemTracking == "S") {
      if (this.lotValue == "") {
        if (this.showValidation) {
          this.toastr.error('', this.translate.instant("SerialNoCantBlank"));
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
        this.scanToBin.nativeElement.focus();
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
      this.scanPallet.nativeElement.focus();
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
          //     this.getDefaultToBin();
        }
        if (localStorage.getItem("fromscreen") == "WhsTransfer") {
          this.getDefaultBin();
        }
        this.CheckTrackingandVisiblity();
        this.scanItemCode.nativeElement.focus();
      } else if (this.lookupfor == "BatchNoList") {
        this.lotValue = $event[0];
        this.fromBin = $event[6];
        this.transferQty = $event[7];
        this.onHandQty = $event[7];
        this.SysNumber = $event[9];
        this.palletNo = $event[12];
        this.actualLotNo = $event[13];
        this.scanLotNo.nativeElement.focus();
      } 
      else if (this.lookupfor == "BatchNoList2") {
        this.lotValue = $event[0];
        this.fromBin = $event[5];
        this.transferQty = $event[7];
        this.onHandQty = $event[7];
        this.SysNumber = $event[9];
        this.palletNo = ""
        this.actualLotNo = $event[0];
        this.scanLotNo.nativeElement.focus();
        // this.palletNo = $event[12];
        // this.actualLotNo = $event[13];
      }

      else if (this.lookupfor == "SBTrackFromBin") {
        this.fromBin = $event[3];
        this.transferQty = $event[6];
        this.onHandQty = $event[6];
        this.scanFromBin.nativeElement.focus();
      } else if (this.lookupfor == "NTrackFromBin") {
        this.fromBin = $event[3];
        this.transferQty = $event[6];
        this.onHandQty = $event[6];
        this.scanFromBin.nativeElement.focus();
      } else if (this.lookupfor == "toBinsList") {
        this.toBin = $event[0];
        //this.prepareByPalletData();
        this.scanToBin.nativeElement.focus();
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
    var rs = localStorage.getItem("radioSelection");
    if (rs != undefined && rs.length > 0) {
      this.radioSelected = Number.parseInt(rs);
    }
    this.viewLines = false;
  }

  deleteAllOkClick() {
    var rs = localStorage.getItem("radioSelection");
    if (rs != undefined && rs.length > 0) {
      this.radioSelected = Number.parseInt(rs);
    }
    this.TransferedItemsDetail = [];
    this.selectedPallets = [];
    this.clearData();
    document.getElementById("modalCloseBtn").click();
  }

  formatTransferNumbers() {
    this.transferQty = Number(this.transferQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
  }

  formatOnHandQty() {
    this.onHandQty = Number(this.onHandQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
  }

  goBack() {
    this.operationType = "back";
   
    if (localStorage.getItem("fromscreen") == "WhsTransfer") {
      this.cancelevent.emit(true);
    } else if (localStorage.getItem("fromscreen") == "InventoryTransferRequest") {
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
        }
      }
    }
  }

  handleCheckChange(event) {
    this.checkChangeEvent = event;
    console.log(this.checkChangeEvent);
    if (this.TransferedItemsDetail.length == 0) {
      this.selectedPallets = [];
      this.clearData();
      this.manageCheckChange();
    } else {
      this.checkChangeEvent.preventDefault();
      this.showDialog("RadioBtnChange", this.translate.instant("yes"), this.translate.instant("no"),
        this.translate.instant("Plt_DataDeleteMsg"));
    }
  }

  manageCheckChange() {
    if (this.checkChangeEvent.target.id == "byItem") {
      // mfr serial radio selected.
      this.radioSelected = 0;
      localStorage.setItem("radioSelection", "0");
    }
    if (this.checkChangeEvent.target.id == "byPallet") {
      // mfr serial radio selected.
      this.radioSelected = 1;
      localStorage.setItem("radioSelection", "1");
    }
  }

  public getPalletList() {
    this.showLoader = true;
    this.showLookupLoader = true;
    this.commonservice.GetPalletsWithRowsPresent().subscribe(
      (data: any) => {
        this.showLoader = false;
        this.showLookupLoader = false;
        console.log(data);
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

  onPalletChange() {

    if (this.palletNo == undefined || this.palletNo == "") {
      return;
    }
    this.showLoader = true;
    this.commonservice.isPalletValid(this.palletNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            this.palletNo = data[0].Code;
            //this.selectedPallets.push(data[0]);
            //this.getPalletData();
          } else {
            this.toastr.error('', this.translate.instant("InValidPalletNo"));
            this.palletNo = "";
            return;
          }
        }
        else {
          this.toastr.error('', this.translate.instant("InValidPalletNo"));
          this.palletNo = "";
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

  getPalletData() {
    this.showLoader = true;
    this.commonservice.GetPalletDataForWhseTrns(this.palletNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
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
        WhsCode: localStorage.getItem("towhseId"),
        OnHandQty: this.palletData[i].QTY,
        Remarks: this.Remarks,
        BaseLine: ""
      });
    }
    //this.SubmitFinally();
  }

  showSelectedPallets() {
    this.dialogOpened = !this.dialogOpened;
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

  onAddPalletClick() {
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

  onHiddenByPalBatchNoScanClick()
  {
    var inputValue = (<HTMLInputElement>document.getElementById('binTransferBatchNoInput')).value;
    if (inputValue.length > 0) {
      this.lotValue = inputValue;
    }
    this.OnLotChange();
  }
}
