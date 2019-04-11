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
  dialogMsg:string="Do you want to delete?"
  showConfirmDialog:boolean;
  rowindexForDelete:any;
  gridDataAfterDelete:any[];

  constructor(private inboundService: InboundService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
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
    if(dataModel != null && dataModel != undefined && dataModel != ""){
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
            return;
          } else {
            this.VendCode = data[0].ID;
            this.VendName = data[0].Name;
          }
        } else {
          this.toastr.error('', this.translate.instant("VendorExistMessge"));
          this.VendCode = "";
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
  }

  public onNextClick() {
    if (this.VendCode != undefined && this.VendCode != "") {
      this.inboundMasterComponent.selectedVernder = this.VendCode;
      this.inboundMasterComponent.inboundComponent = 2;
    }
    else {
      this.toastr.error('', this.translate.instant("SelectVendorValidateMsg"));
    }
  }

  OnCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

  onPOSelection(){
    this.inboundMasterComponent.inboundComponent = 2;
  }

  public openConfirmForDelete(rowindex, gridData: any) {
    this.dialogFor = "deleteRow";
    this.dialogMsg =  this.translate.instant("DoYouWantToDelete")
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
    gridData.splice(rowindex, 1);
    var dataModel = localStorage.getItem("GRPOReceieveData");
    if (dataModel == null || dataModel == undefined || dataModel == "") {
    } else {
      var inboundData = JSON.parse(dataModel);
      this.removePODetailData(inboundData.POReceiptLots[rowindex], inboundData);
      inboundData.POReceiptLots.splice(rowindex, 1);
    }
    gridData.data = this.Polist;
    if (this.Polist.length > 0) {
      this.showGRPOGridAndBtn = true;
    } else {
      this.showGRPOGridAndBtn = false;
    }
  }

  removePODetailData(POReceiptLots: any, inboundData: any){
    for(var i=0; i<inboundData.POReceiptLots.length; i++){
      if(inboundData.POReceiptLots[i].POItemCode == POReceiptLots.PONumber+POReceiptLots.ItemCode){

      }
    }
  }
}
