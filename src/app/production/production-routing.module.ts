import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductionIssueComponent } from './production-issue/production-issue.component';
import { ProductionReceiptItemsListComponent } from './production-receipt-items-list/production-receipt-items-list.component';
import { ProductionReceiptMasterComponent } from './production-receipt-master/production-receipt-master.component';


const routes: Routes = [
  
  { path: '', component:ProductionIssueComponent  },
  { path: 'production-issue', component:ProductionIssueComponent  },
  { path: 'production-receipt-master', component:ProductionReceiptMasterComponent },
  { path: 'production-receipt-item-list', component:ProductionReceiptItemsListComponent  },
  
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductionRoutingModule { }
