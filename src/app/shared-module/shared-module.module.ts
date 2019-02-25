import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LookupComponent } from '../common/lookup/lookup.component';
import { GridModule } from '@progress/kendo-angular-grid';
import { DialogsModule } from '@progress/kendo-angular-dialog';

@NgModule({  
  imports: [ CommonModule, 
    GridModule, 
    DialogsModule],
  declarations: [ LookupComponent ],
  exports:      [ LookupComponent ]
})
export class SharedModule { }
