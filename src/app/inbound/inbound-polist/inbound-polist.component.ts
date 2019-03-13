import { Component, OnInit } from '@angular/core';
import { InboundService } from '../../services/inbound.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { InboundMasterComponent } from '../inbound-master.component';
import { LangChangeEvent, TranslateService } from '../../../../node_modules/@ngx-translate/core';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { Router } from '../../../../node_modules/@angular/router';

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
  itemCode: string;
  Name: string;
  soItemsDetail: any[];

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
    this.inboundService.GetOpenPOLines(this.futurepo, this.itemCode,
      this.poCode).subscribe(
        (data: any) => {
          console.log(data);
          if (data.Table != undefined) {
            this.soItemsDetail = data.Table;
          } else if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            alert("session expire");
            this.router.navigateByUrl('account');
            return;
          }
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
            // this.Name = data[0].NAME;//set vendor code neeraj Kushwaha
            // olblVend1.setVisible(true);
            // olblVenderDescription.setVisible(true);
            // olblVenderDescription.setText(modelPOLines.oData[0].NAME);
            // oCurrentController.OnShowMaterials();
          }
          else {
            this.toastr.error('', this.translate.instant("POExistMessage"));
            // oTextPo.setValue();
            // oTextPo.focus();
            // var sMsg = oCurrentController.GetResourceString("GoodsReceiptPOs.POExistMessage");
            // oTextbox.ShowMessageDialog(sMsg, oCurrentController.MessageState.MessageStateError
            //    "Error");
            // oCurrentController.onClearData();
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
    }
    // else if(this.lookupfor = "lookupfor"){
    //   this.poCode = $event[0];
    // }
  }
}
