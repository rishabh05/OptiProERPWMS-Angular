import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhsTransferComponent } from './whs-transfer/whs-transfer.component';
import { BinTransferComponent } from './bin-transfer/bin-transfer.component';

@NgModule({
  declarations: [WhsTransferComponent, BinTransferComponent],
  imports: [
    CommonModule
  ]
})
export class InventoryTransferModule { }
