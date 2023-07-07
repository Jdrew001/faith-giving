import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrowlService } from './growl.service';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { StripeService } from './services/stripe.service';
import { CurrencyMaskDirective } from './directives/currency-mask.directive';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
  declarations: [CurrencyMaskDirective],
  imports: [CommonModule, MessagesModule, MessageModule, ToastModule],
  providers: [GrowlService, MessageService, StripeService, CookieService],
  exports: [MessagesModule, MessageModule, ToastModule, CurrencyMaskDirective],
})
export class CoreModule {}
