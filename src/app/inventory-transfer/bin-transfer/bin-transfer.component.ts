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
  onHandQty: any="0";
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

  constructor(private commonservice: Commonservice, private activatedRoute: ActivatedRoute,
    private router: Router, private inventoryTransferService: InventoryTransferService,
    private toastr: ToastrService, private translate: TranslateService,
    private modalService: BsModalService, private _location: Location) {
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
    // apply grid height
    this.gridHeight = UIHelper.getMainContentHeight();

    // check mobile device
    this.isMobile = UIHelper.isMobile();

    //  this.getViewLineList();
    this.viewLines = false;

    if (localStorage.getItem("towhseId") == localStorage.getItem("whseId")) {
      this.PageTitle = this.translate.instant("BinTransfer");
    } else {
      this.PageTitle = this.translate.instant("WarehouseTransfer") + this.translate.instant("From") + localStorage.getItem("whseId") + this.translate.instant("To") + localStorage.getItem("towhseId");
    }
    this.formatTransferNumbers();
    this.formatOnHandQty();
    this.zero = this.onHandQty;
    console.log("bin loaded")
  }


  /** Simple method to toggle element visibility */
  public ShowSavedData(): void {
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
    this.inventoryTransferService.getItemCodeList().subscribe(
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
          this.lookupfor = "ItemCodeList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.toastr.error('', error);
      }
    );
  }

  OnItemCodeChange() {
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
          // oWhsTransEditLot.Remarks = data[0].getValue();
          this.ItemTracking = data[0].TRACKING;
          this.transferQty = "0.000";
          this.onHandQty = 0.000;
          this.CheckTrackingandVisiblity();
          if (localStorage.getItem("whseId") != localStorage.getItem("towhseId")) {
            this.getDefaultBin();
          }
        } else {
          this.toastr.error('', this.translate.instant("InvalidItemCode"));
          this.showItemName = false;
          this.itemCode = "";
          this.fromBin = "";
        }
      },
      error => {
        this.toastr.error('', error);
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
              this.toastr.error('', this.translate.instant("InvalidSerial"));
            }
            else {
              this.toastr.error('', this.translate.instant("InvalidBatch"));
            }
          }
          else {
            this.lotValue = data[0].LOTNO;
            this.onHandQty = data[0].TOTALQTY;
            // oWhsTransEditLot.Qty = oCurrentController.getFormatedValue(oWhsTransEditLot.Qty);
            this.transferQty = this.onHandQty
            this.formatTransferNumbers();
            this.formatOnHandQty();
            // oWhsTransEditLot.Item = data[0].ITEMCODE;
            // oWhsTransEditLot.ITEMNAME = data[0].ITEMCODE;
            // oWhsTransEditLot.Tracking = data[0].TRACKING;
            // oWhsTransEditLot.LotWhsCode = data[0].WHSCODE;
            // oWhsTransEditLot.SysNumber = data[0].SYSNUMBER;
            // oWhsTransEditLot.Remarks = otxtReason.getValue();
          }
        }
      },
      error => {
        this.toastr.error('', error);
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
        this.toastr.error('', error);
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
        this.toastr.error('', error);
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
            this.toastr.error('', this.translate.instant("NoBinsAvailableMsg"));
          }
        }
      },
      error => {
        this.toastr.error('', error);
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
              // olblQtyOnhand.setValue(oCurrentController.getFormatedValue(modelBins.oData[0].TOTALQTY.toString()));
              this.SysNumber = data[0].SYSNUMBER;
              this.LotWhsCode = data[0].WHSCODE;
              //  this.Remarks;// = otxtReason.getValue();
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
        this.toastr.error('', error);
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
        this.toastr.error('', error);
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
              // oModelWhsTranEditLines = new JSONModel(oWhsTransEditLot)
              // oCurrentController.getView().setModel(oModelWhsTranEditLines);
              this.getDefaultBinFlag = false;
            }
          }
          else {
            this.toastr.error('', this.translate.instant("NoBinsAvailableMsg"));
          }
        }
      },
      error => {
        this.toastr.error('', error);
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
    if (!this.CheckValidation()) {
      return;
    }
    var itemIndex = this.IsInvTransferDetailLineExists(this.itemCode,
      this.lotValue, this.fromBin, this.toBin, this.Remarks, "");
    var transferedItemsDetail;
    if (itemIndex == -1) {
      this.TransferedItemsDetail.push({
        LineNum: '01',
        LotNo: this.lotValue,
        ItemCode: this.itemCode,
        ItemName: this.itemName,
        Qty: this.transferQty,
        SysNumber: "0",
        BinNo: this.fromBin,
        ToBin: this.toBin,
        Tracking: this.ItemTracking,
        WhsCode: localStorage.getItem("whseId"),
        OnHandQty: this.onHandQty,
        Remarks: this.Remarks
        //EnableSplitContainer: oCurrentController.GetWMSDefaultValues("EnableSplitContainer"),
        //NewConatiner: oWhsTransEditLot.Container
      });

      // localStorage.setItem("InvPutAwayLot", this.TransferedItemsDetail);
      this.clearData();
    }
    else {
      if (this.ItemTracking == "S") {
        this.toastr.error('', this.translate.instant("SerialAlreadyExist"));
        return false;
      }
      else {
        //this.toastr.error('', this.translate.instant("WhsTransferEdit.overwrite"));
        this.showModal();
        this.ModalContent = this.translate.instant("WhsTransferEdit.overwrite");
        let that = this;

        setTimeout(() => {
          let el: HTMLElement = this.transferedItemsBtn.nativeElement as HTMLElement;
          el.onclick = function () {
            that.TransferedItemsDetail[itemIndex].Qty = that.transferQty;
            that.autoShownModal.hide();
            that.clearData();
          }
        }, 1000);
      }
    }
  }

  showValidation: boolean = true;
  SubmitPutAway() {
    this.showValidation = true;
    if (this.TransferedItemsDetail.length > 0) {
      this.showValidation = false;
    }
    this.AddLineLots();
    var oWhsTransAddLot: any = {};
    oWhsTransAddLot.Header = [];
    oWhsTransAddLot.Detail = [];
    oWhsTransAddLot.UDF = [];
    // var oFromWhs = JSON.parse(sessionStorage.getItem(oCurrentController.SessionProperties.FromWhse));
    // var oToWhs = JSON.parse(sessionStorage.getItem(oCurrentController.SessionProperties.ToWhse));
    for (var i = 0; i < this.TransferedItemsDetail.length; i++) {
      this.TransferedItemsDetail[i].LineNum = i;
    }
    oWhsTransAddLot.Detail = this.TransferedItemsDetail;
    let type;
    if (localStorage.getItem("whseId") == localStorage.getItem("towhseId")) {
      type = "";
    }
    else {
      type = "Items";
    }

    oWhsTransAddLot.Header.push({
      WhseCode: localStorage.getItem("whseId"),
      ToWhsCode: localStorage.getItem("towhseId"), //oToWhs,
      Type: type,
      DiServerToken: localStorage.getItem("Token"), //companyDBObject.DIServerToken,
      CompanyDBId: localStorage.getItem("CompID"), //companyDBObject.CompanyDbName,
      TransType: "WHS",
      //--------------------Adding Parameters for the Licence--------------------------------------------
      GUID: localStorage.getItem("GUID"),
      UsernameForLic: localStorage.getItem("UserId")
      //------------------End for the Licence Parameter------------------------------------------------------
    });

    // var UDF = JSON.parse(sessionStorage.getItem(oCurrentController.SessionProperties.UDFSaveSession));
    // if (UDF != null && UDF.length > 0) {
    //     for (var iIndex = 0; iIndex < UDF.length ; iIndex++) {
    //         oWhsTransAddLot.UDF.push({
    //             Key: UDF[iIndex].Key,
    //             Value: UDF[iIndex].Value,
    //             LotNo: UDF[iIndex].LotNo,
    //             Flag: UDF[iIndex].Source,
    //             LineNo: UDF[iIndex].LineNo

    //         });
    //     }

    // }

    this.inventoryTransferService.submitBinTransfer(oWhsTransAddLot).subscribe(
      data => {

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

              this.toastr.success('', this.translate.instant("ItemsTranSuccessfully") + data[0].SuccessNo);

              oWhsTransAddLot = {};
              oWhsTransAddLot.Header = [];
              oWhsTransAddLot.Detail = [];
              oWhsTransAddLot.UDF = [];
              this.TransferedItemsDetail = [];
              this.clearData();
            }
            else {
              this.toastr.success('', data[0].ErrorMsg);
            }
          }
        }
      },
      error => {
        this.toastr.error('', error);
      }
    );
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
          this.toastr.error('', this.translate.instant("Enterquantitygreaterthanzero"));
        }
        return false;
      }
    }
    if (this.fromBin == "") {
      this.toastr.error('', this.translate.instant("FromBinMsg"));
      return false;
    }
    if (this.toBin == "") {
      if (this.showValidation) {
        this.toastr.error('', this.translate.instant("ToBinMsg"));
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


  getLookupValue($event) {
    if (this.lookupfor == "ItemCodeList") {
      this.itemCode = $event[0];
      this.itemName = $event[1];
      this.ItemTracking = $event[2];
      this.showItemName = true;
      this.transferQty = this.translate.instant("zero");
      this.onHandQty = 0.000;
      if (localStorage.getItem("whseId") != localStorage.getItem("towhseId")) {
        this.getDefaultBin();
      }
      this.CheckTrackingandVisiblity();
    } else if (this.lookupfor == "BatchNoList") {
      this.lotValue = $event[0];
      this.fromBin = $event[6];
      this.transferQty = $event[7];
      this.onHandQty = $event[7];
    } else if (this.lookupfor == "SBTrackFromBin") {
      this.fromBin = $event[3];
      this.transferQty = $event[6];
      this.onHandQty = $event[6];
    } else if (this.lookupfor == "NTrackFromBin") {
      this.fromBin = $event[3];
      this.transferQty = $event[6];
      this.onHandQty = $event[6];
    } else if (this.lookupfor == "toBinsList") {
      this.toBin = $event[0];
    }
    this.formatTransferNumbers();
    this.formatOnHandQty();
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
      // oTxtTransferQty.setEnabled(false);
      // var qty = olblQtyOnhand.getValue();
      // if (qty > 0) {
      //     oWhsTransEditLot.TransferQty = oCurrentController.getFormatedValue("1");
      // }
      // else {
      //     oWhsTransEditLot.TransferQty = oCurrentController.getFormatedValue("0");
      // }
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

  ViewLinesRowDeleteClick(rowindex, gridData: any) {

    this.TransferedItemsDetail.splice(rowindex, 1);
    gridData.data = this.TransferedItemsDetail;
    console.log(this.TransferedItemsDetail.length);
    // const itemDetails = selection.selectedRows[0].dataItem;
    // this.TransferedItemsDetail.splice(index, 1);

  }

  OnOKClick() {
    this.viewLines = false;
  }

  deleteAllOkClick() {
    this.TransferedItemsDetail = [];
    document.getElementById("modalCloseBtn").click();
  }

  formatTransferNumbers() {
    this.transferQty = Number(this.transferQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
  }

  formatOnHandQty() {
    this.onHandQty = Number(this.onHandQty).toFixed(Number(localStorage.getItem("DecimalPrecision")));
  }

  goBack() {
    if (localStorage.getItem("towhseId") == localStorage.getItem("whseId")) {
      this.router.navigate(['home/dashboard']);
    } else {
      this.cancelevent.emit(true);
    }
  }
}
