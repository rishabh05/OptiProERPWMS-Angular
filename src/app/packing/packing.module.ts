import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';
import { SharedModule } from '../shared-module/shared-module.module';
import { FormsModule } from '@angular/forms';
import { TrnaslateLazyModule } from '../../translate-lazy.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { NgxTrimDirectiveModule } from 'ngx-trim-directive';
import { PackingRoutingModule } from './packing-routing.module';
import { DialogsModule } from '../../../node_modules/@progress/kendo-angular-dialog';
import { PackingComponent } from './packing.component';
import {RemoveComponent} from './remove.component';
import { DecimalPipe } from '@angular/common';

@NgModule({
  declarations: [ 
    PackingComponent,
    RemoveComponent
  ],
  imports: [
    CommonModule,
    GridModule,
    DialogsModule,
    SharedModule,    
    TrnaslateLazyModule,
    PerfectScrollbarModule, 
    FormsModule,
    PackingRoutingModule,
    DropDownsModule,
    DateInputsModule,
    NgxTrimDirectiveModule
  ],
  providers: [DecimalPipe],
  exports: []
})
export class PackingModule { }
