import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionRoutingModule } from './production-routing.module';
import { ProductionIssueComponent } from './production-issue/production-issue.component';
import { ProductionReceiptComponent } from './production-receipt/production-receipt.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TrnaslateLazyModule } from '../../translate-lazy.module';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { SharedModule } from '../shared-module/shared-module.module';
import { GridModule } from '@progress/kendo-angular-grid';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { ProdOrderlistComponent } from './production-issue/prod-orderlist/prod-orderlist.component';
import { OutboundModule } from '../outbound/outbound.module';


@NgModule({
  declarations: [ProductionIssueComponent, ProductionReceiptComponent, ProdOrderlistComponent],
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ProductionRoutingModule,
    TrnaslateLazyModule,
    PerfectScrollbarModule,
    DateInputsModule,
    DropDownsModule,
    InputsModule,
    GridModule,
    OutboundModule
  ]
})
export class ProductionModule { }
