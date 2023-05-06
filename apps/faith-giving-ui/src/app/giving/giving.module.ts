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
import { NgxStripeModule } from 'ngx-stripe';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

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
    HttpClientModule,
    NgxMaskDirective, NgxMaskPipe,
    NgxStripeModule.forRoot('pk_test_51IWOf3A0DJoBf0VzbZR7l3xohneGilLnLoYtjesw2BED5SqjGsV8TZa2Xx9d68RCFlmAN87ErPgQhx9UMT1yrC1400omCjotV3')
  ],
  providers: [
    GivingFormService,
    GivingService,
    provideNgxMask()
  ],
})
export class GivingModule {}
