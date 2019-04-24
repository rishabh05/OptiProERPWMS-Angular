import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionRoutingModule } from './production-routing.module';
import { ProductionIssueComponent } from './production-issue/production-issue.component';
import { ProductionReceiptComponent } from './production-receipt/production-receipt.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TrnaslateLazyModule } from 'src/translate-lazy.module';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { SharedModule } from '../shared-module/shared-module.module';


@NgModule({
  declarations: [ProductionIssueComponent, ProductionReceiptComponent],
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ProductionRoutingModule,
    TrnaslateLazyModule,
    PerfectScrollbarModule,
    DateInputsModule
  ]
})
export class ProductionModule { }
