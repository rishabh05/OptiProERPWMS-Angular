import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdjustmentsCountingRoutingModule } from './adjustments-counting-routing.module';
import { PhysicalCountComponent } from './physical-count/physical-count.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TrnaslateLazyModule } from '../../translate-lazy.module';
import { GridModule } from '../../../node_modules/@progress/kendo-angular-grid';
import { SharedModule } from 'src/app/shared-module/shared-module.module';
import { FormsModule } from '../../../node_modules/@angular/forms';

@NgModule({
  declarations: [PhysicalCountComponent],
  imports: [
    CommonModule,
    GridModule,
    SharedModule,
    PerfectScrollbarModule,
    TrnaslateLazyModule,
    FormsModule,
    AdjustmentsCountingRoutingModule
  ]
})
export class AdjustmentsCountingModule { }
