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
  @Output() isYesClick = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  public opened: boolean = true;

  public close(status) {

    if (status == "yes") {
      this.isYesClick.emit(true);
    } else {
      this.isYesClick.emit(false);
    }
    this.opened = false;
  }

  public open() {
    this.opened = true;
  }
}
