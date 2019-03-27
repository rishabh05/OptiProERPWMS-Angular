import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductionRoutingModule } from './production-routing.module';
import { ProductionIssueComponent } from './production-issue/production-issue.component';
import { ProductionReceiptComponent } from './production-receipt/production-receipt.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TrnaslateLazyModule } from 'src/translate-lazy.module';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';

@NgModule({
  declarations: [ProductionIssueComponent, ProductionReceiptComponent],
  imports: [
    CommonModule,
    ProductionRoutingModule,
    TrnaslateLazyModule,
    PerfectScrollbarModule,
    DateInputsModule
  ]
})
export class ProductionModule { }
