import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LookupComponent } from '../common/lookup/lookup.component';
import { ComonConfirmDialogComponent } from '../common/comon-confirm-dialog/comon-confirm-dialog.component';
import { GridModule } from '@progress/kendo-angular-grid';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { FormsModule } from '@angular/forms';
import {ConfirmDialogComponent} from '../common/confirm-dialog/confirm-dialog/confirm-dialog.component';
import {ConfirmdialogService} from '../common/confirm-dialog/confirmdialog.service';

@NgModule({  
  imports: [ CommonModule, 
    GridModule, 
    FormsModule,
    DialogsModule],
    providers:[ ConfirmdialogService],
  declarations: [ LookupComponent,ConfirmDialogComponent,ComonConfirmDialogComponent ],
  entryComponents: [ ConfirmDialogComponent ],
  exports:      [ LookupComponent,ConfirmDialogComponent,ComonConfirmDialogComponent ]
})
export class SharedModule { }
