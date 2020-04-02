import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ShpLoadingComponent } from './shp-loading.component';

const routes: Routes = [
  { path: '', component: ShpLoadingComponent,
//   children: [
//     { path: '', redirectTo: 'picking-list', pathMatch: 'full' }, //,canActivate: [AuthGuard]
//     {path: 'picking-list', component: PickingListComponent},
//     {path: 'picking-item-list', component: PickingItemListComponent},
//     {path: 'picking-item-details', component: PickingItemDetailsComponent}
    
// ]
},
  { }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShpLoadingRoutingModule { }
