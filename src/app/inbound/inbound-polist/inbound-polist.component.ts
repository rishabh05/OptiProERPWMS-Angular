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
  viewLines: any[];


  constructor(private inboundService: InboundService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
  }

  onPOlookupClick() {
    console.log("item POlookup click :");
    this.inboundService.getPOList(this.futurepo,
      this.inboundMasterComponent.selectedVernder, this.itemCode).subscribe(
        (data: any) => {
          if (data != undefined) {
            if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
              this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
                this.translate.instant("CommonSessionExpireMsg"));
              return;
            }
            this.showLookupLoader = false;
            this.serviceData = data.Table;
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
    console.log("search click : in open poline method");
    this.inboundService.GetOpenPOLines(this.futurepo, this.itemCode,
      this.poCode).subscribe(
        (data: any) => {
          console.log("api call resonse section");
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
          console.log("api call resonse section end of if");
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
          console.log("autolot value from polist:"+this.autoLot);
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

        this.inboundMasterComponent.setAutoLots(this.autoLot);
        this.openPOLineModel = this.openPOLinesModel.find(e => e.ITEMCODE == itemCode);
        if (this.openPOLineModel != null) {
          this.inboundMasterComponent.setClickedItemDetail(this.openPOLineModel);
          this.inboundMasterComponent.inboundComponent = 3;
        }
      },
      error => {
        console.log("Error: ", error);
      }
    );
  }

  onCancelClick() {
    this.inboundMasterComponent.inboundComponent = 1;
  }
}
