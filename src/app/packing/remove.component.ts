import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-remove-from-container',
  templateUrl: './remove.component.html',
  styleUrls: ['./remove.component.scss']
})
export class RemoveComponent implements OnInit {

  palletNo: string = "";
  @Input() titleMessage: any;
  @Input() yesButtonText: any;
  @Input() noButtonText: any;
  @Input() OPTM_CONTAINERCODE: string;
  @Input() OPTM_ITEMCODE: string;
  @Input() OPTM_BTCHSER: string;
  @Input() OPTM_TRACKING: string;
  @Input() OPTM_QTY: number;
  @Output() userResponse = new EventEmitter();
  showNoButton: boolean = true;
  showLoader: boolean = false;
  remove_Qty: number = 0;
  pageopened: boolean = true;  
  constructor(private translate: TranslateService, private toastr: ToastrService,
    private router: Router) {       
    }

  ngOnInit() {
    this.showNoButton = true;
    this.pageopened = true;
    
    if (this.OPTM_TRACKING == 'S') {
        this.remove_Qty = 1;
    } else {
        this.remove_Qty = this.OPTM_QTY;
    }
    if (this.noButtonText == undefined || this.noButtonText == "") {
      this.showNoButton = false;
    }        
  }  

  public close(status) {
    this.pageopened = false; 
    if (status == "yes") {        
        if (this.remove_Qty == undefined || this.remove_Qty <= 0) {
            this.toastr.error('', this.translate.instant("MsgQuantity>0"));
            return;
        } 
        if (this.remove_Qty > this.OPTM_QTY) {
            this.toastr.error('', this.translate.instant("MsgQuantityError"));
            return;
        }         

        this.userResponse.emit({
            OPTM_CONTAINERCODE: this.OPTM_CONTAINERCODE,
            OPTM_ITEMCODE: this.OPTM_ITEMCODE,
            OPTM_BTCHSER: this.OPTM_BTCHSER,
            OPTM_TRACKING: this.OPTM_TRACKING,              
            OPTM_QTY: this.OPTM_QTY,
            REMOVE_QTY: this.remove_Qty,
            CLOSED: false
          });
    } else if (status == "cancel" || status == "no") {
      this.userResponse.emit({
        CLOSED: true
      });  
    }         
  }
}
