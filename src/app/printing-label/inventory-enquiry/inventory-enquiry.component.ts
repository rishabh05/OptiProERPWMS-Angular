import { Component, OnInit, Renderer } from '@angular/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LabelPrintReportsService } from 'src/app/services/label-print-reports.service';
import { ISubscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-inventory-enquiry',
  templateUrl: './inventory-enquiry.component.html',
  styleUrls: ['./inventory-enquiry.component.scss']
})
export class InventoryEnquiryComponent implements OnInit {
  pageSize: number = 5;
  itemCode: string = "";
  lotNo: string = "";
  itemName: string = "";
  itemNameLabel: string = "";
  binNo: string = "";
  type: string = "";
  nonTracked: boolean = false;

  lotsListSubs: ISubscription;
  lotScanListWithoutWhseBinSubs: ISubscription;
  getItemOrBatchDetailSubs: ISubscription;
  itemLabelSubs: ISubscription;
  isItemExistsSubs: ISubscription;
  itemTrackingSubs: ISubscription;

  showLookupLoader: boolean = true;
  serviceData: any[];
  lookupfor: string;

  disableDescription: boolean = false;
  disableItemCode: boolean = false;

  batchSerial: boolean = true;
  itemSummary: boolean = false;
  itemDetail: boolean = false;

  showQuantityGrid:boolean = false;
  quantityGridData: any[];

  isFromLotChange:boolean = false;
  isFromItemChange:boolean = false;
  totalSum: number = 0;
  constructor(private renderer: Renderer, private commonservice: Commonservice, private router: Router, private labelPrintReportsService: LabelPrintReportsService,
    private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.batchSerial = true;
    this.itemSummary = false;
    this.itemDetail = false;

    this.disableDescription = true;
    this.disableItemCode = true;
  }
  handleCheckChange($event) {
    this.resetGridOnRadioChange();
    switch ($event.target.id) {
      case ("InventoryEnquiryOptions1"):
        this.initialize()
        break;
      case ("InventoryEnquiryOptions2"):
        this.batchSerial = false;
        this.itemSummary = true;
        this.itemDetail = false;
        this.disableDescription = true;
        this.disableItemCode = false;
        break;
      case ("InventoryEnquiryOptions3"):
        this.batchSerial = false;
        this.itemSummary = false;
        this.itemDetail = true;
        this.disableDescription = true;
        this.disableItemCode = false;
        break;
    }
  }

  /**
   * item code lookup click.
   */
  OnItemCodeLookupClick() {
    this.getItemList();
  }
  /**
   * Batch serial lookup click.
   */
  OnBatchSerialLookupClick (){
      this.showLotsList();
  }

  /**
  * Method to get list of inquries from server.
  */
  public showLotsList() {

    this.lotsListSubs = this.labelPrintReportsService.getLotsList("").subscribe(
      data => {
        if (data != undefined && data.length > 0) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          this.serviceData = data;
          this.lookupfor = "LotsList";
        }
        else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.toastr.error('', error);
      },
    );
  }

  /**
  * This method will check if entered code is valid or not on field blur event.
  */
  OnLotsChange() {
    console.log("onLostsChange:");
    if (this.lotNo == undefined || this.lotNo == "") {
      return;
    }
    this.isFromLotChange = true;
    this.checkBinForOtherTrackedItems();
  }

  checkBinForOtherTrackedItems() {
    
    this.lotScanListWithoutWhseBinSubs = this.labelPrintReportsService.getLotScanListWithoutWhseBinAndItemWise(this.itemCode, this.lotNo).subscribe(
      (data: any) => {
        if (data != undefined && data.length > 0) {
          console.log("" + data);
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return; 
          }
          if (data == "0" || data[0] == "0") {
            this.toastr.error('', this.translate.instant("InvalidBatch"));
            this.lotNo = "";
            return;
          }
          this.lotNo = data[0].LOTNO; //check this code.
          this.GetItemOrBatchDetail();
        } else {
          this.toastr.error('', this.translate.instant("InvalidBatch"));
          this.lotNo = "";
        }
      },
      error => {
        this.toastr.error('', error);
        this.lotNo = "";
      }
    );
  }

  /**
   * @param $event this will return the value on row click of lookup grid.
   */
  getLookupValue($event) {
    
    if (this.lookupfor == "LotsList") {
      //this.lotNo = $event[0];
      this.isFromLotChange = false;// reset this variable for batch value is not from on change.
      this.itemCode = $event[2];
      this.binNo = $event[3];
      this.itemNameLabel = $event[8];
      this.itemName = "";//in case of  item code send itemName = ""
      this.type = $event[9];
      if (this.type == "N") {
        this.lotNo = this.binNo;
        this.nonTracked = true;
      } else {
        this.lotNo = $event[0];
        this.nonTracked = false;
      }
      if (this.lotNo != "" && this.itemCode != "")
        this.GetItemOrBatchDetail();

    }
    if (this.lookupfor == "ItemCodeList") {
      this.isFromItemChange = false;// reset this variable for batch value is not from on change.
      console.log("value of lots" + $event);
      this.lotNo = "";  //in case of  item code send lotNo = ""
      this.itemCode = $event[0];
      this.itemNameLabel = $event[1];
      if (this.itemSummary == true) {
        this.itemName = "summary";
        this.nonTracked = true;
      } else {
        this.type = $event[2];
        this.itemName = "";
        if (this.type == "N") {
          this.nonTracked = true;
        } else {
          this.nonTracked = false;
        }
      }
      
      // we do not need to show lot no. column in case of item summery.
      if (this.itemCode != "")
        this.GetItemOrBatchDetail();
    }
  }

  /**
   * this method will get result enquiry grid data.
   */
  GetItemOrBatchDetail() {
    
    this.getItemOrBatchDetailSubs = this.labelPrintReportsService.GetItemOrBatchDetail(this.itemCode, this.lotNo, this.itemName).subscribe(
      (data: any) => {
        
        if (data != undefined && data.length > 0) {
          console.log("Item Detail:" + data);

          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showQuantityGrid = true;
          this.quantityGridData = data;
          
          this.getTotalSum(data);
          //case when value comes from on input text change then set value to desable input labels
          if(this.isFromLotChange == true){
            this.itemCode = data[0].ITEMCODE;
            this.lotNo= data[0].LOTNO;
            this.binNo = data[0].BINNO; 
            this.itemNameLabel = data[0].itemCode;
            this.isFromLotChange = false;
          }
          if(this.isFromItemChange == true){
            this.itemNameLabel = data[0].ItemName
            this.isFromItemChange = false;
          }
          if (data == "0" || data[0] == "0") {
            this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
            return;
          }
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.toastr.error('', error);
      }
    );
  }

  /**
   * method used to calculate total qty sum.
   * @param data collection of data
   */
  getTotalSum(data: any[]) {
    this.totalSum = 0;
    
    if (data != undefined && data != null && data.length > 0) {
      var num = 0;
      for (num = 0; num < data.length; num++) {
        this.totalSum = this.totalSum + data[num].TOTALQTY;
      }
    }
  }
  /**
   * this method will reset all variables on initialze the radio change property.
   */
  resetGridOnRadioChange() {

    //reset grid hide show variables, grid data vaiables other api passing parameters.
    this.showQuantityGrid = false;
    this.quantityGridData = null;
    this.itemCode = "";
    this.binNo = "";
    this.itemName = "";
    this.type = "";
    this.itemNameLabel = "";
    this.isFromLotChange = false;
    this.isFromItemChange = false;
  }

  // item section.
   /**
   * Method to get list of inquries from server.
   */
  public getItemList() {

    //this.showLoader = true; this.getPIlistSubs = 
    this.itemLabelSubs = this.labelPrintReportsService.getItemCode().subscribe(
      data => {
        if (data != undefined && data.length > 0) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          this.serviceData = data;
          this.lookupfor = "ItemCodeList";
        }
        else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.toastr.error('', error);
      },
    );
  }

  ngOnDestroy() {
    if (this.itemLabelSubs != undefined)
      this.itemLabelSubs.unsubscribe();
    if (this.getItemOrBatchDetailSubs != undefined)
      this.getItemOrBatchDetailSubs.unsubscribe();
    if (this.lotScanListWithoutWhseBinSubs != undefined)
      this.lotScanListWithoutWhseBinSubs.unsubscribe();
    if (this.lotsListSubs != undefined)
      this.lotsListSubs.unsubscribe();
    if (this.isItemExistsSubs != undefined)
      this.isItemExistsSubs.unsubscribe();
    if (this.itemTrackingSubs != undefined)
      this.itemTrackingSubs.unsubscribe();
  }

  /**
   * 
   * This method will check if entered code is valid or not on field blur event.
   */
  OnItemCodeChange() {
    
    if (this.itemCode == "" || this.itemCode == undefined) {
      //this.itemTracking = "";
      return;
    }
    this.isFromItemChange = true;
    this.isItemExistsSubs = this.labelPrintReportsService.isItemExists(this.itemCode).subscribe(
      data => {
        
        if (data != undefined && data.length > 0) {
          console.log("" + data);
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data == "0" || data[0] == "0") {
            this.toastr.error('', this.translate.instant("InvalidItemCode"));
            this.itemCode = "";
            return;
          }else{
             //do the needful for correct data.
             this.getItemTracking(this.itemCode); //no need of tracking here.
          }
        } else {
          this.toastr.error('', this.translate.instant("InvalidItemCode"));
          this.itemCode = "";
        }
      },
      error => {
        this.toastr.error('', error);
      }
    );
  }

  /**
   * get  type (tracking) of item if not available.
   * @param itemCode 
   */
  getItemTracking(itemCode: string) {
    
    this.itemTrackingSubs = this.labelPrintReportsService.getItemTracking(itemCode).subscribe(
      data => {
        if (data != undefined && data.length > 0 && data != "0") {
          console.log("" + data);
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          if (data == "0" || data[0] == "0") { return; }
          this.type = data;
          
          if (this.itemSummary == true) {
            this.itemName = "summary";
            this.nonTracked = true;
          } else {
            this.itemName = "";
            if (this.type == "N") {
              this.nonTracked = true;
            } else {
              this.nonTracked = false;
            }
          }
          if (this.itemCode != "")
          this.GetItemOrBatchDetail();

        } else {
          //  this.toastr.error('', this.translate.instant("InvalidItemCode"));
          this.itemCode = "";
        }
      },
      error => {
        this.toastr.error('', error);
      }
    );
  }
 
 
  OnCancelClick(){
    this.router.navigate(['home/dashboard']);
  }
}
