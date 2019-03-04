import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PhysicalCountComponent } from './physical-count/physical-count.component';

const routes: Routes = [
  
  { path: '', component:PhysicalCountComponent  },
  { path: 'physical-count', component:PhysicalCountComponent  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdjustmentsCountingRoutingModule { }
