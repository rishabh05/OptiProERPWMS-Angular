import { Component, OnInit, HostListener, TemplateRef } from '@angular/core';
import { viewLineContent } from 'src/app/DemoData/sales-order';
import { UIHelper } from 'src/app/helpers/ui.helpers';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-bin-transfer',
  templateUrl: './bin-transfer.component.html',
  styleUrls: ['./bin-transfer.component.scss']
})
export class BinTransferComponent implements OnInit {
  public gridData: any[];
  isMobile: boolean;
  gridHeight: number;
  showLoader: boolean = false;
  modalRef: BsModalRef;
  showLookupLoader: boolean;

  constructor(private modalService: BsModalService) { }
  // Class variables
  public viewLines: boolean;
  
  // UI Section
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // apply grid height
    this.gridHeight = UIHelper.getMainContentHeight();

    // check mobile device
    this.isMobile = UIHelper.isMobile();
  }
  // End UI Section

  ngOnInit() {
    // apply grid height
    this.gridHeight = UIHelper.getMainContentHeight();

    // check mobile device
    this.isMobile = UIHelper.isMobile();

    this.getViewLineList();
    this.viewLines = false;
  }
  

  /** Simple method to toggle element visibility */
  public toggle(): void { this.viewLines = !this.viewLines; }
  
  public getViewLineList() {
    this.showLoader = true;
    this.gridData = viewLineContent;
    setTimeout(()=>{    
      this.showLoader = false;
    }, 1000);
  }

 
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template,
      Object.assign({}, { class: 'modal-dialog-centered' })
      );
  }
  OnItemLookupClick(){
    this.showLookupLoader = true;
  }
}
