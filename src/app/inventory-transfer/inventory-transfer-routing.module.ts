import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BinTransferComponent } from './bin-transfer/bin-transfer.component';
import { WhsTransferComponent } from './whs-transfer/whs-transfer.component';

const routes: Routes = [
  
  { path: '', component:BinTransferComponent  },
  { path: 'binTransfer', component:BinTransferComponent  },
  { path: 'whsTransfer', component:WhsTransferComponent  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryTransferRoutingModule { }
