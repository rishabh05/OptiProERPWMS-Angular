import { Component, OnInit } from '@angular/core';
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

  constructor(private commonService: Commonservice, private router: Router,) { }

  ngOnInit() {
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
