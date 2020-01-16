import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CTRMainComponent } from 'src/app/CTRMaster/ctrmain/ctrmain.component';

// const routes: Routes = [];

const routes: Routes = [
  { path: '', component: CTRMainComponent}
    // { path: 'outcustomer', component: OutCutomerComponent },
    // { path: 'outorder', component: OutOrderComponent },
    // { path: 'outprodissue', component: OutProdissueComponent }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CTRMasterRoutingModule { }
