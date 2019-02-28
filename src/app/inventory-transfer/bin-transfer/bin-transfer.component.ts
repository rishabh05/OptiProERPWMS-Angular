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
  itemCode: string;
  lotValue: string;
  fromBin: string;
  totalQty: string;
  TransferQty: any;
  itemName: string;
  ItemTracking: string;
  serviceData: any[];
  lookupfor: string;
  showItemName: boolean = false;
  showBatchNo: boolean = false;
  Remarks: string;
  SysNumber: any;
  LotWhsCode: any;
  toBin: any;


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
          console.log("ItemList - " + data);
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
          if (data[0].TRACKING == "N") {
            this.checkNonTrack();
          }

        } else {
          this.toastr.error('', this.translate.instant("InvalidItemCode"));
          this.showItemName = false;
          this.itemCode = "";
        }
      },
      error => {
        this.toastr.error('', error);
      }
    );
  }

  OnLotLookupClick() {

  }

  OnLotChange() {
    if (this.lotValue == "" || this.lotValue == undefined) {
      return;
    }
    this.inventoryTransferService.getLotInfo("", "", this.itemCode, this.lotValue).subscribe(
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
            this.totalQty = data[0].TOTALQTY;
            // oWhsTransEditLot.Qty = oCurrentController.getFormatedValue(oWhsTransEditLot.Qty);
            // this.TransferQty = oWhsTransEditLot.Qty
            // olblQtyOnhand.setValue(oWhsTransEditLot.Qty);

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
    this.inventoryTransferService.getLotList("", "", this.itemCode, this.lotValue).subscribe(
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
    if (this.fromBin == "" || this.lotValue == undefined) {
      return;
    }
    this.inventoryTransferService.isFromBinExists(this.ItemTracking, "", this.itemCode, this.lotValue).subscribe(
      data => {
        if (data != null) {
          if (data.length > 0) {
            if (this.ItemTracking == "N") {
              this.fromBin = data[0].BINNO;
              this.TransferQty = data[0].TOTALQTY.toString();
              this.TransferQty = data[0].TOTALQTY.toString();
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


  

  getLookupValue($event) {
    if (this.lookupfor == "ItemCodeList") {
      this.itemCode = $event[0];
      if ($event[1].TRACKING == "N") {
        this.checkNonTrack();
      }
    } else if (this.lookupfor == "BatchNoList") {

    }
  }

  checkNonTrack() {

  }


  CheckTrackingandVisiblity() {

    // if (this.ItemTracking == "B") {
    //   this.showBatchNo = true;
    //     oLotFlex.setVisible(true);
    //     oTxtTransferQty.setEnabled(true);
    //     olbllotqty.setText("OnHand Qty.")
    //     olbllotno.setText("Batch No.");
    // }
    // else if (this.ItemTracking == "S") {
    //   this.showBatchNo = true;
    //     oCurrentController.getView().byId("txtLot").setVisible(true);
    //     oTxtTransferQty.setEnabled(false);
    //     oLotFlex.setVisible(true);
    //     var qty = olblQtyOnhand.getValue();
    //     if (qty > 0) {
    //         oWhsTransEditLot.TransferQty = oCurrentController.getFormatedValue("1");
    //     }
    //     else {
    //         oWhsTransEditLot.TransferQty = oCurrentController.getFormatedValue("0");
    //     }
    //     olbllotqty.setText("Serial Qty.")
    //     olbllotno.setText("Serial No.");
    // }
    // else if (this.ItemTracking == "N") {
    //   this.showBatchNo = false;
    //     olbllotno.setText("")

    // }

  }
}
