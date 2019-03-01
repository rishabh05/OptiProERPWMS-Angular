import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BinLabelComponent } from './bin-label/bin-label.component';
import { InventoryEnquiryComponent } from './inventory-enquiry/inventory-enquiry.component';
import { ItemLabelComponent } from './item-label/item-label.component';

const routes: Routes = [
  
  { path: '', component:ItemLabelComponent  },
  { path: 'item-label', component:ItemLabelComponent  },
  { path: 'bin-label', component:BinLabelComponent  },
  { path: 'inventory-enquiry', component:InventoryEnquiryComponent  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrintingLabelRoutingModule { }
