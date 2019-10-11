import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortalHomeRoutingModule } from './portal-home-routing.module';
import { PortalLeftComponent } from './portal-left/portal-left.component';
import { PortalRightComponent } from './portal-right/portal-right.component';
import { PortalTopComponent } from './portal-top/portal-top.component';
import { PortalHomeComponent } from './portal-home.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import 'hammerjs';

// import { FormModule } from '../form/form.module';
import { TrnaslateLazyModule } from '../../translate-lazy.module';
import { InventoryTransferModule } from '../inventory-transfer/inventory-transfer.module';
import { InboundModule } from '../inbound/inbound.module';
import { OutboundModule } from '../outbound/outbound.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChangeWarehouseComponent } from '../change-warehouse/change-warehouse.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { SharedModule } from '../shared-module/shared-module.module';
import { PalletizationModule } from '../palletization/palletization.module';

@NgModule({
  imports: [
    CommonModule, 
    PortalHomeRoutingModule,

    // BS
    AngularSvgIconModule, 
    BsDropdownModule.forRoot(),
    PerfectScrollbarModule,
    TrnaslateLazyModule,
    DropDownsModule,
    // Angular
    HttpClientModule,         
    FormsModule,
    NgbModule,

    CommonModule, 
    GridModule,
    SharedModule,

    InboundModule,
    OutboundModule,
    InventoryTransferModule,
    PalletizationModule
  ],
  declarations: [PortalHomeComponent, PortalLeftComponent, PortalRightComponent, PortalTopComponent, DashboardComponent, ChangeWarehouseComponent],
  providers:[DashboardComponent ]
})
export class PortalHomeModule { }
