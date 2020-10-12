import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DropComponent } from './drop/drop.component';

const routes: Routes = [
  {
    path: '', component: DropComponent,
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
export class DropRoutingModule { }
