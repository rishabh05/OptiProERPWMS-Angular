import { Component, OnInit } from '@angular/core';
import { InventoryTransferService } from '../../services/inventory-transfer.service';
import { ToastrService } from 'ngx-toastr';
import { ToWhs } from 'src/app/models/InventoryTransfer/ToWhs';
import { CurrentSidebarInfo } from 'src/app/models/sidebar/current-sidebar-info';
import { Router } from '@angular/router';
import { Commonservice } from 'src/app/services/commonservice.service';

@Component({
  selector: 'app-whs-transfer',
  templateUrl: './whs-transfer.component.html',
  styleUrls: ['./whs-transfer.component.scss']
})
export class WhsTransferComponent implements OnInit {
  selectedItem: any;

  fromWhse: string;
  showLookupLoader=true;
  toWhs: ToWhs[];
  serviceData: any[];
  lookupfor: string;
  
  constructor(private commonService: Commonservice, private router: Router, private inventoryTransferService: InventoryTransferService, private toastr: ToastrService) { }

  ngOnInit() {
    this.fromWhse = localStorage.getItem("whseId");
  }

  getToWhse(){
    this.inventoryTransferService.getToWHS().subscribe(
      data => {

        if(data == "7001"){
          // CommonSessionExpireMsg
          return;
        }
        
        this.showLookupLoader = false;
        this.serviceData = data;
        this.lookupfor = "toWhsList";
      },
      error => {
        this.showLookupLoader = false;
        this.lookupfor = "toWhsList";
      }
    );
  }
  /**
   * 
   * @param event 
   * @param module 
   */
  listClick(event, module) { 
    this.selectedItem = module;
    
    this.closeRightSidebar();
    
    //this.router.navigate(['home/' + module]);
    this.router.navigateByUrl('home/' + module, { skipLocationChange: true });

  }
  closeRightSidebar() {
    let currentSidebarInfo: CurrentSidebarInfo = new CurrentSidebarInfo();
    currentSidebarInfo.SideBarStatus = false;
    this.commonService.setCurrentSideBar(currentSidebarInfo);
  }
}
