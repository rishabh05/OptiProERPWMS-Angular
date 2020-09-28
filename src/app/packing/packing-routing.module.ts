import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PackingComponent } from './packing.component';

const routes: Routes = [
  {
    path: '', component: PackingComponent,
    children: [
      { path: '', redirectTo: 'packing', pathMatch: 'full' }, //,canActivate: [AuthGuard]
    ]
  },
  {}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PackingRoutingModule { }
