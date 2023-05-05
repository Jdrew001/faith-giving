import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrowlService } from './growl.service';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import { MessageService } from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import { StripeService } from './services/stripe.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MessagesModule,
    MessageModule,
    ToastModule
  ],
  providers: [
    GrowlService,
    MessageService,
    StripeService
  ],
  exports: [
    MessagesModule,
    MessageModule,
    ToastModule
  ]
})
export class CoreModule { }
