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
import { ShipmentinfoComponent } from '../common/shipmentinfo/shipmentinfo.component';
import { TrnaslateLazyModule } from '../../translate-lazy.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { UDFdialogComponent } from 'src/app/common/udfdialog/udfdialog.component';
import { DropDownsModule } from '../../../node_modules/@progress/kendo-angular-dropdowns';
@NgModule({  
  imports: [ CommonModule, 
    GridModule, 
    FormsModule,
    TrnaslateLazyModule,
    DropDownsModule,
    DialogsModule,PdfViewerModule,PerfectScrollbarModule],
    providers:[ ConfirmdialogService,StatePersistingServiceService],
  declarations: [ LookupComponent,ConfirmDialogComponent,ComonConfirmDialogComponent,DisplayPdfComponent,ShipmentinfoComponent,
    PdfpipePipe,NumberFormatPipe, InputDialogComponent , UDFdialogComponent],
  entryComponents: [ ConfirmDialogComponent,DisplayPdfComponent, InputDialogComponent,ShipmentinfoComponent],
  exports:      [ LookupComponent,ConfirmDialogComponent,ComonConfirmDialogComponent,
    DisplayPdfComponent,PdfpipePipe,NumberFormatPipe, InputDialogComponent, ShipmentinfoComponent, UDFdialogComponent]
    
})
export class SharedModule { }
