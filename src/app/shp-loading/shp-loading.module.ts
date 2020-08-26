import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShpLoadingComponent } from './shp-loading.component';
import { ShpLoadingRoutingModule } from './shp-loading-routing.module';
import { GridModule } from '../../../node_modules/@progress/kendo-angular-grid';
import { DialogsModule } from '../../../node_modules/@progress/kendo-angular-dialog';
import { SharedModule } from 'src/app/shared-module/shared-module.module';
import { TrnaslateLazyModule } from '../../translate-lazy.module';
import { FormsModule } from '../../../node_modules/@angular/forms';
import { PerfectScrollbarModule } from '../../../node_modules/ngx-perfect-scrollbar';
import { DropDownsModule } from '../../../node_modules/@progress/kendo-angular-dropdowns';
import { NgxTrimDirectiveModule } from '../../../node_modules/ngx-trim-directive';

@NgModule({
  declarations: [ShpLoadingComponent],
  imports: [
    CommonModule,
    ShpLoadingRoutingModule,
    GridModule,
    DialogsModule,
    SharedModule,    
    TrnaslateLazyModule,
    PerfectScrollbarModule, 
    FormsModule,
    DropDownsModule,
    NgxTrimDirectiveModule
  ]
})
export class ShpLoadingModule { }
