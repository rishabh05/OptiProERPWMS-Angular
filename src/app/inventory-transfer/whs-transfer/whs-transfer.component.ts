import { Component, OnInit } from '@angular/core';
import { InventoryTransferService } from '../../services/inventory-transfer.service';
import { ToastrService } from 'ngx-toastr';
import { ToWhs } from 'src/app/models/InventoryTransfer/ToWhs';

@Component({
  selector: 'app-whs-transfer',
  templateUrl: './whs-transfer.component.html',
  styleUrls: ['./whs-transfer.component.scss']
})
export class WhsTransferComponent implements OnInit {

  fromWhse: string;
  showLookupLoader=true;
  toWhs: ToWhs[];
  serviceData: any[];
  lookupfor: string;
  
  constructor(private inventoryTransferService: InventoryTransferService, private toastr: ToastrService) { }

  ngOnInit() {
    this.fromWhse = localStorage.getItem("whseId");
  }

  getToWhse(){
    this.inventoryTransferService.getToWHS().subscribe(
      data => {
        this.showLookupLoader = false;
        this.serviceData = data;
        this.lookupfor = "toWhsList";
      },
      error => {
     
      }
    );
  }
}
