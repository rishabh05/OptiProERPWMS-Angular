import { Component, OnInit } from '@angular/core';
import { OutboundService } from 'src/app/services/outbound.service';

@Component({
  selector: 'app-out-order',
  templateUrl: './out-order.component.html',
  styleUrls: ['./out-order.component.scss']
})
export class OutOrderComponent implements OnInit {
private customerName:string="";

public serviceData: any;
public lookupfor: any = 'out-order';
public showLookup:boolean=false;
public customerCode:any;
constructor(private outboundservice: OutboundService) { }

  ngOnInit() {
  }

  public openCustomerLookup() {
    debugger;
    this.outboundservice.getCustomerSOList(this.customerCode).subscribe(
      resp => {
      this.showLookup=true;  
        this.serviceData = resp;
      }
    )
  }

}
