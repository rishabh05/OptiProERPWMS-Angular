import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OutCutomerComponent } from './out-cutomer/out-cutomer.component';
import { OutOrderComponent } from './out-order/out-order.component';
import { OutProdissueComponent } from './out-prodissue/out-prodissue.component';
import { DeliveryThroughShipmentComponent } from './delivery-through-shipment/delivery-through-shipment.component';

const routes: Routes = [
  { path: '', component: OutCutomerComponent}, 
    { path: 'outcustomer', component: OutCutomerComponent },
    { path: 'outorder', component: OutOrderComponent },
    { path: 'outprodissue', component: OutProdissueComponent },
    { path: 'deliveryThroughShipment', component: DeliveryThroughShipmentComponent }
 
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OutboundRoutingModule { }



