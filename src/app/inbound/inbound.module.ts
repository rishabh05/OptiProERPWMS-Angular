import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';
import { SharedModule } from '../shared-module/shared-module.module';
import { FormsModule } from '@angular/forms';
import { TrnaslateLazyModule } from '../../translate-lazy.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { InboundRoutingModule } from './inbound-routing.module';
import { InboundDetailsComponent } from './inbound-details/inbound-details.component';
import { InboundMasterComponent } from './inbound-master.component';
import { InboundPolistComponent } from './inbound-polist/inbound-polist.component';
import { InboundGRPOComponent } from './inbound-grpo/inbound-grpo.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { InboundThroughAPIComponent } from './inbound-through-api/inbound-through-api.component';
//import { PrintingLabelModule } from '../inbound/inbound-routing.module';

@NgModule({
  declarations: [InboundDetailsComponent, InboundMasterComponent, InboundPolistComponent, 
    InboundGRPOComponent, InboundThroughAPIComponent],
  imports: [
    CommonModule,
    GridModule,
    SharedModule,
    
    TrnaslateLazyModule,
    PerfectScrollbarModule, 
    FormsModule,

    InboundRoutingModule,
    DropDownsModule,
    DateInputsModule
  ],
  providers: [ 
    InboundGRPOComponent,InboundMasterComponent // added class in the providers
  ],
  exports: [InboundGRPOComponent,InboundDetailsComponent, InboundMasterComponent, InboundPolistComponent]
})
export class InboundModule { }
