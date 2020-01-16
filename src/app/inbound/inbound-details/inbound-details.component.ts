import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { InboundService } from '../../services/inbound.service';
import { Commonservice } from '../../services/commonservice.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { InboundMasterComponent } from '../inbound-master.component';
import { StatePersistingServiceService } from '../../services/state-persisting-service.service';
import { promise } from 'protractor';

@Component({
  selector: 'app-inbound-details',
  templateUrl: './inbound-details.component.html',
  styleUrls: ['./inbound-details.component.scss']
})
export class InboundDetailsComponent implements OnInit {

  @ViewChild('VendScanInputField') vendInputScanField: ElementRef;
  @ViewChild('poScanInputField') poScanInputField;
  @ViewChild('scanVenderRefNo') scanVenderRefNo;
  public viewLines: boolean;
  showLookupLoader: boolean = true;
  VendRefNo: string = "";
  serviceData: any[];
  lookupfor: string;
  VendCode: string;
  VendCode1: string;
  VendName: string;
  showLoader: boolean = false;
  showGRPOGridAndBtn: boolean = false;
  public Polist: any[] = [];
  dialogFor: string = "";
  dialogMsg: string = "";
  showConfirmDialog: boolean;
  rowindexForDelete: any;
  gridDataAfterDelete: any[];
  showNext: boolean = false;
  yesButtonText: string = "";
  noButtonText: string = "";
  showPDF: boolean = false;
  base64String: string = "";
  fileName: string = "";
  displayPDF1: boolean = false;
  detailsAvailable: boolean = false;

  constructor(private inboundService: InboundService, private commonservice: Commonservice, private router: Router, private toastr: ToastrService, private translate: TranslateService,
    private inboundMasterComponent: InboundMasterComponent, private persistingService: StatePersistingServiceService) {
    let userLang = navigator.language.split('-')[0];
    userLang = /(fr|en)/gi.test(userLang) ? userLang : 'fr';
    translate.use(userLang);
    translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    this.onVendorLookupClick();
  }


  onVendorLookupClick() {
    this.showLoader = true;
    this.inboundService.getVendorList().subscribe(
      (data: any) => {
        this.showLoader = false;
        // console.log(data);
        if (data != undefined) {
          if (data.LICDATA != undefined && data.LICDATA[0].ErrorMsg == "7001") {
            this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router,
              this.translate.instant("CommonSessionExpireMsg"));
            return;
          }
          this.showLookupLoader = false;
          this.serviceData = data.Table;
          this.lookupfor = "CTList";
        } else {
          this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
        }
      },
      error => {
        this.showLoader = false;
        // console.log("Error: ", error);
        // this.toastr.error('', error);
        if (error.error.ExceptionMessage != null && error.error.ExceptionMessage != undefined) {
          this.commonservice.unauthorizedToken(error, this.translate.instant("token_expired"));
        }
        else {
          this.toastr.error('', error);
        }
      }
    );
  }


  getLookupValue(event) {
    localStorage.setItem("", JSON.stringify(event));
    this.inboundMasterComponent.inboundComponent = 2;
  }


  OnCancelClick() {
    this.router.navigate(['home/dashboard']);
  }

  OnAddClick(){
    this.inboundMasterComponent.inboundComponent = 2;
  }

  onEditClick(){
    this.inboundMasterComponent.inboundComponent = 2;
  }

  onDeleteRowClick(){
    this.inboundMasterComponent.inboundComponent = 2;
  }
}
