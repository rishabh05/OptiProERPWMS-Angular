import { Component, OnInit } from '@angular/core';
import { InboundMasterComponent } from 'src/app/inbound/inbound-master.component';
import { Router } from '../../../../node_modules/@angular/router';
import { InboundService } from 'src/app/services/inbound.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { ToastrService } from '../../../../node_modules/ngx-toastr';
import { TranslateService, LangChangeEvent } from '../../../../node_modules/@ngx-translate/core';
import { UOM } from 'src/app/models/Inbound/UOM';
import { OpenPOLinesModel } from 'src/app/models/Inbound/OpenPOLinesModel';
import { RecvingQuantityBin } from 'src/app/models/Inbound/RecvingQuantityBin';

@Component({
  selector: 'app-inbound-grpo',
  templateUrl: './inbound-grpo.component.html',
  styleUrls: ['./inbound-grpo.component.scss']
})
export class InboundGRPOComponent implements OnInit {

  openPOLineModel: OpenPOLinesModel[] = [];
  Ponumber: any;
  RecvbBinvalue: any="";
  uomSelectedVal: UOM;
  UOMList: UOM[];
  qty: number;
  showButton: boolean = false;
  recvingQuantityBinArray: RecvingQuantityBin[] = [];
  defaultRecvBin: boolean = false;
  serviceData: any[];
  lookupfor: string;
  showLookupLoader = true;
  viewLines:any[];
  getLookupValue:any[];
  public value: Date = new Date();

  constructor(private inboundService: InboundService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    this.openPOLineModel[0] = this.inboundMasterComponent.openPOmodel;
    this.Ponumber = this.openPOLineModel[0].DOCENTRY;
    this.getUOMList();
    if (this.RecvbBinvalue == "") {
      this.defaultRecvBin = true;
      this.ShowBins();
    }
  }

  /**
    * Method to get list of inquries from server.
   */
  public ShowBins() {
    this.inboundService.getRevBins(this.openPOLineModel[0].QCREQUIRED).subscribe(
      (data: any) => {
        console.log(data);
        if (data != null) {
          if (this.defaultRecvBin == true) {
            this.RecvbBinvalue = data[0].BINNO;
            this.defaultRecvBin = false
          }
          else {
            if (data.length > 0) {
              console.log(data);
              this.showLookupLoader = false;
              this.serviceData = data;
              this.lookupfor = "RecvBinList";
              return;
            }
            else {
              this.toastr.error('', this.translate.instant("NoBinsAvailableMsg"));
            }
          }
        }
      },
      error => {
        console.log("Error: ", error);
      }
    );
  }


  OnBinChange() {
    if (this.RecvbBinvalue == "") {
      return;
    }
    this.inboundService.binChange(this.openPOLineModel[0].QCREQUIRED).subscribe(
      (data: any) => {
        console.log(data);
        if (data != null) {
          if (data.length > 0) {
            if (data[0].Result == "0") {
              this.toastr.error('', this.translate.instant("INVALIDBIN"));
              this.RecvbBinvalue = "";
              return;
            }
            else {
              this.RecvbBinvalue = data[0].ID;
              // oCurrentController.isReCeivingBinExist();
            }
          }
        }
        else {
          this.toastr.error('', this.translate.instant("INVALIDBIN"));
          this.RecvbBinvalue = "";
          return;
        }
      },
      error => {
        console.log("Error: ", error);
        this.RecvbBinvalue = "";
      }
    );
  }

  /**
   * Method to get list of inquries from server.
  */
  public getUOMList() {
    this.inboundService.getUOMs(this.openPOLineModel[0].ITEMCODE).subscribe(
      (data: any) => {
        console.log(data);

        this.openPOLineModel[0].UOMList = data;
        if (this.openPOLineModel[0].UOMList.length > 0) {
          this.uomSelectedVal = this.openPOLineModel[0].UOMList[0];
        }
      },
      error => {
        console.log("Error: ", error);
      }
    );
  }



  addQuantity(e) {
    if (this.qty == 0 || this.qty == undefined) {
      alert("Please enter quantity");
      return;
    }

    if (this.RecvbBinvalue == "" || this.RecvbBinvalue == undefined) {
      alert("Invalid Bin");
      return;
    }

    let result = this.recvingQuantityBinArray.find(element => element.Bin == this.RecvbBinvalue);
    if (result == undefined) {
      this.recvingQuantityBinArray.push(new RecvingQuantityBin(this.qty, this.RecvbBinvalue));
      this.showButton = true;
      this.qty = undefined;
    } else {
      alert("can not item add in same bin");
      return;
    }
  }
}
