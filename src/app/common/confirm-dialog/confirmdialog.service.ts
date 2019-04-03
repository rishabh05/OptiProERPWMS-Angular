import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmdialogService {

  constructor(private modalService: NgbModal) { }

  public confirm(
    title: string,
    message: string,
    btnOkText: string = 'OK',
    btnCancelText: string = 'Cancel',
    dialogSize: 'sm'|'lg' = 'sm'): Promise<boolean>{
      const modelRef = this.modalService.open(ConfirmDialogComponent,{size:dialogSize});
      modelRef.componentInstance.title = title;
      modelRef.componentInstance.message = message;
      modelRef.componentInstance.btnOkText = btnOkText;
      modelRef.componentInstance.btnCancelText = btnCancelText;
      return modelRef.result;
}
}