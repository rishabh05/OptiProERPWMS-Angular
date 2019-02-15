import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';



import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { TranslateModule, TranslateLoader } from '../../../node_modules/@ngx-translate/core';
import { TranslateHttpLoader } from '../../../node_modules/@ngx-translate/http-loader';
import { TrnaslateLazyModule } from '../../translate-lazy.module';




@NgModule({
  imports: [
    CommonModule,
    AccountRoutingModule,

    // BS
    PerfectScrollbarModule,
    HttpClientModule,     
    TrnaslateLazyModule,
    ButtonsModule,
    DropDownsModule,

       
    FormsModule,
    TooltipModule.forRoot(),
  
    // TranslateModule.forRoot({
    //   loader: {
    //     provide: TranslateLoader,
    //     useFactory: (HttpLoaderFactory),
    //     deps: [HttpClient]
    //   }
    // }),
  ],
  declarations: [SignupComponent, SigninComponent, SetPasswordComponent, ResetPasswordComponent]
})
export class AccountModule { }
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}