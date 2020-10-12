import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadComponent } from './load/load.component';
import { LoadRoutingModule } from './load-routing.module';
import { GridModule } from '@progress/kendo-angular-grid';
import { SharedModule } from '../shared-module/shared-module.module';
import { FormsModule } from '@angular/forms';
import { TrnaslateLazyModule } from '../../translate-lazy.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { NgxTrimDirectiveModule } from 'ngx-trim-directive';
import { DialogsModule } from '@progress/kendo-angular-dialog';

@NgModule({
  declarations: [LoadComponent],
  imports: [
    CommonModule,
    LoadRoutingModule,
    GridModule,
    DialogsModule,
    SharedModule,    
    TrnaslateLazyModule,
    PerfectScrollbarModule, 
    FormsModule,
    DropDownsModule,
    DateInputsModule,
    NgxTrimDirectiveModule
  ]
})
export class LoadModule { }
