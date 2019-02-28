import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductionIssueComponent } from './production-issue/production-issue.component';
import { ProductionReceiptComponent } from './production-receipt/production-receipt.component';

const routes: Routes = [
  
  { path: '', component:ProductionIssueComponent  },
  { path: 'issue', component:ProductionIssueComponent  },
  { path: 'recipt', component:ProductionReceiptComponent  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductionRoutingModule { }
