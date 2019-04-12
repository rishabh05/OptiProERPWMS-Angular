import { Component, OnInit } from '@angular/core';
import { InboundService } from '../../services/inbound.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { InboundMasterComponent } from '../inbound-master.component';
import { LangChangeEvent, TranslateService } from '../../../../node_modules/@ngx-translate/core';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { Router } from '../../../../node_modules/@angular/router';
import { AutoLot } from 'src/app/models/Inbound/AutoLot';

@Component({
  selector: 'app-inbound-polist',
  templateUrl: './inbound-polist.component.html',
  styleUrls: ['./inbound-polist.component.scss']
})
export class InboundPolistComponent implements OnInit {

  futurepo: boolean = false;
  poCode: string;
  showLookupLoader: boolean = true;
  serviceData: any[];
  lookupfor: string;
  itemCode: string = "";
  Name: string;
  NonItemsDetail: any[];
  BatchItemsDetail: any[];
  SerialItemsDetail: any[];
  showSerialTrackItem: boolean = false;
  showBatchTrackItem: boolean = false;
  showNonTrackItem: boolean = false;
  autoLot: any[];
  openPOLineModel: any;
  openPOLinesModel: any[];
  unmatchedPOLinesModel: any[];
  viewLines: any[];
  public oSavedPOLotsArray: any = {};
  public addToGRPOArray: any = {};
  addToGRPOPONumbers: any = {};
  showGRPOButton: boolean = false;
  selectedVendor: string= "";
  disablePO: boolean = false;

  constructor(private inboundService: InboundService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    var selectedPO = localStorage.getItem("selectedPO");
    if (selectedPO != undefined && selectedPO != null && selectedPO != "") {
      this.poCode = selectedPO;
      this.disablePO = true;
    }else{
      this.disablePO = false;
    }
    var ponumber = localStorage.getItem("PONumber");
    if (ponumber != undefined && ponumber != null && ponumber != "") {
      this.poCode = ponumber;
      this.openPOLines();
    }
    this.selectedVendor = this.inboundMasterComponent.selectedVernder;
  }

  onPOlookupClick() {
    console.log("item POlookup click :");
    this.inboundService.getPOList(this.futurepo,
      this.inboundMasterComponent.selectedVernder, this.itemCode).subscribe(
        (data: any) => {
          console.log("get polist response:");
          if (data != undefined) {
            if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
              this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                this.translate.instant("CommonSessionExpireMsg"));
              return;
            }
            this.showLookupLoader = false;
            this.serviceData = data.Table;
            console.log("get polist response serviceData:", this.serviceData);
            this.lookupfor = "POList";
          } else {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
          }
        },
        error => {
          console.log("Error: ", error);
        }
      );
  }

  onItemlookupClick() {
    console.log("item lookup click :");
    this.inboundService.getItemList(this.futurepo, this.inboundMasterComponent.selectedVernder,
      this.poCode).subscribe(
        (data: any) => {
          console.log(data);
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
          console.log("Error: ", error);
        }
      );
  }

  openPOLines() {
    console.log("search click : in open poline method :openPOLines()");
    this.inboundService.GetOpenPOLines(this.futurepo, this.itemCode,
      this.poCode).subscribe(
        (data: any) => {
          console.log("api call resonse section :openPOLines()");
          console.log(data);
          this.showNonTrackItem = false;
          this.showBatchTrackItem = false;
          this.showSerialTrackItem = false;
          if (data.Table != undefined) {
            this.openPOLinesModel = [];
            this.BatchItemsDetail = [];
            this.NonItemsDetail = [];
            this.SerialItemsDetail = [];
            this.openPOLinesModel = data.Table;
            // var  unmatchedPOLinesModel = data.Table;
            this.updateReceivedQtyForSavedItems();
            this.openPOLinesModel.forEach(element => {
              if (element.TRACKING == "N") {
                this.NonItemsDetail.push(element);
              } else if (element.TRACKING == "B") {
                this.BatchItemsDetail.push(element);
              } else if (element.TRACKING == "S") {
                this.SerialItemsDetail.push(element);
              }
            });
            if (this.NonItemsDetail.length > 0) {
              this.showNonTrackItem = true;
            } if (this.BatchItemsDetail.length > 0) {
              this.showBatchTrackItem = true;
            } if (this.SerialItemsDetail.length > 0) {
              this.showSerialTrackItem = true;
            }
          } else if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          console.log("api call resonse section end of if :openPOLines()");
        },
        error => {
          console.log("Error: ", error);
        }
      );

  }

  OnPOChange() {
    if (this.poCode == "" || this.poCode == undefined) {
      return;
    }
    this.inboundService.IsPOExists(this.poCode, "").subscribe(
      data => {

        if (data != null) {
          if (data.length > 0) {
            this.openPOLines();
          }
          else {
            this.toastr.error('', this.translate.instant("POExistMessage"));
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
    if (this.lookupfor == "POList") {
      this.poCode = $event[0];
      this.Name = $event[1];
    }
    else if (this.lookupfor == "POItemList") {
      this.itemCode = $event[0];
      this.openPOLines();
    }
  }

  onClickOpenPOLineRowOpenAutoLot(selection) {
    const poline = selection.selectedRows[0].dataItem;
    this.getAutoLot(poline.ITEMCODE);
  }

  getAutoLot(itemCode: string) {
    this.inboundService.getAutoLot(itemCode).subscribe(
      (data: any) => {
        console.log(data);
        if (data.Table != undefined) {
          this.autoLot = data.Table;
          console.log("autolot value from polist:" + this.autoLot);
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
        this.openPOLineModel = this.openPOLinesModel.find(e => e.ITEMCODE == itemCode);
        if (this.openPOLineModel != null) {
          this.openPOLineModel.RPTQTY = 0;
          this.inboundMasterComponent.setClickedItemDetail(this.openPOLineModel);
          this.inboundMasterComponent.inboundComponent = 3;
        }
      },
      error => {
        console.log("Error: ", error);
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
    console.log("OpenPOlines items size:", this.openPOLinesModel.length);
    console.log("OpenPOlines items :", JSON.stringify(this.openPOLinesModel));
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
    this.inboundMasterComponent.inboundComponent = 1;
    localStorage.setItem("PONumber", "");
  }

  onAddtoGRPOClick() {
    this.oSavedPOLotsArray = JSON.parse(localStorage.getItem("GRPOReceieveData"));
    if (this.oSavedPOLotsArray != undefined && this.oSavedPOLotsArray != null && this.oSavedPOLotsArray != "") {
      if (localStorage.getItem("AddToGRPO") != "") {
        this.addToGRPOArray = JSON.parse(localStorage.getItem("AddToGRPO"));
      }else{
        this.addToGRPOArray.POReceiptLots = [];
        this.addToGRPOArray.POReceiptLotDetails = [];
        this.addToGRPOArray.UDF = [];
        this.addToGRPOArray.LastSerialNumber = [];
      }
      if (localStorage.getItem("addToGRPOPONumbers") != "") {
        this.addToGRPOPONumbers = JSON.parse(localStorage.getItem("addToGRPOPONumbers"));
      }else{
        this.addToGRPOPONumbers.PONumbers = [];
      }
      var addpo = true;
      for (var i = 0; i < this.oSavedPOLotsArray.POReceiptLots.length; i++) {
        if (this.oSavedPOLotsArray.POReceiptLots[i].PONumber == this.poCode) {
          if (addpo) {
            this.addToGRPOPONumbers.PONumbers.push({
              PONumber: this.oSavedPOLotsArray.POReceiptLots[i].PONumber
            });
            addpo = false;
          }

          this.addToGRPOArray.POReceiptLots.push({
            DiServerToken: localStorage.getItem("Token"),
            PONumber: this.oSavedPOLotsArray.POReceiptLots[i].PONumber,
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
              this.addToGRPOArray.POReceiptLotDetails.push({
                LastSerialNumber: this.oSavedPOLotsArray.LastSerialNumber[m].LastSerialNumber,
                LineId: this.oSavedPOLotsArray.LastSerialNumber[m].LineId,
                ItemCode: this.oSavedPOLotsArray.LastSerialNumber[m].ItemCode
              });
            }
          }

        }
      }
      localStorage.setItem("AddToGRPO", JSON.stringify(this.addToGRPOArray));
      localStorage.setItem("addToGRPOPONumbers", JSON.stringify(this.addToGRPOPONumbers));
    }
    localStorage.setItem("PONumber", "");
    this.inboundMasterComponent.inboundComponent = 1;
  }
}
