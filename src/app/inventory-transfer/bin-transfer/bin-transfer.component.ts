import { Component, OnInit, HostListener, TemplateRef } from '@angular/core';
import { viewLineContent } from '../../DemoData/sales-order';
import { UIHelper } from '../../helpers/ui.helpers';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Commonservice } from 'src/app/services/commonservice.service';
import { Router } from '../../../../node_modules/@angular/router';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { InventoryTransferService } from 'src/app/services/inventory-transfer.service';
import { LangChangeEvent, TranslateService } from '../../../../node_modules/@ngx-translate/core';

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
  itemCode: string="";
  lotValue: string="";
  fromBin: string="";
  transferQty: string="";
  itemName: string="";
  ItemTracking: string="";
  serviceData: any[];
  lookupfor: string;
  showItemName: boolean = false;
  showBatchNo: boolean = false;
  Remarks: string;
  onHandQty: string;
  SysNumber: any;
  LotWhsCode: any;
  toBin: string="";
  getDefaultBinFlag: boolean = false;
  isItemSerialTrack: boolean;
  editTransferQty: boolean;


  constructor(private commonservice: Commonservice, private router: Router, private inventoryTransferService: InventoryTransferService, private toastr: ToastrService, private translate: TranslateService, private modalService: BsModalService) {
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

    localStorage.setItem("towhseId", "01");
  }
  // End UI Section

  ngOnInit() {
    // apply grid height
    this.gridHeight = UIHelper.getMainContentHeight();

    // check mobile device
    this.isMobile = UIHelper.isMobile();

    this.getViewLineList();
    this.viewLines = false;
  }


  /** Simple method to toggle element visibility */
  public toggle(): void { this.viewLines = !this.viewLines; }

  public getViewLineList() {
    this.showLoader = true;
    this.gridData = viewLineContent;
    setTimeout(() => {
      this.showLoader = false;
    }, 1000);
  }


  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'modal-dialog-centered' })
    );
  }

  OnItemCodeLookupClick() {
    this.inventoryTransferService.getItemCodeList().subscribe(
      data => {
        if (data != undefined && data.length > 0) {
          console.log("ItemList - " + data.toString());
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
    this.inventoryTransferService.getItemInfo(this.itemCode).subscribe(
      data => {
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

          this.CheckTrackingandVisiblity();

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
    this.inventoryTransferService.getLotInfo(this.fromBin, this.itemCode, this.lotValue).subscribe(
      data => {
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


  ShowLOTList() {
    this.inventoryTransferService.getLotList(localStorage.getItem("whseId"), this.fromBin, this.itemCode, this.lotValue).subscribe(
      data => {
        if (data != undefined && data.length > 0) {
          console.log("ItemList - " + data);
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
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
    this.inventoryTransferService.getFromBins(this.ItemTracking, "", this.itemCode, this.lotValue).subscribe(
      data => {
        if (data != null) {
          if (data.length > 0) {
            this.showLookupLoader = false;
            this.serviceData = data;
            if (this.ItemTracking != "N") {
              this.lookupfor = "SBTrackFromBin";
            }
            else {
              this.lookupfor = "NTrackFromBin";
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


  OnFromBinChange() {
    if (this.fromBin == "" || this.fromBin == undefined) {
      return;
    }
    this.inventoryTransferService.isFromBinExists(this.ItemTracking, this.fromBin, this.itemCode, this.lotValue).subscribe(
      data => {
        if (data != null) {
          if (data.length > 0) {
            if (this.ItemTracking == "N") {
              this.fromBin = data[0].BINNO;
              this.onHandQty = data[0].TOTALQTY.toString();
              this.transferQty = data[0].TOTALQTY.toString();
              // olblQtyOnhand.setValue(oCurrentController.getFormatedValue(modelBins.oData[0].TOTALQTY.toString()));
              this.SysNumber = data[0].SYSNUMBER;
              this.LotWhsCode = data[0].WHSCODE;
              this.Remarks;// = otxtReason.getValue();
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
    this.inventoryTransferService.isBinExist(this.toBin, "01").subscribe(
      data => {
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
    this.inventoryTransferService.getToBin(this.fromBin, localStorage.getItem("whseId")).subscribe(
      data => {
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

  IsInvTransferDetailLineExists(Item: string, LotNumber: string, Binno: string, ToBin: string, InvType: string): boolean {
    var sumLotQuantity = 0;
    // for (var i = 0; i < oWhsTransAddLot.Detail.length; i++) {
    //     if (oWhsTransAddLot.Detail[i].ItemCode == Item &&
    //            oWhsTransAddLot.Detail[i].LotNo == LotNumber &&
    //            oWhsTransAddLot.Detail[i].BinNo == Binno &&
    //           oWhsTransAddLot.Detail[i].ToBin == ToBin &&
    //     oWhsTransAddLot.Detail[i].Remarks == otxtReason.getValue() &&
    //           oWhsTransAddLot.Detail[i].InvType == InvType)
    //         return oWhsTransAddLot.Detail[i];
    // }
    return false;
  }

  AddLineLots() {

    var oWhsTransAddLot: any = {};
    oWhsTransAddLot.Detail = [];

    var InvDetailLine = this.IsInvTransferDetailLineExists(this.itemCode,
    this.lotValue, this.fromBin, this.toBin, "");
   // if (InvDetailLine == false) {
        //debugger;
        oWhsTransAddLot.Detail.push({

            LineNum: "LineNum",
            LotNo: this.lotValue, 
            ItemCode: this.itemCode,
            ItemName: this.itemName,
            Qty: this.transferQty,
            SysNumber: this.SysNumber,
            BinNo: this.fromBin,
            ToBin: this.toBin,
            Tracking: this.ItemTracking,
            WhsCode: localStorage.getItem("whseId"),
            OnHandQty: this.onHandQty,
            Remarks: this.Remarks
            //EnableSplitContainer: oCurrentController.GetWMSDefaultValues("EnableSplitContainer"),
            //NewConatiner: oWhsTransEditLot.Container
        });
   // }
    // else {
        if (this.ItemTracking == "S") {
          this.toastr.error('', this.translate.instant("SerialAlreadyExist"));
          return false;
        }
        else {
            // var psOverwrite = oCurrentController.GetResourceString("WhsTransferEdit.overwrite");
            // var psDialogConfirm = oCurrentController.GetResourceString("GoodsReceiptPOViewLots.DialogTitle");
            // var psMsgOk = oCurrentController.GetResourceString("GoodsReceiptPOViewLots.Ok");
            // var psMsgCancel = oCurrentController.GetResourceString("GoodsReceiptPOViewLots.Cancel");

            // var dialog = new Dialog({
            //     title: psDialogConfirm,
            //     type: 'Message',
            //     content: new Text({ text: psOverwrite }),
            //     beginButton: new Button({
            //         text: psMsgOk,
            //         press: function () {
            //             //InvDetailLine.Qty = (parseFloat(InvDetailLine.Qty) + parseFloat(this.GetQuantity()));
            //             InvDetailLine.Qty = parseFloat(oCurrentController.GetQuantity());
            //             oCurrentController.ClearModel();
            //             oCurrentController.EnableModel();
            //             sessionStorage.removeItem(oCurrentController.SessionProperties.InvPutAwayLot);
            //             sessionStorage.setItem(oCurrentController.SessionProperties.InvPutAwayLot, JSON.stringify(oWhsTransAddLot));
            //             dialog.close();
            //         }
            //     }),
            //     endButton: new Button({
            //         text: psMsgCancel,
            //         press: function () {
            //             dialog.close();
            //         }
            //     }),
            //     afterClose: function () {
            //         dialog.destroy();
            //     }
            // });

            // dialog.open();
        }

       
    // }

}


  getLookupValue($event) {
    if (this.lookupfor == "ItemCodeList") {
      this.itemCode = $event[0];
      this.itemName  = $event[1];
      this.ItemTracking = $event[2];
      this.showItemName = true;
      this.CheckTrackingandVisiblity();
    } else if (this.lookupfor == "BatchNoList") {
      this.lotValue = $event[0];
      this.fromBin  = $event[6];
    } else if (this.lookupfor == "SBTrackFromBin") {
      this.fromBin  = $event[3];
    } else if (this.lookupfor == "NTrackFromBin") {
      this.fromBin  = $event[3];
    } else if (this.lookupfor == "toBinsList") {
      this.toBin = $event[0];
    }
  }

  CheckTrackingandVisiblity() {
    if (this.ItemTracking == "B") {
      this.isItemSerialTrack = false;
      this.showBatchNo = true;
      this.editTransferQty = false;
        // oTxtTransferQty.setEnabled(true);
    }
    else if (this.ItemTracking == "S") {
      this.isItemSerialTrack = true;
      this.showBatchNo = true;
      this.editTransferQty = true;
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
        // olbllotno.setText("")
    }

    this.fromBin = "";
    this.toBin = "";
    this.lotValue = "";
  }
}
