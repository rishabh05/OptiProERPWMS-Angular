import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdjustmentsCountingRoutingModule } from './adjustments-counting-routing.module';
import { PhysicalCountComponent } from './physical-count/physical-count.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TrnaslateLazyModule } from 'src/translate-lazy.module';

@NgModule({
  declarations: [PhysicalCountComponent],
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    TrnaslateLazyModule,

    AdjustmentsCountingRoutingModule
  ]
})
export class AdjustmentsCountingModule { }
