import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InboundMasterComponent } from './inbound-master.component';
import { InboundThroughAPIComponent } from './inbound-through-api/inbound-through-api.component';

// const routes: Routes = [];

const routes: Routes = [
  { path: '', component: InboundMasterComponent},
  { path: 'inboundAPI', component: InboundThroughAPIComponent}
    // { path: 'outcustomer', component: OutCutomerComponent },
    // { path: 'outorder', component: OutOrderComponent },
    // { path: 'outprodissue', component: OutProdissueComponent }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InboundRoutingModule { }
