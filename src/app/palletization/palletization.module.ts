import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PalletizationRoutingModule } from './palletization-routing.module';
import { SplitTransferComponent } from './split-transfer/split-transfer.component';
import { PalletMergeComponent } from './pallet-merge/pallet-merge.component';
import { DepalletizeComponent } from './depalletize/depalletize.component';
import { PalletizeComponent } from './palletize/palletize.component';
import { GridModule } from '@progress/kendo-angular-grid';
import { SharedModule } from '../shared-module/shared-module.module';
import { TrnaslateLazyModule } from 'src/translate-lazy.module';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PalSplitComponent } from './pal-split/pal-split.component';
import { PalTransferComponent } from './pal-transfer/pal-transfer.component';

@NgModule({
  declarations: [SplitTransferComponent, PalletMergeComponent, DepalletizeComponent, PalletizeComponent, PalSplitComponent, PalTransferComponent],
  imports: [
    CommonModule,
    PalletizationRoutingModule,
    GridModule,
    SharedModule,
    TrnaslateLazyModule,
    FormsModule,
    PerfectScrollbarModule
  ],
  exports:[SplitTransferComponent,PalletMergeComponent]
})
export class PalletizationModule { }
