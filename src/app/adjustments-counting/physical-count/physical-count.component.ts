import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PhysicalcountService } from 'src/app/services/physicalcount.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { TranslateService, LangChangeEvent } from '../../../../node_modules/@ngx-translate/core';
import { ToastrService } from '../../../../node_modules/ngx-toastr';

@Component({
  selector: 'app-physical-count',
  templateUrl: './physical-count.component.html',
  styleUrls: ['./physical-count.component.scss']
})
export class PhysicalCountComponent implements OnInit {
  showLoader: boolean = false;
  showLookupLoader: boolean = false;
  serviceData: any[];
  lookupfor: string;
  DocNo: string;
  CountDate: string;
  ItemCode: string;
  ItemName: string;
  BinNo: string;
  SerialNo: string;
  CountedQty: string;
  UOM: string;
  ItemTracking: string="";
  batchNoPlaceholder: string;
  batchSrBtn: string;
  isNonTrack: boolean = false;
  IsteamCount: string="";
  batchserno: string;
  QtyOnHand:string = "";
  showItemName:string = "";
  showConfirmDialog:boolean = false;
  SavedDocNoDetailArray: any[] = [];

  constructor(private phycountService: PhysicalcountService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    this.getPhysicalCountData();
  }

  getPhysicalCountData() {
    this.showLoader = true;
    this.phycountService.getPhysicalCountDataView().subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != undefined) {
          if (data[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = true;
          this.serviceData = data;
          this.lookupfor = "PhyCntItemList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
        this.toastr.error('', error);
      }
    );
  }

  onItemlookupClick() {
    this.showLoader = true;
    this.phycountService.getItemList(this.DocNo).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != undefined) {
          if (data.ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = true;
          this.serviceData = data;
          this.lookupfor = "showPhyCntItemsList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
      }
    );
  }

  ShowBatachSerList() {
    
    if(this.SavedDocNoDetailArray.length > 0){
      this.showLookupLoader = true;
      this.serviceData = this.SavedDocNoDetailArray;
      this.lookupfor = "ShowBatachSerList";
    }
  }

  GetSavedDocNoDetails() {
    this.showLoader = true;
    this.phycountService.GetSavedDocNoDetails(this.DocNo, this.ItemCode, this.BinNo, this.IsteamCount).subscribe(
      (data: any) => {
        this.showLoader = false;
        console.log(data);
        if (data != undefined) {
          if (data.ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.SavedDocNoDetailArray = data;
          if(this.SavedDocNoDetailArray.length > 0){
            this.ItemTracking = this.SavedDocNoDetailArray[0].Tracking;
            this.UOM = this.SavedDocNoDetailArray[0].UomCode;
            this.CountedQty = this.SavedDocNoDetailArray[0].Qty;
            this.QtyOnHand = this.SavedDocNoDetailArray[0].Qty;
            this.CheckTrackingandVisiblity();
          }
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLoader = false;
        console.log("Error: ", error);
      }
    );
  }

  // showSavedDocNoDetails() {
  //   this.showLoader = true;
  //   this.phycountService.GetSavedDocNoDetails(this.DocNo, this.ItemCode, this.BinNo, this.IsteamCount).subscribe(
  //     (data: any) => {
  //       this.showLoader = false;

  //       if (data != undefined) {

  //         this.showLookupLoader = true;
  //         this.serviceData = data;
  //         this.lookupfor = "showPhyCntLotNos";
  //       } else {
  //         this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
  //       }
  //     },
  //     error => {
  //       this.showLoader = false;
  //       console.log("Error: ", error);
  //     }
  //   );
  // }

  getLookupValue($event) {
    if (this.lookupfor == "PhyCntItemList") {
      this.DocNo = $event[0];
      this.CountDate = $event[4];
      this.ItemCode = $event[2];
      this.BinNo = $event[3];
      this.QtyOnHand = $event[5];
      this.IsteamCount = $event[6];
      this.GetSavedDocNoDetails();

    } else if (this.lookupfor == "showPhyCntItemsList") {
      this.ItemCode = $event[0];
      this.BinNo = $event[3];
      this.ItemTracking = $event[2];
      this.UOM = $event[4];
      this.CheckTrackingandVisiblity();
    }else if(this.lookupfor == "ShowBatachSerList"){
      this.batchserno = $event[7];
      this.ItemCode = $event[3];
      this.ItemTracking = $event[31];
      this.UOM = $event[19];
      this.CountedQty = $event[20];
      this.CheckTrackingandVisiblity();
    }
  }

  CheckTrackingandVisiblity() {
    if (this.ItemTracking == "B") {
      this.isNonTrack = false;
      this.batchNoPlaceholder = this.translate.instant("BatchNo");
      this.batchSrBtn = this.translate.instant("Batch");
    }
    else if (this.ItemTracking == "S") {
      this.isNonTrack = false;
      this.batchNoPlaceholder = this.translate.instant("SerialNo");
      this.batchSrBtn = this.translate.instant("Serial");
    }
    else if (this.ItemTracking == "N") {
      this.isNonTrack = true;
    }

    // this.fromBin = "";
    // this.toBin = "";
    // this.lotValue = "";
  }

  onCancelClick() {
    this.router.navigate(['home/dashboard']);
  }
}
