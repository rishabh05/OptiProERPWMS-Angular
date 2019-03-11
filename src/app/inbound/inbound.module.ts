import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrnaslateLazyModule } from '../../translate-lazy.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { InboundRoutingModule } from './inbound-routing.module';
import { InboundDetailsComponent } from './inbound-details/inbound-details.component';
import { InboundMasterComponent } from './inbound-master.component';

@NgModule({
  declarations: [InboundDetailsComponent, InboundMasterComponent],
  imports: [
    CommonModule,
    TrnaslateLazyModule,
    PerfectScrollbarModule, 


    InboundRoutingModule
  ]
})
export class InboundModule { }
