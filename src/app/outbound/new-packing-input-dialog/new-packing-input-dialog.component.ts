import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { OutboundService } from 'src/app/services/outbound.service';
import { Commonservice } from 'src/app/services/commonservice.service';
import { Router } from '@angular/router';
import { CommonConstants } from 'src/app/const/common-constants';
import { PackingModel } from 'src/app/models/outbound/PackingModel';

@Component({
  selector: 'app-new-packing-input-dialog',
  templateUrl: './new-packing-input-dialog.component.html',
  styleUrls: ['./new-packing-input-dialog.component.scss']
})
export class NewPackingInputDialogComponent implements OnInit {


  
  packingNo: string = "";
  type: string = "";
  @Input() titleMessage: any;
  @Input() yesButtonText: any;
  @Input() noButtonText: any;
  @Input() fromWhere: any;
  @Input() docEntry: any;
  @Output() packingDialogOutput = new EventEmitter();
  showNoButton: boolean = true;
  showLoader: boolean = false;
  showLookup: boolean = false;
  opened:boolean = true;
  serviceData: any[];
  lookupfor: string;
  packingtypes:any =[{"PackingType":"Box"},{"PackingTyhpe":"Carton"}]

  autoGeneratePalletEnable: boolean = false;
  isPalletizationEnable: boolean = false;
  constructor(private toastr: ToastrService, private translate: TranslateService,
    private outboundservice: OutboundService, private commonservice: Commonservice,
    private router: Router) { }

  ngOnInit() {

  }


  OnPackingChange(){
    //this.validateAndGetPackValue(true,this.packingNo,this.docEntry)
   if(this.checkPackingNoExistInDb(this.packingNo)){
    this.toastr.error('', this.translate.instant("PackingNoAlreadyTaken"));
    this.packingNo = '';
   }else{
         // we can take it.
   }
  }
  

 OnTypeLookupClick(){
  this.validateAndGetTypeValue(false,"","");
 }
 OnTypeChange(){
  this.validateAndGetTypeValue(true,"",this.type)
 }
 validateAndGetTypeValue(fromblur:any = false,packNo: any, types: any) {
  if(fromblur && types=="")
  {
    return;
  }
  

   this.outboundservice.GetPackSlipType(packNo, types).subscribe(
     (resp: any) => {
       if (resp != null && resp.length > 0) {
         if (resp[0].ErrorMsg == "7001") {
           this.commonservice.RemoveLicenseAndSignout(this.toastr, this.router, this.translate.instant("CommonSessionExpireMsg"));//.subscribe();
           return;
         }
         if (fromblur) {
           //do something
           this.type = resp[0].PkgType
         } else {
           this.lookupfor = "packingType";
           this.serviceData = resp;
           if (this.serviceData.length > 0) {
             this.showLookup = true;
           } else {
            this.type =''
             this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
             // this.showLookupLoader = false;
             this.showLookup = false;
           }
         }
       } else {
        this.type =''
         this.toastr.error('', this.translate.instant("CommonNoDataAvailableMsg"));
       }

     },
     error => {
       this.toastr.error('', this.translate.instant("CommonSomeErrorMsg"));
       //this.showLookupLoader = false;
       this.showLookup = false;
     }
   );
}

  checkPackingNoExistInDb(packingNo: String): boolean {
    var outbound: any;
    let outboundData = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      outbound = JSON.parse(outboundData);
      var packingCollection: any = outbound.packingCollection;
      var items = packingCollection.filter(pItem => pItem.PkgNo ===packingNo);
      if (items.length > 0) return true;
    }
    return false;
  }

  getLookupValue($event) {
    if ($event != null && $event == "close") {
      //nothing to do
      return;
    }
    else if (this.lookupfor == "packingType") {
      this.type = $event.PkgType;
    }
  }

  public close(status) {
    this.packingDialogOutput.emit(
      'close'
    );
    this.opened = false;
  }
  
  OnDoneClick(){
    if(this.packingNo==undefined || this.packingNo==null || this.packingNo=="" ||
    this.type==undefined || this.type==null || this.type=="" ){
      this.toastr.error('', this.translate.instant("packNoAndTypeValidate"));
      return;
    }
    var outbound: any;
    let outboundData = localStorage.getItem(CommonConstants.OutboundData);
    if (outboundData != undefined && outboundData != '') {
      outbound = JSON.parse(outboundData);
      var packingCollection: any = outbound.packingCollection;
      var model: PackingModel  = new PackingModel();
      model.PkgNo = this.packingNo;
      model.PkgType = this.type
      outbound.packingCollection.push(model) 
      outbound.AllCreatedPackings.push(model)
      outbound.selectedPackingItem=model;
      localStorage.setItem(CommonConstants.OutboundData, JSON.stringify(outbound));
     }
     this.packingDialogOutput.emit({
      Status: 'yes',
    });
    this.opened = false;
    }
   

}
