import { Component, OnInit } from '@angular/core';
import { InboundService } from 'src/app/services/inbound.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { TranslateService, LangChangeEvent } from '../../../../node_modules/@ngx-translate/core';
import { Router } from '../../../../node_modules/@angular/router';
import { InboundMasterComponent } from '../inbound-master.component';

@Component({
  selector: 'app-inbound-details',
  templateUrl: './inbound-details.component.html',
  styleUrls: ['./inbound-details.component.scss']
})
export class InboundDetailsComponent implements OnInit {
  public viewLines: boolean;
  showLookupLoader: boolean = true;
  serviceData: any[];
  lookupfor: string;
  VendCode: string;
  VendName: string;
  showGRPOGridAndBtn: boolean = false;
  public Polist: any[] = [];
  dialogFor: string = "";
  dialogMsg: string = "Do you want to delete?"
  showConfirmDialog: boolean;
  rowindexForDelete: any;
  gridDataAfterDelete: any[];
  showNext: boolean = false;

  yesButtonText: string = "Yes";
  noButtonText: string = "No";

  constructor(private inboundService: InboundService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    this.VendCode = localStorage.getItem("VendCode");
    this.VendName = localStorage.getItem("VendName");
    if(this.VendCode != ""){
      this.showNext = true;
    }else{
      this.showNext = false;
    }
    this.dateAvailableToReceieve();
  }

  dateAvailableToReceieve() {
    var dataModel = localStorage.getItem("addToGRPOPONumbers");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
      this.showGRPOGridAndBtn = false;
    } else {
      var inboundData = JSON.parse(dataModel);
      this.Polist = inboundData.PONumbers;
      this.showGRPOGridAndBtn = true;
    }
  }

  receive() {
    var dataModel = localStorage.getItem("AddToGRPO");
    if (dataModel != null && dataModel != undefined && dataModel != "") {
      this.SubmitGoodsReceiptPO(JSON.parse(dataModel));
    }
  }

  SubmitGoodsReceiptPO(oSubmitPOLotsObj: any) {
    this.inboundService.SubmitGoodsReceiptPO(oSubmitPOLotsObj).subscribe(
      (data: any) => {
        console.log(data);
        if (data[0].ErrorMsg == "" && data[0].Successmsg == "SUCCESSFULLY") {
          // alert("Goods Receipt PO generated successfully with Doc No: " + data.DocEntry);
          this.toastr.success('', this.translate.instant("GRPOSuccessMessage") + data[0].DocEntry);
          localStorage.setItem("Line", "0");
          localStorage.setItem("GRPOReceieveData", "");
          localStorage.setItem("AddToGRPO", "");
          localStorage.setItem("addToGRPOPONumbers", "");
          this.dateAvailableToReceieve();
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
        console.log("Error: ", error);
        // alert("fail");
      }
    );
  }

  onVendorLookupClick() {
    this.inboundService.getVendorList().subscribe(
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
          this.lookupfor = "VendorList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        console.log("Error: ", error);
        this.toastr.error('', error);
      }
    );
  }


  OnVendorChange() {
    if (this.VendCode == "" || this.VendCode == undefined) {
      return;
    }
    this.inboundService.IsVendorExists(this.VendCode).subscribe(
      (data: any) => {
        console.log(data);
        if (data != null) {
          if (data != undefined && data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data[0].Result == "0") {
            this.toastr.error('', this.translate.instant("VendorExistMessge"));
            this.VendCode = "";
            this.showNext = false;
            return;
          } else {
            this.VendCode = data[0].ID;
            this.VendName = data[0].Name;
            this.showNext = true;

          }
        } else {
          this.toastr.error('', this.translate.instant("VendorExistMessge"));
          this.VendCode = "";
          this.showNext = false;
        }
      },
      error => {
        console.log("Error: ", error);
        this.toastr.error('', error);
      }
    );
  }

  getLookupValue($event) {
    this.VendCode = $event[0];
    this.VendName = $event[1];
    this.showNext = true;
  }

  public onNextClick() {
    if (this.VendCode != undefined && this.VendCode != "") {
      this.inboundMasterComponent.selectedVernder = this.VendCode;
      this.inboundMasterComponent.inboundComponent = 2;
      localStorage.setItem("VendCode", this.VendCode);
      localStorage.setItem("VendName", this.VendName);
      localStorage.setItem("selectedPO", "");
      localStorage.setItem("PONumber", "");
    }
    else {
      this.toastr.error('', this.translate.instant("SelectVendorValidateMsg"));
    }
  }

  OnCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

  onPOSelection($event) {
    localStorage.setItem("selectedPO", $event.selectedRows[0].dataItem.PONumber);
    this.inboundMasterComponent.inboundComponent = 2;
  }
 
  public openConfirmForDelete(rowindex, gridData: any) {
    this.dialogFor = "deleteRow";
    this.dialogMsg = this.translate.instant("DoYouWantToDelete")
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
      }
    } else {
      if ($event.Status == "cancel") {
        // when user click on cross button nothing to do.
      }
    }
  }

  DeleteRowClick(rowindex, gridData: any) {
    this.Polist.splice(rowindex, 1);
    var dataModel = localStorage.getItem("addToGRPOPONumbers");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
    } else {
      var inboundData = JSON.parse(dataModel);
      inboundData.PONumbers.splice(rowindex, 1);
    }
    localStorage.setItem("addToGRPOPONumbers", JSON.stringify(inboundData));
    gridData.data = this.Polist;
    if (this.Polist.length > 0) {
      this.showGRPOGridAndBtn = true;
    } else {
      this.showGRPOGridAndBtn = false;
    }
  }

  removePODetailData(PONumbers: any){
    var inboundData = JSON.parse(localStorage.getItem("AddToGRPO"));
    if (inboundData != undefined && inboundData != null && inboundData != "") {
      for (var i = 0; i < inboundData.POReceiptLots.length; i++) {
        if (inboundData.POReceiptLots[i].PONumber == PONumbers) {

          for (var j = 0; j < inboundData.POReceiptLotDetails.length; j++) {
            if (inboundData.POReceiptLotDetails[j].ParentLineNo == inboundData.POReceiptLots[i].Line) {
              inboundData.POReceiptLotDetails[j].splice(j, 1);
            }
          }

          for (var k = 0; k < inboundData.UDF.length; k++) {
            if (inboundData.UDF[k].LineNo == inboundData.POReceiptLots[i].Line) {
              inboundData.UDF[k].splice(k, 1); 
            }
          }

          for (var m = 0; m < inboundData.LastSerialNumber.length; m++) {
            if (inboundData.LastSerialNumber[m].ItemCode == inboundData.POReceiptLots[i].ItemCode) {
              inboundData.LastSerialNumber.splice(m, 1);
            }
          }

          inboundData.POReceiptLots.splice(i, 1);
        }
      }
      localStorage.setItem("AddToGRPO", JSON.stringify(inboundData));
    }
  }
}
