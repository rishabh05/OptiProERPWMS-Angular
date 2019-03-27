import { Component, OnInit, Renderer } from '@angular/core';
import { Commonservice } from 'src/app/services/commonservice.service';
import { Router } from '@angular/router';
import { ProductionService } from 'src/app/services/production.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-production-receipt',
  templateUrl: './production-receipt.component.html',
  styleUrls: ['./production-receipt.component.scss']
})
export class ProductionReceiptComponent implements OnInit {
  
  
  //subscription variables.
  orderNoListSubs: ISubscription;
  
  //for making disable the three fields.
  enableSearialQty:boolean = false;
  enableOpenQty:boolean = false;
  enableAcceptQty:boolean = false;
  
  //showing loader for data loading purpose.
  showLookupLoader: boolean = true;
  
  // values related variables.
  public value: Date = new Date();
  orderNumber:string= "";
  constructor(private renderer: Renderer, private commonservice: Commonservice, private router: Router, private productionService: ProductionService,
    private toastr: ToastrService, private translate: TranslateService) { }

  ngOnInit() {
  }

  /**
  * Method to get list of inquries from server.
  */
 public showList() {

  this.orderNoListSubs = this.productionService.getOrderNumberList(this.orderNumber).subscribe(
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

}
