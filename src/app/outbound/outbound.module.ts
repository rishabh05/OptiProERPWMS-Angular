import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrnaslateLazyModule } from 'src/translate-lazy.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { OutboundRoutingModule } from './outbound-routing.module';
import { OutboundDetailsComponent } from './outbound-details/outbound-details.component';
import { OutCutomerComponent } from './out-cutomer/out-cutomer.component';
import { OutOrderComponent } from './out-order/out-order.component';
import { OutProdissueComponent } from './out-prodissue/out-prodissue.component';
import { SharedModule } from '../shared-module/shared-module.module';
import { FormsModule } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';

@NgModule({
  declarations: [OutboundDetailsComponent, OutCutomerComponent, OutOrderComponent, OutProdissueComponent],
  imports: [   
    FormsModule,
    CommonModule,
    TrnaslateLazyModule,
    PerfectScrollbarModule,
    GridModule,
    OutboundRoutingModule,
    SharedModule,
    DropDownsModule
  ],
  exports:[OutCutomerComponent,OutOrderComponent,OutProdissueComponent]
})
export class OutboundModule { }
