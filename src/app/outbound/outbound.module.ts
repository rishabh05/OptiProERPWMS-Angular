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

@NgModule({
  declarations: [OutboundDetailsComponent, OutCutomerComponent, OutOrderComponent, OutProdissueComponent],
  imports: [   

    CommonModule,
    TrnaslateLazyModule,
    PerfectScrollbarModule,

    OutboundRoutingModule,
    SharedModule
  ]
})
export class OutboundModule { }
