import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-comon-confirm-dialog',
  templateUrl: './comon-confirm-dialog.component.html',
  styleUrls: ['./comon-confirm-dialog.component.scss']
})
export class ComonConfirmDialogComponent implements OnInit {

  @Input() titleMessage: any; 
  @Input() yesButtonText: any;
  @Input() noButtonText: any;
  @Input() fromWhere: any;
  @Output() isYesClick = new EventEmitter();
  showNoButton:boolean = true;
  numberOfCopies: number = 1;
  ShowPrintCount = false;
  constructor() { }

  ngOnInit() {
    this.showNoButton = true;
    if(this.noButtonText == undefined || this.noButtonText == ""){
      this.showNoButton = false;
    }

    if(this.fromWhere == "receiveSinglePDFDialog" || this.fromWhere == "receiveMultiplePDFDialog"){
      this.ShowPrintCount = true;
    }else{
      this.ShowPrintCount = false;
    }
  }

  public opened: boolean = true;

  public close(status) {
    this.isYesClick.emit({Status:status,From: this.fromWhere, NoOfCopies:this.numberOfCopies});

    // if (status == "yes") {

     
    // } else {
    //   this.isYesClick.emit(status,this.fromWhere);
    // }
    this.opened = false;
  }
 
  public open() {
    this.opened = true; 
  }
}
