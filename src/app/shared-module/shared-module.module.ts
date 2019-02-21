import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LookupComponent } from '../common/lookup/lookup.component';

@NgModule({  
  imports: [ CommonModule ],
  declarations: [ LookupComponent ],
  exports:      [ LookupComponent ]
})
export class SharedModule { }
