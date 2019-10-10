import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SplitTransferComponent } from './split-transfer/split-transfer.component';
import { PalletMergeComponent } from './pallet-merge/pallet-merge.component';
import { DepalletizeComponent } from './depalletize/depalletize.component';
import { PalletizeComponent } from './palletize/palletize.component';

const routes: Routes = [
  
  { path: '', component:SplitTransferComponent  },
  { path: 'split-transfer', component:SplitTransferComponent  },
  { path: 'pallet-merge', component:PalletMergeComponent  },
  { path: 'depalletize', component:DepalletizeComponent  },
  { path: 'palletize', component:PalletizeComponent  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PalletizationRoutingModule { }
