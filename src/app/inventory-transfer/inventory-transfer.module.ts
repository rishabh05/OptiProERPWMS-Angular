import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhsTransferComponent } from './whs-transfer/whs-transfer.component';
import { BinTransferComponent } from './bin-transfer/bin-transfer.component';
import { TrnaslateLazyModule } from 'src/translate-lazy.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { GridModule } from '@progress/kendo-angular-grid';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedModule } from 'src/app/shared-module/shared-module.module';

@NgModule({
  declarations: [WhsTransferComponent, BinTransferComponent],
  imports: [
    CommonModule,
    GridModule,
    SharedModule,
    TrnaslateLazyModule,
    PerfectScrollbarModule,
    ModalModule.forRoot()
  ]
})
export class InventoryTransferModule { }
