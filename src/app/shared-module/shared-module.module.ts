import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LookupComponent } from '../common/lookup/lookup.component';
import { ComonConfirmDialogComponent } from '../common/comon-confirm-dialog/comon-confirm-dialog.component';
import { GridModule } from '@progress/kendo-angular-grid';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { FormsModule } from '@angular/forms';
import {ConfirmDialogComponent} from '../common/confirm-dialog/confirm-dialog/confirm-dialog.component';
import {ConfirmdialogService} from '../common/confirm-dialog/confirmdialog.service';
import {DisplayPdfComponent} from '../printing-label/display-pdf/display-pdf.component';
import {PdfpipePipe} from '../printing-label/pdfpipe.pipe';
import {NumberFormatPipe} from '../common/number-format.pipe';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { InputDialogComponent } from '../common/input-dialog/input-dialog.component';
import { StatePersistingServiceService } from '../services/state-persisting-service.service';
@NgModule({  
  imports: [ CommonModule, 
    GridModule, 
    FormsModule,
    DialogsModule,PdfViewerModule],
    providers:[ ConfirmdialogService,StatePersistingServiceService],
  declarations: [ LookupComponent,ConfirmDialogComponent,ComonConfirmDialogComponent,DisplayPdfComponent,
    PdfpipePipe,NumberFormatPipe, InputDialogComponent ],
  entryComponents: [ ConfirmDialogComponent,DisplayPdfComponent, InputDialogComponent],
  exports:      [ LookupComponent,ConfirmDialogComponent,ComonConfirmDialogComponent,
    DisplayPdfComponent,PdfpipePipe,NumberFormatPipe, InputDialogComponent ]
    
})
export class SharedModule { }
