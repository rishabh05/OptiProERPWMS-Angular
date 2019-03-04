import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrintingLabelRoutingModule } from './printing-label-routing.module';
import { ItemLabelComponent } from './item-label/item-label.component';
import { BinLabelComponent } from './bin-label/bin-label.component';
import { InventoryEnquiryComponent } from './inventory-enquiry/inventory-enquiry.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TrnaslateLazyModule } from 'src/translate-lazy.module';

@NgModule({
  declarations: [ItemLabelComponent, BinLabelComponent, InventoryEnquiryComponent],
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    TrnaslateLazyModule,
    
    PrintingLabelRoutingModule
    
  ]
})
export class PrintingLabelModule { }
