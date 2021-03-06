import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { SalesOrderListComponent } from '../sales-order/sales-order-list/sales-order-list.component';
import { PortalHomeComponent } from './portal-home.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
// import { FormFieldComponent } from '../form/form-field/form-field.component';
import { BinTransferComponent } from '../inventory-transfer/bin-transfer/bin-transfer.component';
import { WhsTransferComponent } from '../inventory-transfer/whs-transfer/whs-transfer.component';
import { ChangeWarehouseComponent } from '../change-warehouse/change-warehouse.component';
import { SplitTransferComponent } from '../palletization/split-transfer/split-transfer.component';
import { PalletMergeComponent } from '../palletization/pallet-merge/pallet-merge.component';
import { DepalletizeComponent } from '../palletization/depalletize/depalletize.component';
import { PalletizeComponent } from '../palletization/palletize/palletize.component';
import { InventoryTransferbyITRMasterComponent } from '../inventory-transfer/inventory-transferby-itrmaster/inventory-transferby-itrmaster.component';

const routes: Routes = [

  {
    path: '', component: PortalHomeComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path:'dashboard', component:DashboardComponent },
      
      // { path: 'salesorder', component:SalesOrderListComponent },
      //{ path: 'form', component:FormFieldComponent },
      { path:'binTransfer', component:BinTransferComponent },
      { path:'whsTransfer', component:WhsTransferComponent },
      { path: 'InventoryTransferRequest', component:WhsTransferComponent  },
      { path: 'InventoryTransferbyITR', component:InventoryTransferbyITRMasterComponent  },
      { path:'changeWarehouse', component:ChangeWarehouseComponent },
      { path:'inbound', loadChildren:"../inbound/inbound.module#InboundModule"},     
      { path: 'adjustment-counting', loadChildren: "../adjustments-counting/adjustments-counting.module#AdjustmentsCountingModule" }, 
      { path: 'picking', loadChildren: "../picking/picking.module#PickingModule" },
      { path: 'packing', loadChildren: "../packing/packing.module#PackingModule" },
      { path: 'drop', loadChildren: "../drop/drop.module#DropModule" },
      { path: 'load', loadChildren: "../load/load.module#LoadModule" },
      { path: 'production', loadChildren: "../production/production.module#ProductionModule" },
      { path: 'printing-label', loadChildren: "../printing-label/printing-label.module#PrintingLabelModule" },
      // Need to remove these routing
      // { path:'outbound/outcustomer', component:OutCutomerComponent },
      // { path:'outbound/outorder', component:OutOrderComponent },
      // { path:'outbound/outprodissue', component:OutProdissueComponent },

      { path:'outbound', loadChildren: "../outbound/outbound.module#OutboundModule" },
      { path:'palletization', loadChildren: "../palletization/palletization.module#PalletizationModule" },
      { path:'split-transfer', component:SplitTransferComponent },
      { path:'pallet-merge', component:PalletMergeComponent },
      { path:'depalletize', component:DepalletizeComponent },
      { path:'palletize', component:PalletizeComponent },
      { path: 'ShpLoading', loadChildren: "../shp-loading/shp-loading.module#ShpLoadingModule" },
    ]
    
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalHomeRoutingModule {  
}
