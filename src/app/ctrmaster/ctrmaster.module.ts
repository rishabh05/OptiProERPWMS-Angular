import { CTRMainComponent } from '../CTRMaster/ctrmain/ctrmain.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';
import { SharedModule } from '../shared-module/shared-module.module';
import { FormsModule } from '@angular/forms';
import { TrnaslateLazyModule } from '../../translate-lazy.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { CTRViewComponent } from '../CTRMaster/ctrview/ctrview.component';
import { CTRUpdateComponent } from '../CTRMaster/ctrupdate/ctrupdate.component';

@NgModule({
  declarations: [CTRMainComponent, CTRViewComponent, CTRUpdateComponent],
  imports: [
    CommonModule,
    GridModule,
    SharedModule,
    
    TrnaslateLazyModule,
    PerfectScrollbarModule, 
    FormsModule,

    DropDownsModule,
    DateInputsModule
  ],
  providers: [ 
    CTRMainComponent // added class in the providers
  ],
  exports: [CTRMainComponent]
})
export class CTRMasterModule { }

