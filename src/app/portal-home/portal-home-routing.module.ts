import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SalesOrderListComponent } from '../sales-order/sales-order-list/sales-order-list.component';
import { PortalHomeComponent } from './portal-home.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { FormFieldComponent } from '../form/form-field/form-field.component';
import { BinTransferComponent } from '../inventory-transfer/bin-transfer/bin-transfer.component';
import { WhsTransferComponent } from '../inventory-transfer/whs-transfer/whs-transfer.component';
import { InboundDetailsComponent } from '../inbound/inbound-details/inbound-details.component';
import { OutboundDetailsComponent } from '../outbound/outbound-details/outbound-details.component';

const routes: Routes = [

  {
    path: '', component: PortalHomeComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path:'dashboard', component:DashboardComponent },
      { path: 'salesorder', component:SalesOrderListComponent },
      { path: 'form', component:FormFieldComponent },
      { path:'binTransfer', component:BinTransferComponent },
      { path:'whsTransfer', component:WhsTransferComponent },
      { path:'inbound', component:InboundDetailsComponent },
      { path:'outbound', component:OutboundDetailsComponent },
    ]
    
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalHomeRoutingModule { }
