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

@NgModule({
  declarations: [WhsTransferComponent, BinTransferComponent],
  imports: [
    CommonModule,
    GridModule,
    SharedModule,
    TrnaslateLazyModule,
    PerfectScrollbarModule,
    FormsModule,
    ModalModule.forRoot()
  ]
})
export class InventoryTransferModule { }
