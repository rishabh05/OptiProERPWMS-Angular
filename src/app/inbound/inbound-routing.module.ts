import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InboundMasterComponent } from './inbound-master.component';

// const routes: Routes = [];

const routes: Routes = [
  { path: '', component: InboundMasterComponent}
    // { path: 'outcustomer', component: OutCutomerComponent },
    // { path: 'outorder', component: OutOrderComponent },
    // { path: 'outprodissue', component: OutProdissueComponent }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InboundRoutingModule { }
