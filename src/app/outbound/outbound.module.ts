import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrnaslateLazyModule } from '../../translate-lazy.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { OutboundRoutingModule } from './outbound-routing.module';

import { OutCutomerComponent } from './out-cutomer/out-cutomer.component';
import { OutOrderComponent } from './out-order/out-order.component';
import { OutProdissueComponent } from './out-prodissue/out-prodissue.component';
import { SharedModule } from '../shared-module/shared-module.module';
import { FormsModule } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DeliveryThroughShipmentComponent } from './delivery-through-shipment/delivery-through-shipment.component';
import { NewPackingInputDialogComponent } from './new-packing-input-dialog/new-packing-input-dialog.component';
 
@NgModule({
  declarations: [ OutCutomerComponent, OutOrderComponent, OutProdissueComponent, DeliveryThroughShipmentComponent, NewPackingInputDialogComponent],
  imports: [   
    FormsModule,
    CommonModule,
    TrnaslateLazyModule,
    PerfectScrollbarModule,
    GridModule,
    OutboundRoutingModule,
    SharedModule,
    DropDownsModule,
    DialogModule,
    InputsModule
  ], 
  exports:[OutCutomerComponent,OutOrderComponent,OutProdissueComponent,NewPackingInputDialogComponent]
})
export class OutboundModule { }
