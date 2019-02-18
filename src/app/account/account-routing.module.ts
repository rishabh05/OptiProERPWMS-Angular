import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SigninComponent } from './signin/signin.component';

const routes: Routes = [
  
  { path: '', component: SigninComponent },
  { path: 'login', component: SigninComponent },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
