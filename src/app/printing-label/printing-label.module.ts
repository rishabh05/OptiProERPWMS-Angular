import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrintingLabelRoutingModule } from './printing-label-routing.module';
import { ItemLabelComponent } from './item-label/item-label.component';
import { BinLabelComponent } from './bin-label/bin-label.component';
import { InventoryEnquiryComponent } from './inventory-enquiry/inventory-enquiry.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TrnaslateLazyModule } from '../../translate-lazy.module';
import { SharedModule } from '../shared-module/shared-module.module';
import { FormsModule } from '@angular/forms';
//import { DisplayPdfComponent } from './display-pdf/display-pdf.component';
//import { PdfpipePipe } from './pdfpipe.pipe';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { GridModule } from '@progress/kendo-angular-grid';

@NgModule({
  declarations: [ItemLabelComponent, BinLabelComponent, InventoryEnquiryComponent],
  imports: [
    CommonModule,

    SharedModule,
    PerfectScrollbarModule,
    TrnaslateLazyModule,
    FormsModule,
    PrintingLabelRoutingModule,
    DialogsModule,
    GridModule
    
  ]
})
export class PrintingLabelModule { }
