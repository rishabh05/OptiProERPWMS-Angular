import { Component, OnInit } from '@angular/core';
import { OutboundService } from 'src/app/services/outbound.service';

@Component({
  selector: 'app-out-cutomer',
  templateUrl: './out-cutomer.component.html',
  styleUrls: ['./out-cutomer.component.scss']
})
export class OutCutomerComponent implements OnInit {

  public serviceData: any;
  public lookupfor: any = 'out-customer';
  public showLookup:boolean=false;;
  constructor(private outboundservice: OutboundService) { }

  ngOnInit() {
  }


  public openCustomerLookup() {
    debugger;
    this.outboundservice.getCustomerList().subscribe(
      resp => {
      this.showLookup=true;  
        this.serviceData = resp;
      }
    )
  }

}
