import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrnaslateLazyModule } from 'src/translate-lazy.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { OutboundRoutingModule } from './outbound-routing.module';
import { OutboundDetailsComponent } from './outbound-details/outbound-details.component';

@NgModule({
  declarations: [OutboundDetailsComponent],
  imports: [   

    CommonModule,
    TrnaslateLazyModule,
    PerfectScrollbarModule,

    OutboundRoutingModule
  ]
})
export class OutboundModule { }
