import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GivingComponent } from './giving.component';
import { GivingRoutingModule } from './giving-routing.module';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  declarations: [GivingComponent],
  imports: [
    CommonModule,
    GivingRoutingModule,
    ButtonModule,
    DropdownModule
  ],
})
export class GivingModule {}
