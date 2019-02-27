import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OutCutomerComponent } from './out-cutomer/out-cutomer.component';
import { OutOrderComponent } from './out-order/out-order.component';
import { OutProdissueComponent } from './out-prodissue/out-prodissue.component';

const routes: Routes = [
  { path: '', redirectTo: 'outcustomer' },
  { path: 'outcustomer', component: OutCutomerComponent },
  { path: 'outorder', component: OutOrderComponent },
  { path: 'outprodissue', component: OutProdissueComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OutboundRoutingModule { }



