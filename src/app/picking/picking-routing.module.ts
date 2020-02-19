import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PickingComponent } from './picking.component';
import { PickingListComponent } from './picking-list/picking-list.component';
import { PickingItemListComponent } from './picking-item-list/picking-item-list.component';
import { PickingItemDetailsComponent } from './picking-item-details/picking-item-details.component';

// const routes: Routes = [];

const routes: Routes = [
  { path: '', component: PickingComponent,
  children: [
    { path: '', redirectTo: 'picking-list', pathMatch: 'full' }, //,canActivate: [AuthGuard]
    {path: 'picking-list', component: PickingListComponent},
    {path: 'picking-item-list', component: PickingItemListComponent},
    {path: 'picking-item-details', component: PickingItemDetailsComponent}
    
]
},

  { }
    // { path: 'outcustomer', component: OutCutomerComponent },
    // { path: 'outorder', component: OutOrderComponent },
    // { path: 'outprodissue', component: OutProdissueComponent }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PickingRoutingModule { }
