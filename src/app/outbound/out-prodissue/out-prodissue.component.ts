import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonConstants } from '../../const/common-constants';
import { OutboundService } from '../../services/outbound.service';
import { OutboundData } from '../../models/outbound/outbound-data';
import { MeterialModel } from '../../models/outbound/meterial-model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { forEach } from '@angular/router/src/utils/collection';
import { anyChanged } from '@progress/kendo-angular-grid/dist/es2015/utils';
import { Commonservice } from '../../services/commonservice.service';

import { Lot, ProductionIssueModel, Item } from '../../models/Production/IFP';
import { ProductionService } from '../../services/production.service';
import { LabelPrintReportsService } from '../../services/label-print-reports.service';
import { ISubscription } from 'rxjs/Subscription';
import { InboundService } from '../../services/inbound.service';
import { InventoryTransferService } from '../../services/inventory-transfer.service';
import { PackingModel } from '../../models/outbound/PackingModel';
import { PickingModule } from '../../picking/picking.module';
import { IUIComponentTemplate } from 'src/app/common/ui-component.interface';



@Component({
  selector: 'app-out-prodissue',
  templateUrl: './out-prodissue.component.html',
  styleUrls: ['./out-prodissue.component.scss']
})
export class OutProdissueComponent implements OnInit {
  dialogMsg: string = "Do you want to delete?"
  yesButtonText: string = "Yes";
  noButtonText: string = "No";
  public outbound: OutboundData;
  public selected: any = null;
  public step: number = 0.001;
  public lookupData: any;
  public lookupFor: any = 'out-items';
  public showLookup: boolean = false;
  public selectedItems: any;
  public totalPickQty: number = 0.000;
  public mask: string = "0.000";
  public uomList: any = [];
  public selectedMeterials: any = Array<MeterialModel>();
  public comingSelectedMeterials: any = Array<MeterialModel>();
  public indivisualPickQty: number = 0.000;
  @Output() screenBackEvent = new EventEmitter();
  public _requiredMeterialQty: number = 0;
  public _remainingMeterial: number = 0;
  public _pickedMeterialQty: number = 0;
  public _pickedMeterialQtyInvUOM: number = 0;
  public OrderType: string = '';
  public oldSelectedMeterials: any = Array<MeterialModel>();
  public OperationType: any;
  public scanInputPlaceholder = "Select/Scan"
  public SerialBatchHeaderTitle: string = "";
  public selectedPackingModel: PackingModel = new PackingModel();
  showConfirmDialog: boolean;
  rowindexForDelete: any;
  delIdx: any;
  delGrd: any;
  showLookupLoader: boolean = false;
  selectedUOM: any;
  uomIdx: number = 0;
  PickQtylbl: string;
  OpenQtylbl: string;
  public pagable: boolean = false;
  public pageSize: number = Commonservice.pageSize;
  public pageTitle: any = "";
  showOtherLookup: boolean = false;
  formatVal = ''
  constructor(private ourboundService: OutboundService, private router: Router,
    private toastr: ToastrService, private translate: TranslateService, private inventoryTransferService: InventoryTransferService,
    private commonservice: Commonservice, private productionService: ProductionService) {

  }

  fromProduction = false;
  public currentOrderNo: string;
  fromITR: any = false;
  toBinNo: string = "";
  toWhse: string = "";
  showSaveButton: boolean = false;
  @ViewChild('scanToBin') scanToBin;
  @ViewChild('scanBatchSerial') scanBatchSerial;

  SelectedPackingNo: any;
  docEntry: any;
  fromShipment: boolean = false;
  IsUDFEnabled = "N"

  async ngOnInit() {
    var precision = sessionStorage.getItem("DecimalPrecision");
    this.formatVal = 'n' + precision;
    console.log("decimal precision" + this.formatVal);
    this.IsUDFEnabled = sessionStorage.getItem("ISUDFEnabled");
    if (sessionStorage.getItem(CommonConstants.FROM_DTS) == "true") {
      this.fromShipment = true;
    }
    //lsOutbound
    let outboundData = sessionStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      this.selected = this.outbound.SelectedItem;
      this.OrderType = this.selected.TRACKING;
      this.docEntry = this.outbound.SelectedItem.DOCENTRY;
      // if(this.outbound.UDF.length > 0){
      this.UDF = this.outbound.UDF;
      // }
      this.currentOrderNo = this.outbound.OrderData["Order No"]

      if (sessionStorage.getItem("ComingFrom") != "itr" && sessionStorage.getItem("ComingFrom") != "ProductionIssue") {
        // call api to get uom data by item id.
        await this.ourboundService.getUOMList(this.selected.ITEMCODE, this.docEntry, this.selected.LINENUM).then(
          data => {
            this.uomList = data;

            if (sessionStorage.getItem("ComingFrom") != "itr" && sessionStorage.getItem("ComingFrom") != "ProductionIssue") {
              for (let i = 0; i < this.outbound.TempMeterials.length; i++) {
                if (this.outbound.TempMeterials[i].Item.ITEMCODE == this.outbound.SelectedItem.ITEMCODE
                  && this.outbound.TempMeterials[i].Item.ROWNUM == this.outbound.SelectedItem.ROWNUM
                  && this.outbound.TempMeterials[i].Item.DOCNUM == this.outbound.OrderData.DOCNUM) {
                  this.selected.SelectedUOMCode = this.outbound.TempMeterials[i].Item.SelectedUOMCode;
                  this.selected.SelectedUOMEntry = this.outbound.TempMeterials[i].Item.SelectedUOMEntry;
                }
              }
              if (this.selected.SelectedUOMCode == "" || this.selected.SelectedUOMCode == undefined || this.selected.SelectedUOMCode == null) {
                this.selectedUOM = this.uomList.find(u => u.UomCode == this.selected.UOM);
              } else {
                this.selectedUOM = this.uomList.find(u => u.UomCode == this.selected.SelectedUOMCode);
              }
              // this.selectedUOM = this.selectedUOM[0];
              if (this.selected.TRACKING == 'S') {
                this.selected.INVOPENQTY = this.selected.OPENQTY * this.selectedUOM.BaseQty;
              } else {
                this.selected.INVOPENQTY = this.selected.OPENQTY * this.selectedUOM.BaseQty
              }

              this.selected.INVOPENQTY = Number(this.selected.INVOPENQTY).toFixed(Number(sessionStorage.getItem("DecimalPrecision")));
            }
          }
        )
      }
      if (this.OrderType != 'N') {
        if (this.OrderType === 'S') {
          this.SerialBatchHeaderTitle = this.translate.instant("SerialNo");
        }
        else if (this.OrderType === 'B') {
          this.SerialBatchHeaderTitle = this.translate.instant("BatchNo");
        }
        this.manageOldCollection();
      }
      if (sessionStorage.getItem("ComingFrom") == "itr") {
        this.toBinNo = this.selected.ToBin;//this.outbound.ITRToBinNo.ToBin;
        this.toWhse = this.outbound.ITRToBinNo.ToWhse;
        this.fromProduction = false;
        this.fromITR = true;
        this.PickQtylbl = this.translate.instant("PickQty");
        this.OpenQtylbl = this.translate.instant("OpenQty");
        this.pageTitle = this.translate.instant("InvTransfer_ITR");
        this.getDefaultToBin();
      } else if (sessionStorage.getItem("ComingFrom") == "ProductionIssue") {

        this.fromProduction = true;
        this.fromITR = false;
        this.OpenQtylbl = this.translate.instant("BalanceQty");
        this.PickQtylbl = this.translate.instant("IssuedQty");
        this.pageTitle = this.translate.instant("ProdIssue_IssueForPO");
      } else {
        this.fromProduction = false;
        this.fromITR = false;
        this.PickQtylbl = this.translate.instant("PickQty");
        this.OpenQtylbl = this.translate.instant("OpenQty");
        this.pageTitle = this.translate.instant("ProdIssue_DeleiveryForSO");
        if (this.outbound.selectedPackingItem != undefined &&
          this.outbound.selectedPackingItem != null) {
          this.selectedPackingModel = new PackingModel();
          this.selectedPackingModel = this.outbound.selectedPackingItem;
        } else {
          this.selectedPackingModel = new PackingModel();
          this.selectedPackingModel.PkgNo = '';
          this.selectedPackingModel.PkgType = '';
        }

      }



      this._requiredMeterialQty = parseFloat(this.selected.OPENQTY);
      this._remainingMeterial = this._requiredMeterialQty - this._pickedMeterialQty;
      this.selectedItems = [this.selected];

      if (this.OrderType == 'N') {
        this.showLookupLoader = true;
        this.ourboundService.getAvaliableMeterialForNoneTracked(this.selected.ITEMCODE).subscribe(
          mdata => {
            this.showLookupLoader = false;
            let el: any = document.getElementById('gridSelectedMeterial');
            this.getLookupValue(mdata, el, true);
            this.manageUOM();
          }
        );
      }
    }
    this.commonservice.GetWMSUDFBasedOnScreen("15041");
  }

  onUoMChange(event, gridItem) {

    // gridItem.data = this.openPOLineModel[0];
  }

  ngAfterViewInit(): void {
    // we do not need to show focus in case of shipent
    if (this.fromShipment != true) {
      setTimeout(() => {

        if (sessionStorage.getItem("ComingFrom") == "itr") {
          this.scanToBin.nativeElement.focus()
        } else {
          if (this.OrderType != 'N') {
            this.scanBatchSerial.nativeElement.focus()
          }
        }
      }, 200);
    }
  }

  manageUOM() {
    if (this.selected.TRACKING == 'S') {
      let total = this.selectedMeterials.map(i => i.MeterialPickQty).reduce((sum, c) => sum + c);
      this._pickedMeterialQty = this.selectedUOM.AltQty * total;
    } else {
      this._pickedMeterialQtyInvUOM = this.selectedUOM.BaseQty * this._pickedMeterialQty;
    }
    this.selected.INVOPENQTY = this.selected.OPENQTY * this.selectedUOM.BaseQty
    this.selected.INVOPENQTY = Number(this.selected.INVOPENQTY).toFixed(Number(sessionStorage.getItem("DecimalPrecision")));
    this._pickedMeterialQtyInvUOM = Number(Number(this._pickedMeterialQtyInvUOM).toFixed(Number(sessionStorage.getItem("DecimalPrecision"))));
  }

  manageOldCollection() {
    let itemMeterials: any = [];
    if (this.outbound.TempMeterials !== undefined
      && this.outbound.TempMeterials !== null
      && this.outbound.TempMeterials.length > 0) {

      if (sessionStorage.getItem("ComingFrom") == "itr") {
        for (let i = 0; i < this.outbound.TempMeterials.length; i++) {
          if (this.outbound.TempMeterials[i].Item.ITEMCODE == this.outbound.SelectedItem.ITEMCODE
            && this.outbound.TempMeterials[i].Item.ROWNUM == this.outbound.SelectedItem.ROWNUM
            && this.outbound.TempMeterials[i].Item.DOCNUM == this.outbound.SelectedItem.DOCNUM) {
            itemMeterials.push(this.outbound.TempMeterials[i]);
          }
        }
      } else {
        for (let i = 0; i < this.outbound.TempMeterials.length; i++) {
          if (this.outbound.TempMeterials[i].Item.ITEMCODE == this.outbound.SelectedItem.ITEMCODE
            && this.outbound.TempMeterials[i].Item.ROWNUM == this.outbound.SelectedItem.ROWNUM
            && this.outbound.TempMeterials[i].Item.DOCNUM == this.outbound.OrderData.DOCNUM) {
            itemMeterials.push(this.outbound.TempMeterials[i]);
          }
        }
      }
    }
    if (itemMeterials !== undefined && itemMeterials !== null
      && itemMeterials.length > 0) {

      itemMeterials.forEach(element => {
        if (sessionStorage.getItem("ComingFrom") != "itr" && sessionStorage.getItem("ComingFrom") != "ProductionIssue" && this.selected.TRACKING != 'S') {
          element.Meterial.MeterialPickQty = element.Meterial.MeterialPickQty * this.selectedUOM.AltQty;
        }
        this.selectedMeterials.push(element.Meterial)
      });
      //applying paging..
      this.pagable = this.selectedMeterials.length > this.pageSize;
      this.manageMeterial();
      this.calculateTotalAndRemainingQty();
    }
  }

  onScanInputChange() {
    if (this.ScanInputs == undefined || this.ScanInputs == null || this.ScanInputs == "") {
      return;
    }
    if (this.needMeterial() == false) {
      this.toastr.error('', this.translate.instant("ProdIssue_PickedAllRequiredItems"));
      //alert('You picked all requerde items.');
      return;
    }
    this.onGS1ScanItem();
  }

  prodIssueScan() {

  }

  onHiddenScanClick() {

    var inputValue = (<HTMLInputElement>document.getElementById('outboundOrderNoScanInput')).value;
    if (inputValue.length > 0) {
      this.ScanInputs = inputValue;
    }
    this.onGS1ScanItem();
  }
  ScanInputs: string = "";
  onGS1ScanItem() {
    if (this.ScanInputs != null && this.ScanInputs != undefined &&
      this.ScanInputs != "" && this.ScanInputs != "error decoding QR Code") {

    } else {
      // if any message is required to show then show.
      this.ScanInputs = "";
      return;
    }
    let this1 = this;
    var code = "";
    if (this.outbound.CustomerData != null &&
      this.outbound.CustomerData != undefined &&
      this.outbound.CustomerData != "null") {
      code = this.outbound.CustomerData.CustomerCode;
    } else {
      code = ""
    }

    this.commonservice.checkAndScanCode(code, this.ScanInputs, this.outbound.SelectedItem.ITEMCODE, this.selected.TRACKING).subscribe(
      (data: any) => {
        //  alert("check and scan code api call response data:"+JSON.stringify(data));
        let openQty: number;
        let tracking: string;
        let oepxpdt: string;
        var piManualOrSingleDimentionBarcode = 0
        var serialNo = "";
        if (data != null) {

          if (data[0].Error != null) {
            this.ScanBatchSerial(openQty);
            if (data[0].Error == "Invalidcodescan") {
              piManualOrSingleDimentionBarcode = 1
              // this.toastr.error('', this.translate.instant("InvalidScanCode"));
              this.ScanInputs = "";
              // nothing is done in old code.
            } else {
              // some message is handle in else section in old code
              //return;
            }
            return;
          }

          // now check if the  code is for avilable item or not other wise invalid item error.
          var itemCode = this.outbound.SelectedItem.ITEMCODE;

          if (piManualOrSingleDimentionBarcode == 0) {
            if (data[0] != null && data[0].Value != null && (data[0].Value.toUpperCase() != itemCode.toUpperCase())) {
              this.toastr.error('', this.translate.instant("InvalidItemCode"));
              this.ScanInputs = "";
              return;
            }

            var piExpDateExist = 0;
            tracking = this1.OperationType;

            for (var i = 0; i < data.length; i++) {
              if (data[i].Key == '10' || data[i].Key == '21' || data[i].Key == '23') {
                this.ScanInputs = data[i].Value;
                serialNo = data[i].Value;

                let result = this.selectedMeterials.find(element => element.LOTNO == serialNo);
                if (result != undefined) {
                  this.toastr.error('', this.translate.instant("ProdIssue_BatchSerialAlreadyExist"));
                  return;
                }

                //scan input value me set karna hai
                // make sure ScanInputs variable me puri string aati hai.. to uski value change karne
                // se kuch affect na kare.
                //scan input field par set karna hai.. ye value 10,21,23 k case me.
              }
              if (data[i].Key == '15' || data[i].Key == '17') {
                var d = data[i].Value.split('/');
                oepxpdt = d[0] + '/' + d[1] + '/' + d[2];
                // set value to date field 
                ///  this.expiryDate = oepxpdt; 
                piExpDateExist = 1; //taken this variable for date purpose check if later used.
              }
              if (data[i].Key == '30' || data[i].Key == '310' ||
                data[i].Key == '315' || data[i].Key == '316' || data[i].Key == '320') {
                openQty = data[i].Value;
                // ye dekhna hai kaise use hoga  this.addQuantity();
              }
            }
          }

          this.ourboundService.getAllPickPackAndOtherSerialBatchWithoutBin(itemCode, "", serialNo,
            this.outbound.SelectedItem.DOCENTRY).subscribe(
              (data: any) => {
                // if (data != null && data != undefined && data.length > 0) {
                //   // var binno = data[0].BINNO;
                //   // var totalQty = data[0].TOTALQTY;
                //   // var lotNo = data[0].LOTNO;
                //   // var PickQty = openQty;
                //   // var sysNumber = data[0].SYSNUMBER;
                //   // let lookupArray: any = [{
                //   //   ITEMCODE: itemCode, OPENQTY: openQty, BINNO: binno,
                //   //   TOTALQTY: totalQty, LOTNO: lotNo, PickQty: PickQty, SYSNUMBER: sysNumber
                //   // }];

                //   for (var i = 0; i < data.length; i++) {
                //     data[i].MeterialPickQty = openQty
                //     data[i].OPENQTY = undefined
                //     data[i].PickQty = undefined
                //   }
                //   let el: any = document.getElementById('gridSelectedMeterial');
                //   this.getLookupValue(data, el, true, true);

                //   // this.setScanBtchSerIntoGrid(data, openQty, "GSTNScan");
                // } else {
                //   this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
                // }
                // this.ScanInputs = "";

                if (data != null && data != undefined && data.length > 0) {
                  this.setScanBtchSerIntoGrid(data, openQty, true, "");
                } else {
                  this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
                }
                this.ScanInputs = "";
              },
              error => {
                console.log("Error when checking availability: ", error);
              });
        } else {
          this.ScanBatchSerial(openQty);
        }
      },
      error => {
        console.log("Error: ", error);
      });
  }

  ScanBatchSerial(openQty) {
    this.ourboundService.getAllPickPackAndOtherSerialBatchWithoutBin(this.outbound.SelectedItem.ITEMCODE, "", this.ScanInputs,
      this.outbound.SelectedItem.DOCENTRY).subscribe(
        (data: any) => {
          if (data != null && data != undefined && data.length > 0) {
            this.setScanBtchSerIntoGrid(data, openQty, false, "");
          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
          this.ScanInputs = "";
        },
        error => {
          console.log("Error when checking availability: ", error);
        });
  }

  setScanBtchSerIntoGrid(data, openQty, scan, fromWhere?: string) {
    let el: any = document.getElementById('gridSelectedMeterial');
    if (el.data != undefined && el.data.length > 0) {
      let index = el.data.findIndex(e => e.LOTNO == data[0].LOTNO);
      if (index != -1) {
        this.toastr.error('', this.translate.instant("ProdIssue_BatchSerialAlreadyExist"))
        return;
      }
    } else if (el.data == undefined && this.selectedMeterials.length > 0) {
      let index = this.selectedMeterials.findIndex(e => e.LOTNO == data[0].LOTNO);
      if (index != -1) {
        this.toastr.error('', this.translate.instant("ProdIssue_BatchSerialAlreadyExist"))
        return;
      }
    }
    for (var i = 0; i < data.length; i++) {
      data[i].MeterialPickQty = openQty
      data[i].OPENQTY = undefined
      data[i].PickQty = undefined
    }
    this.lookupData = data;
    if (data.length > 1) {
      this.manageOldSelectedItems();
      this.manageExistingItem();
      this.lookupFor = "out-items"
      this.showLookup = true;
      this.showOtherLookup = false;
    } else {
      this.getLookupValue(data, el, true, scan, fromWhere);
    }
  }

  calculateRequeiredMeterial(): boolean {
    let needMeterial: boolean = false;
    let localTotalPickQty: number = this.totalPickQty;
    let requiredQty: number = parseFloat(this.selected.OPENQTY) - localTotalPickQty;
    if (localTotalPickQty >= requiredQty) {
      return false;
    }
    if (this.comingSelectedMeterials != undefined && this.comingSelectedMeterials != null && this.comingSelectedMeterials.length > 0) {
      this.comingSelectedMeterials = this.comingSelectedMeterials.reverse(i => i.TOTALQTY);
      // Insert Pick qty
      for (let i = 0; i < this.comingSelectedMeterials.length; i++) {
        requiredQty = requiredQty - localTotalPickQty;
        needMeterial = true;
        let meterial = this.comingSelectedMeterials[i];
        let meterialExists: boolean = false;
        meterialExists = this.selectedItems.filter(i => i.LOTNO == meterial.LOTNO && i.BINNO == meterial.BINNO).length > 0;
        if (meterialExists) {
          return false;
        }
        let avlQty = meterial.TOTALQTY;
        if (avlQty >= requiredQty) {
          meterial.MeterialPickQty = parseFloat(this.selected.OPENQTY);
        }
        else {
          meterial.MeterialPickQty = parseFloat(avlQty);
        }
        localTotalPickQty = localTotalPickQty + meterial.MeterialPickQty;
        this.selectedMeterials.push(meterial);
        //apply paging..
        this.pagable = this.selectedMeterials.length > this.pageSize;
      }
      this.totalPickQty = this.totalPickQty + this.selectedMeterials.map(i => i.MeterialPickQty).reduce((sum, c) => sum + c);
    }
    return needMeterial;
  }

  QtyFilled() {
    if (this.selectedMeterials != undefined && this.selectedMeterials != null && this.selectedMeterials.length > 0) {
      this.totalPickQty = this.totalPickQty + this.selectedMeterials.map(i => i.MeterialPickQty).reduce((sum, c) => sum + c);
    }
    else {
      this.totalPickQty = 0;
    }
    return this.totalPickQty >= this.selected.OPENQTY;
  }

  needMeterial() {
    this.calculateTotalAndRemainingQty();
    if (sessionStorage.getItem("ComingFrom") == "ProductionIssue") {
      return this._pickedMeterialQty < this._requiredMeterialQty;
    } else {
      if (sessionStorage.getItem("IsGreaterQuantityAllowedThanOrder") == "Y") {
        return true;
      }
    }
  }

  onIssueMeterialQtyChange(idx: number, txt: any) {
    let oldValue: number = parseFloat(this.oldSelectedMeterials[idx].MeterialPickQty);
    if (this.selectedMeterials[idx].MeterialPickQty === null || this.selectedMeterials[idx].MeterialPickQty === undefined) {
      this.selectedMeterials[idx].MeterialPickQty = oldValue;
    }
    //let oldValue: number = parseFloat(this.selectedMeterials[idx].MeterialPickQty);

    if (txt.value === '' || txt.value === undefined || txt.value === null) {
      this.toastr.error('', this.translate.instant("ProdIssue_MeterialCanNotBeBlank"));
      txt.value = oldValue;
      this.selectedMeterials[idx].MeterialPickQty = oldValue;
      return;
    }
    this.selectedMeterials[idx].MeterialPickQty = parseFloat(txt.value);
    if (this.selectedMeterials[idx].MeterialPickQty > this.selectedMeterials[idx].TOTALQTY) {

      this.toastr.error('', this.translate.instant("ProdIssue_QtyGTTotal"));
      txt.value = oldValue;
      this.selectedMeterials[idx].MeterialPickQty = oldValue;
    }
    this.calculateTotalAndRemainingQty();
    if (this._pickedMeterialQty < 0) {
      this.toastr.error('', this.translate.instant("ProdIssue_MeterialCanNotBeLTZero"));
      txt.value = oldValue;
      this.selectedMeterials[idx].MeterialPickQty = oldValue;
      //apply paging..
      this.pagable = this.selectedMeterials.length > this.pageSize;
      this.calculateTotalAndRemainingQty();
      return;
    }
    if (this._pickedMeterialQty > this._requiredMeterialQty) {
      if (sessionStorage.getItem("ComingFrom") == "ProductionIssue") {
        this.toastr.error('', this.translate.instant("ProdIssue_QtyGTOpen"));
        txt.value = oldValue;
        this.selectedMeterials[idx].MeterialPickQty = oldValue;
        this.calculateTotalAndRemainingQty();
        return;
      } else if (sessionStorage.getItem("IsGreaterQuantityAllowedThanOrder") != "Y") {
        this.toastr.error('', this.translate.instant("ProdIssue_QtyGTOpen"));
        txt.value = oldValue;
        this.selectedMeterials[idx].MeterialPickQty = oldValue;
        this.calculateTotalAndRemainingQty();
        return;
      }
    }
    this.updateQtyInPackingForAlreadySelectedMaterial(this.selectedMeterials[idx].MeterialPickQty);
  }

  calculateTotalAndRemainingQty() {
    if (this.selectedMeterials && this.selectedMeterials.length > 0) {
      this._pickedMeterialQty = this.selectedMeterials.map(i => i.MeterialPickQty).reduce((sum, c) => parseFloat(sum) + parseFloat(c));
      this._remainingMeterial = this._requiredMeterialQty - this._pickedMeterialQty;
    }
    else {
      this._pickedMeterialQty = 0;
      this._remainingMeterial = this._requiredMeterialQty - this._pickedMeterialQty;
    }
    if (sessionStorage.getItem("ComingFrom") != "itr" && sessionStorage.getItem("ComingFrom") != "ProductionIssue") {
      if (this.selected.TRACKING == 'S') {
        this._pickedMeterialQty = this._pickedMeterialQty * this.selectedUOM.AltQty;
      }
      this._pickedMeterialQtyInvUOM = this.selectedUOM.BaseQty * this._pickedMeterialQty;
      this._pickedMeterialQtyInvUOM = Number(Number(this._pickedMeterialQtyInvUOM).toFixed(Number(sessionStorage.getItem("DecimalPrecision"))));
      this._pickedMeterialQty = Number(Number(this._pickedMeterialQty).toFixed(Number(sessionStorage.getItem("DecimalPrecision"))));
    }
  }

  public openAvaliableMeterials() {
    if (this.needMeterial() == false) {
      this.toastr.error('', this.translate.instant("ProdIssue_PickedAllRequiredItems"));
      return;
    }
    let itemCode = this.selected.ITEMCODE;
    let docEntry = this.selected.DOCENTRY;
    this.showLookupLoader = true;
    this.ourboundService.getAvaliableMeterial(itemCode, docEntry).subscribe(
      (resp: any) => {
        for (var i = 0; i < resp.length; i++) {
          resp[i].selected = false;
        }
        this.lookupData = resp;
        this.showLookupLoader = false;
        if (this.lookupData.length > 0) {
          this.manageOldSelectedItems();
          this.manageExistingItem();
          this.lookupFor = "out-items"
          this.showLookup = true;
          this.showOtherLookup = false;
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      }
    )
  }

  getLookupValue(lookupValue: any, gridSelectedMeterial: any, updateGrid: boolean = true, scan: boolean = false, fromwhere?: string) {
    this.showLookup = false;
    this.showOtherLookup = false;
    if (this.lookupFor == "packingList") {
      this.selectedPackingModel = new PackingModel();
      this.selectedPackingModel.PkgNo = lookupValue.PkgNo;
      this.selectedPackingModel.PkgType = lookupValue.PkgType;
      this.showPackingLookup = false;
      var outbound: any;
      this.outbound.selectedPackingItem = this.selectedPackingModel
      //storing selectedPacking to db.
      let outboundData = sessionStorage.getItem(CommonConstants.OutboundData);
      if (outboundData != undefined && outboundData != '') {
        outbound = JSON.parse(outboundData);
        outbound.selectedPackingItem = this.selectedPackingModel;
        sessionStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
      }
    } else {
      if (this.lookupFor == "toBinsList") {
        this.toBinNo = lookupValue.BINNO;
        if (this.OrderType == 'N') {
          this.updateToBinForCommingSelectedMaterial(this.toBinNo);
        } else {
          this.scanBatchSerial.nativeElement.focus()
        }
        //this.selectedMeterials = [];
        // this.manageMeterial(scan);
      } else if (lookupValue) {
        if (this.OrderType == 'S') {
          let data: any[] = [];
          let tempLookup: any[] = lookupValue;
          if (sessionStorage.getItem("ComingFrom") != "ProductionIssue" && sessionStorage.getItem("IsGreaterQuantityAllowedThanOrder") == "Y") {
            for (let i = 0; i < tempLookup.length; i++) {
              if (i < tempLookup.length) {
                if (this.fromITR) {
                  if (lookupValue[i].ToBin == null || lookupValue[i].ToBin == undefined || lookupValue[i].ToBin == "") {
                    data.push({
                      ACTLOTNO: lookupValue[i].ACTLOTNO,
                      BINNO: lookupValue[i].BINNO,
                      EXPDATE: lookupValue[i].EXPDATE,
                      ITEMCODE: lookupValue[i].ITEMCODE,
                      LOTNO: lookupValue[i].LOTNO,
                      PALLETNO: lookupValue[i].PALLETNO,
                      SYSNUMBER: lookupValue[i].SYSNUMBER,
                      TOTALQTY: lookupValue[i].TOTALQTY,
                      WHSCODE: lookupValue[i].WHSCODE,
                      ToBin: this.toBinNo
                    })
                  } else {
                    data.push(lookupValue[i]);
                  }
                } else {
                  // case of outbound and issue prodn.
                  data.push(tempLookup[i]);
                }
              }
            }
          } else {
            for (let i = 0; i < this._remainingMeterial; i++) {
              if (i < tempLookup.length) {
                if (this.fromITR) {
                  if (lookupValue[i].ToBin == null || lookupValue[i].ToBin == undefined || lookupValue[i].ToBin == "") {
                    data.push({
                      ACTLOTNO: lookupValue[i].ACTLOTNO,
                      BINNO: lookupValue[i].BINNO,
                      EXPDATE: lookupValue[i].EXPDATE,
                      ITEMCODE: lookupValue[i].ITEMCODE,
                      LOTNO: lookupValue[i].LOTNO,
                      PALLETNO: lookupValue[i].PALLETNO,
                      SYSNUMBER: lookupValue[i].SYSNUMBER,
                      TOTALQTY: lookupValue[i].TOTALQTY,
                      WHSCODE: lookupValue[i].WHSCODE,
                      ToBin: this.toBinNo
                    })
                  } else {
                    data.push(lookupValue[i]);
                  }
                } else {
                  // case of outbound and issue prodn.
                  data.push(tempLookup[i]);
                }
              }
            }
          }
          this.comingSelectedMeterials = data;
        } else {
          if (this.fromITR) {
            this.comingSelectedMeterials = [];
            for (let i = 0; i < lookupValue.length; i++) {
              if (lookupValue[i].ToBin == null || lookupValue[i].ToBin == undefined || lookupValue[i].ToBin == "") {
                this.comingSelectedMeterials.push({
                  ACTLOTNO: lookupValue[i].ACTLOTNO,
                  BINNO: lookupValue[i].BINNO,
                  EXPDATE: lookupValue[i].EXPDATE,
                  ITEMCODE: lookupValue[i].ITEMCODE,
                  LOTNO: lookupValue[i].LOTNO,
                  PALLETNO: lookupValue[i].PALLETNO,
                  SYSNUMBER: lookupValue[i].SYSNUMBER,
                  TOTALQTY: lookupValue[i].TOTALQTY,
                  WHSCODE: lookupValue[i].WHSCODE,
                  ToBin: this.toBinNo
                })
              } else {
                this.comingSelectedMeterials.push(lookupValue[i]);
              }
            }
          } else {
            // case of outbound and issue prodn.
            this.comingSelectedMeterials = lookupValue;
          }
        }
        this.manageMeterial(scan, fromwhere);
        if (updateGrid == true)
          gridSelectedMeterial.data = this.selectedMeterials;
        //lsOutbound
        var addedPackingCollection = this.outbound.packingCollection;
        this.outbound = JSON.parse(sessionStorage.getItem(CommonConstants.OutboundData));
        this.outbound.SelectedMeterials = lookupValue;
        this.outbound.packingCollection = addedPackingCollection;
        sessionStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
        if (this.OrderType != 'N') {
          this.scanBatchSerial.nativeElement.focus()
        }
      } else {
        this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        this.showLookupLoader = false;
        this.showLookup = false;
      }
    }
  }

  updateToBinForCommingSelectedMaterial(toBin: string) {
    var tempComingSelectedMaterialList = []
    if (this.selectedMeterials != null && this.selectedMeterials != undefined && this.selectedMeterials.length > 0) {
      for (let i = 0; i < this.selectedMeterials.length; i++) {
        tempComingSelectedMaterialList.push({
          ACTLOTNO: this.selectedMeterials[i].ACTLOTNO,
          BINNO: this.selectedMeterials[i].BINNO,
          EXPDATE: this.selectedMeterials[i].EXPDATE,
          ITEMCODE: this.selectedMeterials[i].ITEMCODE,
          LOTNO: this.selectedMeterials[i].LOTNO,
          PALLETNO: this.selectedMeterials[i].PALLETNO,
          SYSNUMBER: this.selectedMeterials[i].SYSNUMBER,
          TOTALQTY: this.selectedMeterials[i].TOTALQTY,
          WHSCODE: this.selectedMeterials[i].WHSCODE,
          ToBin: toBin,
          MeterialPickQty: this.selectedMeterials[i].MeterialPickQty
        })
      }
    }
    this.selectedMeterials = tempComingSelectedMaterialList;
  }
  valueChange(e: any) {
    this.selectedUOM = e;
    this.manageUOM();
  }

  removeSelectedMeterial(idx: any, grd: any) {
    this.selectedMeterials.splice(idx, 1);
    grd.data = this.selectedMeterials;
    this.calculateTotalAndRemainingQty();
    if (this.selectedMeterials != undefined && this.selectedMeterials != null && this.selectedMeterials.length >= 0) {
      this.showSaveButton = true;
    }
    //setting paging..
    this.pagable = this.selectedMeterials.length > this.pageSize;
  }

  removeMeterial(idx: any, grd: any) {
    this.delGrd = grd;
    this.delIdx = idx;
    this.showConfirmDialog = true;
  }

  getConfirmDialogValue($event) {
    this.showConfirmDialog = false;
    // Yes
    if ($event.Status === 'yes') {
      this.removeSelectedMeterial(this.delIdx, this.delGrd);
    }
    // No
    else if ($event.Status === 'no') {
    }
    // Cross
    else {
    }
  }

  // manageMeterial(scan: boolean = false) {
  //   let requiredMeterialQty: number = this._requiredMeterialQty;
  //   let pickedMeterialQty: number = this._pickedMeterialQty;
  //   let remailingMeterialQty: number = requiredMeterialQty - pickedMeterialQty;
  //   if (pickedMeterialQty <= requiredMeterialQty) {
  //     if (scan) {// if scan true means user comes from scan.
  //       let meterial = this.comingSelectedMeterials[0]; // coming selected material is the collection which we selected from dropdown.
  //       if (meterial.PickQty > requiredMeterialQty) { //checking how much qty we require
  //         if (meterial.totalPickQty > remailingMeterialQty) {
  //           meterial.MeterialPickQty = remailingMeterialQty
  //         } else {
  //           meterial.MeterialPickQty = meterial.totalPickQty
  //         }
  //       } else { // if selected material qty is not grater then the required qty.
  //         if (meterial.totalPickQty > remailingMeterialQty) {
  //           meterial.MeterialPickQty = remailingMeterialQty
  //         }
  //         else {
  //           meterial.MeterialPickQty = meterial.totalPickQty
  //         }
  //         meterial.MeterialPickQty = meterial.TOTALQTY - meterial.PickQty
  //       }
  //       this.selectedMeterials.push(meterial); // after updating the qty push the material to seleted material with updated qty.
  //       //apply paging..
  //       this.pagable = this.selectedMeterials.length > this.pageSize;
  //       pickedMeterialQty = pickedMeterialQty + meterial.MeterialPickQty;
  //       remailingMeterialQty = requiredMeterialQty - pickedMeterialQty;
  //     }
  //     else {
  //       for (let i = 0; i < this.comingSelectedMeterials.length; i++) { // loop over all selected materials to select material according to qty.
  //         let meterial = this.comingSelectedMeterials[i];
  //         let avaliableMeterialQty = parseFloat(meterial.TOTALQTY);
  //         if (avaliableMeterialQty >= remailingMeterialQty) {
  //           meterial.MeterialPickQty = remailingMeterialQty;
  //         } else {
  //           meterial.MeterialPickQty = avaliableMeterialQty;
  //         }
  //         this.selectedMeterials.push(meterial);
  //          // after updating the qty push the material to seleted material with updated qty.
  //         if (this.selectedPackingModel != null && this.selectedPackingModel != undefined &&
  //           this.selectedPackingModel.PkgNo != "") {
  //           if (this.selected.TRACKING != 'N') {
  //             this.addItemsToPacking(this.selected.ITEMCODE, this.selected.TRACKING, meterial, this.selected.CARDCODE,
  //               this.selected.DOCENTRY, this.selected.LINENUM)
  //           }
  //         }
  //         //apply paging..
  //         this.pagable = this.selectedMeterials.length > this.pageSize;
  //         pickedMeterialQty = pickedMeterialQty + meterial.MeterialPickQty;
  //         remailingMeterialQty = requiredMeterialQty - pickedMeterialQty;
  //       }
  //       //code only for non tracked item
  //       //fixed issue: save&remaing items showing  
  //       if (this.OrderType == 'N') {
  //         let itemMeterials
  //         if (this.outbound.TempMeterials !== undefined
  //           && this.outbound.TempMeterials !== null
  //           && this.outbound.TempMeterials.length > 0) {
  //           itemMeterials = this.outbound.TempMeterials.filter(
  //             (m: any) => m.Item.ITEMCODE
  //               === this.outbound.SelectedItem.ITEMCODE && m.Item.ROWNUM
  //               === this.outbound.SelectedItem.ROWNUM && this.outbound.OrderData.DOCNUM === m.Item.DOCNUM);
  //         }
  //         if (itemMeterials !== undefined && itemMeterials !== null
  //           && itemMeterials.length > 0) {
  //           // this.selectedMeterials = [];
  //           itemMeterials.forEach(element => {
  //             for (var i = 0; i < this.selectedMeterials.length; i++) {
  //               if (this.selectedMeterials[i].BINNO == element.Meterial.BINNO) {
  //                 this.selectedMeterials[i] = (element.Meterial)
  //               }
  //             }
  //           });
  //         }
  //       }
  //     }
  //     // Selected meterial
  //     if (this.selectedMeterials && this.selectedMeterials.length > 0) {
  //       this._pickedMeterialQty = this.selectedMeterials.map(i => i.MeterialPickQty).reduce((sum, c) => sum + c);
  //       this._remainingMeterial = this._requiredMeterialQty - this._pickedMeterialQty;
  //     }
  //     else {
  //       this._pickedMeterialQty = pickedMeterialQty;
  //       this._requiredMeterialQty = remailingMeterialQty;
  //     }
  //   }
  //   this.oldSelectedMeterials = JSON.parse(JSON.stringify(this.selectedMeterials));
  //   this.pagable = this.selectedMeterials.length > this.pageSize;
  //   if (this.selectedMeterials != null && this.selectedMeterials != undefined &&
  //     this.selectedMeterials.length > 0) {
  //     this.showSaveButton = true;
  //   }
  // }



  manageMeterial(scan: boolean = false, fromwhere?: string) {
    let requiredMeterialQty: number = this._requiredMeterialQty;
    let pickedMeterialQty: number = this._pickedMeterialQty;
    let remailingMeterialQty: number = requiredMeterialQty - pickedMeterialQty;
    // if(fromwhere != undefined && fromwhere == "GSTNScan"){
    //   remailingMeterialQty = this.comingSelectedMeterials[0].MeterialPickQty; 
    //   if(remailingMeterialQty > requiredMeterialQty){
    //     remailingMeterialQty = requiredMeterialQty - pickedMeterialQty;
    //   }
    // }
    if (pickedMeterialQty <= requiredMeterialQty) {
      if (scan) {// if scan true means user comes from scan.
        let meterial = this.comingSelectedMeterials[0]; // coming selected material is the collection which we selected from dropdown.
        let avaliableMeterialQty = parseFloat(meterial.TOTALQTY);
        // if (sessionStorage.getItem("ComingFrom") != "ProductionIssue" && sessionStorage.getItem("IsGreaterQuantityAllowedThanOrder") == "Y") {
        //   meterial.MeterialPickQty = avaliableMeterialQty;
        // } else {
        if (meterial.MeterialPickQty > requiredMeterialQty) {
          if (avaliableMeterialQty >= remailingMeterialQty) {
            meterial.MeterialPickQty = remailingMeterialQty;
          } else {
            meterial.MeterialPickQty = avaliableMeterialQty;
          }
        } else {
          if (meterial.MeterialPickQty > avaliableMeterialQty) {
            meterial.MeterialPickQty = avaliableMeterialQty;
          }
        }
        // }

        this.selectedMeterials.push(meterial); // after updating the qty push the material to seleted material with updated qty.
        if (this.selectedPackingModel != null && this.selectedPackingModel != undefined &&
          this.selectedPackingModel.PkgNo != "") {
          if (this.selected.TRACKING != 'N') {
            this.addItemsToPacking(this.selected.ITEMCODE, this.selected.TRACKING, meterial, this.selected.CARDCODE,
              this.selected.DOCENTRY, this.selected.LINENUM)
          }
        }

        //apply paging..
        this.pagable = this.selectedMeterials.length > this.pageSize;
        pickedMeterialQty = pickedMeterialQty + meterial.MeterialPickQty;
        remailingMeterialQty = requiredMeterialQty - pickedMeterialQty;
      }
      else {
        for (let i = 0; i < this.comingSelectedMeterials.length; i++) { // loop over all selected materials to select material according to qty.
          let meterial = this.comingSelectedMeterials[i];
          let avaliableMeterialQty = parseFloat(meterial.TOTALQTY);
          // if (sessionStorage.getItem("ComingFrom") != "ProductionIssue" && sessionStorage.getItem("IsGreaterQuantityAllowedThanOrder") == "Y") {
          //   meterial.MeterialPickQty = avaliableMeterialQty;
          // } else {
          if (avaliableMeterialQty >= remailingMeterialQty) {
            meterial.MeterialPickQty = remailingMeterialQty;
          } else {
            meterial.MeterialPickQty = avaliableMeterialQty;
          }
          // }
          this.selectedMeterials.push(meterial);
          // after updating the qty push the material to seleted material with updated qty.
          if (this.selectedPackingModel != null && this.selectedPackingModel != undefined &&
            this.selectedPackingModel.PkgNo != "") {
            if (this.selected.TRACKING != 'N') {
              this.addItemsToPacking(this.selected.ITEMCODE, this.selected.TRACKING, meterial, this.selected.CARDCODE,
                this.selected.DOCENTRY, this.selected.LINENUM)
            }
          }
          //apply paging..
          this.pagable = this.selectedMeterials.length > this.pageSize;
          pickedMeterialQty = pickedMeterialQty + meterial.MeterialPickQty;
          remailingMeterialQty = requiredMeterialQty - pickedMeterialQty;
        }
        //code only for non tracked item
        //fixed issue: save&remaing items showing  
        if (this.OrderType == 'N') {
          let itemMeterials
          if (this.outbound.TempMeterials !== undefined
            && this.outbound.TempMeterials !== null
            && this.outbound.TempMeterials.length > 0) {
            // itemMeterials = this.outbound.TempMeterials.filter(
            //   (m: any) => m.Item.ITEMCODE
            //     === this.outbound.SelectedItem.ITEMCODE && m.Item.ROWNUM
            //     === this.outbound.SelectedItem.ROWNUM && this.outbound.OrderData.DOCNUM === m.Item.DOCNUM);

            itemMeterials = this.outbound.TempMeterials.filter(e => e.Item.ITEMCODE == this.outbound.SelectedItem.ITEMCODE && e.Item.ROWNUM
              == this.outbound.SelectedItem.ROWNUM && this.outbound.SelectedItem.DOCNUM == e.Item.DOCNUM)
          }
          if (itemMeterials !== undefined && itemMeterials !== null
            && itemMeterials.length > 0) {
            // this.selectedMeterials = [];
            for (var i = 0; i < this.selectedMeterials.length; i++) {
              this.selectedMeterials[i].MeterialPickQty = 0
            }
            itemMeterials.forEach(element => {
              for (var i = 0; i < this.selectedMeterials.length; i++) {
                if (this.selectedMeterials[i].BINNO == element.Meterial.BINNO) {
                  if (sessionStorage.getItem("ComingFrom") != "itr" && sessionStorage.getItem("ComingFrom") != "ProductionIssue") {
                    element.Meterial.MeterialPickQty = element.Meterial.MeterialPickQty * this.selectedUOM.AltQty;
                  }
                  this.selectedMeterials[i] = (element.Meterial)
                }
              }
            });
          }
        }
      }
      // Selected meterial
      if (this.selectedMeterials && this.selectedMeterials.length > 0) {
        this._pickedMeterialQty = this.selectedMeterials.map(i => i.MeterialPickQty).reduce((sum, c) => sum + c);
        this._remainingMeterial = this._requiredMeterialQty - this._pickedMeterialQty;
      }
      else {
        this._pickedMeterialQty = pickedMeterialQty;
        this._requiredMeterialQty = remailingMeterialQty;
      }
      if (sessionStorage.getItem("ComingFrom") != "itr" && sessionStorage.getItem("ComingFrom") != "ProductionIssue") {
        if (this.selected.TRACKING == 'S') {
          this._pickedMeterialQty = this._pickedMeterialQty * this.selectedUOM.AltQty;
        }
        this._pickedMeterialQtyInvUOM = this.selectedUOM.BaseQty * this._pickedMeterialQty;
        this._pickedMeterialQtyInvUOM = Number(Number(this._pickedMeterialQtyInvUOM).toFixed(Number(sessionStorage.getItem("DecimalPrecision"))));
        this._pickedMeterialQty = Number(Number(this._pickedMeterialQty).toFixed(Number(sessionStorage.getItem("DecimalPrecision"))));
      }
    }
    this.oldSelectedMeterials = JSON.parse(JSON.stringify(this.selectedMeterials));
    this.pagable = this.selectedMeterials.length > this.pageSize;
    if (this.selectedMeterials != null && this.selectedMeterials != undefined &&
      this.selectedMeterials.length > 0) {
      this.showSaveButton = true;
    }
  }



  /**
   * this method will sort all the loose items first then palletitems.
   */
  sortSelectedMaterials() {
    var looseMaterial: any[] = this.selectedMeterials.filter((s: any) => s.PALLETNO == '');
    var palletMaterial: any[] = this.selectedMeterials.filter((s: any) => s.PALLETNO != '');
    var sortedList: any[] = [];
    for (let i = 0; i < looseMaterial.length; i++) {
      sortedList.push(looseMaterial[i]);
    }
    for (let j = 0; j < palletMaterial.length; j++) {
      sortedList.push(palletMaterial[j]);
    }
    this.selectedMeterials = sortedList;
  }

  saveNonTrackedOnSaveClick() {

  }

  readjustPackingForNonTracked: boolean = false;
  bypassNonTrackedItemSave: boolean = false;
  // Save click
  addMetToCollection(fromIFPSave: boolean = false) {
    var packingCollection;

    // if (this.IsUDFEnabled == 'Y') {
    //   let indx = -1;
    //   if (this.UDF.length > 0) {
    //     if (sessionStorage.getItem("ComingFrom") == "ProductionIssue") {
    //       indx = this.UDF.findIndex(e => e.LineNo == this.selected.RefLineNo && e.DocEntry == this.docEntry)
    //     } else {
    //       indx = this.UDF.findIndex(e => e.LineNo == this.selected.LINENUM && e.DocEntry == this.docEntry)
    //     }
    //   }
    //   if (indx == -1) {
    //     this.ShowUDF('Detail');
    //     return;
    //   }
    // }

    if (this.selected.TRACKING == 'N') {
      if (this.checkIfAlreadyPreasentQtyForNonTracked()) {

      } else {
        if (!this.bypassNonTrackedItemSave) {
          console.log("selectedMeterials", this.selectedMeterials.toString());
          if (this.selectedPackingModel != null && this.selectedPackingModel != undefined &&
            this.selectedPackingModel.PkgNo != "") {
            for (let i = 0; i < this.selectedMeterials.length; i++) {
              var meterial = this.selectedMeterials[i];
              this.addItemsToPacking(this.selected.ITEMCODE, this.selected.TRACKING, meterial, this.selected.CARDCODE,
                this.selected.DOCENTRY, this.selected.LINENUM)
            }
            //add non tracked items to packing
          }
          if (!this.validateNonTrackedItemQtyOnSave()) {
            this.showPackingMismatchAlert = true;
            this.readjustPackingForNonTracked = true;
            return;
          } else {

          }
          // selected material le kar non tracked ko karna h..
        }
      }
    }
    if (this.checkPackingDetailIsOk()) {
      packingCollection = this.outbound.packingCollection;
    } else {
      this.showPackingMismatchAlert = true;
      // means packing is not ok
      return;
    }
    //lsOutbound
    let outboundData = sessionStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      let count = 0;
      if (this.outbound.TempMeterials !== undefined
        && this.outbound.TempMeterials !== null && this.outbound.TempMeterials.length > 0) {
        if (this.fromProduction) {
          this.outbound.TempMeterials = this.outbound.TempMeterials.filter((t: any) =>
            t.Item.RefLineNo !== this.outbound.SelectedItem.RefLineNo && t.Item.ITEMCODE !== this.outbound.SelectedItem.ITEMCODE || t.Order["Order No"] !== this.outbound.OrderData["Order No"]);
        }
        else {
          var tempItems = this.outbound.TempMeterials;
          var OtherTempItems: any = [];
          for (let i = 0; i < tempItems.length; i++) {
            if (tempItems[i].Item.ROWNUM !== this.outbound.SelectedItem.ROWNUM && (tempItems[i].Item.ITEMCODE !== this.outbound.SelectedItem.ITEMCODE ||
              tempItems[i].Item.DOCNUM !== this.outbound.OrderData.DOCNUM)) {
              OtherTempItems.push(tempItems[i]);
            }
          }
          this.outbound.TempMeterials = OtherTempItems;
        }
        // loop selected Items
        for (let index = 0; index < this.selectedMeterials.length; index++) {
          const m = this.selectedMeterials[index];
          count = count + m.MeterialPickQty;
          if (count > this._requiredMeterialQty) {
            if (sessionStorage.getItem("ComingFrom") == "ProductionIssue") {
              this.toastr.error('', this.translate.instant("ProdIssue_QtyGTTotal"));
              return;
            } else if (sessionStorage.getItem("IsGreaterQuantityAllowedThanOrder") != "Y") {
              this.toastr.error('', this.translate.instant("ProdIssue_QtyGTTotal"));
              return;
            }
          }
          if (m.MeterialPickQty > 0) {
            if (sessionStorage.getItem("ComingFrom") != "itr" && sessionStorage.getItem("ComingFrom") != "ProductionIssue") {
              this.outbound.SelectedItem.SelectedUOMCode = this.selectedUOM.UomCode
              this.outbound.SelectedItem.SelectedUOMEntry = this.selectedUOM.UomEntry;
              // m.RPTQTY = m.MeterialPickQty;
              if (this.selected.TRACKING != "S") {
                m.RPTQTY = m.MeterialPickQty;
                m.MeterialPickQty = m.MeterialPickQty * this.selectedUOM.BaseQty;
              } else {
                m.RPTQTY = m.MeterialPickQty * this.selectedUOM.AltQty;
              }
            }
            let item = { Order: this.outbound.OrderData, Item: this.outbound.SelectedItem, Meterial: m }
            this.outbound.TempMeterials.push(item)
          }
        }
      }
      else {
        this.outbound.TempMeterials = [];
        // loop selected Items
        for (let index = 0; index < this.selectedMeterials.length; index++) {
          const m = this.selectedMeterials[index];
          count = count + m.MeterialPickQty;
          if (count > this._requiredMeterialQty) {
            if (sessionStorage.getItem("ComingFrom") == "ProductionIssue") {
              this.toastr.error('', this.translate.instant("ProdIssue_QtyGTTotal"));
              return;
            } else if (sessionStorage.getItem("IsGreaterQuantityAllowedThanOrder") != "Y") {
              this.toastr.error('', this.translate.instant("ProdIssue_QtyGTTotal"));
              return;
            }
          }
          if (m.MeterialPickQty > 0) {
            if (sessionStorage.getItem("ComingFrom") != "itr" && sessionStorage.getItem("ComingFrom") != "ProductionIssue") {
              this.outbound.SelectedItem.SelectedUOMCode = this.selectedUOM.UomCode;
              this.outbound.SelectedItem.SelectedUOMEntry = this.selectedUOM.UomEntry;
              // m.RPTQTY = m.MeterialPickQty;
              if (this.selected.TRACKING != "S") {
                m.RPTQTY = m.MeterialPickQty;
                m.MeterialPickQty = m.MeterialPickQty * this.selectedUOM.BaseQty;
              } else {
                m.RPTQTY = m.MeterialPickQty * this.selectedUOM.AltQty;
              }
            }
            let item = { Order: this.outbound.OrderData, Item: this.outbound.SelectedItem, Meterial: m }
            this.outbound.TempMeterials.push(item)
          }
        }
      }
    }
    // this.outbound.UDF = this.UDF;
    this.outbound.packingCollection = packingCollection;
    sessionStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
    if (this.fromProduction == true && fromIFPSave == true) {
      this.back(2);
    } else if (this.fromProduction == false) {
      this.saveSelectedPackingTosessionStorage()
      this.back(-1);
    }
  }

  checkIfAlreadyPreasentQtyForNonTracked(): boolean {
    var isPresent = false;
    if (this.outbound != undefined && this.outbound != null) {
      var packingCollection = this.outbound.packingCollection;
      var filteredItemsForThisScreen = packingCollection.filter(pi => (pi.ItemCode == this.selected.ITEMCODE
        && pi.DocEntry == this.docEntry && pi.LineNum == this.selected.LINENUM && pi.Quantity > 0));
      if (filteredItemsForThisScreen != null && filteredItemsForThisScreen != undefined &&
        filteredItemsForThisScreen.length > 0) {
        isPresent = true;
      }
    }
    return isPresent;
  }

  validateNonTrackedItemQtyOnSave(): boolean {
    var savedPackingForThisItem: any;
    if (this.outbound != undefined && this.outbound != null) {
      savedPackingForThisItem = this.outbound.packingCollection;
      if (savedPackingForThisItem != null && savedPackingForThisItem != undefined
        && savedPackingForThisItem.length > 0) {
        //show packing details in lookup.
        var selectedPackingItemsForThisScreen = savedPackingForThisItem.filter(pi => (pi.ItemCode == this.selected.ITEMCODE
          && pi.DocEntry == this.docEntry));
        var packingNotUsedAtThisScreen = [];
        var qty = 0;

        for (let i = 0; i < selectedPackingItemsForThisScreen.length; i++) {
          qty = qty + parseInt(selectedPackingItemsForThisScreen[i].Quantity);
        }
        if (qty > this._pickedMeterialQty) {
          this.toastr.error('', this.translate.instant("ReadjustPackingQty"));
          return false;
          // this.packingData = tempPackingForEditJson;
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  checkPackingDetailIsOk(): boolean {
    var totalSelectdQty: number = 0;
    var packingCollection = this.outbound.packingCollection
    let selectedPackingOfThisScreen = packingCollection.filter(pi => (pi.ItemCode == this.selected.ITEMCODE && pi.DocEntry == this.selected.DOCENTRY));
    if (selectedPackingOfThisScreen != null && selectedPackingOfThisScreen != undefined && selectedPackingOfThisScreen.length > 0) {
      for (let i = 0; i < selectedPackingOfThisScreen.length; i++) {
        totalSelectdQty = + selectedPackingOfThisScreen[i].Quantity;
      }

      if (this.fromITR == false && this.fromProduction == false && this.selected.TRACKING == 'S') {
        if (totalSelectdQty > this._pickedMeterialQty) {
          //this.toastr.error('', this.translate.instant("PackingQtyNotMoreThenPickedQty"));
          return false;
        } else {
          return true;
        }
      } else {
        if (totalSelectdQty > this._pickedMeterialQty) {
          //this.toastr.error('', this.translate.instant("PackingQtyNotMoreThenPickedQty"));
          return false;
        } else {
          return true;
        }
      }
    }
    return true;
  }

  sortMeterials() {

  }

  back(fromwhereval: number) {
    if (sessionStorage.getItem("ComingFrom") == "ProductionIssue") {
      var statusObject: any = { fromwhere: fromwhereval }
      this.screenBackEvent.emit(statusObject);
    } else {
      this.router.navigate(['home/outbound/outorder', { skipLocationChange: true }]);
    }
  }

  intersection(array1: any[], array2: any[]): any[] {
    let result: any[] = [];
    for (let i = 0; i < array1.length; i++) {
      for (let j = 0; j < array2.length; j++) {
        if (array1[i] === array2[j] && result.indexOf(array1[i]) === -1) {
          result.push(array1[i]);
          break;
        }
      }
    }
    return result;
  };

  filterData(m1: any[], m2: any[]): any[] {
    let result: any[] = [];
    for (let i = 0; i < m1.length; i++) {
      let data = m2.filter((m: any) =>
        m.BINNO !== m1[i].BINNO &&
        m.LOTNO !== m1[i].LOTNO
      );
      if (data !== undefined && data !== null && data.length > 0) {
        result.push(data);
      }
    }
    return result;
  }

  removeData(m1: any[], m2: any[]): any[] {
    for (let index = 0; index < m2.length; index++) {
      let data = m1.filter((m: any) =>
        m.BINNO !== m2[index].BINNO &&
        m.LOTNO !== m2[index].LOTNO
      );
      let idx = m1.indexOf(data);
      if (idx > -1) {
        m1 = m1.splice(idx, 1);
      }
      return m1;
    }
  }


  private manageOldSelectedItems() {

    if (this.selectedMeterials !== null && this.selectedMeterials !== undefined && this.selectedMeterials.length > 0) {
      for (let index = 0; index < this.selectedMeterials.length; index++) {
        const element = this.selectedMeterials[index];
        for (let j = 0; j < this.lookupData.length; j++) {
          const sd = this.lookupData[j];
          if (sd.ITEMCODE === element.ITEMCODE
            && sd.LOTNO === element.LOTNO
            && sd.BINNO === element.BINNO) {
            sd.OldData = true;
            sd.selected = true;
            // if(sd.TOTALQTY>=element.MeterialPickQty  ){
            // sd.TOTALQTY = sd.TOTALQTY-element.MeterialPickQty;
            // }
            this.lookupData[j] = sd;
          }
          else {
            // sd.OldData=false;
            // this.lookupData[j]=sd;
          }
        }
      }
    }
  }

  private manageExistingItem() {
    let tempLookup: any = this.lookupData;
    for (let j = 0; j < this.lookupData.length; j++) {
      const sd = this.lookupData[j];
      if (this.outbound) {
        let tempCollection = this.outbound.TempMeterials;
        let currentOrder = this.outbound.OrderData;
        // Serial
        if (this.OrderType === 'S') {
          for (let index = 0; index < tempCollection.length; index++) {
            const element = tempCollection[index];
            // If already selectde
            if (element.Order.DOCNUM !== currentOrder.DOCNUM
              && element.Meterial.BINNO === sd.BINNO &&
              element.Meterial.LOTNO === sd.LOTNO &&
              element.Meterial.ITEMCODE === sd.ITEMCODE) {
              if (tempLookup.length > j) {
                tempLookup.splice(j, 1);
                break;
              }
            }
          }
        }
        else {
          // Prepare collection of bin
          let totalBinPickQtyCollection: any[] = this.getBinAndTotalMeterial(tempCollection);
          for (let i = 0; i < totalBinPickQtyCollection.length; i++) {
            const element = totalBinPickQtyCollection[i];
            if (element.BINNO === sd.BINNO &&
              element.LOTNO === sd.LOTNO &&
              element.ITEMCODE === sd.ITEMCODE
            ) {
              sd.TOTALQTY = sd.TOTALQTY - element.TotalAllocatedMetQty;
              if (element.TotalAllocatedMetQty >= sd.TOTALQTY) {
                if (tempLookup.length > j && this.OrderType != 'B') {
                  tempLookup.splice(j, 1);
                  break;
                }
                else {
                  tempLookup[j].TOTALQTY = sd.TOTALQTY;
                }
              }
            }
          }
        }
      }
    }
    this.lookupData == tempLookup;
  }

  private getBinAndTotalMeterial(tempCollection: any[]): any[] {
    let binAndQtyCollectionArray: any[] = [];
    let ProcessedCount: number = 0;
    for (let index = 0; index < tempCollection.length; index++) {
      const element = tempCollection[index];
      let tCollection: any = tempCollection.filter(t =>
        element.Meterial.BINNO === t.Meterial.BINNO &&
        element.Meterial.LOTNO === t.Meterial.LOTNO &&
        element.Meterial.ITEMCODE === t.Meterial.ITEMCODE)
      ProcessedCount = ProcessedCount + tCollection.length;
      if (ProcessedCount <= tempCollection.length) {
        let existCol = binAndQtyCollectionArray.filter(t =>
          element.Meterial.BINNO === t.BINNO &&
          element.Meterial.LOTNO === t.LOTNO &&
          element.Meterial.ITEMCODE === t.ITEMCODE
        );
        if (existCol.length == 0) {
          let binAndQtyCollection: any = {};
          binAndQtyCollection.BINNO = element.Meterial.BINNO;
          binAndQtyCollection.LOTNO = element.Meterial.LOTNO;
          binAndQtyCollection.ITEMCODE = element.Meterial.ITEMCODE;
          binAndQtyCollection.TotalAllocatedMetQty = tCollection.map(i => i.Meterial.MeterialPickQty).reduce((sum, c) => sum + c);
          binAndQtyCollectionArray.push(binAndQtyCollection);
        }
      }
    }
    return binAndQtyCollectionArray;
  }

  // This method is used here for IFP
  public addToDeleiver(goToCustomer: boolean = true) {
    this.showLookupLoader = true;
    //lsOutbound
    let outboundData: string = sessionStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      this.prepareDeleiveryTempCollection();
      sessionStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      this.showLookupLoader = false;
    }
  }


  // On Issue Click
  public submitProduction(orderId: any = null) {
    this.addMetToCollection();
    this.addToDeleiver(false);
    this.prepareDeleiveryCollectionAndDeliver(orderId);

  }

  prepareDeleiveryTempCollection() {
    if (this.outbound) {
      let tempMeterialCollection: any[] = this.outbound.TempMeterials;
      for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {
        const d = this.outbound.DeleiveryCollection[index];
        for (let j = 0; j < tempMeterialCollection.length; j++) {
          const element = tempMeterialCollection[j];
          if (d.Item.DOCENTRY == element.Item.DOCENTRY && d.Order.DOCNUM == element.Order.DOCNUM) {
            tempMeterialCollection.slice(index, 1);
          }
        }
      }

      if (tempMeterialCollection !== undefined &&
        tempMeterialCollection !== null && tempMeterialCollection.length > 0) {
        for (let index = 0; index < tempMeterialCollection.length; index++) {
          const tm = tempMeterialCollection[index];
          let hasitem = this.outbound.DeleiveryCollection.filter(d =>
            d.Item.DOCENTRY === tm.Item.DOCENTRY &&
            d.Item.TRACKING === tm.Item.TRACKING &&
            d.Order.DOCNUM === tm.Order.DOCNUM &&
            d.Meterial.LOTNO === tm.Meterial.LOTNO &&
            d.Meterial.BINNO === tm.Meterial.BINNO
          );
          if (hasitem.length == 0) {
            this.outbound.DeleiveryCollection.push(tm)
          }
        }
      }
    }
  }

  prepareDeleiveryCollectionAndDeliver(orderId: any) {

    if (this.outbound != null && this.outbound != undefined
      && this.outbound.DeleiveryCollection != null && this.outbound.DeleiveryCollection != undefined
      && this.outbound.DeleiveryCollection.length > 0) {
      if (orderId !== undefined && orderId !== null) {
        this.outbound.DeleiveryCollection = this.outbound.DeleiveryCollection.filter(d => d.Order.DOCNUM === orderId);
      }
      let arrIssues: Item[] = [];
      let arrLots: Lot[] = [];
      let prodIssueModel: ProductionIssueModel = new ProductionIssueModel();
      // Hdr
      let comDbId = sessionStorage.getItem("CompID");
      let token = sessionStorage.getItem("Token");
      let guid: string = sessionStorage.getItem("GUID");
      let uid: string = sessionStorage.getItem("UserId");
      let hdrLine: number = 0;
      let limit = -1;
      let hdrLineVal = -1;
      let refLineNo = 0;
      this.showLookupLoader = true;
      // Loop through delivery collection 
      for (let index = 0; index < this.outbound.DeleiveryCollection.length; index++) {
        //get first item from collection        
        const element = this.outbound.DeleiveryCollection[index];
        // Filter for getting  current item :: May be we need to change this in future
        this.outbound.DeleiveryCollection = this.outbound.DeleiveryCollection.filter(d => d.Item.DOCENTRY === this.outbound.SelectedItem.DOCENTRY)
        // let coll=Get all Item for Item.Lineno===i
        let lineDeleiveryCollection = this.outbound.DeleiveryCollection.filter(d =>
          //d.Item.LINENUM === element.Item.LINENUM
          element.Order.DOCNUM === d.Order.DOCNUM &&
          element.Item.DOCENTRY === d.Item.DOCENTRY &&
          element.Item.TRACKING === d.Item.TRACKING
        );
        // Process Order Item and Tracking collection
        for (let hIdx = 0; hIdx < lineDeleiveryCollection.length; hIdx++) {
          const o = lineDeleiveryCollection[hIdx];
          // check hdr exists
          let existHdr = false;
          for (let index = 0; index < arrIssues.length; index++) {
            const h = arrIssues[index];
            if (h.DOCENTRY === o.Item.DOCENTRY
              && h.ItemCode === o.Item.ITEMCODE
              && h.Tracking === o.Item.TRACKING) {
              existHdr = true;
              break;
            }
          }

          if (existHdr == false) {
            // Add Header here and then add 
            hdrLineVal = hdrLineVal + 1;
            let item: Item = new Item();
            item.DiServerToken = token;
            item.CompanyDBId = comDbId;
            item.Transaction = "ProductionIssue"
            item.RECUSERID = item.LoginId = item.UsernameForLic = uid
            item.DOCENTRY = o.Item.DOCENTRY;
            item.ItemCode = o.Item.ITEMCODE;
            item.Tracking = o.Item.TRACKING;
            item.RefLineNo = o.Item.RefLineNo;
            item.BATCHNO = o.Order["Order No"]
            refLineNo = item.RefLineNo;
            item.ONLINEPOSTING = null
            let metQty = lineDeleiveryCollection.map(i => i.Meterial.MeterialPickQty).reduce((sum, c) => sum + c);
            item.DBIssuedQty = o.Item.IssuedQty
            item.U_O_ACTISSQTY = metQty
            item.U_O_PLNISSQTY = o.Item.ActualQty
            item.U_O_BALQTY = o.Item.BalQty
            item.FGWAREHOUSE = item.U_O_ISSWH = o.Item.WhsCode;
            item.RefDocEntry = o.Order.RefDocEntry.toString();
            item.GUID = guid;
            item.LineId = o.Item.LineId;
            item.LineNo = hdrLineVal;
            item.IssuedQty = "0.000"
            arrIssues.push(item);
          }
          // check weather item existe or not 
          let hasDetail = false;
          for (let index = 0; index < arrLots.length; index++) {
            const element = arrLots[index];
            if (element.LotNumber === o.Meterial.LOTNO && element.Bin === o.Meterial.BINNO && element.LineNo === refLineNo) {
              hasDetail = true;
              break;
            }
          }
          if (hasDetail == false) {
            // Add Detail here 
            let dtl: Lot = new Lot();
            dtl.Bin = o.Meterial.BINNO;
            dtl.LotNumber = o.Meterial.LOTNO;
            dtl.LotQty = o.Meterial.MeterialPickQty + "";
            dtl.LOTSIGMASTATUS = 'N'
            dtl.LineNo = refLineNo;
            dtl.SYSNUMBER = o.Meterial.SYSNUMBER
            arrLots.push(dtl);
          }
          limit = limit + lineDeleiveryCollection.length;
        }
      }

      if (arrIssues.length > 0 && arrLots.length > 0) {
        prodIssueModel.Items = arrIssues;
        prodIssueModel.Lots = arrLots;
        if (this.IsUDFEnabled == 'Y') {
          prodIssueModel.UDF = this.outbound.UDF;
          if (prodIssueModel.UDF.findIndex(e => e.Flag == "H") == -1) {
            if (sessionStorage.getItem("GRPOHdrUDF") != undefined && sessionStorage.getItem("GRPOHdrUDF") != "") {
              JSON.parse(sessionStorage.getItem("GRPOHdrUDF")).forEach(element => {
                prodIssueModel.UDF.push(element);
              });
            } else {
              this.ShowUDF('Header');
              return;
            }
          }
        }
      }
      this.productionService.submitProduction(prodIssueModel).subscribe(
        data => {
          if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
            this.showLookupLoader = false;
            this.toastr.success('', this.translate.instant("ProdIssue_ProductionIssueSuccess") + " : " + data[0].SuccessNo);
            this.resetIssueProduction();
            sessionStorage.setItem("GRPOHdrUDF", "");
            this.back(1)
          } else if (data[0].ErrorMsg == "7001") {
            this.showLookupLoader = false;
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            this.back(1);
            return;
          }
          else {
            this.showLookupLoader = false;
            if (data[0].ErrorMsg != "") {
              if (data[0].ErrorNo != undefined && data[0].ErrorNo == "-1") {
                // Receipt not successful. Do not refresh the screen.
                this.toastr.error('', data[0].ErrorMsg);
                return;
              } else if (data[0].ErrorNo != undefined && data[0].ErrorNo == "0") {
                //Error in updating optipro tables. SAP succefully updated.
                this.toastr.error('', "Error in updating optipro tables. SAP succefully updated");
                this.resetIssueProduction();
                this.back(1)
              }

              // show errro.
              this.toastr.error('', data[0].ErrorMsg);
            }
          }
        },
        error => {
          this.showLookupLoader = false;
          console.log(
            error);
        }
      );
    }
  }


  showAddToMeterialAndDelevery() {
    let dBit: boolean = false;
    if (this.outbound && this.outbound.TempMeterials) {
      let data = this.outbound.TempMeterials.filter(tm => tm.Order["Order No"] === this.currentOrderNo);
      dBit = data.length > 0
    }
    else {
      dBit = false;
    }
    return dBit;
  }

  resetIssueProduction() {
    let data: OutboundData = this.outbound
    this.outbound = new OutboundData();
    this.outbound.OrderData = data.OrderData
    this.outbound.SelectedItem = data.SelectedItem
    sessionStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
    this.selectedMeterials = [];

  }

  getItemListForOrder() {
    this.productionService.GetBOMItemForProductionIssue(this.currentOrderNo).subscribe(
      (data: any) => {
        if (data != null) {
          if (data.length > 0) {
            // -------------------Check For Licence---------------
            if (data[0].ErrorMsg != undefined) {
              if (data[0].ErrorMsg.length > 0) {
                this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                  this.translate.instant("CommonSessionExpireMsg"));
                return;
              }
            }
          }
          else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        }
      },
      error => {
        //this.showLoader = false;
        console.log("Error: ", error);
      }
    );
  }


  OnBinLookupClick() {
    this.showLookupLoader = true;
    this.inventoryTransferService.getToBin("", this.selected.WHSCODE).subscribe(
      data => {
        this.showLookupLoader = false;
        if (data != null) {
          if (data.length > 0) {
            this.showLookup = false;
            this.showOtherLookup = true;
            this.lookupData = data;
            this.lookupFor = "toBinsList";
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

  OnBinChange() {
    if (this.toBinNo == "" || this.toBinNo == undefined) {
      return;
    }
    this.showLookupLoader = true;
    this.inventoryTransferService.isToBinExist(this.toBinNo, this.selected.WHSCODE).then(
      data => {
        this.showLookupLoader = false;
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("INVALIDBIN"));
              return;
            }
            else {
              this.toBinNo = data[0].ID;
            }
          }
          else {
            this.toBinNo = "";
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

  onBinNoScan() {

  }

  getDefaultToBin() {
    this.showLookupLoader = true;
    this.inventoryTransferService.GetToBinForWhsTrnsfr(this.selected.ITEMCODE, this.selected.WHSCODE).subscribe(
      data => {
        this.showLookupLoader = false;
        if (data != null) {
          let resultV = data.find(element => element.BINTYPE == '1');
          if (resultV != undefined) {
            this.toBinNo = resultV.BinCode;
            return;
          }
          let resultD = data.find(element => element.BINTYPE == '2');
          if (resultD != undefined) {
            this.toBinNo = resultD.BinCode;
            return;
          }
          let resultI = data.find(element => element.BINTYPE == '3');
          if (resultI != undefined) {
            this.toBinNo = resultI.BinCode;
            return;
          }
          let resultQ = data.find(element => element.BINTYPE == '4');
          if (resultQ != undefined) {
            this.toBinNo = resultQ.BinCode;
            return;
          }
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


  inputDialogFor: any;
  btnYes: any;
  btnNo: any;
  titleMessage: any;
  newPackingNoDialogFlag: boolean = false;
  onNewPackingDialog() {
    this.inputDialogFor = "CreateNewPacking";
    this.btnYes = this.translate.instant("Done");
    this.btnNo = this.translate.instant("Cancel");
    this.newPackingNoDialogFlag = true;
    this.titleMessage = this.translate.instant("CreateNewPacking");
  }


  // get the value from new packing dialgo
  getNewPackingDialogOutPut($event) {
    if ($event != null && $event == "close") {
      this.newPackingNoDialogFlag = false;
      return;
    } else {
      var outbound: any;
      let outboundData = sessionStorage.getItem(CommonConstants.OutboundData);
      if (outboundData != undefined && outboundData != '') {
        outbound = JSON.parse(outboundData);
        this.selectedPackingModel = new PackingModel();
        // we are fatching from already saved in local storage at time of new creation.
        this.selectedPackingModel = outbound.selectedPackingItem;
        this.outbound.selectedPackingItem = this.selectedPackingModel
      }
    }
    this.newPackingNoDialogFlag = false;
  }



  saveSelectedPackingTosessionStorage() {
    let outboundData = sessionStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      var outbound = JSON.parse(outboundData);
      outbound.selectedPackingItem = this.selectedPackingModel;
      sessionStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
    }
  }
  showPackingLookup: boolean = false;
  selectPackingNumber() {
    //manage from local array and show list
    let outboundData = sessionStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      var outbound = JSON.parse(outboundData);
      this.lookupData = outbound.packingCollection;
      const map = new Map();
      var result = [];
      for (const packingLookupItem of outbound.packingCollection) {
        if (!map.has(packingLookupItem.PkgNo)) {
          map.set(packingLookupItem.PkgNo, true);    // set any value to Map
          result.push(
            packingLookupItem
          );
        }
      }
      this.lookupData = result;
      if (this.lookupData.length == 0) {
        this.toastr.error('', this.translate.instant("PackingNotAvailable"));
        return;
      } else {
        this.lookupFor = "packingList";
        this.showPackingLookup = true;
      }
    }
  }

  onPackingNoChange() {
    if (this.checkPackingNoExistInDb(this.selectedPackingModel.PkgNo)) {
      this.getSelectedPackingNoModel(this.selectedPackingModel.PkgNo)
    } else {
      this.selectedPackingModel = new PackingModel();
      this.toastr.error('', this.translate.instant("PackingNoNotAvailable"));
    }
    //manage from local array and show list
  }
  checkPackingNoExistInDb(packingNo: String): boolean {
    var outbound: any;
    let outboundData = sessionStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      outbound = JSON.parse(outboundData);
      var packingCollection: any = outbound.packingCollection;
      var items = packingCollection.filter(pItem => pItem.PkgNo == packingNo);
      if (items.length > 0) return true;
    }
    return false;
  }
  getSelectedPackingNoModel(packingNo: String): PackingModel {
    var outbound: any;
    let outboundData = sessionStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      outbound = JSON.parse(outboundData);
      var packingCollection: any = outbound.packingCollection;
      var items = packingCollection.filter(pItem => pItem.PkgNo == packingNo);
      var model: PackingModel = new PackingModel()
      model = items[0]
      return model
    }
  }

  packingData: any;
  showPackingInfo: boolean = false;
  showPackingGridDoneBtn: boolean = false
  ShowPackingDetails() {
    var packingDetails: any;
    if (this.outbound != undefined && this.outbound != null) {
      packingDetails = this.outbound.packingCollection;
      if ((packingDetails == null || packingDetails == undefined || packingDetails.length == 0) &&
        this.addedNewPackingDuringOperationsOnThisScreen().length == 0) {
        this.toastr.error('', this.translate.instant("NoPackingInfoAvailable"));
        return;
      }
      sessionStorage.setItem("orignalArrayBeforeEdit", JSON.stringify(this.outbound.packingCollection));

      if (packingDetails != null && packingDetails != undefined) {
        //show packing details in lookup.
        var selectedPackingItemsForThisScreen = packingDetails.filter(pi => (pi.ItemCode == this.selected.ITEMCODE
          && pi.DocEntry == this.docEntry));
        var packingNotUsedAtThisScreen = [];
        for (let j = 0; j < packingDetails.length; j++) {
          var pos = selectedPackingItemsForThisScreen.findIndex(item => (item.PkgNo == packingDetails[j].PkgNo))
          if (pos == -1) {
            packingNotUsedAtThisScreen.push(packingDetails[j]);
          }
        }// set value for new items.
        // packingNotUsedAtThisScreen.push.apply(packingNotUsedAtThisScreen,this.addedNewPackingDuringOperationsOnThisScreen())
        for (let j = 0; j < packingNotUsedAtThisScreen.length; j++) {
          packingNotUsedAtThisScreen[j].ItemCode = this.selected.ITEMCODE;
          packingNotUsedAtThisScreen[j].CARDCODE = this.selected.CARDCODE;
          packingNotUsedAtThisScreen[j].ItemTracking = this.selected.TRACKING;
          packingNotUsedAtThisScreen[j].Quantity = 0;
          packingNotUsedAtThisScreen[j].DocEntry = this.selected.DOCENTRY;
          packingNotUsedAtThisScreen[j].LineNum = this.selected.LINENUM
        }
      }
      //==================================
      // remove repeating packing.
      const map = new Map();
      var result = [];
      for (const otherPackingItem of packingNotUsedAtThisScreen) {
        if (!map.has(otherPackingItem.PkgNo)) {
          map.set(otherPackingItem.PkgNo, true);    // set any value to Map
          result.push(
            otherPackingItem
          );
        }
      }
      packingNotUsedAtThisScreen = result;
      //==================================
      var arrayToDisplay = [];
      arrayToDisplay.push.apply(arrayToDisplay, selectedPackingItemsForThisScreen);
      arrayToDisplay.push.apply(arrayToDisplay, packingNotUsedAtThisScreen);


      for (const newItm of this.addedNewPackingDuringOperationsOnThisScreen()) {
        var position = arrayToDisplay.findIndex(item => (item.PkgNo == newItm.PkgNo))
        if (position == -1) {
          newItm.ItemCode = this.selected.ITEMCODE;
          newItm.CARDCODE = this.selected.CARDCODE;
          newItm.ItemTracking = this.selected.TRACKING;
          newItm.Quantity = 0;
          newItm.DocEntry = this.selected.DOCENTRY;
          newItm.LineNum = this.selected.LINENUM
          arrayToDisplay.push(newItm)
        }
      }
      this.showPackingInfo = true;
      this.packingData = arrayToDisplay;
      sessionStorage.setItem("tempPackingList", JSON.stringify(this.packingData));
    }
  }


  //this method let the user to manipulate qty in packing detail lookup.
  DonePackingQtyChangesLookup(event, dataItem, index) {
    var totalQty = 0;
    var orignalArray = sessionStorage.getItem("orignalArrayBeforeEdit");
    var tempPackingForEdit = sessionStorage.getItem("tempPackingList");//jo ki humne bana kar rakha tha yaha
    var tempPackingForEditJson = JSON.parse(tempPackingForEdit);
    var orignalArrayJson = JSON.parse(orignalArray);
    for (let i = 0; i < this.packingData.length; i++) {
      totalQty = totalQty + parseInt(this.packingData[i].Quantity);
    }
    if (totalQty > this._pickedMeterialQty) {
      this.toastr.error('', this.translate.instant("PackingQtyNotMoreThenPickedQty"));
      // this.packingData = tempPackingForEditJson;
    } else {

      this.outbound.packingCollection = this.updateArrayAsPerUserChanges(this.packingData, orignalArrayJson)
      var packingCollectionItems = this.outbound.packingCollection
      sessionStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
      this.toastr.success('', this.translate.instant("PackingDetailUpdated"));
      this.closePackinDialog();
      if (this.selected.TRACKING == 'N' && this.readjustPackingForNonTracked) {
        this.bypassNonTrackedItemSave = true;
      } else {
        this.bypassNonTrackedItemSave = false;
      }
    }
  }

  //this method update the final array afer user manipulation in qty.
  updateArrayAsPerUserChanges(tempArray: any, finalArray: any): any {
    var otherItems: any = [];
    for (let i = 0; i < tempArray.length; i++) {
      var tempItem = tempArray[i];
      var pos = finalArray.findIndex(item => (item.PkgNo == tempItem.PkgNo &&
        item.ItemCode == tempItem.ItemCode &&
        item.DocEntry == tempItem.DocEntry))
      if (pos != -1) {
        // means purana item mil gaya hai to update it.
        finalArray[pos] = tempItem;
      } else {
        otherItems.push(tempItem)
      }
    }
    finalArray.push.apply(finalArray, otherItems);
    return finalArray;
  }
  //on lookup done changes
  changevalue() {
    // for (let i = 0; i < this.packingData.length; i++) {
    //   totalQty = totalQty + parseInt(this.packingData[i].Quantity);
    // }
  }
  resetPackingQtyChangesLookup() {

  }

  closePackinDialog() {
    this.showPackingInfo = false;
  }

  public addItemsToPacking(itemId: String, tracking: String, currentSelectedMaterialRow: any,
    cardCode: String, docEntry: String, lineNum: String) {

    if (this.outbound != undefined && this.outbound != null) {
      var selectedPackingItem = this.selectedPackingModel;
      var packingCollectionItems = this.outbound.packingCollection;
      var qty = this.getItmQtyToPutInPacking(currentSelectedMaterialRow, selectedPackingItem, packingCollectionItems, docEntry)
      let selectedPackingsByPkgNo = packingCollectionItems.filter(pi => pi.PkgNo == selectedPackingItem.PkgNo);
      var packingItem: PackingModel
      // filter record for current item.
      if (selectedPackingsByPkgNo != null && selectedPackingsByPkgNo != undefined && selectedPackingsByPkgNo.length > 0) {
        let selectedPackingsByItem = selectedPackingsByPkgNo.filter(pi => pi.ItemCode == currentSelectedMaterialRow.ITEMCODE);
        if (selectedPackingsByItem != null && selectedPackingsByItem != undefined && selectedPackingsByItem.length > 0) {
          let selectedPackingsBySO = selectedPackingsByItem.filter(pi => pi.DocEntry == docEntry);
          if (selectedPackingsBySO != null && selectedPackingsBySO != undefined && selectedPackingsBySO.length > 0) {
            packingItem = selectedPackingsBySO[0]
            packingItem.PkgNo = selectedPackingsBySO[0].PkgNo
            packingItem.PkgType = selectedPackingsBySO[0].PkgType
            packingItem.CARDCODE = cardCode;
            packingItem.ItemCode = itemId;
            packingItem.ItemTracking = tracking;
            // packingItem.Quantity = qty;
            if (tracking == 'S') {
              packingItem.Quantity = qty * this.selectedUOM.AltQty;
            } else {
              packingItem.Quantity = qty;
            }
            packingItem.DocEntry = docEntry;
            packingItem.LineNum = lineNum;
            this.outbound.packingCollection = packingCollectionItems;
          } else {
            // packing found with item but in other SO we will add new for this SO
            packingItem = new PackingModel()
            packingItem.PkgNo = selectedPackingItem.PkgNo
            packingItem.PkgType = selectedPackingItem.PkgType
            packingItem.CARDCODE = cardCode;
            packingItem.ItemCode = itemId;
            packingItem.ItemTracking = tracking;
            // packingItem.Quantity = qty;
            if (tracking == 'S') {
              packingItem.Quantity = qty * this.selectedUOM.AltQty;
            } else {
              packingItem.Quantity = qty;
            }
            packingItem.DocEntry = docEntry;
            packingItem.LineNum = lineNum;
            packingCollectionItems.push(packingItem)
            this.outbound.packingCollection = packingCollectionItems;
          }
        } else {
          // means packing to exist karti hai but usme koi item abhi tak add nai kea h 
          //ya fir packing dusre item k saath hai..
          let selectedPackingsItemNotNull = selectedPackingsByPkgNo.filter(pi => pi.ItemCode != null);
          if (selectedPackingsItemNotNull != null && selectedPackingsItemNotNull.length > 0) { // if  package present but with other item in it then create new row and push.
            packingItem = new PackingModel()
            packingItem.PkgNo = selectedPackingItem.PkgNo
            packingItem.PkgType = selectedPackingItem.PkgType
            packingItem.CARDCODE = cardCode;
            packingItem.ItemCode = itemId;
            packingItem.ItemTracking = tracking;
            // packingItem.Quantity = qty;
            if (tracking == 'S') {
              packingItem.Quantity = qty * this.selectedUOM.AltQty;
            } else {
              packingItem.Quantity = qty;
            }
            packingItem.DocEntry = docEntry;
            packingItem.LineNum = lineNum;
            packingCollectionItems.push(packingItem)
            this.outbound.packingCollection = packingCollectionItems;
          } else {
            packingItem = new PackingModel()
            packingItem.PkgNo = selectedPackingItem.PkgNo
            packingItem.PkgType = selectedPackingItem.PkgType
            packingItem.CARDCODE = cardCode;
            packingItem.ItemCode = itemId;
            packingItem.ItemTracking = tracking;
            // packingItem.Quantity = qty;
            if (tracking == 'S') {
              packingItem.Quantity = qty * this.selectedUOM.AltQty;
            } else {
              packingItem.Quantity = qty;
            }
            packingItem.DocEntry = docEntry;
            packingItem.LineNum = lineNum;
            var pos = packingCollectionItems.findIndex(i => (i.PkgNo == packingItem.PkgNo && i.ItemCode == undefined))
            if (pos != -1) {
              packingCollectionItems[pos] = packingItem;
              this.outbound.packingCollection = packingCollectionItems;
            } else {
              packingCollectionItems.push(packingItem)
            }
          }
        }
      } else {
        // means that packing is still not added to packing collection first time adding.
        packingItem = new PackingModel()
        packingItem.PkgNo = selectedPackingItem.PkgNo
        packingItem.PkgType = selectedPackingItem.PkgType
        packingItem.CARDCODE = cardCode;
        packingItem.ItemCode = itemId;
        packingItem.ItemTracking = tracking;
        if (tracking == 'S') {
          packingItem.Quantity = qty * this.selectedUOM.AltQty;
        } else {
          packingItem.Quantity = qty;
        }
        packingItem.DocEntry = docEntry;
        packingItem.LineNum = lineNum;
        packingCollectionItems.push(packingItem)
        this.outbound.packingCollection = packingCollectionItems;
        // its begining first item abhi tak koi packing add ni hui h.
      }
      //sessionStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
    }
  }

  // checkItemBatchSerialAdded(itemCode: String, batchSerialNo: String) {
  //   var outbound: any;
  //   let outboundData = sessionStorage.getItem(CommonConstants.OutboundData);
  //   if (outboundData != undefined && outboundData != '') {
  //     outbound = JSON.parse(outboundData);
  //     var packingCollectionItems = outbound.packingCollection;
  //     if (packingCollectionItems != null && packingCollectionItems != undefined && packingCollectionItems.length > 0) {
  //       let addedPackingItems = packingCollectionItems.filter(pi => pi.ItemCode == itemCode &&
  //         pi.ItemCode == batchSerialNo);
  //     }
  //   }
  // }

  // get qty for adding in packing, this method calculate if already added qty is there then manipulate new qty accordingly.
  getItmQtyToPutInPacking(selectedMaterial: any, selectedPacking: PackingModel, savedPackingList: any, docEntry: any): any {
    var materialQty: Number = 0;
    let selectedPackingsByPkgNo = savedPackingList.filter(pi => pi.PkgNo == selectedPacking.PkgNo);
    let selectedPackingsByItem = selectedPackingsByPkgNo.filter(pi => pi.ItemCode == selectedMaterial.ITEMCODE);
    // if already qty added for that item then take that qty and add new qty in that qty..
    let selectedPackingsBySO = selectedPackingsByItem.filter(pi => pi.DocEntry == docEntry);
    if (selectedPackingsBySO != null && selectedPackingsBySO != undefined && selectedPackingsBySO.length > 0) {
      var packingItem: PackingModel = selectedPackingsBySO[0]
      if (packingItem.Quantity != null && packingItem.Quantity != undefined && packingItem.Quantity > 0) {
        materialQty = packingItem.Quantity;
      }
    }
    // now add coming selected material qty.
    if (selectedMaterial != null && selectedMaterial != undefined) {
      materialQty = materialQty + selectedMaterial.MeterialPickQty;
    }
    return materialQty;
  }
  updateQtyInPackingForAlreadySelectedMaterial(selectedMaterialRow: any) {

  }



  onHiddenToBinScanClick() {
    var inputValue = (<HTMLInputElement>document.getElementById('InvTransfer_ToBinInput')).value;
    if (inputValue.length > 0) {
      this.toBinNo = inputValue;
    }
    this.OnBinChange()
  }
  showPackingMismatchAlert: boolean = false;
  closePackingAlert() {
    this.showPackingMismatchAlert = false;
  }
  packingAlertOkClick() {
    this.showPackingMismatchAlert = false;
    this.ShowPackingDetails();
  }

  addedNewPackingDuringOperationsOnThisScreen(): any {
    var addedPackings: any;
    var newAddedPackings: any = [];
    let outboundData = sessionStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      this.outbound = JSON.parse(outboundData);
      addedPackings = this.outbound.packingCollection;
      newAddedPackings = addedPackings.filter(i => i.PkgNo != null && i.PkgType != null &&
        (i.ItemCode == null || i.ItemCode == undefined))

    }
    return newAddedPackings;
  }

  ////UDF-Code
  showUDF = false;
  UDFComponentData: IUIComponentTemplate[] = [];
  itUDFComponents: IUIComponentTemplate = <IUIComponentTemplate>{};
  templates = [];
  displayArea = "Header";
  UDFlineNo: number;
  UDF: any = [];
  LotIndex = 0;

  ShowUDF(displayArea, rowIndex?) {
    this.LotIndex = rowIndex;
    this.displayArea = displayArea;
    let subarray = [];
    let lineno = 0;
    if (sessionStorage.getItem("ComingFrom") == "ProductionIssue") {
      lineno = this.selected.RefLineNo
    } else {
      lineno = this.selected.LINENUM
    }
    this.outbound.UDF.forEach(e => {
      if (e.LineNo == lineno && e.DocEntry == this.docEntry && e.Flag == "L" && e.LotNo == this.selectedMeterials[this.LotIndex].LOTNO) {
        subarray.push(e);
      }
    });
    this.commonservice.loadUDF(displayArea, this.commonservice.getUDFData(), subarray);
    this.templates = this.commonservice.getTemplateArray();
    this.UDFComponentData = this.commonservice.getUDFComponentDataArray();
    this.showUDF = true;
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
      while (this.UDF.length > 0) {
        let index = -1
        if (sessionStorage.getItem("ComingFrom") == "ProductionIssue") {
          index = this.UDF.findIndex(e => e.LineNo == this.selected.RefLineNo && e.DocEntry == this.docEntry)
        } else {
          index = this.UDF.findIndex(e => e.LineNo == this.selected.LINENUM && e.DocEntry == this.docEntry)
        }
        if (index == -1) {
          break;
        }
        this.UDF.splice(index, 1);
      }
      if (itUDFComponentData.length > 0) {
        for (var i = 0; i < itUDFComponentData.length; i++) {
          let value = "";
          if (itUDFComponentData[i].istextbox) {
            value = itUDFComponentData[i].textBox;
          } else {
            value = itUDFComponentData[i].dropDown.FldValue;
          }
          let lineno = this.selected.LINENUM;
          if (sessionStorage.getItem("ComingFrom") == "ProductionIssue") {
            lineno = this.selected.RefLineNo
          }
          this.UDF.push({
            Flag: "D",
            LineNo: lineno,
            Value: value,
            Key: itUDFComponentData[i].AliasID,
            DocEntry: this.docEntry
          });
        }
      }
    }
    else if (this.displayArea == "Lot") {
      let line
      if (sessionStorage.getItem("ComingFrom") == "ProductionIssue") {
        line = this.selected.RefLineNo
      } else {
        line = this.selected.LINENUM
      }
      while (this.outbound.UDF.length > 0) {
        let index = this.outbound.UDF.findIndex(e => e.LineNo == line && e.DocEntry == this.docEntry && e.Flag == "L" && e.LotNo == this.selectedMeterials[this.LotIndex].LOTNO)
        if (index == -1) {
          break;
        }
        this.outbound.UDF.splice(index, 1);
      }
      for (var i = 0; i < itUDFComponentData.length; i++) {
        // oWhsTransAddLot.UDF = itUDFComponentData;
        let value = "";
        if (itUDFComponentData[i].istextbox) {
          value = itUDFComponentData[i].textBox;
        } else {
          value = itUDFComponentData[i].dropDown.FldValue;
        }
        this.outbound.UDF.push({
          Flag: "L",
          LineNo: line,
          Value: value,
          Key: itUDFComponentData[i].AliasID,
          DocEntry: this.docEntry,
          LotNo: this.selectedMeterials[this.LotIndex].LOTNO,
          Bin: this.selectedMeterials[this.LotIndex].BINNO
        });
      }
      sessionStorage.setItem(CommonConstants.OutboundData, JSON.stringify(this.outbound));
    }
    else {
      if (itUDFComponentData.length > 0) {
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
        sessionStorage.setItem("GRPOHdrUDF", JSON.stringify(this.UDF));
      }
    }
    this.templates = [];
  }
}

