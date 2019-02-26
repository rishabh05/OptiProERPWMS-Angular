import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrnaslateLazyModule } from 'src/translate-lazy.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { InboundRoutingModule } from './inbound-routing.module';
import { InboundDetailsComponent } from './inbound-details/inbound-details.component';

@NgModule({
  declarations: [InboundDetailsComponent],
  imports: [
    CommonModule,
    TrnaslateLazyModule,
    PerfectScrollbarModule, 


    InboundRoutingModule
  ]
})
export class InboundModule { }
