import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhsTransferComponent } from './whs-transfer/whs-transfer.component';
import { BinTransferComponent } from './bin-transfer/bin-transfer.component';
import { TrnaslateLazyModule } from '../../translate-lazy.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { GridModule } from '@progress/kendo-angular-grid';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedModule } from '../shared-module/shared-module.module';
import { FormsModule } from '@angular/forms';
import { InventoryTransferRoutingModule } from './inventory-transfer-routing.module';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { InventoryTransferbyITRMasterComponent } from './inventory-transferby-itrmaster/inventory-transferby-itrmaster.component';
import { ITRLIstComponent } from './itrlist/itrlist.component';
import { ITRCalculationComponent } from './itr-calculation/itr-calculation.component';
import { OutboundModule } from '../outbound/outbound.module';
import { DropDownsModule } from '../../../node_modules/@progress/kendo-angular-dropdowns';
// import { ModalModule } from '../../../node_modules/ngx-bootstrap/modal/modal.module';

@NgModule({
  declarations: [WhsTransferComponent, BinTransferComponent, InventoryTransferbyITRMasterComponent, ITRLIstComponent, ITRCalculationComponent],
  imports: [
    CommonModule,
    GridModule,
    SharedModule,
    TrnaslateLazyModule,
    PerfectScrollbarModule,
    FormsModule,
    InventoryTransferRoutingModule,
    DialogsModule,
    OutboundModule,
    DropDownsModule,
    ModalModule.forRoot()
  ]
})
export class InventoryTransferModule { }
