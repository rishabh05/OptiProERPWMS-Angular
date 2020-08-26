import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionRoutingModule } from './production-routing.module';
import { ProductionIssueComponent } from './production-issue/production-issue.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TrnaslateLazyModule } from '../../translate-lazy.module';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { SharedModule } from '../shared-module/shared-module.module';
import { GridModule } from '@progress/kendo-angular-grid';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { ProdOrderlistComponent } from './production-issue/prod-orderlist/prod-orderlist.component';
import { OutboundModule } from '../outbound/outbound.module';
import { ProductionReceiptItemsListComponent } from './production-receipt-items-list/production-receipt-items-list.component';

import { ProductionReceiptMasterComponent } from './production-receipt-master/production-receipt-master.component';
import { InboundModule } from '../inbound/inbound.module';


@NgModule({
  declarations: [ProductionIssueComponent, ProdOrderlistComponent, ProductionReceiptItemsListComponent, ProductionReceiptMasterComponent],
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
    OutboundModule,
    InboundModule
  ]
})
export class ProductionModule { }
