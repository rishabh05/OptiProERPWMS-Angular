import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LookupComponent } from '../common/lookup/lookup.component';
import { GridModule } from '@progress/kendo-angular-grid';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { FormsModule } from '@angular/forms';

@NgModule({  
  imports: [ CommonModule, 
    GridModule, 
    FormsModule,
    DialogsModule],
  declarations: [ LookupComponent ],
  exports:      [ LookupComponent ]
})
export class SharedModule { }
