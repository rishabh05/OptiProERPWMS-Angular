import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { SigninComponent } from './signin/signin.component';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { TrnaslateLazyModule } from '../../translate-lazy.module';
import { DialogsModule } from '../../../node_modules/@progress/kendo-angular-dialog';
import { SharedModule } from 'src/app/shared-module/shared-module.module';




@NgModule({
  imports: [
    CommonModule,
    AccountRoutingModule,
    DialogsModule,
    CommonModule,
    SharedModule,
    PerfectScrollbarModule,
    HttpClientModule,     
    TrnaslateLazyModule,
    ButtonsModule,
    DropDownsModule,
    FormsModule,
    TooltipModule.forRoot(),
  ],
  declarations: [SigninComponent]
  // declarations: [SignupComponent, SigninComponent, SetPasswordComponent, ResetPasswordComponent]
})
export class AccountModule { }
