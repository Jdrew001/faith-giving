import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GivingComponent } from './giving.component';
import { GivingRoutingModule } from './giving-routing.module';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { GivingFormService } from './services/giving-form.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { CoreModule } from '../core/core.module';
import { UserDetailsComponent } from './user-details/user-details.component';
import { GivingDetailsComponent } from './giving-details/giving-details.component';
import { CardDetailsComponent } from './card-details/card-details.component';
import { GivingService } from './services/giving.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    GivingComponent,
    UserDetailsComponent,
    GivingDetailsComponent,
    CardDetailsComponent,
  ],
  imports: [
    CommonModule,
    GivingRoutingModule,
    ButtonModule,
    DropdownModule,
    CardModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    CheckboxModule,
    CoreModule,
    HttpClientModule
  ],
  providers: [
    GivingFormService,
    GivingService
  ],
})
export class GivingModule {}
